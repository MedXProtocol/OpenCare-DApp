pragma solidity ^0.4.23;

import "./MedXToken.sol";
import "./DoctorManager.sol";
import "./Registry.sol";
import "./Initializable.sol";
import "./CaseManager.sol";
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

  Registry public registry;
  MedXToken public medXToken;

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
    require(doctorManager().isDoctor(_doctor));
    _;
  }

  modifier onlyDiagnosingDoctor() {
    require(msg.sender == diagnosingDoctor);
    _;
  }

  modifier onlyChallengeDoctor() {
    require(msg.sender == challengingDoctor);
    _;
  }

  modifier onlyCaseManager() {
    require(msg.sender == address(caseManager()));
    _;
  }

  /**
   * @dev - Creates a new case with the given parameters
   * @param _patient - the patient who created the case
   * @param _caseFee - fee for this particular case
   * @param _token - the MedX token
   * @param _registry - the registry contract
   */
  function initialize (
      address _patient,
      bytes _encryptedCaseKey,
      bytes _caseKeySalt,
      bytes _caseHash,
      uint256 _caseFee,
      MedXToken _token,
      Registry _registry
  ) external notInitialized {
    setInitialized();
    require(_encryptedCaseKey.length != 0);
    require(_caseKeySalt.length != 0);
    require(_caseHash.length != 0);
    createdAt = block.timestamp;
    owner = msg.sender;
    status = CaseStatus.Open;
    encryptedCaseKey = _encryptedCaseKey; // don't need to store this
    caseKeySalt = _caseKeySalt;
    patient = _patient;
    caseDataHash = _caseHash; // don't need to store this
    caseFee = _caseFee;
    medXToken = _token;
    registry = _registry;
    emit CaseCreated(patient);
  }

  /**
   * @dev - Contract should not accept any ether
   */
  function () public payable {
    revert();
  }

  function setDiagnosingDoctor (address _doctor, bytes _doctorEncryptedKey) external onlyCaseManager isDoctor(_doctor) {
    require(status == CaseStatus.Open);
    require(diagnosingDoctor == address(0));
    require(_doctor != patient);
    diagnosingDoctor = _doctor;
    status = CaseStatus.Evaluating;
    caseManager().addOpenCase(_doctor, address(this));
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
    caseManager().removeOpenCase(diagnosingDoctor, address(this));
    diagnosisHash = _diagnosisHash;
    emit CaseEvaluated(patient, diagnosingDoctor);
  }

  /**
   * @dev - The user accepts the evaluation and tokens are credited to doctor and rest is returned to the patient
   */
  function acceptDiagnosis() external onlyPatient {
    /* TODO: add evaluation time logic */
    require(status == CaseStatus.Evaluated);
    status = CaseStatus.Closed;
    medXToken.transfer(diagnosingDoctor, caseFee);
    medXToken.transfer(patient, medXToken.balanceOf(address(this)));
    emit CaseClosed(patient, diagnosingDoctor);
  }

  function challengeWithDoctor(address _doctor, bytes _doctorEncryptedKey) external onlyPatient {
    require(status == CaseStatus.Evaluated, 'Status must match');
    status = CaseStatus.Challenging;
    caseManager().addOpenCase(_doctor, address(this));
    setChallengingDoctor(_doctor, _doctorEncryptedKey);
    caseManager().addChallengeDoctor(_doctor);
    emit CaseChallenged(patient, _doctor);
  }

  function setChallengingDoctor (address _doctor, bytes _doctorEncryptedKey) internal isDoctor(_doctor) {
    require(_doctor != patient);
    require(_doctor != diagnosingDoctor);
    challengingDoctor = _doctor;
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
    caseManager().removeOpenCase(challengingDoctor, address(this));
    challengeHash = _secondaryDiagnosisHash;
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
    medXToken.transfer(challengingDoctor, (caseFee * 50) / 100);
    medXToken.transfer(patient, medXToken.balanceOf(address(this)));

    emit CaseClosedConfirmed(patient, challengingDoctor);
  }

  /**
   * @dev - The second doctor rejects the diagnosis
   */
  function rejectChallengedDiagnosis() internal {
    status = CaseStatus.ClosedRejected;

    medXToken.transfer(challengingDoctor, (caseFee * 50) / 100);
    medXToken.transfer(patient, medXToken.balanceOf(address(this)));

    emit CaseClosedRejected(patient, challengingDoctor);
  }

  function doctorManager() internal view returns (DoctorManager) {
    return DoctorManager(registry.lookup(keccak256("DoctorManager")));
  }

  function caseManager() internal view returns (CaseManager) {
    return CaseManager(registry.lookup(keccak256("CaseManager")));
  }
}
