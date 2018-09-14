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

  /**
   * @dev - throws when the system is locked down, or when it's onlyDoctors and the
   *        patient is not a doctor
   */
  modifier byUsageRestrictions(address _patient) {
    if (registry.adminSettings().usageRestrictions() == AdminSettings.UsageRestrictions.OnlyDoctors) {
      require(registry.doctorManager().isDoctor(_patient), '_patient must be a doctor');
    } else if (registry.adminSettings().usageRestrictions() == AdminSettings.UsageRestrictions.Locked) {
      require(false, 'system is currently locked down by AdminSettings');
    }
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
    address _tokenContract,
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
    createAndAssignCase(
      _tokenContract,
      _patient,
      _encryptedCaseKey,
      _caseKeySalt,
      _ipfsHash,
      _doctor,
      _doctorEncryptedKey
    );
  }

  function createAndAssignCase(
    address _tokenContract,
    address _patient,
    bytes _encryptedCaseKey,
    bytes _caseKeySalt,
    bytes _ipfsHash,
    address _doctor,
    bytes _doctorEncryptedKey
  ) public payable byUsageRestrictions(_patient) {
    Case newCase = Case(new Delegate(registry, keccak256("Case")));
    uint256 caseIndex = caseList.push(address(newCase)) - 1;
    caseIndices[address(newCase)] = caseIndex;
    patientCases[_patient].push(address(newCase));

    uint256 caseTokenFeeWei = registry.casePaymentManager().caseFeeTokenWei(_tokenContract);
    newCase.initialize(_patient, _encryptedCaseKey, _caseKeySalt, _ipfsHash, caseTokenFeeWei);
    registry.caseLifecycleManager().setDiagnosingDoctor(newCase, _doctor, _doctorEncryptedKey);
    registry.caseScheduleManager().initializeCase(newCase);
    registry.casePaymentManager().initializeCase.value(msg.value)(newCase, _tokenContract);

    emit NewCase(newCase, caseIndex);
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
