/* TODO: Change action button based on case status -> Evaluated, show review button*/
let $createCaseBtn, $medXBalanceLbl;
let $swarmHashCaseDataTxt;
let $allListingsDataTable;
let $allListingsTbl;

$(function() {
    $createCaseBtn = $("#createCaseBtn");

    $allListingsTbl = $("#allListingsTbl");
    $medXBalanceLbl = $("#medXBalanceLbl");

    $swarmHashCaseDataTxt = $("#swarmHashCaseDataTxt");

    initializeIndexPage();
});

function initializeIndexPage() {
    if (accountsInitialized) {
        $createCaseBtn.on("click", createCase);
        $allListingsTbl.on("click", ".cancel-case", cancelCase);
        $allListingsDataTable = initDataTable($allListingsTbl, {
            "columnDefs": [
                {"targets": 4, "visible": false}
            ],
            "language": {
                "emptyTable": "There are currently no names for sale. Please check back later"
            }
        });

        populateAllListingsTable();
        updateAccountBalance($medXBalanceLbl);

    } else {
        setTimeout(function() {
            initializeIndexPage();
        }, 500);
    }
}

function cancelCase() {
    web3.eth.defaultAccount = currentUserAddress;
    let caseAddress = $allListingsDataTable.row($(this).parents("tr")).data()[4];
    log("Case Address [" + caseAddress + "]");
    let medXCase = web3.eth.contract(medXCaseAbi).at(caseAddress);
    medXCase.cancelCase(function(_error, _result) {
        log("Cancel case tx hash [" + _result + "]");
        waitForTxComplete(_result, "Cancel Case", function (_txDetails) {
            log("Case Canceled");
            updateAccountBalance($medXBalanceLbl);
            populateAllListingsTable();
        });
    });
}

function createCase() {
    web3.eth.defaultAccount = currentUserAddress;
    medXToken.approveAndCall(caseFactoryAddress, 150, $swarmHashCaseDataTxt.val(), function (_error, _result) {
        log("Create case tx hash [" + _result + "]");
        waitForTxComplete(_result, "Create Case", function (_txDetails) {
            log("Case Created");
            populateAllListingsTable();
        });
    });
}

function populateAllListingsTable() {
    $allListingsDataTable.clear().draw();

    caseFactory.getPatientCaseListCount(currentUserAddress, function(_error, _patientCaseCount) {
        log("Case count [" + _patientCaseCount + "]");
        for (let _iterationCounter = 0; _iterationCounter < _patientCaseCount; _iterationCounter++) {
            caseFactory.patientCases(currentUserAddress, _iterationCounter, function(_error, _contractAddress) {
                let medXCase = web3.eth.contract(medXCaseAbi).at(_contractAddress);
                medXCase.status(function(_error, _caseStatus) {
                    medXToken.balanceOf(_contractAddress, function(_error, _caseMedXBalance) {
                        let disableButton = "";
                        if (_caseStatus != 1)
                            disableButton = " disabled='disabled'";
                        $allListingsDataTable.row.add([
                            "<a href='caseDetails.html?caseId=" + encodeURIComponent(_contractAddress) + "'>" + _contractAddress + "</a>",
                            CaseStatus[_caseStatus],
                            _caseMedXBalance + " MEDX",
                            "<button id='cancel" + _iterationCounter + "Btn' class='btn cancel-case btn-primary btn-block' " + disableButton + " type='button'>Cancel</button>",
                            _contractAddress
                        ]).draw();
                    });
                })
            });
        }
    });
}



