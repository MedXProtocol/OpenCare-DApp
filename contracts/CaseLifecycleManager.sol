// This is the contract with mainly external method definitions to receive calls from web3 / etc
// It does the require / guard checks to ensure the incoming requests are coming from the correct
// user, and acts as the interface to update the state of a case

pragma solidity ^0.4.23;

import './Case.sol';
import './CaseManager.sol';
import './CaseFirstPhaseManager.sol';
import './CaseSecondPhaseManager.sol';
import './CaseScheduleManager.sol';
import './CaseStatusManager.sol';
import './DoctorManager.sol';
import "./Initializable.sol";
import './Registry.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseLifecycleManager is Ownable, Initializable {

  Registry registry;

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
   * @dev - throws unless either first (initial diagnosis) or second (challenge/second opinion)
            Case phase manager
   */
  modifier onlyCasePhaseManagers(address _caseAddress) {
    Case _case = Case(_caseAddress);
    require(
         (msg.sender == address(caseFirstPhaseManager()))
      || (msg.sender == address(caseSecondPhaseManager())),
      'must be one of the Case Phase Manager contracts'
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

    caseFirstPhaseManager().setDiagnosingDoctor(_caseAddress, _doctor, _doctorEncryptedKey);
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
    caseFirstPhaseManager().acceptDiagnosis(_caseAddress);
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

    caseFirstPhaseManager().diagnoseCase(_caseAddress, _diagnosisHash);
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

    caseFirstPhaseManager().patientWithdrawFunds(_caseAddress);
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

    caseFirstPhaseManager().patientRequestNewInitialDoctor(_caseAddress, _doctor, _doctorEncryptedKey);
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
    caseFirstPhaseManager().acceptAsDoctor(_caseAddress);
  }

  function challengeWithDoctor(address _caseAddress, address _doctor, bytes _doctorEncryptedKey)
    external
    onlyPatient(_caseAddress)
    isCase(_caseAddress)
  {
    Case _case = Case(_caseAddress);
    require(_case.status() == Case.CaseStatus.Evaluated, 'Status must match');

    caseSecondPhaseManager().challengeWithDoctor(_caseAddress, _doctor, _doctorEncryptedKey);
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

    caseSecondPhaseManager().diagnoseChallengedCase(_caseAddress, _secondaryDiagnosisHash, _accept);
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

  function caseFirstPhaseManager() internal view returns (CaseFirstPhaseManager) {
    return CaseFirstPhaseManager(registry.lookup(keccak256("CaseFirstPhaseManager")));
  }

  function caseSecondPhaseManager() internal view returns (CaseSecondPhaseManager) {
    return CaseSecondPhaseManager(registry.lookup(keccak256("CaseSecondPhaseManager")));
  }

}
