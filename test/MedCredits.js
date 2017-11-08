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

contract('MedCredits', function (accounts) {

    describe('Initial Setup:', function() {
        this.slow(1000);

        before(async () => {
            medXToken = await medXTokenContract.new();
            doctorManager = await doctorManagerContract.new();
            caseFactory = await caseFactoryContract.new(100, medXToken.address, doctorManager.address);
        });

        it("Configuration test...", async () => {
            smartLog("MedXToken Address [" + medXToken.address + "]");
            smartLog("DrManager Address [" + doctorManager.address + "]");
            smartLog("CaseFactory Address [" + caseFactory.address + "]");
            await medXToken.mint(accounts[1], 1000);
            smartLog("Token total supply [" + await medXToken.totalSupply() + "]");
            smartLog("Token balance for [" + accounts[1] + "] is [" + await medXToken.balanceOf(accounts[1]) + "]");
            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[1] });
            let caseAddress = await caseFactory.caseList(0);
            smartLog("Case list length [" + await caseFactory.getCaseListLength() + "]");
            smartLog("Case address [" + caseAddress + "]");
            smartLog("Case token balance [" + await medXToken.balanceOf(caseAddress) + "]");
            theCase = caseContract.at(caseAddress);
            smartLog("Case status [" + await theCase.status() + "]");
            smartLog("Case patient [" + await theCase.patient() + "], should be [" + accounts[1] + "]");
            assert.equal(await theCase.patient(), accounts[1], "Incorrect patient");
            let t = await caseFactory.cases(accounts[4]);
            smartLog("Invalid Case [" + t + "]");
            let u = await caseFactory.cases(caseAddress);
            smartLog("Valid Case [" + u + "]");
            smartLog("Alternative way to get case [" + await caseContract.at(u).caseFee() + "]");
        });
    });

    describe('Patient/Doctor flow:', function() {
        this.slow(1000);

        before(async () => {
            medXToken = await medXTokenContract.new();
            doctorManager = await doctorManagerContract.new();
            caseFactory = await caseFactoryContract.new(100, medXToken.address, doctorManager.address);
            await medXToken.mint(accounts[1], 1000);
            await medXToken.mint(accounts[2], 1000);
            await medXToken.mint(accounts[3], 1000);
            await medXToken.mint(accounts[4], 1000);
        });

        it("should add doctor", async () => {
            /* Try add doctor from non-owner account */
            await expectThrow(doctorManager.addDoctor(accounts[1], { from: accounts[1] }));
            await doctorManager.addDoctor(accounts[1], { from: accounts[0] });
            assert.equal(await doctorManager.isDoctor(accounts[1]), true);
            assert.equal(await doctorManager.isDoctor(accounts[2]), false);
        });

        it("should cancel case", async () => {
            smartLog("Token balance [" + await medXToken.balanceOf(accounts[1]) + "]");
            assert.equal(await medXToken.balanceOf(accounts[1]), 1000);
            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[1] });
            assert.equal(await caseFactory.getCaseListLength(), 1);
            assert.equal(await medXToken.balanceOf(accounts[1]), 850);
            let caseAddress = await caseFactory.caseList(0);
            smartLog("Case address [" + caseAddress + "]");
            let createdCase = caseContract.at(caseAddress);
            assert.equal(await createdCase.status(), CaseStatus.Created);
            assert.equal(await medXToken.balanceOf(createdCase.address), 150);
            /* Try to cancel case with account who isn't the patient for that case */
            await expectThrow(createdCase.cancelCase({ from: accounts[3] }));
            await createdCase.cancelCase({ from: accounts[1] });
            assert.equal(await createdCase.status(), CaseStatus.Canceled);
            assert.equal(await medXToken.balanceOf(accounts[1]), 1000);
            assert.equal(await medXToken.balanceOf(createdCase.address), 0);
        });

        it("should submit case", async () => {
            let accountTokenBalance = await medXToken.balanceOf(accounts[1]);
            assert.equal(accountTokenBalance, 1000);
            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[1] });
            assert.equal(await caseFactory.getCaseListLength(), 2);
            assert.equal(accountTokenBalance - 150, 850);
            let createdCase = caseContract.at(await caseFactory.caseList(1));
            assert.equal(await createdCase.status(), CaseStatus.Created);
            await expectThrow(createdCase.submitCase("locationHash", "encryptionKey", { from: accounts[3] }));
            await createdCase.submitCase("locationHash", "encryptionKey", { from: accounts[1] });
            assert.equal(await createdCase.status(), CaseStatus.Open);
            await expectThrow(createdCase.cancelCase({ from: accounts[1] }));
        });

        it("should diagnose and accept case", async () => {

        });

        it("should diagnose, challenge and confirm case", async () => {

        });

        it("should diagnose, challenge and reject case", async () => {

        });
    });

    describe('Doctor Authorization Request:', function() {
        this.slow(1000);

        before(async () => {
            medXToken = await medXTokenContract.deployed();
            doctorManager = await doctorManagerContract.deployed();
            caseFactory = await caseFactoryContract.deployed();
        });

        it("doctor should request authorization", async () => {
        });

        it("patient should authorize doctor", async () => {

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
