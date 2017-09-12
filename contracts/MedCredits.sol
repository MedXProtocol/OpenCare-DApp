pragma solidity ^0.4.15;

contract MedCredits {
    address public contractOwner;
    uint256 caseCount;

    /*mapping(address => PatientCase) patientCases;*/

    /* 0x2755f888047Db8E3d169C6A427470C44b19a7270 => [0][struct[]]*/
    /* 0x2755f888047Db8E3d169C6A427470C44b19a7270 => [1][struct[]]*/
    /* 0x203e9Aa0a8A8Dc03f8182bC74Db18cEe371dC237 => [2][struct[]]*/
    //patientCases[msg.sender][caseCount];
    mapping(address => mapping(uint256 => PatientCase)) patientCases;

    mapping(address => Physician) public physicians;

    enum CaseState { WaitingForDiagnosis, DiagnosisInProgress, DiagnosisAccepted, DiagnosisRejected }
    enum PhysicianStatus { NotApproved, Approved }

    struct PatientCase {
        string diagnosis;
        CaseState caseStatus;
        uint256 dateListed;
    }

    struct Physician {
        address physician;
        PhysicianStatus status;
    }

    event CaseListed(address patient);
    event CaseDiagnosis(address patient, address doctor);

    modifier onlyOwner {
        require(msg.sender == contractOwner);
        _;
    }

    function MedCredits() {
        contractOwner = msg.sender;
    }

    function addPhysician(address _physicianAddress) onlyOwner {
        physicians[_physicianAddress] = Physician({physician: _physicianAddress, status: PhysicianStatus.NotApproved});
    }

    function createCase() {
        patientCases[msg.sender][caseCount] = PatientCase("My Symptoms go here", CaseState.WaitingForDiagnosis, now);
    }

    function diagnoseCase(address _patient, uint256 _caseId, address _consultingPhysician) {
        PatientCase patCase = patientCases[_patient][_caseId];
        patCase.caseStatus = CaseState.DiagnosisInProgress;
    }

    /* Reject or approved diagnosis */
    function reviewDiagnosis() {
        /*Patient only*/
    }

    function approvePhysician(address _physicianAddress) onlyOwner {
        Physician dr = physicians[_physicianAddress];
        dr.status = PhysicianStatus.Approved;
    }

    function listCase(address _patientAddress, uint256 _caseId) constant returns (string, CaseState, uint256) {
        //Only approved physicians can view cases
        require(physicians[msg.sender].physician != 0);

        PatientCase patCase = patientCases[_patientAddress][_caseId];
        return (patCase.diagnosis, patCase.caseStatus, patCase.dateListed);
    }
}
