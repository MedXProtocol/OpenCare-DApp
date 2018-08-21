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

  event DiagnosingDoctorSet(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor, bytes doctorEncryptedKey);
  event ClearDiagnosingDoctor(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event PatientWithdrewFunds(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event InitialDiagnosisReceived(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event InitialDoctorForceAcceptedDiagnosis(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event InitialCaseClosed(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor, address _challengingDoctor);

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
    onlyCaseLifecycleManager
  {
    Case _case = Case(_caseAddress);

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
     * @dev - doctor submits diagnosis for case. Patient must have approved the doctor in order for them to decrypt the case files
     * @param _diagnosisHash - Swarm hash of where the diagnosis data is stored
     */
  function diagnoseCase(address _caseAddress, bytes _diagnosisHash)
    external
    onlyCaseLifecycleManager
  {
    Case _case = Case(_caseAddress);
    require(
      _case.status() == Case.CaseStatus.Evaluating,
      'case must be in evaluating state to diagnose'
    );
    _case.setStatus(Case.CaseStatus.Evaluated);
    _case.setDiagnosisHash(_diagnosisHash);
    caseScheduleManager().touchUpdatedAt(_caseAddress);
    emit InitialDiagnosisReceived(_case, _case.patient(), _case.diagnosingDoctor());
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

  /**
   * @dev - allows the patient to withdraw funds after 1 day if the initial doc didn't respond
   */
  function patientWithdrawFunds(address _caseAddress)
    external
    onlyCaseLifecycleManager
  {
    Case _case = Case(_caseAddress);

    caseScheduleManager().touchUpdatedAt(_caseAddress);
    caseLifecycleManager().close(_case);

    emit PatientWithdrewFunds(_case, _case.patient(), _case.diagnosingDoctor());
  }

  /**
   * @dev - allows the patient to choose another doc if the first doc hasn't responded after 24 hours
   */
  function patientRequestNewInitialDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    onlyCaseLifecycleManager
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
    onlyCaseLifecycleManager
  {
    Case _case = Case(_caseAddress);

    caseScheduleManager().touchUpdatedAt(_caseAddress);

    accept(_case);

    emit InitialDoctorForceAcceptedDiagnosis(_case, _case.patient(), _case.diagnosingDoctor());
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
