let $submitCaseBtn, $requestAuthorizationBtn, $authDoctorBtn, $diagnoseCaseBtn;
let $currentAccountLbl, $isDoctorLbl, $medXBalanceLbl, $caseBalanceLbl, $caseAddressLbl, $caseFeeLbl, $patientLbl, $doctorALbl, $doctorBLbl, $detailLocationHashLbl, $statusLbl, $isAuthorizedDoctorLbl,
    $originalEncryptionKeyLbl, $diagnosisLocationHashLbl, $doctorManagerAddressLbl, $medXTokenAddressLbl;
let $descriptionTxt, $encryptionKeyTxt, $authDoctorAddressTxt, $diagnosisTxt;
let latestCase, queryStringCaseAddress;


$(function() {
    $currentAccountLbl = $("#currentAccountLbl");
    $isDoctorLbl = $("#isDoctorLbl");
    $medXBalanceLbl = $("#medXBalanceLbl");
    $caseBalanceLbl = $("#caseBalanceLbl");
    $caseAddressLbl = $("#caseAddressLbl");
    $caseFeeLbl = $("#caseFeeLbl");
    $patientLbl = $("#patientLbl");
    $doctorALbl = $("#doctorALbl");
    $doctorBLbl = $("#doctorBLbl");
    $detailLocationHashLbl = $("#detailLocationHashLbl");
    $statusLbl = $("#statusLbl");
    $isAuthorizedDoctorLbl = $("#isAuthorizedDoctorLbl");
    $originalEncryptionKeyLbl = $("#originalEncryptionKeyLbl");
    $diagnosisLocationHashLbl = $("#diagnosisLocationHashLbl");
    $doctorManagerAddressLbl = $("#doctorManagerAddressLbl");
    $medXTokenAddressLbl = $("#medXTokenAddressLbl");

    $descriptionTxt = $("#descriptionTxt");
    $encryptionKeyTxt = $("#encryptionKeyTxt");
    $authDoctorAddressTxt = $("#authDoctorAddressTxt");
    $diagnosisTxt = $("#diagnosisTxt");

    $submitCaseBtn = $("#submitCaseBtn");
    $requestAuthorizationBtn = $("#requestAuthorizationBtn");
    $authDoctorBtn = $("#authDoctorBtn");
    $diagnoseCaseBtn = $("#diagnoseCaseBtn");

    log("Query String Param [" + URI.parseQuery(URI.parse(window.location.href).query).caseId + "]");
    queryStringCaseAddress = URI.parseQuery(URI.parse(window.location.href).query).caseId;

    initializeSubmitPage();
});

function initializeSubmitPage() {
    if (accountsInitialized) {
        $currentAccountLbl.text(currentUserAddress);
        doctorManager.isDoctor(currentUserAddress, function(_error, _result) {
            $isDoctorLbl.text(_result);
        });

        $submitCaseBtn.on("click", submitCase);
        $requestAuthorizationBtn.on("click", requestAuthorization);
        $authDoctorBtn.on("click", authorizedDoctor);
        $diagnoseCaseBtn.on("click", diagnoseCase);

        updateAccountBalance();
        loadCase();
        getCaseDetails();
    } else {
        setTimeout(function() {
            initializeSubmitPage();
        }, 500);
    }
}

function loadCase() {
    if (queryStringCaseAddress === undefined) {
        log("Getting latest case...");
        caseFactory.getPatientCaseListCount(currentUserAddress, function (_error, _caseCount) {
            log("Case count [" + _caseCount + "]");
            caseFactory.patientCases(currentUserAddress, _caseCount - 1, function (_error, _latestCaseAddress) {
                log("Latest Case Address [" + _latestCaseAddress + "]");
                latestCase = web3.eth.contract(medXCaseAbi).at(_latestCaseAddress);
                updateCaseBalance(_latestCaseAddress);
            });
        });
    } else {
        log("Already have address, loading case...");
        latestCase = web3.eth.contract(medXCaseAbi).at(queryStringCaseAddress);
        updateCaseBalance(queryStringCaseAddress);
    }
}

function getCaseDetails() {
    if (latestCase !== undefined) {
        $caseAddressLbl.text(latestCase.address);
        latestCase.caseFee(function (_error, _result) {
            $caseFeeLbl.text(_result);
        });
        latestCase.patient(function (_error, _result) {
            $patientLbl.text(_result);
        });
        latestCase.diagnosingDoctorA(function (_error, _result) {
            $doctorALbl.text(_result);
        });
        latestCase.diagnosingDoctorB(function (_error, _result) {
            $doctorBLbl.text(_result);
        });
        latestCase.caseDetailLocationHash(function (_error, _result) {
            $detailLocationHashLbl.text(_result);
        });
        latestCase.status(function (_error, _result) {
            $statusLbl.text(CaseStatus[_result]);
        });
        latestCase.originalEncryptionKey(function (_error, _result) {
            $originalEncryptionKeyLbl.text(_result);
        });
        latestCase.diagnosisLocationHash(function (_error, _result) {
            $diagnosisLocationHashLbl.text(_result);
        });
        latestCase.doctorManager(function (_error, _result) {
            $doctorManagerAddressLbl.text(_result);
        });
        latestCase.medXToken(function (_error, _result) {
            $medXTokenAddressLbl.text(_result);
        });
        latestCase.authorizations(currentUserAddress, function(_error, _result) {
            $isAuthorizedDoctorLbl.text(AuthStatus[_result[0]]);
        })
    } else {
        setTimeout(function() {
            getCaseDetails();
        }, 500);
    }
}

function submitCase() {
    web3.eth.defaultAccount = currentUserAddress;
    latestCase.submitCase($descriptionTxt.val(), $encryptionKeyTxt.val(), function(_error, _result) {
        log("Case Submitted!");
    });
}

function diagnoseCase() {
    web3.eth.defaultAccount = currentUserAddress;
    latestCase.diagnoseCase($diagnosisTxt.val(), function(_error, _result) {
        log("Case Dianosis Submitted!");
    });
}

function updateCaseBalance(_caseAddress) {
    medXToken.balanceOf(_caseAddress, function (_error, _caseBalance) {
        $caseBalanceLbl.html(_caseBalance + " MEDX");
    });
}

function authorizedDoctor() {
    web3.eth.defaultAccount = currentUserAddress;
    latestCase.authorizeDoctor($authDoctorAddressTxt.val(), "encryptionKey", function(_error, _result) {
       log("Doctor Authorized!");
    });
}

function requestAuthorization() {
    web3.eth.defaultAccount = currentUserAddress;
    latestCase.requestAuthorization(function(_error, _result) {
        log("Auth requested for case!");
    });
}