pragma solidity ^0.4.23;

import "./AccountManager.sol";
import "./Case.sol";
import './CaseLifecycleManager.sol';
import './CaseScheduleManager.sol';
import "./Delegate.sol";
import "./Initializable.sol";
import "./IEtherPriceFeed.sol";
import "./MedXToken.sol";
import './Registry.sol';
import './RegistryLookup.sol';
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import './DelegateTarget.sol';

contract CaseManager is Ownable, Pausable, Initializable, DelegateTarget {

  using RegistryLookup for Registry;
  using SafeMath for uint256;

  /*
    MEMORY START
    _do not_ remove any of these once they are deployed to a network (Ropsten,
    Mainnet, etc.) and only append to the bottom (before the END comment)
  */
  uint256 public caseFeeUsd;

  address[] public caseList;
  mapping (address => uint256) public caseIndices;
  mapping (address => address[]) public patientCases;

  MedXToken _;
  Registry public registry;

  mapping (address => address[]) public doctorCases;
  /*
    MEMORY END
    It is safe to add new data definitions here
  */

  event NewCase(address indexed caseAddress, uint256 indexed index);

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

  modifier onlyThis() {
    require(this == msg.sender, 'must be called by the same contract');
    _;
  }

  function isCase(address _caseAddress) external view returns (bool) {
    return (
      (_caseAddress != address(0)) && (caseIndices[_caseAddress] != uint256(0))
    );
  }

  function initializeTarget(address _registry, bytes32 _key) public notInitialized {
    require(_registry != 0x0, 'registry is zero');
    setInitialized();
    registry = Registry(_registry);
    owner = msg.sender;
    caseList.push(address(0));
  }

  /**
   * @dev - Contract should not accept any ether
   */
  function () payable public {
    revert();
  }

  /**
   * @dev - sets the base case fee - only affects new cases
   */
  function setBaseCaseFee(uint256 _newCaseFeeUsd) public onlyOwner {
    require(_newCaseFeeUsd > 0);
    caseFeeUsd = _newCaseFeeUsd;
  }

  /**
   * @dev - returns the length of the "all" case list
   */
  function getAllCaseListCount() public constant returns (uint256) {
    return caseList.length - 1;
  }

  /**
   * @dev - returns the length of the patient specific case list
   */
  function getPatientCaseListCount(address _patient) constant public returns (uint256) {
    return patientCases[_patient].length;
  }

  function createAndAssignCaseWithPublicKey(
    address _patient,
    bytes _encryptedCaseKey,
    bytes _caseKeySalt,
    bytes _ipfsHash,
    address _doctor,
    bytes _doctorEncryptedKey,
    bytes _patientPublicKey
  ) public payable {
    AccountManager am = registry.accountManager();
    require(am.publicKeys(_patient).length == 0, 'patient already has a public key');
    am.setPublicKey(_patient, _patientPublicKey);
    createCase(
      _patient,
      _encryptedCaseKey,
      _caseKeySalt,
      _ipfsHash,
      _doctor,
      _doctorEncryptedKey);
  }

  function createAndAssignCase(
    address _patient,
    bytes _encryptedCaseKey,
    bytes _caseKeySalt,
    bytes _ipfsHash,
    address _doctor,
    bytes _doctorEncryptedKey
  ) public payable {
    createCase(
      _patient,
      _encryptedCaseKey,
      _caseKeySalt,
      _ipfsHash,
      _doctor,
      _doctorEncryptedKey);
  }

  function createCase(
    address _patient,
    bytes _encryptedCaseKey,
    bytes _caseKeySalt,
    bytes _ipfsHash,
    address _doctor,
    bytes _doctorEncryptedKey
  ) internal {
    Case newCase = Case(new Delegate(registry, keccak256("Case")));
    newCase.initialize(_patient, _encryptedCaseKey, _caseKeySalt, _ipfsHash, caseFeeWei());
    uint256 caseIndex = caseList.push(address(newCase)) - 1;
    caseIndices[address(newCase)] = caseIndex;
    patientCases[_patient].push(address(newCase));

    registry.caseLifecycleManager().setDiagnosingDoctor(newCase, _doctor, _doctorEncryptedKey);
    registry.caseScheduleManager().initializeCase(newCase);

    newCase.deposit.value(msg.value)();

    emit NewCase(newCase, caseIndex);
  }

  function createCaseCostWei (uint256 _caseFeeUsd) public view returns (uint256) {
    uint256 caseFee = usdToWei(_caseFeeUsd);
    return caseFee.add(caseFee.mul(50).div(100));
  }

  function caseFeeWei() public view returns (uint256) {
    return usdToWei(caseFeeUsd);
  }

  function usdToWei(uint256 _caseFeeUsd) public view returns (uint256) {
    return _caseFeeUsd.div(usdPerWei());
  }

  function usdPerWei() public view returns (uint256) {
    IEtherPriceFeed etherPriceFeed = IEtherPriceFeed(registry.lookup(keccak256('EtherPriceFeed')));
    uint256 usdPerEth = uint256(etherPriceFeed.read());
    return usdPerEth.div(1000000000000000000);
  }

  function addDoctorToDoctorCases(address _doctor, address _caseAddress) public onlyCasePhaseManagers() {
    doctorCases[_doctor].push(_caseAddress);
  }

  function doctorCasesCount(address _doctor) external view returns (uint256) {
    return doctorCases[_doctor].length;
  }

  function doctorCaseAtIndex(address _doctor, uint256 _caseIndex) external view returns (address) {
    if (_caseIndex < doctorCases[_doctor].length) {
      return doctorCases[_doctor][_caseIndex];
    } else {
      return 0;
    }
  }
}
