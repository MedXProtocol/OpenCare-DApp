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

  event PatientWithdraw(address indexed case, address indexed patient, address indexed doctor);
  event CaseClosed(address indexed case, address indexed patient, address indexed diagnosingDoctor, address challengingDoctor);

  event CaseDiagnosesDiffer(address indexed case, address indexed patient, address indexed doctor);
  event CaseDiagnosisConfirmed(address indexed case, address indexed patient, address indexed doctor);

  event CaseChallenged(address indexed case, address indexed patient, address indexed doctor);

  event SetDiagnosingDoctor(address indexed case, address indexed patient, address indexed doctor, bytes doctorEncryptedKey);
  event SetChallengingDoctor(address indexed case, address indexed patient, address indexed doctor, bytes doctorEncryptedKey);

  event ClearDiagnosingDoctor(address indexed case, address indexed patient, address indexed clearedDoctor);

  /**
   * @dev - throws if called by any account that is not the deployed case scheduler
   */
  modifier onlyCaseScheduleManager() {
    require(msg.sender == address(caseScheduleManager()), 'Must be the Case Schedule Manager contract');
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
  modifier onlyChallengeDoctor() {
    require(msg.sender == challengingDoctor, 'Must be the second opinion challenging doctor');
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

  function setDiagnosingDoctor(address _doctor, bytes _doctorEncryptedKey)
    external
    onlyCaseStrategyManagers isDoctor(_doctor)
  {
    require(status == CaseStatus.Open, 'case must be open to set the diagnosingDoctor');
    require(diagnosingDoctor == address(0), 'the diagnosingDoctor must be empty');
    require(_doctor != patient, 'the doctor cannot be the patient');
    diagnosingDoctor = _doctor;
    status = CaseStatus.Evaluating;
    caseStatusManager().addOpenCase(_doctor, this);
    doctorEncryptedCaseKeys[_doctor] = _doctorEncryptedKey;
    emit SetDiagnosingDoctor(patient, _doctor, _doctorEncryptedKey);
  }

  function clearDiagnosingDoctor() external onlyCaseScheduleManager {
    require(diagnosingDoctor != address(0), 'the diagnosingDoctor must be set');
    emit ClearDiagnosingDoctor(patient, diagnosingDoctor);
    caseStatusManager().removeOpenCase(diagnosingDoctor, this);
    diagnosingDoctor = 0x0;
    status = CaseStatus.Open;
  }

  /**
   * @dev - The patient accepts the evaluation and tokens are credited to doctor
   * and rest is returned to the patient
   */
  function acceptDiagnosis() external onlyPatient {
    accept();
  }

  function acceptDiagnosisAsDoctor() external onlyCaseScheduleManager {
    accept();
  }

  function accept() internal {
    require(status == CaseStatus.Evaluated, 'the case must be Evaluated to accept');

    medXToken.transfer(diagnosingDoctor, caseFee);

    close();
  }

  /**
   * @dev - allows the patient to withdraw funds after 1 day if the initial doc didn't respond
   */
  function patientClose() external onlyCaseScheduleManager {
    close();
    emit PatientWithdraw(patient, diagnosingDoctor);
  }

  function close() internal {
    require(
         status != CaseStatus.Closed
      || status != CaseStatus.ClosedRejected
      || status != CaseStatus.ClosedConfirmed, 'case must not be closed prior to closing'
    );
    status = CaseStatus.Closed;

    medXToken.transfer(patient, medXToken.balanceOf(address(this)));

    caseStatusManager().removeOpenCase(diagnosingDoctor, this);
    caseStatusManager().addClosedCase(diagnosingDoctor, this);

    emit CaseClosed(patient, diagnosingDoctor, challengingDoctor);
  }

  function challengeWithDoctor(address _doctor, bytes _doctorEncryptedKey) external onlyPatient {
    require(status == CaseStatus.Evaluated, 'Status must match');
    status = CaseStatus.Challenging;
    setChallengingDoctor(_doctor, _doctorEncryptedKey);
    caseManager().addChallengeDoctor(_doctor);
    caseScheduleManager().touchUpdatedAt(this);

    emit CaseChallenged(patient, _doctor);
  }

  function setChallengingDoctor (address _doctor, bytes _doctorEncryptedKey) internal isDoctor(_doctor) {
    require(_doctor != patient, 'doctor cannot also be patient');
    require(_doctor != diagnosingDoctor, 'challenge doctor cannot be diagnosing doctor');
    challengingDoctor = _doctor;
    caseStatusManager().addOpenCase(challengingDoctor, this);
    doctorEncryptedCaseKeys[_doctor] = _doctorEncryptedKey;
    emit SetChallengingDoctor(patient, msg.sender, _doctorEncryptedKey);
  }

  /**
   * @dev - Submit a diagnosis for a challenged case, must be a different doctor to the first
   * @param _secondaryDiagnosisHash - Location of the diagnosis
   * @param _accept - diagnosis the same as the original
   */
  function diagnoseChallengedCase(bytes _secondaryDiagnosisHash, bool _accept) external onlyChallengeDoctor {
    require(status == CaseStatus.Challenging, 'case needs to be challenged for a challenge diagnosis');
    caseStatusManager().removeOpenCase(challengingDoctor, this);
    caseStatusManager().addClosedCase(challengingDoctor, this);
    caseStatusManager().removeOpenCase(diagnosingDoctor, this);
    caseStatusManager().addClosedCase(diagnosingDoctor, this);
    challengeHash = _secondaryDiagnosisHash;
    caseScheduleManager().touchUpdatedAt(this);

    if (_accept)
        confirmChallengedDiagnosis();
    else
        rejectChallengedDiagnosis();
  }

  /**
   * @dev - The second doctor confirms the diagnosis. Patient must have approved second doctor in order for them to have viewed the case files
   */
  function confirmChallengedDiagnosis() internal {
    status = CaseStatus.ClosedConfirmed;

    medXToken.transfer(diagnosingDoctor, caseFee);
    medXToken.transfer(challengingDoctor, caseFee.mul(50).div(100));
    medXToken.transfer(patient, medXToken.balanceOf(address(this)));

    emit CaseDiagnosisConfirmed(patient, challengingDoctor);
  }

  /**
   * @dev - The second doctor rejects the diagnosis
   */
  function rejectChallengedDiagnosis() internal {
    status = CaseStatus.ClosedRejected;

    medXToken.transfer(challengingDoctor, caseFee.mul(50).div(100));
    medXToken.transfer(patient, medXToken.balanceOf(address(this)));

    emit CaseDiagnosesDiffer(patient, challengingDoctor);
  }

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
   * @dev - allows the patient to withdraw funds after 1 day if the initial doc didn't respond
   */
  function patientWithdrawFunds(address _caseAddress)
    external
    onlyPatient(_caseAddress) patientWaitedOneDay(_caseAddress)
  {
    caseScheduleManager().touchUpdatedAt(_caseAddress)

    Case _case = Case(_caseAddress);
    _case.patientClose();
  }

  /**
   * @dev - allows the patient to choose another doc if the first doc hasn't responded after 24 hours
   */
  function patientRequestNewDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    onlyPatient(_caseAddress) patientWaitedOneDay(_caseAddress)
  {
    caseScheduleManager().touchUpdatedAt(_caseAddress)

    Case _case = Case(_caseAddress);
    _case.clearDiagnosingDoctor();
    _case.setDiagnosingDoctor(_doctor, _doctorEncryptedKey);
  }

  /**
   * @dev - The initial doctor can accept their evaluation after 48 hours and get tokens owing to them
   */
  function acceptAsDoctor(address _caseAddress)
    external
    onlyDiagnosingDoctor(_caseAddress) doctorWaitedTwoDays(_caseAddress)
  {
    caseScheduleManager().touchUpdatedAt(_caseAddress)

    Case _case = Case(_caseAddress);
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

  function getDiagnosingDoctor() public view returns (address) {
    return diagnosingDoctor;
  }

  function getChallengingDoctor() public view returns (address) {
    return challengingDoctor;
  }

}
