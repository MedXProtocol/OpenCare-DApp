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
    bytes public diagnosisALocationHash;
    bytes public diagnosisBLocationHash;

    Registry public registry;
    MedXToken public medXToken;
    CaseStatus public status;

    byte[64] public encryptedCaseKey;

    enum CaseStatus {
      None, Open, EvaluationRequest, Evaluating, Evaluated,
      Closed, Challenged, ChallengeRequest, Challenging,
      Canceled, ClosedRejected, ClosedConfirmed
    }

    event CaseCreated(address indexed _caseAddress, address indexed _casePatient);
    event CaseEvaluated(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseClosed(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseClosedRejected(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseClosedConfirmed(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseChallenged(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseAuthorizationRequested(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor);
    event CaseAuthorizationApproved(address indexed _caseAddress, address indexed _casePatient, address indexed _caseDoctor, bytes _doctorEncryptedKey);

    /**
     * @dev - throws if called by any account other than the patient.
     */
    modifier onlyPatient() {
        require(msg.sender == patient, 'Sender must be patient');
        _;
    }

    /**
     * @dev - throws if called by any account other than a doctor.
     */
    modifier onlyDoctor(address _doctor) {
        require(doctorManager().isDoctor(_doctor));
        _;
    }

    modifier onlyFirstDoctor() {
      require(msg.sender == diagnosingDoctorA);
      _;
    }

    modifier onlyChallengeDoctor() {
      require(msg.sender == diagnosingDoctorB);
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
        byte[64] _encryptedCaseKey,
        bytes _caseHash,
        uint256 _caseFee,
        MedXToken _token,
        Registry _registry
    ) external notInitialized {
        setInitialized();
        owner = msg.sender;
        status = CaseStatus.Open;
        encryptedCaseKey = _encryptedCaseKey; // don't need to store this
        patient = _patient;
        caseDetailLocationHash = _caseHash; // don't need to store this
        caseFee = _caseFee;
        medXToken = _token;
        registry = _registry;
        emit CaseCreated(address(this), patient);
    }

    /**
     * @dev - Contract should not accept any ether
     */
    function () public payable {
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
    function diagnoseCase(bytes _diagnosisHash) public onlyFirstDoctor {
        require(status == CaseStatus.Evaluating);
        status = CaseStatus.Evaluated;
        diagnosisALocationHash = _diagnosisHash;
        emit CaseEvaluated(address(this), patient, diagnosingDoctorA);
    }

    function getEncryptedCaseKey() public view returns (byte[64]) {
      return encryptedCaseKey;
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
    function diagnoseChallengedCase(bytes _secondaryDiagnosisHash, bool _accept) public onlyChallengeDoctor {
        require(status == CaseStatus.Challenging);
        diagnosisBLocationHash = _secondaryDiagnosisHash;
        if (_accept)
            confirmChallengedDiagnosis();
        else
            rejectChallengedDiagnosis();
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

    function requestDiagnosisAuthorization (address _doctor) external onlyDoctor(_doctor) {
      require(status == CaseStatus.Open);
      status = CaseStatus.EvaluationRequest;
      emit CaseAuthorizationRequested(address(this), patient, _doctor);
    }

    function requestChallengeAuthorization (address _doctor) external onlyDoctor(_doctor) {
      require(status == CaseStatus.Challenged);
      status = CaseStatus.ChallengeRequest;
      emit CaseAuthorizationRequested(address(this), patient, _doctor);
    }

    function authorizeDiagnosisDoctor (address _doctor, bytes _doctorEncryptedKey) external onlyPatient {
      require(status == CaseStatus.EvaluationRequest);
      diagnosingDoctorA = _doctor;
      status = CaseStatus.Evaluating;
      emit CaseAuthorizationApproved(address(this), patient, msg.sender, _doctorEncryptedKey);
    }

    function authorizeChallengeDoctor (address _doctor, bytes _doctorEncryptedKey) external onlyPatient {
      require(status == CaseStatus.ChallengeRequest);
      diagnosingDoctorB = _doctor;
      status = CaseStatus.Challenging;
      emit CaseAuthorizationApproved(address(this), patient, msg.sender, _doctorEncryptedKey);
    }

    function doctorManager() internal view returns (DoctorManager) {
        return DoctorManager(registry.lookup(keccak256("DoctorManager")));
    }
}
