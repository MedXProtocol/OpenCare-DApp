import expectThrow from './helpers/expectThrow';

let medXTokenContract = artifacts.require("./MedXToken.sol");
let caseFactoryContract = artifacts.require("./CaseFactory.sol");
let doctorManagerContract = artifacts.require("./DoctorManager.sol");
let caseContract = artifacts.require("./Case.sol");
let medXToken;
let caseFactory;
let doctorManager;
let theCase;

let CaseStatus = { Created:0, Open:1, Evaluated:2, Closed:3, Challenged:4, Canceled:5 };
let AuthStatus = { None:0, Requested:1, Approved:2 };

contract('MedCredits Application', function (accounts) {

    describe('Initial Configuration', function() {
        this.slow(1000);

        before(async () => {
            medXToken = await medXTokenContract.deployed();
            doctorManager = await doctorManagerContract.deployed();
            caseFactory = await caseFactoryContract.deployed();
        });

        it("Configuration test...", async () => {
            smartLog("MedXToken Address [" + medXToken.address + "]", true);
            smartLog("DrManager Address [" + doctorManager.address + "]", true);
            smartLog("CaseFactory Address [" + caseFactory.address + "]", true);
            await medXToken.mint(accounts[1], 1000);
            smartLog("Token total supply [" + await medXToken.totalSupply() + "]", true);
            smartLog("Token balance for [" + accounts[1] + "] is [" + await medXToken.balanceOf(accounts[1]) + "]", true);
        });

        it("should create case", async () => {
            await medXToken.mint(accounts[1], 1000);
            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[1] });
            let caseAddress = await caseFactory.caseList(0);
            smartLog("Case list length [" + await caseFactory.getCaseListLength() + "]", true);
            smartLog("Case address [" + caseAddress + "]", true);
            smartLog("Case token balance [" + await medXToken.balanceOf(caseAddress) + "]", true);
            theCase = caseContract.at(caseAddress);
            smartLog("Case status [" + await theCase.status() + "]", true);
            smartLog("Case patient [" + await theCase.patient() + "], should be [" + accounts[1] + "]", true);
            assert.equal(await theCase.patient(), accounts[1], "Incorrect patient");
            let t = await caseFactory.cases(accounts[4]);
            smartLog("Invalid Case [" + t + "]", true);
            let u = await caseFactory.cases(caseAddress);
            smartLog("Valid Case [" + u + "]", true);
            smartLog("Alternative way to get case [" + await caseContract.at(u).caseFee() + "]", true);
        });
    });


    /***********************************************************/
    /*                    HELPER FUNCTIONS                     */
    /***********************************************************/

    async function fastForwardBlocks(_numBlocks) {
        smartLog("Fast forwarding " + _numBlocks + " blocks...");
        for (let i = 0; i < _numBlocks; i++) {
            web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", id: Date.now()});
            smartLog("Block number - " + web3.eth.blockNumber);
        }
    }

    function smartLog(message, override) {
        let verbose = false;
        if (verbose || override)
            console.log(message);
    }
});
