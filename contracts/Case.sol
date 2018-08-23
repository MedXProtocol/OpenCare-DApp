pragma solidity ^0.4.23;

import "./Initializable.sol";
import "./MedXToken.sol";
import './Registry.sol';
import './RegistryLookup.sol';
import "./WETH9.sol";

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Case is Ownable, Initializable {

  using RegistryLookup for Registry;
  using SafeMath for uint256;

  uint256 public caseFee;

  address public patient;
  address public diagnosingDoctor;
  address public challengingDoctor;

  bytes public caseDataHash;
  bytes public diagnosisHash;
  bytes public challengeHash;

  Registry public registry;
  MedXToken public _;

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

  event CaseCreated(address indexed _patient);
  event CaseFinalized(address indexed _case, address indexed _patient, address indexed _diagnosingDoctor, address _challengingDoctor);

  /**
   * @dev - throws unless is instance of either the first (initial diagnosis)
            or the second (challenge/second opinion) CasePhaseManager
   */
  modifier onlyCasePhaseManagers() {
    require(isCasePhaseManager(), 'must be one of the Case Phase Manager contracts');
    _;
  }

  function isCasePhaseManager() internal view returns (bool) {
    return (
         (msg.sender == address(registry.caseFirstPhaseManager()))
      || (msg.sender == address(registry.caseSecondPhaseManager()))
    );
  }

  modifier onlyCaseFirstPhaseManager() {
    require(
      msg.sender == address(registry.caseFirstPhaseManager()),
      'Must be an instance of the Case First Phase Manager contract'
    );
    _;
  }

  modifier onlyCaseSecondPhaseManager() {
    require(
      (msg.sender == address(registry.caseSecondPhaseManager())),
      'Must be an instance of the Case Second Phase Manager contract'
    );
    _;
  }

  /**
   * @dev - Contract should not accept any ether
   */
  function () public payable {
    revert();
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
    require(_encryptedCaseKey.length != 0, 'encryptedCaseKey required');
    require(_caseKeySalt.length != 0, 'caseKeySalt required');
    require(_caseHash.length != 0, 'caseHash required');
    owner = msg.sender;
    status = CaseStatus.Open;
    encryptedCaseKey = _encryptedCaseKey;
    caseKeySalt = _caseKeySalt;
    patient = _patient;
    caseDataHash = _caseHash;
    caseFee = _caseFee;
    registry = Registry(_registry);
    emit CaseCreated(patient);
  }

  function setDiagnosingDoctor(address _doctorAddress) external onlyCaseFirstPhaseManager {
    diagnosingDoctor = _doctorAddress;
  }

  function deposit() external payable {
    require(msg.value >= createCaseCost(), 'Not enough ether to create case');
    lookupWeth9().deposit.value(msg.value)();
  }

  function setChallengingDoctor(address _doctorAddress) external onlyCaseSecondPhaseManager {
    challengingDoctor = _doctorAddress;
  }

  function setStatus(CaseStatus _status) external onlyCasePhaseManagers {
    status = _status;
  }

  function setDiagnosisHash(bytes _diagnosisHash) external onlyCaseFirstPhaseManager {
    diagnosisHash = _diagnosisHash;
  }

  function setChallengeHash(bytes _secondaryDiagnosisHash) external onlyCaseSecondPhaseManager {
    challengeHash = _secondaryDiagnosisHash;
  }

  function setDoctorEncryptedCaseKeys(address _doctor, bytes _doctorEncryptedKey) external onlyCasePhaseManagers {
    doctorEncryptedCaseKeys[_doctor] = _doctorEncryptedKey;
  }

  function finalize() external onlyCasePhaseManagers {
    emit CaseFinalized(address(this), patient, diagnosingDoctor, challengingDoctor);
  }

  function transferCaseFeeToDiagnosingDoctor() external onlyCasePhaseManagers {
    WETH9 weth9 = lookupWeth9();
    weth9.transfer(diagnosingDoctor, caseFee);
  }

  function transferRemainingBalanceToPatient() external onlyCasePhaseManagers {
    WETH9 weth9 = lookupWeth9();
    weth9.transfer(patient, weth9.balanceOf(address(this)));
  }

  function transferChallengingDoctorFee() external onlyCaseSecondPhaseManager {
    WETH9 weth9 = lookupWeth9();
    weth9.transfer(challengingDoctor, caseFee.mul(50).div(100));
  }

  function createCaseCost() internal view returns (uint256) {
    return caseFee.add(caseFee.mul(50).div(100));
  }

  function lookupWeth9() internal view returns (WETH9) {
    return WETH9(registry.lookup(keccak256("WrappedEther")));
  }

}
