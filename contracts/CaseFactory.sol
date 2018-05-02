pragma solidity ^0.4.23;

import "./Case.sol";
import "./MedXToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CaseFactory is Ownable, Pausable {
    using SafeMath for uint256;

    uint256 public caseFee;
    address[] public caseList;
    mapping (address => address[]) public patientCases;

    MedXToken public medXToken;
    DoctorManager public doctorManager;

    /**
     * @dev - Constructor
     * @param _baseCaseFee - initial case fee
     * @param _medXToken - the MedX token
     */
    function CaseFactory(uint256 _baseCaseFee, MedXToken _medXToken, DoctorManager _doctorManager) {
        require(_baseCaseFee > 0);
        require(address(_medXToken) != 0x0);
        require(address(_doctorManager) != 0x0);

        caseFee = _baseCaseFee;
        medXToken = _medXToken;
        doctorManager = _doctorManager;
    }

    /**
     * @dev - Contract should not accept any ether
     */
    function () {
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
     * @dev - sets the doctor manager contract address
     */
    function setDoctorManager(DoctorManager _doctorManagerContract) public onlyOwner {
        require(address(_doctorManagerContract) != 0x0);
        doctorManager = _doctorManagerContract;
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
        Case newCase = new Case(_patient, _caseDetailLocation, caseFee, medXToken, doctorManager);
        caseList.push(address(newCase));
        patientCases[_patient].push(address(newCase));
        return newCase;
    }
}
