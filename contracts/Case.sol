pragma solidity 0.4.15;

import "./MedXToken.sol";
import "./DoctorManager.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Case is Ownable {
    using SafeMath for uint256;

    uint256 public caseFee;

    address public patient;
    address public diagnosingDoctorA;
    address public diagnosingDoctorB;

    string public caseDetailLocationHash;
    string public encryptionKey;
    string public diagnosisLocationHash;

    DoctorManager public doctorManager;
    MedXToken public medXToken;
    CaseStatus public status;

    enum CaseStatus { Created, Open, Evaluated, Closed, Challenged, Canceled }

    event CaseCreated(address indexed _caseAddress, address indexed _casePatient);
    event CaseEvaluated(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseClosed(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseChallenged(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);

    /**
     * @dev - throws if called by any account other than the patient.
     */
    modifier onlyPatient() {
        require(msg.sender == patient);
        _;
    }

    /**
     * @dev - throws if called by any account other than a doctor.
     */
    modifier onlyDoctor() {
        require(doctorManager.isDoctor(msg.sender));
        _;
    }

    /**
     * @dev - Creates a new case with the given parameters
     * @param _patient - the patient who created the case
     * @param _caseHash - location of the encrypted case files
     * @param _encryptionKey - key used to encrypt the case files
     * @param _caseFee - fee for this particular case
     * @param _token - the MedX token
     * @param _doctorManager - the doctor manager contract
     */
    function Case(
        address _patient,
        string _caseHash,
        string _encryptionKey,
        uint256 _caseFee,
        MedXToken _token,
        DoctorManager _doctorManager
    ) {
        /* check that this cases balance is 150% of the case fee */
        require(_token.balanceOf(this) >= _caseFee + (_caseFee * 50) / 100);

        patient = _patient;
        caseDetailLocationHash = _caseHash;
        encryptionKey = _encryptionKey;
        caseFee = _caseFee;
        medXToken = _token;
        status = CaseStatus.Created;
        doctorManager = _doctorManager;
        CaseCreated(address(this), patient);
    }

    /**
     * @dev - Contract should not accept any ether
     */
    function() {
        revert();
    }

    /**
     * @dev - The patient can cancel the contract and retrieve funds if not submitted yet
     */
    function cancelCase() public onlyPatient {
        require(status == CaseStatus.Created);
        status = CaseStatus.Canceled;
        medXToken.transfer(patient, medXToken.balanceOf(this)); //Security in case the funds were bigger than required
    }

    /**
     * @dev - doctor submits diagnosis for case
     * @param _diagnosisHash - Swarm hash of where the diagnosis data is stored
     */
    function diagnoseCase(string _diagnosisHash) public onlyDoctor {
        require(status == CaseStatus.Created);
        status = CaseStatus.Evaluated;
        diagnosingDoctorA = msg.sender;
        diagnosisLocationHash = _diagnosisHash;
        CaseEvaluated(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The user accepts the evaluation and tokens are credited to doctor and rest is returned to the patient
     */
    function acceptDiagnosis() public onlyPatient {
        /* TODO: add evaluation time logic */
        require(status == CaseStatus.Evaluated);
        status = CaseStatus.Closed;
        medXToken.transfer(diagnosingDoctorA, caseFee);
        medXToken.transfer(patient, medXToken.balanceOf(this) - caseFee); //Security in case the funds were bigger than required
        CaseClosed(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The user challenges the diagnosis - new doctor to review
     */
    function challengeDiagnosis() public onlyPatient {
        require(status == CaseStatus.Evaluated);
        status = CaseStatus.Challenged;
        CaseChallenged(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The second doctor confirms the diagnosis
     */
    function confirmChallengedDiagnosis() public onlyDoctor {
        /* TODO: add evaluation time logic */
        require(status == CaseStatus.Challenged);
        require(msg.sender != diagnosingDoctorA);

        status = CaseStatus.Closed;
        diagnosingDoctorB = msg.sender;

        medXToken.transfer(diagnosingDoctorA, caseFee);
        medXToken.transfer(diagnosingDoctorB, (caseFee * 50) / 100);
        medXToken.transfer(patient, medXToken.balanceOf(this) - (caseFee + (caseFee * 50) / 100)); //Security in case the funds were bigger than required

        CaseClosed(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The second doctor rejects the diagnosis
     */
    function rejectChallenegedDiagnosis() public onlyDoctor {
        /* TODO: add evaluation time logic */
        require(status == CaseStatus.Challenged);
        require(msg.sender != diagnosingDoctorA);

        status = CaseStatus.Closed;
        diagnosingDoctorB = msg.sender;

        medXToken.transfer(diagnosingDoctorB, (caseFee * 50) / 100);
        medXToken.transfer(patient, medXToken.balanceOf(this) - ((caseFee * 50) / 100)); //Security in case the funds were bigger than required

        CaseClosed(address(this), patient, diagnosingDoctorA);
    }
}
