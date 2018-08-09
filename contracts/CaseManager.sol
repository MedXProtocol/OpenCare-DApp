pragma solidity ^0.4.23;

import "./Case.sol";
import "./MedXToken.sol";
import "./Registry.sol";
import "./AccountManager.sol";
import "./Delegate.sol";
import "./Initializable.sol";
import "./LinkedList.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CaseManager is Ownable, Pausable, Initializable {
    using SafeMath for uint256;
    using LinkedList for LinkedList.UInt256;

    uint256 public caseFee;

    address[] public caseList;
    mapping (address => uint256) public caseIndices;
    mapping (address => address[]) public patientCases;

    MedXToken public medXToken;
    Registry public registry;

    mapping (address => address[]) public doctorCases;
    mapping (address => LinkedList.UInt256) openDoctorCasesList;
    /**
      * This mapping stores the list index of an open case for each doctor
      */
    mapping (address => mapping (address => uint256)) doctorOpenCaseNodeIndices;

    event NewCase(address indexed caseAddress, uint256 indexed index);

    modifier isCase(address _case) {
      require(_case != address(0));
      require(caseIndices[_case] != uint256(0));
      _;
    }

    modifier onlyThis() {
      require(this == msg.sender);
      _;
    }

    /**
     * @dev - Constructor
     * @param _baseCaseFee - initial case fee
     * @param _medXToken - the MedX token
     */
    function initialize(uint256 _baseCaseFee, MedXToken _medXToken, Registry _registry) external notInitialized {
        require(_baseCaseFee > 0);
        require(address(_medXToken) != 0x0);
        require(address(_registry) != 0x0);
        setInitialized();

        owner = msg.sender;
        caseFee = _baseCaseFee;
        medXToken = _medXToken;
        registry = _registry;
        caseList.push(address(0));
    }

    /**
     * @dev - Contract should not accept any ether
     */
    function () payable public {
        revert();
    }

    function createCaseCost () internal view returns (uint256) {
      return caseFee.add(caseFee.mul(50).div(100));
    }

    /**
     * @dev - initial payment it 150% of the fee, 50% refunded if first diagnosis accepted
     * @param _from - owner of the tokens
     * @param _value - number of tokens allowed to spend
     * @param _token - unused
     * @param _extraData - unused
     */
    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) external whenNotPaused {
        require(_value == createCaseCost(), "value of MedX does not match cost to create case");
        require(medXToken.balanceOf(_from) >= _value, "MedXToken balance too low");

        /**

        Call data will be structured:

        4 bytes: sig
        32 bytes: _from
        32 bytes: _value
        32 bytes: _token
        32 bytes: _extraData offset
        32 bytes: _extraData length
        X bytes: _extraData
        Y bytes: 32 - (_extraData.length % 32)

         */

        bytes4 sig;

        uint256 i;
        for (i = 0; i < 4; i++) {
          sig |= bytes4(_extraData[i]) >> 8*i;
        }

        bool sig1matches =
          sig == bytes4(keccak256('createAndAssignCase(address,bytes,bytes,bytes,address,bytes)'));
        bool sig2matches =
          sig == bytes4(keccak256('createAndAssignCaseWithPublicKey(address,bytes,bytes,bytes,address,bytes,bytes)'));

        require(sig1matches || sig2matches);

        address _this = address(this);
        uint256 inputSize = _extraData.length;

        assembly {
          let ptr := mload(0x40)
          calldatacopy(ptr, 164, inputSize) // copy extraData
          let ptrAtPatient := add(ptr, 4) // skip signature
          calldatacopy(ptrAtPatient, 4, 32) // overwrite _from onto patient
          let result := call(gas, _this, 0, ptr, inputSize, 0, 0)
          let size := returndatasize
          returndatacopy(ptr, 0, size)

          switch result
          case 0 { revert(ptr, size) }
          default { return(ptr, size) }
        }
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
    ) public onlyThis {
      AccountManager am = accountManager();
      require(am.publicKeys(_patient).length == 0);
      am.setPublicKey(_patient, _patientPublicKey);
      createAndAssignCase(
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
    ) public onlyThis {
      Case newCase = Case(new Delegate(registry, keccak256("Case")));
      newCase.initialize(_patient, _encryptedCaseKey, _caseKeySalt, _ipfsHash, caseFee, medXToken, registry);
      uint256 caseIndex = caseList.push(address(newCase)) - 1;
      caseIndices[address(newCase)] = caseIndex;
      patientCases[_patient].push(address(newCase));
      doctorCases[_doctor].push(newCase);
      medXToken.transferFrom(_patient, newCase, createCaseCost());
      newCase.setDiagnosingDoctor(_doctor, _doctorEncryptedKey);
      emit NewCase(newCase, caseIndex);
    }

    function addChallengeDoctor(address _doctor) external isCase(msg.sender) {
      doctorCases[_doctor].push(msg.sender);
    }

    function doctorCasesCount(address _doctor) external view returns (uint256) {
      return doctorCases[_doctor].length;
    }

    function doctorCaseAtIndex(address _doctor, uint256 _doctorAuthIndex) external view returns (address) {
      require(_doctorAuthIndex < doctorCases[_doctor].length);
      return doctorCases[_doctor][_doctorAuthIndex];
    }

    function accountManager() internal view returns (AccountManager) {
      return AccountManager(registry.lookup(keccak256('AccountManager')));
    }

    function addOpenCase(address _doctor, address _case) external {
      require(doctorOpenCaseNodeIndices[_doctor][_case] == 0);
      uint256 caseIndex = caseIndices[_case];
      require(caseIndex != 0);
      uint256 nodeIndex = openDoctorCasesList[_doctor].enqueue(caseIndex);
      doctorOpenCaseNodeIndices[_doctor][_case] = nodeIndex;
    }

    function removeOpenCase(address _doctor, address _case) external {
      uint256 nodeIndex = doctorOpenCaseNodeIndices[_doctor][_case];
      require(nodeIndex != 0);
      doctorOpenCaseNodeIndices[_doctor][_case] = 0;
      openDoctorCasesList[_doctor].remove(nodeIndex);
    }

    /**
      * @return The number of open cases for a doctor
      */
    function openCaseCount(address _doctor) external view returns (uint256) {
      openDoctorCasesList[_doctor].length();
    }

    /**
      * @return The node id of the first open case for a doctor
      */
    function firstOpenCaseId(address _doctor) external view returns (uint256) {
      return openDoctorCasesList[_doctor].peekId();
    }

    /**
      * @return The node id of the node that follows the given node
      */
    function nextOpenCaseId(address _doctor, uint256 nodeId) external view returns (uint256) {
      return openDoctorCasesList[_doctor].nextId(nodeId);
    }

    /**
      * @return The address of the case for the given node
      */
    function openCaseAddress(address _doctor, uint256 nodeId) external view returns (address) {
      return caseList[openDoctorCasesList[_doctor].value(nodeId)];
    }
}
