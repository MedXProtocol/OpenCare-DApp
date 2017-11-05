pragma solidity ^0.4.15;

contract MedCredits {
    address public contractOwner;
    uint256 public caseCount;
    uint256 constant ALLOWED_DIAGNOSES = 2;

    mapping(uint256 => PatientCase) internal patientCases;
    mapping(address => Physician) public physicians;

    struct PatientCase {
        address patient;
        string symptoms;
        bytes32 imagePath1;
        bytes32 imagePath2;
        string diagnosis;
        uint256 diagnosisCount;
        CaseState caseStatus;
        uint256 dateListed;
    }

    struct Physician {
        PhysicianStatus status;
        string name;
    }

    enum CaseState { WaitingForDiagnosis, DiagnosisInProgress, DiagnosisSubmitted, DiagnosisAccepted, DiagnosisRejected }
    enum PhysicianStatus { NotApproved, Approved }

    event CaseListed(address patient, uint256 dateListed);
    event CaseDiagnosed(address patient, address doctor);

    modifier onlyOwner {
        require(msg.sender == contractOwner);
        _;
    }

    modifier approvedPhysicianOnly {
        require(physicians[msg.sender].status == PhysicianStatus.Approved);
        _;
    }

    function MedCredits() {
        contractOwner = msg.sender;
    }

    function createCase(string _symptoms) {
        //TODO: Add params to create the actual case
        patientCases[caseCount] = PatientCase(msg.sender, _symptoms, "", "", "", 0, CaseState.WaitingForDiagnosis, now);
        caseCount++;
        CaseListed(msg.sender, now);
    }

    function getCase(uint256 _caseId) constant returns (address, string, bytes32, bytes32, string, uint256, CaseState, uint256) {
        PatientCase storage pCase = patientCases[_caseId];
        //Only approved physicians and the patient can view their cases
        require(physicians[msg.sender].status == PhysicianStatus.Approved || pCase.patient == msg.sender);

        return (pCase.patient, pCase.symptoms, pCase.imagePath1, pCase.imagePath2, pCase.diagnosis, pCase.diagnosisCount, pCase.caseStatus, pCase.dateListed);
    }

    function diagnoseCase(uint256 _caseId) approvedPhysicianOnly {
        PatientCase storage pCase = patientCases[_caseId];
        require(pCase.caseStatus == CaseState.WaitingForDiagnosis);
        require(pCase.diagnosisCount <= ALLOWED_DIAGNOSES);
        pCase.caseStatus = CaseState.DiagnosisInProgress;
    }

    function submitDiagnosis(uint256 _caseId, string _diagnosis) approvedPhysicianOnly {
        PatientCase storage pCase = patientCases[_caseId];
        require(pCase.caseStatus == CaseState.DiagnosisInProgress);
        pCase.diagnosis = _diagnosis;
        pCase.diagnosisCount++;
        pCase.caseStatus = CaseState.DiagnosisSubmitted;
    }

    function reviewDiagnosis(uint256 _caseId, bool _accepted) {
        PatientCase storage pCase = patientCases[_caseId];
        require(pCase.caseStatus == CaseState.DiagnosisSubmitted);
        require(pCase.patient == msg.sender);
        if (_accepted)
            pCase.caseStatus = CaseState.DiagnosisAccepted;
        else {
            if(pCase.diagnosisCount < ALLOWED_DIAGNOSES)
                pCase.caseStatus = CaseState.WaitingForDiagnosis;
            else
                pCase.caseStatus = CaseState.DiagnosisRejected;
        }
    }

    function addPhysician(address _physicianAddress, string _name) onlyOwner {
        physicians[_physicianAddress] = Physician({status: PhysicianStatus.NotApproved, name: _name});
    }

    function approvePhysician(address _physicianAddress) onlyOwner {
        Physician storage phys = physicians[_physicianAddress];
        phys.status = PhysicianStatus.Approved;
    }

}
