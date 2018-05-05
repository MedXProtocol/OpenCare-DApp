pragma solidity ^0.4.23;

import "./Case.sol";
import "./MedXToken.sol";
import "./Registry.sol";
import "./Delegate.sol";
import "./Initializable.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CaseFactory is Ownable, Pausable, Initializable {
    using SafeMath for uint256;

    uint256 public caseFee;
    address[] public caseList;
    mapping (address => address[]) public patientCases;

    MedXToken public medXToken;
    Registry registry;

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
        require(_value == caseFee + (caseFee * 50) / 100);
        require(medXToken.balanceOf(_from) >= _value);

        address createdCaseAddress = createCase(_from, _extraData);
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
    function getAllCaseListCount() public constant returns (uint256 _caseCount) {
        return caseList.length;
    }

    /**
     * @dev - returns the length of the patient specific case list
     */
    function getPatientCaseListCount(address _patient) constant public returns (uint256 _caseCount) {
        return patientCases[_patient].length;
    }

    /**
     * @dev - Internal function to create a new case which will have the required tokens already transferred to it
     * @param _patient - the patient creating the case
     * @return - address of the case contract created
     */
    function createCase(address _patient, bytes _caseDetailLocation) internal returns (address _newCase) {
        Delegate delegator = new Delegate(registry, "Case");
        Case newCase = Case(delegator);
        /* newCase.initialize(_patient, _caseDetailLocation, caseFee, medXToken, registry); */
        caseList.push(address(newCase));
        patientCases[_patient].push(address(newCase));
        return newCase;
    }
}
