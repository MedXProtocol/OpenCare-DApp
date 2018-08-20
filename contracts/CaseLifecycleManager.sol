pragma solidity ^0.4.23;

import './Case.sol';
import './Registry.sol';
import "./Initializable.sol";
import './CaseManager.sol';
import './CaseStatusManager.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CaseLifecycleManager is Ownable, Pausable, Initializable {

  Registry registry;

  event CaseEvaluated(address indexed case, address indexed patient, address indexed doctor);

  event PatientWithdrew(address indexed case, address indexed patient, address indexed doctor);
  event CaseClosed(address indexed case, address indexed patient, address indexed diagnosingDoctor, address challengingDoctor);

  event CaseDiagnosesDiffer(address indexed case, address indexed patient, address indexed doctor);
  event CaseDiagnosisConfirmed(address indexed case, address indexed patient, address indexed doctor);

  event CaseChallenged(address indexed case, address indexed patient, address indexed doctor);

  event DiagnosingDoctorSet(address indexed case, address indexed patient, address indexed doctor, bytes doctorEncryptedKey);
  event ChallengeDoctorSet(address indexed case, address indexed patient, address indexed doctor, bytes doctorEncryptedKey);

  event ClearDiagnosingDoctor(address indexed case, address indexed patient, address indexed clearedDoctor);

  /**
   * @dev - throws unless the patient has waited 24 hours
   */
  modifier patientWaitedOneDay(address _caseAddress) {
    caseScheduleManager().patientWaitedOneDay(_caseAddress);
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
   * @dev - throws if called by any account that is not the deployed case scheduler
   */
  modifier isCase(address caseAddress) {
    require(caseManager().isCase(_caseAddress), 'Must be an instance of a Case contract');
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
  modifier onlyCaseStrategyManagers() {
    require(
         (msg.sender == address(caseScheduleManager()))
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

  function setDiagnosingDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    isCase(_caseAddress)
    onlyCaseStrategyManagers
    isDoctor(_doctor)
  {
    Case _case = Case(_caseAddress);

    require(_case.status() == Case.CaseStatus.Open, 'case must be open to set the diagnosingDoctor');
    require(_case.diagnosingDoctor() == address(0), 'the diagnosingDoctor must be empty');
    require(_doctor != _case.patient, 'the doctor cannot be the patient');

    _case.setDiagnosingDoctor(_doctor);
    _case.setStatus(Case.CaseStatus.Evaluating);
    _case.setDoctorEncryptedCaseKeys(_doctor, _doctorEncryptedKey);

    caseStatusManager().addOpenCase(_doctor, this);
    emit DiagnosingDoctorSet(patient, _doctor, _doctorEncryptedKey);
  }

  function clearDiagnosingDoctor(address _caseAddress)
    external
    isCase(_caseAddress)
    onlyCaseScheduleManager
  {
    Case _case = Case(_caseAddress);
    memory patient = _case.patient()
    memory diagnosingDoctor = _case.diagnosingDoctor()

    require(diagnosingDoctor != address(0), 'the diagnosingDoctor must be already set in the Case contract');

    caseStatusManager().removeOpenCase(diagnosingDoctor, this);

    _case.setDiagnosingDoctor(0x0);
    _case.setStatus(Case.CaseStatus.Open);

    emit ClearDiagnosingDoctor(patient, diagnosingDoctor);
  }

  /**
   * @dev - The patient accepts the evaluation and tokens are credited to doctor
   * and rest is returned to the patient
   */
  function acceptDiagnosis(address _caseAddress)
    external
    isCase(_caseAddress)
    onlyPatient
  {
    Case _case = Case(_caseAddress);
    accept(_case);
  }

  function acceptDiagnosisAsDoctor(address _caseAddress)
    external
    isCase(_caseAddress)
    onlyCaseScheduleManager
  {
    Case _case = Case(_caseAddress);
    accept(_case);
  }

  function accept(Case _case) internal {
    require(_case.status() == Case.CaseStatus.Evaluated, 'the case must be Evaluated to accept');

    medXToken.transfer(_case.diagnosingDoctor(), _case.caseFee());

    close(_case);
  }

  /**
   * @dev - allows the patient to withdraw funds after 1 day if the initial doc didn't respond
   */
  function patientClose(address _caseAddress)
    external
    onlyCaseScheduleManager
    isCase(_caseAddress)
  {
    Case _case = Case(_caseAddress);

    close(_case);

    emit PatientWithdrew(_case.patient(), _case.diagnosingDoctor());
  }

  function close(Case _case) internal {
    require(
         (_case.status() != Case.CaseStatus.Closed
       || _case.status() != Case.CaseStatus.ClosedRejected
       || _case.status() != Case.CaseStatus.ClosedConfirmed),
      'case must not be closed when trying to close'
    );
    _case.setStatus(Case.CaseStatus.Closed);
    memory patient = _case.patient()
    memory diagnosingDoctor = _case.diagnosingDoctor()
    memory challengingDoctor = _case.challengingDoctor()

    medXToken.transfer(patient, medXToken.balanceOf(address(this)));

    caseStatusManager().removeOpenCase(diagnosingDoctor, this);
    caseStatusManager().addClosedCase(diagnosingDoctor, this);

    emit CaseClosed(patient, diagnosingDoctor, challengingDoctor);
  }

  function challengeWithDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    onlyPatient
    isCase(_caseAddress)
  {
    Case _case = Case(_caseAddress);

    require(_case.status() == Case.CaseStatus.Evaluated, 'Status must match');
    _case.setStatus(Case.CaseStatus.Challenging);
    setChallengingDoctor(_case, _doctor, _doctorEncryptedKey);
    caseManager().addChallengeDoctor(_doctor);
    caseScheduleManager().touchUpdatedAt(_caseAddress);

    emit CaseChallenged(_case.patient(), _doctor);
  }

  function setChallengingDoctor(Case _case, address _doctor, bytes _doctorEncryptedKey)
    internal
    isDoctor(_doctor)
    isCase(_caseAddress)
  {
    require(_doctor != _case.patient(), 'doctor cannot also be patient');
    require(_doctor != _case.diagnosingDoctor(), 'challenge doctor cannot be diagnosing doctor');
    _case.setChallengingDoctor(_doctor);
    _case.setDoctorEncryptedCaseKeys(_doctor, _doctorEncryptedKey);

    caseStatusManager().addOpenCase(_doctor, this);

    emit ChallengeDoctorSet(_case.patient(), _doctor, _doctorEncryptedKey);
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
    isCase(_caseAddress)
    onlyChallengeDoctor(_caseAddress)
  {
    Case _case = Case(_caseAddress);

    require(
      status == Case.CaseStatus.Challenging,
      'case needs to be challenged for a challenge diagnosis'
    );

    caseStatusManager().removeOpenCase(challengingDoctor, this);
    caseStatusManager().addClosedCase(challengingDoctor, this);
    caseStatusManager().removeOpenCase(diagnosingDoctor, this);
    caseStatusManager().addClosedCase(diagnosingDoctor, this);
    challengeHash = _secondaryDiagnosisHash;
    caseScheduleManager().touchUpdatedAt(_caseAddress);

    if (_accept)
        confirmChallengedDiagnosis();
    else
        rejectChallengedDiagnosis();
  }

  /**
   * @dev - The second doctor confirms the diagnosis. Patient must have approved second doctor in order for them to have viewed the case files
   */
  function confirmChallengedDiagnosis(Case _case) internal {
    status = Case.CaseStatus.ClosedConfirmed;

    medXToken.transfer(diagnosingDoctor, caseFee);
    medXToken.transfer(challengingDoctor, caseFee.mul(50).div(100));
    medXToken.transfer(patient, medXToken.balanceOf(address(this)));

    emit CaseDiagnosisConfirmed(patient, challengingDoctor);
  }

  /**
   * @dev - The second doctor rejects the diagnosis
   */
  function rejectChallengedDiagnosis(Case _case) internal {
    status = Case.CaseStatus.ClosedRejected;

    medXToken.transfer(challengingDoctor, caseFee.mul(50).div(100));
    medXToken.transfer(patient, medXToken.balanceOf(address(this)));

    emit CaseDiagnosesDiffer(patient, challengingDoctor);
  }

  /**
   * @dev - allows the patient to withdraw funds after 1 day if the initial doc didn't respond
   */
  function patientWithdrawFunds(address _caseAddress)
    external
    isCase(_caseAddress)
    onlyPatient(_caseAddress)
    patientWaitedOneDay(_caseAddress)
  {
    Case _case = Case(_caseAddress);
    caseScheduleManager().touchUpdatedAt(_caseAddress)

    Case _case = Case(_caseAddress);
    _case.patientClose();
  }

  /**
   * @dev - allows the patient to choose another doc if the first doc hasn't responded after 24 hours
   */
  function patientRequestNewDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    isCase(_caseAddress)
    onlyPatient(_caseAddress)
    patientWaitedOneDay(_caseAddress)
  {
    Case _case = Case(_caseAddress);

    caseScheduleManager().touchUpdatedAt(_caseAddress)

    _case.clearDiagnosingDoctor();
    _case.setDiagnosingDoctor(_doctor, _doctorEncryptedKey);
  }

  /**
   * @dev - The initial doctor can accept their evaluation after 48 hours and get tokens owing to them
   */
  function acceptAsDoctor(address _caseAddress)
    external
    isCase(_caseAddress)
    onlyDiagnosingDoctor(_caseAddress)
    doctorWaitedTwoDays(_caseAddress)
  {
    Case _case = Case(_caseAddress);

    caseScheduleManager().touchUpdatedAt(_caseAddress)

    _case.acceptDiagnosisAsDoctor();
  }

  function doctorManager() internal view returns (IDoctorManager) {
    return IDoctorManager(registry.lookup(keccak256("DoctorManager")));
  }

  function caseManager() internal view returns (ICaseManager) {
    return ICaseManager(registry.lookup(keccak256("CaseManager")));
  }

  function caseStatusManager() internal view returns (CaseStatusManager) {
    return CaseStatusManager(registry.lookup(keccak256("CaseStatusManager")));
  }

  function caseScheduleManager() internal view returns (CaseScheduleManager) {
    return CaseScheduleManager(registry.lookup(keccak256("CaseScheduleManager")));
  }

}
