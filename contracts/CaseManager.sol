pragma solidity ^0.4.23;

import "./Case.sol";
import "./MedXToken.sol";
import "./Registry.sol";
import "./Delegate.sol";
import "./Initializable.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./Queue.sol";

contract CaseManager is Ownable, Pausable, Initializable {
    using SafeMath for uint256;
    using Queue for Queue.UInt256;

    uint256 public caseFee;

    address[] public caseList;
    mapping (address => address[]) public patientCases;

    MedXToken public medXToken;
    Registry public registry;

    Queue.UInt256 openCaseQueue;

    mapping (address => uint256[]) public doctorAuthorizationRequests;

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
        openCaseQueue = Queue.create();
    }

    /**
     * @dev - Contract should not accept any ether
     */
    function () payable public {
        revert();
    }

    /**
     * @dev - initial payment it 150% of the fee, 50% refunded if first diagnosis accepted
     * @param _from - owner of the tokens
     * @param _value - number of tokens allowed to spend
     * @param _token - unused
     * @param _extraData - unused
     */
    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) external whenNotPaused {
        require(_value == caseFee.add(caseFee.mul(50).div(100)));
        require(medXToken.balanceOf(_from) >= _value);

        /**
         * assume that the 'extraData' contains
         * 1. 64 bytes for encryptedCaseKey
         * 2. remainder for ipfs hash
         */

        byte[64] memory encryptedCaseKey;
        uint256 keyLength = 64;
        uint256 i = 0;
        for (; i < keyLength; i++) {
          encryptedCaseKey[i] = _extraData[i];
        }

        bytes memory caseHash = new bytes(_extraData.length - keyLength);
        for (i = keyLength; i < _extraData.length; i++) {
          caseHash[i - keyLength] = _extraData[i];
        }

        address createdCaseAddress = createCase(_from, encryptedCaseKey, caseHash);
        /* Transfer tokens from patient to the newly created case contract */
        medXToken.transferFrom(_from, createdCaseAddress, _value);
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
        return caseList.length;
    }

    /**
     * @dev - returns the length of the patient specific case list
     */
    function getPatientCaseListCount(address _patient) constant public returns (uint256) {
        return patientCases[_patient].length;
    }

    /**
     * @dev - Internal function to create a new case which will have the required tokens already transferred to it
     * @param _patient - the patient creating the case
     * @return - address of the case contract created
     */
    function createCase(address _patient, byte[64] _encryptedCaseKey, bytes _ipfsHash) internal returns (address) {
      Delegate delegate = new Delegate(registry, keccak256("Case"));
      Case newCase = Case(delegate);
      newCase.initialize(_patient, _encryptedCaseKey, _ipfsHash, caseFee, medXToken, registry);
      uint256 caseIndex = caseList.push(address(newCase)) - 1;
      openCaseQueue.enqueue(caseIndex);
      patientCases[_patient].push(address(newCase));
      return newCase;
    }

    function requestNextCase() external returns (address) {
      require(openCaseQueue.count() > 0);
      uint256 caseIndex = openCaseQueue.dequeue();
      Case caseContract = Case(caseList[caseIndex]);
      caseContract.requestDiagnosisAuthorization(msg.sender);
      doctorAuthorizationRequests[msg.sender].push(caseIndex);
      return caseContract;
    }

    function openCaseCount() external view returns (uint256) {
      return openCaseQueue.count();
    }

    function doctorAuthorizationRequestCount(address _doctor) external view returns (uint256) {
      return doctorAuthorizationRequests[_doctor].length;
    }

    function doctorAuthorizationRequestCaseAtIndex(address _doctor, uint256 _doctorAuthIndex) external view returns (address) {
      require(_doctorAuthIndex < doctorAuthorizationRequests[_doctor].length);
      uint256 index = doctorAuthorizationRequests[_doctor][_doctorAuthIndex];
      require(index < caseList.length);
      return caseList[index];
    }

    /**
     * @dev Converts bytes to bytes32
     * see https://ethereum.stackexchange.com/questions/7702/how-to-convert-byte-array-to-bytes32-in-solidity
     */
    /* function bytesToBytes32(bytes b, uint256 offset) internal pure returns (bytes32) {
      bytes32 out;
      for (uint256 i = 0; i < 32; i++) {
        out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
      }
      return out;
    } */
}
