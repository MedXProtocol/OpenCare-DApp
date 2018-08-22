pragma solidity ^0.4.23;

import "./DoctorManager.sol";
import "./IRegistry.sol";
import "./Initializable.sol";
import "./ICaseManager.sol";
import "./CaseStatusManager.sol";
import "./WETH9.sol";

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Case is Ownable, Initializable {
  using SafeMath for uint256;

  uint256 public caseFee;

  address public patient;
  address public diagnosingDoctor;
  address public challengingDoctor;

  bytes public caseDataHash;
  bytes public diagnosisHash;
  bytes public challengeHash;

  IRegistry public registry;

  CaseStatus public status;

  bytes public encryptedCaseKey;
  bytes public caseKeySalt;

  mapping(address => bytes) public doctorEncryptedCaseKeys;

  enum CaseStatus {
    None,
    Open,
    Evaluating,
    Evaluated,
    Closed,
    Challenged,
    Challenging,
    ClosedRejected,
    ClosedConfirmed
  }

  uint public createdAt;
  uint public updatedAt;

  event CaseCreated(address indexed patient);
  event CaseEvaluated(address indexed patient, address indexed doctor);
  event CaseClosed(address indexed patient, address indexed doctor);
  event CaseClosedRejected(address indexed patient, address indexed doctor);
  event CaseClosedConfirmed(address indexed patient, address indexed doctor);
  event CaseChallenged(address indexed patient, address indexed doctor);
  event SetDiagnosingDoctor(address indexed patient, address indexed doctor, bytes doctorEncryptedKey);
  event SetChallengingDoctor(address indexed patient, address indexed doctor, bytes doctorEncryptedKey);

  /**
   * @dev - throws if called by any account other than the patient.
   */
  modifier onlyPatient() {
    require(msg.sender == patient, 'Sender must be patient');
    _;
  }

  /**
   * @dev - throws if called by any account other than a doctor.
   */
  modifier isDoctor(address _doctor) {
    require(doctorManager().isDoctor(_doctor), 'Sender must be a Doctor');
    _;
  }

  /**
   * @dev - throws if called by any account that is not the initial diagnosing doctor.
   */
  modifier onlyDiagnosingDoctor() {
    require(msg.sender == diagnosingDoctor, 'Must be the initial diagnosing doctor');
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
   * @dev - throws if called by any account that is not the deployed case manager
   */
  modifier onlyCaseManager() {
    require(msg.sender == address(caseManager()), 'Must be the Case Manager contract');
    _;
  }

  /**
   * @dev - Creates a new case with the given parameters
   * @param _patient - the patient who created the case
   * @param _caseFee - fee for this particular case
   * @param _registry - the registry contract
   */
  function initialize (
      address _patient,
      bytes _encryptedCaseKey,
      bytes _caseKeySalt,
      bytes _caseHash,
      uint256 _caseFee,
      address _registry
  ) external notInitialized {
    setInitialized();
    require(_encryptedCaseKey.length != 0, 'missing encrypted case key');
    require(_caseKeySalt.length != 0, 'missing case key salt');
    require(_caseHash.length != 0, 'no case hash given');
    createdAt = block.timestamp;
    updatedAt = block.timestamp;
    owner = msg.sender;
    status = CaseStatus.Open;
    encryptedCaseKey = _encryptedCaseKey; // don't need to store this
    caseKeySalt = _caseKeySalt;
    patient = _patient;
    caseDataHash = _caseHash; // don't need to store this
    caseFee = _caseFee;
    registry = IRegistry(_registry);
    emit CaseCreated(patient);
  }

  function deposit() external payable {
    require(msg.value >= createCaseCost(), 'Not enough ether to create case');
    lookupWeth9().deposit.value(msg.value)();
  }

  /**
   * @dev - Contract should not accept any ether
   */
  function () public payable {
    revert();
  }

  function touchUpdatedAt() internal {
    updatedAt = block.timestamp;
  }

  function setDiagnosingDoctor (address _doctor, bytes _doctorEncryptedKey) external onlyCaseManager isDoctor(_doctor) {
    require(status == CaseStatus.Open, 'Case status is not open');
    require(diagnosingDoctor == address(0), 'diagnosing doctor is zero');
    require(_doctor != patient, 'doctor cannot be the patient');
    diagnosingDoctor = _doctor;
    status = CaseStatus.Evaluating;
    caseStatusManager().addOpenCase(_doctor, this);
    doctorEncryptedCaseKeys[_doctor] = _doctorEncryptedKey;
    emit SetDiagnosingDoctor(patient, msg.sender, _doctorEncryptedKey);
  }

  /**
   * @dev - doctor submits diagnosis for case. Patient must have approved the doctor in order for them to decrypt the case files
   * @param _diagnosisHash - Swarm hash of where the diagnosis data is stored
   */
  function diagnoseCase(bytes _diagnosisHash) external onlyDiagnosingDoctor {
    require(status == CaseStatus.Evaluating);
    status = CaseStatus.Evaluated;
    diagnosisHash = _diagnosisHash;
    touchUpdatedAt();
    emit CaseEvaluated(patient, diagnosingDoctor);
  }

  /**
   * @dev - The patient accepts the evaluation and tokens are credited to doctor
   * and rest is returned to the patient
   */
  function acceptDiagnosis() external onlyPatient {
    accept();
  }

  /**
   * @dev - The initial doctor accepts the evaluation and tokens are credited to them
   */
  function acceptAsDoctorAfterADay() external onlyDiagnosingDoctor {
    require((block.timestamp - updatedAt) > 86400);

    accept();
  }

  function accept() internal {
    require(status == CaseStatus.Evaluated);
    status = CaseStatus.Closed;
    caseStatusManager().removeOpenCase(diagnosingDoctor, this);
    caseStatusManager().addClosedCase(diagnosingDoctor, this);
    WETH9 weth9 = lookupWeth9();
    weth9.transfer(diagnosingDoctor, caseFee);
    weth9.transfer(patient, weth9.balanceOf(address(this)));
    touchUpdatedAt();
    emit CaseClosed(patient, diagnosingDoctor);
  }

  function challengeWithDoctor(address _doctor, bytes _doctorEncryptedKey) external onlyPatient {
    require(status == CaseStatus.Evaluated, 'Status must match');
    status = CaseStatus.Challenging;
    setChallengingDoctor(_doctor, _doctorEncryptedKey);
    caseManager().addChallengeDoctor(_doctor);
    touchUpdatedAt();
    emit CaseChallenged(patient, _doctor);
  }

  function setChallengingDoctor (address _doctor, bytes _doctorEncryptedKey) internal isDoctor(_doctor) {
    require(_doctor != patient);
    require(_doctor != diagnosingDoctor);
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
    require(status == CaseStatus.Challenging);
    caseStatusManager().removeOpenCase(challengingDoctor, this);
    caseStatusManager().addClosedCase(challengingDoctor, this);
    caseStatusManager().removeOpenCase(diagnosingDoctor, this);
    caseStatusManager().addClosedCase(diagnosingDoctor, this);
    challengeHash = _secondaryDiagnosisHash;
    touchUpdatedAt();
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

    WETH9 weth9 = lookupWeth9();
    weth9.transfer(diagnosingDoctor, caseFee);
    weth9.transfer(challengingDoctor, caseFee.mul(50).div(100));
    weth9.transfer(patient, weth9.balanceOf(address(this)));

    emit CaseClosedConfirmed(patient, challengingDoctor);
  }

  /**
   * @dev - The second doctor rejects the diagnosis
   */
  function rejectChallengedDiagnosis() internal {
    status = CaseStatus.ClosedRejected;
    WETH9 weth9 = lookupWeth9();
    weth9.transfer(challengingDoctor, caseFee.mul(50).div(100));
    weth9.transfer(patient, weth9.balanceOf(address(this)));

    emit CaseClosedRejected(patient, challengingDoctor);
  }

  function createCaseCost () internal view returns (uint256) {
    return caseFee.add(caseFee.mul(50).div(100));
  }

  function doctorManager() internal view returns (DoctorManager) {
    return DoctorManager(registry.lookup(keccak256("DoctorManager")));
  }

  function caseManager() internal view returns (ICaseManager) {
    return ICaseManager(registry.lookup(keccak256("CaseManager")));
  }

  function caseStatusManager() internal view returns (CaseStatusManager) {
    return CaseStatusManager(registry.lookup(keccak256("CaseStatusManager")));
  }

  function lookupWeth9() internal view returns (WETH9) {
    return WETH9(registry.lookup(keccak256("WrappedEther")));
  }

  function getDiagnosingDoctor() public view returns (address) {
    return diagnosingDoctor;
  }

  function getChallengingDoctor() public view returns (address) {
    return challengingDoctor;
  }
}
