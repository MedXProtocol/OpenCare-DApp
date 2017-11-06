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

    bytes32 public caseDetailLocationHash;
    bytes32 public originalEncryptionKey;
    bytes32 public diagnosisLocationHash;

    DoctorManager public doctorManager;
    MedXToken public medXToken;
    CaseStatus public status;

    mapping (address => Authorization) public authorizations;
    struct Authorization {
        AuthStatus status;
        bytes32 doctorEncryptionKey;
    }

    enum CaseStatus { Created, Open, Evaluated, Closed, Challenged, Canceled }
    enum AuthStatus { None, Requested, Approved }

    event CaseCreated(address indexed _caseAddress, address indexed _casePatient);
    event CaseEvaluated(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseClosed(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseChallenged(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseAuthorizationRequested(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseAuthorizationApproved(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);

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

    modifier evaluateTiming() {
        _;
    }

    /**
     * @dev - Creates a new case with the given parameters
     * @param _patient - the patient who created the case
     * @param _caseFee - fee for this particular case
     * @param _token - the MedX token
     * @param _doctorManager - the doctor manager contract
     */
    function Case(
        address _patient,
        uint256 _caseFee,
        MedXToken _token,
        DoctorManager _doctorManager
    ) {
        status = CaseStatus.Created;
        patient = _patient;
        caseFee = _caseFee;
        medXToken = _token;
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
     * @dev - submit case details and make the case available for diagnosis
     * @param _caseHash - location of the encrypted case files
     * @param _encryptionKey - key used to encrypt the case files
     */
    function submitCase(bytes32 _caseHash, bytes32 _encryptionKey) onlyPatient {
        require(status == CaseStatus.Created);
        status = CaseStatus.Open;
        caseDetailLocationHash = _caseHash;
        originalEncryptionKey = _encryptionKey;
    }

    /**
     * @dev - doctor submits diagnosis for case. Patient must have approved the doctor in order for them to decrypt the case files
     * @param _diagnosisHash - Swarm hash of where the diagnosis data is stored
     */
    function diagnoseCase(bytes32 _diagnosisHash) public onlyDoctor {
        require(status == CaseStatus.Open);
        require(authorizations[msg.sender].status == AuthStatus.Approved);
        status = CaseStatus.Evaluated;

        /* TODO: Start 24 hour timer */
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
        medXToken.transfer(patient, medXToken.balanceOf(this).sub(caseFee)); //Security in case the funds were bigger than required
        CaseClosed(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The user challenges the diagnosis - new doctor to review
     */
    function challengeDiagnosis() public onlyPatient {
        require(status == CaseStatus.Evaluated);
        status = CaseStatus.Challenged;
        /* TODO: Make sure case is within 24 hour period */
        CaseChallenged(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The second doctor confirms the diagnosis. Patient must have approved second doctor in order for them to have viewed the case files
     */
    function confirmChallengedDiagnosis() public onlyDoctor {
        /* TODO: add evaluation time logic */
        require(status == CaseStatus.Challenged);
        require(msg.sender != diagnosingDoctorA);
        require(authorizations[msg.sender].status == AuthStatus.Requested);

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
        require(authorizations[msg.sender].status == AuthStatus.Requested);

        status = CaseStatus.Closed;
        diagnosingDoctorB = msg.sender;

        medXToken.transfer(diagnosingDoctorB, (caseFee * 50) / 100);
        medXToken.transfer(patient, medXToken.balanceOf(this) - ((caseFee * 50) / 100)); //Security in case the funds were bigger than required

        CaseClosed(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - doctor requests access to patients encrypted case files. Patient needs to approved and created doctor specific decryption key
     */
    function requestAuthorization() public onlyDoctor {
        authorizations[msg.sender].status = AuthStatus.Requested;
        CaseAuthorizationRequested(address(this), patient, msg.sender);
    }

    /**
     * @dev - Patient will encrypt the encryption key using the doctors public key so that the doctor can decrypt the case files
     * @param _doctor - the doctors address to authorize
     * @param _encryptionKey - the case file encryption key encrypted using the doctors public key
     */
    function authorizeDoctor(address _doctor, bytes32 _encryptionKey) public onlyPatient {
        require(_doctor != 0x0);
        require(doctorManager.isDoctor(_doctor));
        require(authorizations[_doctor].status == AuthStatus.Requested);
        authorizations[_doctor].status = AuthStatus.Approved;
        authorizations[_doctor].doctorEncryptionKey = _encryptionKey;
        CaseAuthorizationApproved(address(this), patient, _doctor);
    }
}
