let $mintTokensBtn, $tokenRecipientTxt;
let $addDoctorBtn, $doctorAddressTxt;

$(function() {
    $mintTokensBtn = $("#mintTokensBtn");
    $tokenRecipientTxt = $("#tokenRecipientTxt");
    $addDoctorBtn = $("#addDoctorBtn");
    $doctorAddressTxt = $("#doctorAddressTxt");

    initializeUtilsPage()
});

function initializeUtilsPage() {
    if (accountsInitialized) {
        $mintTokensBtn.on("click", mintTokens);
        $addDoctorBtn.on("click", addDoctor);
    } else {
        setTimeout(function() {
            initializeUtilsPage();
        }, 100);
    }
}

function mintTokens() {
    web3.eth.defaultAccount = currentUserAddress;
    let tokenRecipient = $tokenRecipientTxt.val();
    medXToken.mint(tokenRecipient, 1000, function(_error, _result) {
        if (!_error) {
            log("Mint tokens tx hash [" + _result + "]");
            waitForTxComplete(_result, "Mint Tokens", function (_txDetails) {
                log("Tokens minted!");
                medXToken.balanceOf(tokenRecipient, function (_error, _balance) {
                    log("Token balance [" + _balance + " MEDX]");
                });
            });
        }
        else {
            console.error(_error);
        }
    });
}

function addDoctor() {
    web3.eth.defaultAccount = currentUserAddress;
    let newDoctor = $doctorAddressTxt.val();
    doctorManager.addDoctor(newDoctor, function(_error, _result) {
        waitForTxComplete(_result, "Add Doctor", function (_txDetails) {
            log("Doctor Added!");
        });
    });
}