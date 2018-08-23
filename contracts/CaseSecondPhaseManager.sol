pragma solidity ^0.4.23;

import './Case.sol';
import './CaseManager.sol';
import './CaseScheduleManager.sol';
import './CaseStatusManager.sol';
import './DoctorManager.sol';
import "./Initializable.sol";
import './Registry.sol';
import './RegistryLookup.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseSecondPhaseManager is Ownable, Initializable {

  using RegistryLookup for Registry;

  Registry registry;

  event CaseDiagnosesDiffer(address indexed _case, address indexed _patient, address indexed _challengingDoctor);
  event CaseDiagnosisConfirmed(address indexed _case, address indexed _patient, address indexed _challengingDoctor);
  event CaseChallenged(address indexed _case, address indexed _patient, address indexed _challengingDoctor);
  event ChallengeDoctorSet(address indexed _case, address indexed _patient, address indexed _challengingDoctor, bytes doctorEncryptedKey);
  event ChallengedCaseClosed(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor, address _challengingDoctor);

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

  function challengeWithDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    onlyCaseLifecycleManager
  {
    Case _case = Case(_caseAddress);

    _case.setStatus(Case.CaseStatus.Challenging);
    setChallengingDoctor(_case, _doctor, _doctorEncryptedKey);

    registry.caseManager().addChallengeDoctor(_doctor, _caseAddress);

    registry.caseScheduleManager().touchUpdatedAt(_caseAddress);

    emit CaseChallenged(_caseAddress, _case.patient(), _doctor);
  }

  function setChallengingDoctor(Case _case, address _doctor, bytes _doctorEncryptedKey) internal {
    _case.setChallengingDoctor(_doctor);
    _case.setDoctorEncryptedCaseKeys(_doctor, _doctorEncryptedKey);

    registry.caseStatusManager().addOpenCase(_doctor, _case);

    emit ChallengeDoctorSet(_case, _case.patient(), _doctor, _doctorEncryptedKey);
  }


  /**
   * @dev - Submit a diagnosis for a challenged case, must be a different doctor to the first
   * @param _secondaryDiagnosisHash - Location of the diagnosis
   * @param _accept - diagnosis the same as the original
   */
  function diagnoseChallengedCase(Case _case, bytes _secondaryDiagnosisHash, bool _accept)
    external
    onlyCaseLifecycleManager
  {
    CaseStatusManager caseStatusManager = registry.caseStatusManager();

    _case.setChallengeHash(_secondaryDiagnosisHash);

    if (_accept)
      confirmChallengedDiagnosis(_case);
    else
      rejectChallengedDiagnosis(_case);

    caseStatusManager.removeOpenCase(_case.challengingDoctor(), _case);
    caseStatusManager.addClosedCase(_case.challengingDoctor(), _case);
    caseStatusManager.removeOpenCase(_case.diagnosingDoctor(), _case);
    caseStatusManager.addClosedCase(_case.diagnosingDoctor(), _case);

    registry.caseScheduleManager().touchUpdatedAt(address(_case));

    _case.finalize();

    emit ChallengedCaseClosed(_case, _case.patient(), _case.diagnosingDoctor(), _case.challengingDoctor());
  }

  /**
   * @dev - The second doctor confirms the diagnosis. Patient must have approved second doctor in order for them to have viewed the case files
   */
  function confirmChallengedDiagnosis(Case _case) internal {
    _case.setStatus(Case.CaseStatus.ClosedConfirmed);

    _case.transferCaseFeeToDiagnosingDoctor();
    _case.transferChallengingDoctorFee();
    _case.transferRemainingBalanceToPatient();

    emit CaseDiagnosisConfirmed(_case, _case.patient(), _case.challengingDoctor());
  }

  /**
   * @dev - The second doctor rejects the diagnosis
   */
  function rejectChallengedDiagnosis(Case _case) internal {
    _case.setStatus(Case.CaseStatus.ClosedRejected);

    _case.transferChallengingDoctorFee();
    _case.transferRemainingBalanceToPatient();

    emit CaseDiagnosesDiffer(_case, _case.patient(), _case.challengingDoctor());
  }

}
