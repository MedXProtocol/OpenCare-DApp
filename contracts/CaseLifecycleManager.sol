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

  event CaseEvaluated(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);

  event PatientWithdrewFunds(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event DoctorForceAcceptedDiagnosis(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event CaseClosed(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor, address _challengingDoctor);

  event CaseDiagnosesDiffer(address indexed _case, address indexed _patient, address indexed _challengingDoctor);
  event CaseDiagnosisConfirmed(address indexed _case, address indexed _patient, address indexed _challengingDoctor);

  event CaseChallenged(address indexed _case, address indexed _patient, address indexed _challengingDoctor);

  event DiagnosingDoctorSet(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor, bytes doctorEncryptedKey);
  event ChallengeDoctorSet(address indexed _case, address indexed _patient, address indexed _challengingDoctor, bytes doctorEncryptedKey);

  event ClearDiagnosingDoctor(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);

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

  function setDiagnosingDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    public
    isCase(_caseAddress)
    onlyCaseManagerOrPatient(_caseAddress)
    isDoctor(_doctor)
  {
    Case _case = Case(_caseAddress);

    require(_case.status() == Case.CaseStatus.Open, 'case must be open to set the diagnosingDoctor');
    require(_case.diagnosingDoctor() == address(0), 'the diagnosingDoctor must be empty');
    require(_doctor != _case.patient(), 'the doctor cannot be the patient');

    _case.setDiagnosingDoctor(_doctor);
    _case.setStatus(Case.CaseStatus.Evaluating);
    _case.setDoctorEncryptedCaseKeys(_doctor, _doctorEncryptedKey);

    caseStatusManager().addOpenCase(_doctor, _case);

    emit DiagnosingDoctorSet(_case, _case.patient(), _doctor, _doctorEncryptedKey);
  }

  function clearDiagnosingDoctor(Case _case) internal {
    address patient = _case.patient();
    address diagnosingDoctor = _case.diagnosingDoctor();

    require(diagnosingDoctor != address(0), 'the diagnosingDoctor must be already set in the Case contract');

    caseStatusManager().removeOpenCase(diagnosingDoctor, _case);

    _case.setDiagnosingDoctor(0x0);
    _case.setStatus(Case.CaseStatus.Open);

    emit ClearDiagnosingDoctor(_case, patient, diagnosingDoctor);
  }

  /**
   * @dev - The patient accepts the evaluation and tokens are credited to doctor
   * and rest is returned to the patient
   */
  function acceptDiagnosis(address _caseAddress)
    external
    isCase(_caseAddress)
    onlyPatient(_caseAddress)
  {
    Case _case = Case(_caseAddress);
    accept(_case);
  }

  function accept(Case _case) internal {
    require(_case.status() == Case.CaseStatus.Evaluated, 'the case must be Evaluated to accept');

    _case.transferCaseFeeToDiagnosingDoctor();

    close(_case);
  }

  function close(Case _case) internal {
    require(
         (_case.status() != Case.CaseStatus.Closed
       || _case.status() != Case.CaseStatus.ClosedRejected
       || _case.status() != Case.CaseStatus.ClosedConfirmed),
      'case must not be closed when trying to close'
    );
    _case.setStatus(Case.CaseStatus.Closed);
    address patient = _case.patient();
    address diagnosingDoctor = _case.diagnosingDoctor();
    address challengingDoctor = _case.challengingDoctor();

    _case.transferBalanceToPatient();

    caseStatusManager().removeOpenCase(diagnosingDoctor, _case);
    caseStatusManager().addClosedCase(diagnosingDoctor, _case);

    emit CaseClosed(_case, patient, diagnosingDoctor, challengingDoctor);
  }

  function challengeWithDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    onlyPatient(_caseAddress)
    isCase(_caseAddress)
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
     * @dev - doctor submits diagnosis for case. Patient must have approved the doctor in order for them to decrypt the case files
     * @param _diagnosisHash - Swarm hash of where the diagnosis data is stored
     */
  function diagnoseCase(address _caseAddress, bytes _diagnosisHash)
    external
    onlyDiagnosingDoctor(_caseAddress)
    isCase(_caseAddress)
  {
    Case _case = Case(_caseAddress);
    require(
      _case.status() == Case.CaseStatus.Evaluating,
      'case must be in evaluating state to diagnose'
    );
    _case.setStatus(Case.CaseStatus.Evaluated);
    _case.setDiagnosisHash(_diagnosisHash);
    caseScheduleManager().touchUpdatedAt(_caseAddress);
    emit CaseEvaluated(_case, _case.patient(), _case.diagnosingDoctor());
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

    caseScheduleManager().touchUpdatedAt(_caseAddress);
    close(_case);

    emit PatientWithdrewFunds(_case, _case.patient(), _case.diagnosingDoctor());
  }

  /**
   * @dev - allows the patient to choose another doc if the first doc hasn't responded after 24 hours
   */
  function patientRequestNewInitialDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    isCase(_caseAddress)
    onlyPatient(_caseAddress)
    patientWaitedOneDay(_caseAddress)
  {
    Case _case = Case(_caseAddress);

    caseScheduleManager().touchUpdatedAt(_caseAddress);

    clearDiagnosingDoctor(_case);

    _case.setDiagnosingDoctor(_doctor);
    _case.setDoctorEncryptedCaseKeys(_doctor, _doctorEncryptedKey);
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

    caseScheduleManager().touchUpdatedAt(_caseAddress);

    accept(_case);

    emit DoctorForceAcceptedDiagnosis(_case, _case.patient(), _case.diagnosingDoctor());
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
