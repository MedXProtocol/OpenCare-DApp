pragma solidity ^0.4.23;

import "./Case.sol";
import "./IRegistry.sol";
import "./IAccountManager.sol";
import "./Delegate.sol";
import "./Initializable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CaseManager is Ownable, Pausable, Initializable {
    using SafeMath for uint256;

    uint256 public caseFee;

    address[] public caseList;
    mapping (address => uint256) public caseIndices;
    mapping (address => address[]) public patientCases;

    IRegistry public registry;

    mapping (address => address[]) public doctorCases;

    event NewCase(address indexed caseAddress, uint256 indexed index);

    modifier onlyIsCase(address _case) {
      isCase(_case);
      _;
    }

    modifier onlyPatient(address _patient) {
      require(_patient == msg.sender, 'only the patient');
      _;
    }

    function isCase(address _case) {
      require(_case != address(0), 'case address is zero');
      require(caseIndices[_case] != uint256(0), 'case is not part of case manager');
    }

    /**
     * @dev - Constructor
     * @param _baseCaseFee - initial case fee
     */
    function initialize(uint256 _baseCaseFee, address _registry) external notInitialized {
        require(_baseCaseFee > 0, 'base case fee is lt eq zero');
        require(_registry != 0x0, 'registry is zero');
        setInitialized();

        owner = msg.sender;
        caseFee = _baseCaseFee;
        registry = IRegistry(_registry);
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
    function setBaseCaseFee(uint256 _newCaseFee) public onlyOwner {
        require(_newCaseFee > 0);
        caseFee = _newCaseFee;
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
    ) public payable onlyPatient(_patient) {
      IAccountManager am = accountManager();
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
    ) public payable onlyPatient(_patient) {
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
      newCase.initialize(_patient, _encryptedCaseKey, _caseKeySalt, _ipfsHash, caseFee, registry);
      uint256 caseIndex = caseList.push(address(newCase)) - 1;
      caseIndices[address(newCase)] = caseIndex;
      patientCases[_patient].push(address(newCase));
      doctorCases[_doctor].push(newCase);
      newCase.setDiagnosingDoctor(_doctor, _doctorEncryptedKey);
      newCase.deposit.value(msg.value)();
      emit NewCase(newCase, caseIndex);
    }

    function addChallengeDoctor(address _doctor) external onlyIsCase(msg.sender) {
      doctorCases[_doctor].push(msg.sender);
    }

    function doctorCasesCount(address _doctor) external view returns (uint256) {
      return doctorCases[_doctor].length;
    }

    function doctorCaseAtIndex(address _doctor, uint256 _doctorAuthIndex) external view returns (address) {
      if (_doctorAuthIndex < doctorCases[_doctor].length) {
        return doctorCases[_doctor][_doctorAuthIndex];
      } else {
        return 0;
      }
    }

    function accountManager() internal view returns (IAccountManager) {
      return IAccountManager(registry.lookup(keccak256('AccountManager')));
    }
}
