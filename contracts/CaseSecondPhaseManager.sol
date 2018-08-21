pragma solidity ^0.4.23;

import './Case.sol';
import './CaseManager.sol';
import './CaseScheduleManager.sol';
import './CaseStatusManager.sol';
import './DoctorManager.sol';
import "./Initializable.sol";
import './Registry.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseLifecycleManager is Ownable, Initializable {

  Registry registry;

  event CaseDiagnosesDiffer(address indexed _case, address indexed _patient, address indexed _challengingDoctor);
  event CaseDiagnosisConfirmed(address indexed _case, address indexed _patient, address indexed _challengingDoctor);
  event CaseChallenged(address indexed _case, address indexed _patient, address indexed _challengingDoctor);
  event ChallengeDoctorSet(address indexed _case, address indexed _patient, address indexed _challengingDoctor, bytes doctorEncryptedKey);

  /**
   * @dev - throws unless the patient has waited 24 hours
   */
  modifier patientWaitedOneDay(address _caseAddress) {
    caseScheduleManager().patientWaitedOneDay(_caseAddress);
    _;
  }

  /**
   * @dev - throws if the sender is not the case's patient
   */
  modifier onlyPatient(address _caseAddress) {
    Case _case = Case(_caseAddress);
    require(msg.sender == _case.patient(), 'sender needs to be the patient');
    _;
  }

  /**
   * @dev - throws unless the Doctor has waited 48 hours
   */
  modifier doctorWaitedTwoDays(address _caseAddress) {
    caseScheduleManager().doctorWaitedTwoDays(_caseAddress);
    _;
  }

  /**
   * @dev - throws if called by any account that is not a case
   */
  modifier isCase(address _caseAddress) {
    caseManager().isCase(_caseAddress);
    _;
  }

  /**
   * @dev - throws if called by any account that is not the deployed case scheduler
   */
  modifier onlyCaseScheduleManager() {
    require(
      msg.sender == address(caseScheduleManager()),
      'Must be the Case Schedule Manager contract'
    );
    _;
  }

  /**
   * @dev - either Case strategy manager
   */
  modifier onlyCaseManagerOrPatient(address _caseAddress) {
    Case _case = Case(_caseAddress);
    require(
         (msg.sender == _case.patient())
      || (msg.sender == address(caseManager())),
      'must be one of the Case Schedule Manager or Case Manager contracts'
    );
    _;
  }

  /**
   * @dev - throws if called by any account that is not the challenging doctor.
   */
  modifier onlyChallengeDoctor(address _caseAddress) {
    Case _case = Case(_caseAddress);

    require(
      msg.sender == _case.challengingDoctor(),
      'Must be the second opinion challenging doctor'
    );
    _;
  }

  /**
   * @dev - throws if called by any account other than a doctor.
   */
  modifier isDoctor(address _doctor) {
    require(doctorManager().isDoctor(_doctor), '_doctor address must be a Doctor');
    _;
  }

  /**
   * @dev - throws if called by any account other than the diagnosing doctor
   */
  modifier onlyDiagnosingDoctor(address _caseAddress) {
    Case _case = Case(_caseAddress);
    require(msg.sender == _case.diagnosingDoctor(), 'sender needs to be the diagnosis doctor');
    _;
  }

  /**
   * @dev - Contract should not accept any ether
   */
  function () public payable {
    revert();
  }

  function initialize(Registry _registry) public notInitialized {
    require(_registry != address(0), 'registry is not blank');
    registry = _registry;
    owner = msg.sender;
    setInitialized();
  }

  function challengeWithDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    onlyCaseLifecycleManager
  {
    Case _case = Case(_caseAddress);

    require(_case.status() == Case.CaseStatus.Evaluated, 'Status must match');
    _case.setStatus(Case.CaseStatus.Challenging);
    setChallengingDoctor(_case, _doctor, _doctorEncryptedKey);
    caseManager().addChallengeDoctor(_doctor);
    caseScheduleManager().touchUpdatedAt(_caseAddress);

    emit CaseChallenged(_case, _case.patient(), _doctor);
  }

  function setChallengingDoctor(Case _case, address _doctor, bytes _doctorEncryptedKey)
    internal
    isDoctor(_doctor)
    isCase(address(_case))
  {
    require(_doctor != _case.patient(), 'doctor cannot also be patient');
    require(_doctor != _case.diagnosingDoctor(), 'challenge doctor cannot be diagnosing doctor');
    _case.setChallengingDoctor(_doctor);
    _case.setDoctorEncryptedCaseKeys(_doctor, _doctorEncryptedKey);

    caseStatusManager().addOpenCase(_doctor, _case);

    emit ChallengeDoctorSet(_case, _case.patient(), _doctor, _doctorEncryptedKey);
  }


  /**
   * @dev - Submit a diagnosis for a challenged case, must be a different doctor to the first
   * @param _secondaryDiagnosisHash - Location of the diagnosis
   * @param _accept - diagnosis the same as the original
   */
  function diagnoseChallengedCase(
    address _caseAddress,
    bytes _secondaryDiagnosisHash,
    bool _accept
  )
    external
    onlyCaseLifecycleManager
  {
    Case _case = Case(_caseAddress);

    require(
      _case.status() == Case.CaseStatus.Challenging,
      'case needs to be challenged for a challenge diagnosis'
    );

    caseStatusManager().removeOpenCase(_case.challengingDoctor(), _case);
    caseStatusManager().addClosedCase(_case.challengingDoctor(), _case);
    caseStatusManager().removeOpenCase(_case.diagnosingDoctor(), _case);
    caseStatusManager().addClosedCase(_case.diagnosingDoctor(), _case);

    _case.setChallengeHash(_secondaryDiagnosisHash);
    caseScheduleManager().touchUpdatedAt(_caseAddress);

    if (_accept)
      confirmChallengedDiagnosis(_case);
    else
      rejectChallengedDiagnosis(_case);
  }

  /**
   * @dev - The second doctor confirms the diagnosis. Patient must have approved second doctor in order for them to have viewed the case files
   */
  function confirmChallengedDiagnosis(Case _case) internal {
    _case.setStatus(Case.CaseStatus.ClosedConfirmed);

    _case.transferCaseFeeToDiagnosingDoctor();
    _case.transferChallengingDoctorFee();
    _case.transferBalanceToPatient();

    emit CaseDiagnosisConfirmed(_case, _case.patient(), _case.challengingDoctor());
  }

  /**
   * @dev - The second doctor rejects the diagnosis
   */
  function rejectChallengedDiagnosis(Case _case) internal {
    _case.setStatus(Case.CaseStatus.ClosedRejected);

    _case.transferChallengingDoctorFee();
    _case.transferBalanceToPatient();

    emit CaseDiagnosesDiffer(_case, _case.patient(), _case.challengingDoctor());
  }

  function doctorManager() internal view returns (DoctorManager) {
    return DoctorManager(registry.lookup(keccak256("DoctorManager")));
  }

  function caseManager() internal view returns (CaseManager) {
    return CaseManager(registry.lookup(keccak256("CaseManager")));
  }

  function caseStatusManager() internal view returns (CaseStatusManager) {
    return CaseStatusManager(registry.lookup(keccak256("CaseStatusManager")));
  }

  function caseScheduleManager() internal view returns (CaseScheduleManager) {
    return CaseScheduleManager(registry.lookup(keccak256("CaseScheduleManager")));
  }

}
