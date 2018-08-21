pragma solidity ^0.4.23;

import './Case.sol';
// import './CaseLifecycleManager.sol';
// import './CaseManager.sol';
// import './CaseScheduleManager.sol';
// import './CaseStatusManager.sol';
import "./Initializable.sol";
import './Registry.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseFirstPhaseManager is Ownable, Initializable {

  Registry registry;

  event DiagnosingDoctorSet(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor, bytes doctorEncryptedKey);
  event ClearDiagnosingDoctor(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event PatientWithdrewFunds(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event InitialDiagnosisReceived(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event PatientAcceptedDiagnosis(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event InitialDoctorForceAcceptedDiagnosis(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);
  event InitialCaseClosed(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor);

  /**
   * @dev - throws if called by anything not an instance of the lifecycle manager contract
   */
  modifier onlyCaseLifecycleManager() {
    require(
      msg.sender == address(registry.caseLifecycleManager()),
      'Must be an instance of Case lifecycle Manager contract'
    );
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

  function setDiagnosingDoctor(Case _case, address _doctor, bytes _doctorEncryptedKey)
    public
    onlyCaseLifecycleManager
  {
    _case.setDiagnosingDoctor(_doctor);
    _case.setStatus(Case.CaseStatus.Evaluating);
    _case.setDoctorEncryptedCaseKeys(_doctor, _doctorEncryptedKey);

    registry.caseStatusManager().addOpenCase(_doctor, _case);

    emit DiagnosingDoctorSet(_case, _case.patient(), _doctor, _doctorEncryptedKey);
  }

  function clearDiagnosingDoctor(Case _case) internal {
    address patient = _case.patient();
    address diagnosingDoctor = _case.diagnosingDoctor();

    require(diagnosingDoctor != address(0), 'the diagnosingDoctor must be already set in the Case contract');

    registry.caseStatusManager().removeOpenCase(diagnosingDoctor, _case);

    _case.setDiagnosingDoctor(0x0);
    _case.setStatus(Case.CaseStatus.Open);

    emit ClearDiagnosingDoctor(_case, patient, diagnosingDoctor);
  }

  /**
   * @dev - The patient accepts the evaluation and tokens are credited to doctor
   * and rest is returned to the patient
   */
  function acceptDiagnosis(Case _case) external onlyCaseLifecycleManager {
    accept(_case);

    emit PatientAcceptedDiagnosis(_case, _case.patient(), _case.diagnosingDoctor());
  }

  /**
   * @dev - The initial doctor can accept their evaluation after 48 hours and get tokens owing to them
   */
  function acceptAsDoctor(Case _case) external onlyCaseLifecycleManager {
    accept(_case);

    emit InitialDoctorForceAcceptedDiagnosis(_case, _case.patient(), _case.diagnosingDoctor());
  }

  function accept(Case _case) internal {
    _case.transferCaseFeeToDiagnosingDoctor();

    finalize(_case);
  }

  function finalize(Case _case) internal {
    address diagnosingDoctor = _case.diagnosingDoctor();

    _case.transferRemainingBalanceToPatient();

    registry.caseScheduleManager().touchUpdatedAt(address(_case));

    registry.caseStatusManager().removeOpenCase(diagnosingDoctor, _case);
    registry.caseStatusManager().addClosedCase(diagnosingDoctor, _case);

    emit InitialCaseClosed(_case, _case.patient(), diagnosingDoctor);
    _case.close();
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
    registry.caseScheduleManager().touchUpdatedAt(_caseAddress);

    emit InitialDiagnosisReceived(_case, _case.patient(), _case.diagnosingDoctor());
  }

  /**
   * @dev - allows the patient to withdraw funds after 1 day if the initial doc didn't respond
   */
  function patientWithdrawFunds(address _caseAddress)
    external
    onlyCaseLifecycleManager
  {
    Case _case = Case(_caseAddress);

    registry.caseScheduleManager().touchUpdatedAt(_caseAddress);

    finalize(_case);

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

    registry.caseScheduleManager().touchUpdatedAt(_caseAddress);

    clearDiagnosingDoctor(_case);

    _case.setDiagnosingDoctor(_doctor);
    _case.setDoctorEncryptedCaseKeys(_doctor, _doctorEncryptedKey);
  }

}
