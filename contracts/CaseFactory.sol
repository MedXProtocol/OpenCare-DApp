pragma solidity 0.4.15;

import "./Case.sol";
import "./MedXToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseFactory is Ownable {

    uint256 public caseFee;

    mapping (address => Case) public cases;
    address[] public caseList;

    MedXToken public medXToken;
    DoctorManager public doctorManager;

    /**
     * @dev - Constructor
     * @param _baseCaseFee - initial case fee
     * @param _medXToken - the MedX token
     */
    function CaseFactory(uint256 _baseCaseFee, MedXToken _medXToken, DoctorManager _doctorManager) {
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
     * @param _extraData - additional data to be used in creating cases
     */
    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) external {
        require(_value == caseFee + (caseFee * 50) / 100);
        require(medXToken.balanceOf(_from) >= _value);

        //TODO: Need to get swarmHash and encryption key from _extraData
        address createdCaseAddress = createCase(_from, "", "");
        /* Transfer tokens from patient to the newly created case contract */
        medXToken.transferFrom(_from, createdCaseAddress, _value);
    }

    /**
     * @dev - sets the base case fee - only affects new cases
     */
    function setBaseCaseFee(uint256 _newCaseFee) public onlyOwner {
        caseFee = _newCaseFee;
    }

    /**
     * @dev - sets the doctor manager contract address
     */
    function setDoctorManager(DoctorManager _doctor) public onlyOwner {
        doctorManager = _doctor;
    }

    /**
     * @dev - Internal function to create a new case which has the required tokens already transferred to it
     * @param _patient - the patient creating the case
     * @param _diagnosisDataLocationHash - Swarm hash of where the data is stored
     * @param _encryptionKey - key that was used to encrypt the data
     * @return - address of the case contract created
     */
    function createCase(
        address _patient,
        string _diagnosisDataLocationHash,
        string _encryptionKey
    )
        internal
        returns (address _newCase)
    {
        Case newCase = new Case(_patient, _diagnosisDataLocationHash, _encryptionKey, caseFee, medXToken, doctorManager);
        cases[address(newCase)] = newCase;
        caseList.push(address(newCase));
        return newCase;
    }
}
