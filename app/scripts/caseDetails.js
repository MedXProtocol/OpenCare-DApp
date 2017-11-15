/* TODO: Hide/show controls based on viewing account. If account is patient, don't show doctor controls etc*/

let $requestAuthorizationBtn, $authDoctorBtn, $diagnoseCaseBtn, $acceptDiagnosisBtn, $challengeDiagnosisBtn, $diagnoseBCaseBtn, $confirmChallengedDiagnosisBtn, $rejectChallengedDiagnosisBtn;
let $currentAccountLbl, $isDoctorLbl, $medXBalanceLbl, $caseBalanceLbl, $caseAddressLbl, $caseFeeLbl, $patientLbl, $doctorALbl, $doctorBLbl, $detailLocationHashLbl, $statusLbl, $isAuthorizedDoctorLbl,
    $originalEncryptionKeyLbl, $diagnosisLocationHashLbl, $doctorManagerAddressLbl, $medXTokenAddressLbl, $diagnosisBLocationHashLbl;
let $descriptionTxt, $encryptionKeyTxt, $authDoctorAddressTxt, $diagnosisTxt, $diagnosisBTxt;
let latestCase, queryStringCaseAddress;
let $allListingsDataTable;
let $allListingsTbl;


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
    $diagnosisBLocationHashLbl = $("#diagnosisBLocationHashLbl");
    $doctorManagerAddressLbl = $("#doctorManagerAddressLbl");
    $medXTokenAddressLbl = $("#medXTokenAddressLbl");

    $descriptionTxt = $("#descriptionTxt");
    $encryptionKeyTxt = $("#encryptionKeyTxt");
    $authDoctorAddressTxt = $("#authDoctorAddressTxt");
    $diagnosisTxt = $("#diagnosisTxt");
    $diagnosisBTxt = $("#diagnosisBTxt");

    $requestAuthorizationBtn = $("#requestAuthorizationBtn");
    $authDoctorBtn = $("#authDoctorBtn");
    $diagnoseCaseBtn = $("#diagnoseCaseBtn");
    $acceptDiagnosisBtn = $("#acceptDiagnosisBtn");
    $challengeDiagnosisBtn = $("#challengeDiagnosisBtn");
    $diagnoseBCaseBtn = $("#diagnoseBCaseBtn");
    $confirmChallengedDiagnosisBtn = $("#confirmChallengedDiagnosisBtn");
    $rejectChallengedDiagnosisBtn = $("#rejectChallengedDiagnosisBtn");

    $allListingsTbl = $("#allListingsTbl");

    log("Query String Param [" + URI.parseQuery(URI.parse(window.location.href).query).caseId + "]");
    queryStringCaseAddress = URI.parseQuery(URI.parse(window.location.href).query).caseId;

    initializeCaseDetailsPage();
});

function initializeCaseDetailsPage() {
    if (accountsInitialized) {
        $currentAccountLbl.text(currentUserAddress);
        doctorManager.isDoctor(currentUserAddress, function(_error, _result) {
            $isDoctorLbl.text(_result);
        });

        $requestAuthorizationBtn.on("click", requestAuthorization);
        $diagnoseCaseBtn.on("click", diagnoseCase);
        $acceptDiagnosisBtn.on("click", acceptDiagnosis);
        $challengeDiagnosisBtn.on("click", challengeDiagnosis);

        $allListingsTbl.on("click", ".auth-doctor", authorizeDoctor);

        $allListingsDataTable = initDataTable($allListingsTbl, {
            "info": false,
            "paging": false,
            "searching": false,
            "language": {
                "emptyTable": "There are currently no names for sale. Please check back later"
            }
        });


        updateAccountBalance();
        loadCase();
        populateCaseAuthRequestsTable();
        getCaseDetails();
    } else {
        setTimeout(function() {
            initializeCaseDetailsPage();
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
            $detailLocationHashLbl.text(web3.toAscii(_result));
        });
        latestCase.status(function (_error, _result) {
            $statusLbl.text(CaseStatus[_result]);
        });
        latestCase.originalEncryptionKey(function (_error, _result) {
            $originalEncryptionKeyLbl.text(_result);
        });
        latestCase.diagnosisALocationHash(function (_error, _result) {
            $diagnosisLocationHashLbl.text(web3.toAscii(_result));
        });
        latestCase.diagnosisBLocationHash(function (_error, _result) {
            $diagnosisBLocationHashLbl.text(web3.toAscii(_result));
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

function diagnoseCase() {
    web3.eth.defaultAccount = currentUserAddress;
    let diagnosisMatch = true;
    latestCase.status(function(_error, _status) {
       if (_status == 4) {
           latestCase.diagnoseChallengedCase($diagnosisTxt.val(), diagnosisMatch, function(_error, _result) {
               log("Challenged Case Diagnosis Submitted with value [" + diagnosisMatch + "]!");
           });
       } else {
           latestCase.diagnoseCase($diagnosisTxt.val(), function(_error, _result) {
               log("Case Diagnosis Submitted!");
           });
       }
    });
}

function acceptDiagnosis() {
    web3.eth.defaultAccount = currentUserAddress;
    latestCase.acceptDiagnosis(function(_error, _result) {
        log("Case accepted!");
    });
}

function challengeDiagnosis() {
    web3.eth.defaultAccount = currentUserAddress;
    latestCase.challengeDiagnosis(function(_error, _result) {
        log("Case challenged!");
    });
}

function updateCaseBalance(_caseAddress) {
    medXToken.balanceOf(_caseAddress, function (_error, _caseBalance) {
        $caseBalanceLbl.html(_caseBalance + " MEDX");
    });
}

function authorizeDoctor() {
    web3.eth.defaultAccount = currentUserAddress;
    let _doctorAddress = $allListingsDataTable.row($(this).parents("tr")).data()[0];
    log("Case Address [" + _doctorAddress + "]");

    latestCase.authorizeDoctor(_doctorAddress, "encryptionKey", function(_error, _result) {
       log("Doctor Authorized!");
    });
}

function requestAuthorization() {
    web3.eth.defaultAccount = currentUserAddress;
    latestCase.requestAuthorization(function(_error, _result) {
        log("Auth requested for case!");
    });
}

function populateCaseAuthRequestsTable() {
    $allListingsDataTable.clear().draw();

    latestCase.getAllAuthorizationListCount(function(_error, _authRequestCount) {
        log("Auth request count [" + _authRequestCount + "]");
        for (let _iterationCounter = 0; _iterationCounter < _authRequestCount; _iterationCounter++) {
            latestCase.authorizationList(_iterationCounter, function(_error, _doctorAddress) {
                latestCase.authorizations(_doctorAddress, function(_error, _authRequestDetails) {
                    let disableButton = "";
                    if (_authRequestDetails[0] == 2)
                        disableButton = " disabled='disabled'";
                    $allListingsDataTable.row.add([
                        _doctorAddress,
                        AuthStatus[_authRequestDetails[0]],
                        "<button id='authdoctor" + _iterationCounter + "Btn' class='btn auth-doctor btn-primary btn-block' " + disableButton + " type='button'>Authorize</button>",
                    ]).draw();
                });
            });
        }
    });
}