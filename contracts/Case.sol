pragma solidity ^0.4.23;

import "./MedXToken.sol";
import "./DoctorManager.sol";
import "./Registry.sol";
import "./Initializable.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Case is Ownable, Initializable {
    using SafeMath for uint256;

    uint256 public caseFee;

    address public patient;
    address public diagnosingDoctorA;
    address public diagnosingDoctorB;

    bytes public caseDetailLocationHash;
    bytes public originalEncryptionKey;
    bytes public diagnosisALocationHash;
    bytes public diagnosisBLocationHash;

    Registry public registry;
    MedXToken public medXToken;
    CaseStatus public status;

    address[] public authorizationList;
    mapping (address => Authorization) public authorizations;
    struct Authorization {
        AuthStatus status;
        bytes32 doctorEncryptionKey;
    }

    enum CaseStatus { None, Open, Evaluated, Closed, Challenged, Canceled, ClosedRejected, ClosedConfirmed }
    enum AuthStatus { None, Requested, Approved }

    event CaseCreated(address indexed _caseAddress, address indexed _casePatient);
    event CaseEvaluated(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseClosed(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseClosedRejected(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseClosedConfirmed(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
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
        require(doctorManager().isDoctor(msg.sender));
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
     * @param _registry - the registry contract
     */
    function initialize (
        address _patient,
        bytes _caseHash,
        uint256 _caseFee,
        MedXToken _token,
        Registry _registry
    ) external notInitialized {
        setInitialized();
        owner = msg.sender;
        status = CaseStatus.Open;
        patient = _patient;
        caseDetailLocationHash = _caseHash;
        caseFee = _caseFee;
        medXToken = _token;
        registry = _registry;
        emit CaseCreated(address(this), patient);
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
        require(status == CaseStatus.Open);
        status = CaseStatus.Canceled;
        medXToken.transfer(patient, medXToken.balanceOf(this)); //Security in case the funds were bigger than required
    }

    /**
     * @dev - doctor submits diagnosis for case. Patient must have approved the doctor in order for them to decrypt the case files
     * @param _diagnosisHash - Swarm hash of where the diagnosis data is stored
     */
    function diagnoseCase(bytes _diagnosisHash) public onlyDoctor {
        require(status == CaseStatus.Open);
        //require(authorizations[msg.sender].status == AuthStatus.Approved);
        status = CaseStatus.Evaluated;

        /* TODO: Start 24 hour timer */
        diagnosingDoctorA = msg.sender;
        diagnosisALocationHash = _diagnosisHash;
        emit CaseEvaluated(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The user accepts the evaluation and tokens are credited to doctor and rest is returned to the patient
     */
    function acceptDiagnosis() public onlyPatient {
        /* TODO: add evaluation time logic */
        require(status == CaseStatus.Evaluated);
        status = CaseStatus.Closed;
        medXToken.transfer(diagnosingDoctorA, caseFee);
        medXToken.transfer(patient, medXToken.balanceOf(address(this)));
        emit CaseClosed(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The user challenges the diagnosis - new doctor to review
     */
    function challengeDiagnosis() public onlyPatient {
        require(status == CaseStatus.Evaluated);
        status = CaseStatus.Challenged;
        /* TODO: Make sure case is within 24 hour period */
        emit CaseChallenged(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - Submit a diagnosis for a challenged case, must be a different doctor to the first
     * @param _secondaryDiagnosisHash - Location of the diagnosis
     * @param _accept - diagnosis the same as the original
     */
    function diagnoseChallengedCase(bytes _secondaryDiagnosisHash, bool _accept) public onlyDoctor {
        require(status == CaseStatus.Challenged);
        require(msg.sender != diagnosingDoctorA);
        //require(authorizations[msg.sender].status == AuthStatus.Approved);

        diagnosingDoctorB = msg.sender;
        diagnosisBLocationHash = _secondaryDiagnosisHash;

        if (_accept)
            confirmChallengedDiagnosis();
        else
            rejectChallengedDiagnosis();
    }

    /**
     * @dev - doctor requests access to patients encrypted case files. Patient needs to approved and created doctor specific decryption key
     */
    function requestAuthorization() public onlyDoctor {
        authorizations[msg.sender].status = AuthStatus.Requested;
        authorizationList.push(msg.sender);
        emit CaseAuthorizationRequested(address(this), patient, msg.sender);
    }

    /**
     * @dev - Patient will encrypt the encryption key using the doctors public key so that the doctor can decrypt the case files
     * @param _doctor - the doctors address to authorize
     * @param _encryptionKey - the case file encryption key encrypted using the doctors public key
     */
    function authorizeDoctor(address _doctor, bytes32 _encryptionKey) public onlyPatient {
        require(_doctor != 0x0);
        require(doctorManager().isDoctor(_doctor));
        require(authorizations[_doctor].status == AuthStatus.Requested);
        authorizations[_doctor].status = AuthStatus.Approved;
        authorizations[_doctor].doctorEncryptionKey = _encryptionKey;
        emit CaseAuthorizationApproved(address(this), patient, _doctor);
    }

    /**
     * @dev - returns the length of the authorization list
     */
    function getAllAuthorizationListCount() public constant returns (uint256 _authorizationCount) {
        return authorizationList.length;
    }

    /**
     * @dev - The second doctor confirms the diagnosis. Patient must have approved second doctor in order for them to have viewed the case files
     */
    function confirmChallengedDiagnosis() internal {
        status = CaseStatus.ClosedConfirmed;

        medXToken.transfer(diagnosingDoctorA, caseFee);
        medXToken.transfer(diagnosingDoctorB, (caseFee * 50) / 100);
        medXToken.transfer(patient, medXToken.balanceOf(address(this)));

        emit CaseClosedConfirmed(address(this), patient, diagnosingDoctorA);
    }

    /**
     * @dev - The second doctor rejects the diagnosis
     */
    function rejectChallengedDiagnosis() internal {
        status = CaseStatus.ClosedRejected;

        medXToken.transfer(diagnosingDoctorB, (caseFee * 50) / 100);
        medXToken.transfer(patient, medXToken.balanceOf(address(this)));

        emit CaseClosedRejected(address(this), patient, diagnosingDoctorA);
    }

    function doctorManager() internal view returns (DoctorManager) {
        return DoctorManager(registry.lookup(keccak256("DoctorManager")));
    }
}
