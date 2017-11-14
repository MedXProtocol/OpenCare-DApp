/* TODO: Check current account - if doctor then show list */

let $createCaseBtn, $medXBalanceLbl;
let $allListingsDataTable;
let $allListingsTbl;

$(function() {
    $createCaseBtn = $("#createCaseBtn");
    $allListingsTbl = $("#allListingsTbl");
    $medXBalanceLbl = $("#medXBalanceLbl");

    initializeDoctorPage();
});

function initializeDoctorPage() {
    if (accountsInitialized) {
        $allListingsTbl.on("click", ".diagnose-case", diagnoseCase);
        $allListingsDataTable = initDataTable($allListingsTbl, {
            "language": {
                "emptyTable": "There are currently no names for sale. Please check back later"
            }
        });

        populateAllListingsTable();
        updateAccountBalance();

    } else {
        setTimeout(function() {
            initializeDoctorPage();
        }, 500);
    }
}

function diagnoseCase() {
    let caseAddress = $allListingsDataTable.row($(this).parents("tr")).data()[0];
    window.location = "caseDetails.html?caseId=" + caseAddress;
}

function populateAllListingsTable() {
    $allListingsDataTable.clear().draw();

    caseFactory.getAllCaseListCount(function(_error, _allCaseCount) {
        log("Case count [" + _allCaseCount + "]");
        for (let _iterationCounter = 0; _iterationCounter < _allCaseCount; _iterationCounter++) {
            caseFactory.caseList(_iterationCounter, function(_error, _contractAddress) {
                let medXCase = web3.eth.contract(medXCaseAbi).at(_contractAddress);
                medXCase.status(function(_error, _caseStatus) {
                    if (_caseStatus == 1 || _caseStatus == 4) {
                        medXCase.patient(function(_error, _pateitnAddress) {
                            $allListingsDataTable.row.add([
                                _contractAddress,
                                CaseStatus[_caseStatus],
                                _pateitnAddress,
                                "<button id='diagnose" + _iterationCounter + "Btn' class='btn diagnose-case btn-primary btn-block' type='button'>Diagnose</button>"
                            ]).draw();
                        })

                    }
                })
            });
        }
    });
}



