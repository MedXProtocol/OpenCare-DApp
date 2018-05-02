import expectThrow from './helpers/expectThrow';

let medXTokenContract = artifacts.require("./MedXToken.sol");
let caseFactoryContract = artifacts.require("./CaseFactory.sol");
let doctorManagerContract = artifacts.require("./DoctorManager.sol");
let caseContract = artifacts.require("./Case.sol");
let medXToken;
let caseFactory;
let doctorManager;
let theCase;

let CaseStatus = { None:0, Open:1, Evaluated:2, Closed:3, Challenged:4, Canceled:5, ClosedRejected:6, ClosedConfirmed:7};
let AuthStatus = { None:0, Requested:1, Approved:2 };

let baseFee = 150;
let halfBaseFee = baseFee * 50 / 100;
let initialPatientTokenBalance = 1000;

contract('MedCredits', function (accounts) {
    describe.skip('Initial Setup:', function() {
        this.slow(1500);

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
            await medXToken.mint(accounts[2], 1000);
            await medXToken.mint(accounts[3], 1000);
            smartLog("Token total supply [" + await medXToken.totalSupply() + "]");
            smartLog("Token balance for [" + accounts[1] + "] is [" + await medXToken.balanceOf(accounts[1]) + "]");

            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[1] });
            let caseAddress = await caseFactory.caseList(0);
            smartLog("Case list length [" + await caseFactory.getAllCaseListCount() + "]");
            smartLog("Case address [" + caseAddress + "]");
            smartLog("Case token balance [" + await medXToken.balanceOf(caseAddress) + "]");

            theCase = caseContract.at(caseAddress);
            smartLog("Case status [" + await theCase.status() + "]");
            smartLog("Case patient [" + await theCase.patient() + "], should be [" + accounts[1] + "]");
            assert.equal(await theCase.patient(), accounts[1], "Incorrect patient");

            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[1] });
            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[1] });
            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[2] });
            await medXToken.approveAndCall(caseFactory.address, 150, "", { from: accounts[3] });

            smartLog("Patient 1 case count [" + await caseFactory.getPatientCaseListCount({ from: accounts[1] }) + "]");
            smartLog("Patient 2 case count [" + await caseFactory.getPatientCaseListCount({ from: accounts[2] }) + "]");
            smartLog("Patient 3 case count [" + await caseFactory.getPatientCaseListCount({ from: accounts[3] }) + "]");
            smartLog("All case count [" + await caseFactory.getAllCaseListCount() + "]");

            assert.equal(await caseFactory.getPatientCaseListCount({ from: accounts[1] }), 3);
            assert.equal(await caseFactory.getPatientCaseListCount({ from: accounts[2] }), 1);
            assert.equal(await caseFactory.getPatientCaseListCount({ from: accounts[3] }), 1);
            assert.equal(await caseFactory.getAllCaseListCount(), 5);

            let mostRecentCaseIndex = await caseFactory.getPatientCaseListCount({ from: accounts[1] }) - 1;
            smartLog("Patient 1 case 1 [" + await caseFactory.patientCases(accounts[1], 0) + "]");
            smartLog("Patient 1 case 2 [" + await caseFactory.patientCases(accounts[1], 1) + "]");
            smartLog("Patient 1 case 3 [" + await caseFactory.patientCases(accounts[1], 2) + "]");
            smartLog("Patient 1 most recent case [" + await caseFactory.patientCases(accounts[1], mostRecentCaseIndex) + "]");
        });
    });

    describe('Patient/Doctor flow:', function() {
        this.slow(2000);

        beforeEach(async () => {
            medXToken = await medXTokenContract.new();
            doctorManager = await doctorManagerContract.new();
            caseFactory = await caseFactoryContract.new(baseFee, medXToken.address, doctorManager.address);

            /* Pre-fund with tokens */
            await medXToken.mint(accounts[1], initialPatientTokenBalance);
            await medXToken.mint(accounts[2], initialPatientTokenBalance);
            await medXToken.mint(accounts[3], initialPatientTokenBalance);
            await medXToken.mint(accounts[4], initialPatientTokenBalance);
            /* Add Dr accounts */
            await doctorManager.addDoctor(accounts[8], { from: accounts[0] });
            await doctorManager.addDoctor(accounts[9], { from: accounts[0] });
        });

        it("should add doctor", async () => {
            /* Try add doctor from non-owner account */
            await expectThrow(doctorManager.addDoctor(accounts[1], { from: accounts[1] }));

            await doctorManager.addDoctor(accounts[1], { from: accounts[0] });
            assert.equal(await doctorManager.isDoctor(accounts[1]), true);
            assert.equal(await doctorManager.isDoctor(accounts[2]), false);
            assert.equal(await doctorManager.isDoctor(accounts[8]), true);
            assert.equal(await doctorManager.isDoctor(accounts[9]), true);
        });

        it("patient should submit case", async () => {
            let testPatientAccount = accounts[2];
            let swarmHash = "19be0ca2d257a9de8bfdaf406460309e1610d624bc15a91103f7a138a91d8fe2";
            let accountTokenBalance = await medXToken.balanceOf(testPatientAccount);
            assert.equal(accountTokenBalance, initialPatientTokenBalance);

            await medXToken.approveAndCall(caseFactory.address, (baseFee + halfBaseFee), swarmHash, { from: testPatientAccount });
            assert.equal(await caseFactory.getAllCaseListCount(), 1);
            assert.equal(await caseFactory.getPatientCaseListCount(testPatientAccount), 1);
            assert.equal(accountTokenBalance - 150, 850);

            let latestPatientCaseIndex = (await caseFactory.getPatientCaseListCount(testPatientAccount)) - 1;
            let patientCase = caseContract.at(await caseFactory.patientCases(testPatientAccount, latestPatientCaseIndex));
            assert.equal(await patientCase.status(), CaseStatus.Open);
            assert.equal(web3.toAscii(await patientCase.caseDetailLocationHash()), swarmHash);
        });

        it("should cancel latest case", async () => {
            let testPatientAccount = accounts[1];
            let swarmHash = "19be0ca2d257a9de8bfdaf406460309e1610d624bc15a91103f7a138a91d8fe2";
            let swarmHash2 = "834e0ca2d257a9de8bfdaf406460309e1610d624bc15a91103f7a138a91d8lvc";
            smartLog("Patient token balance [" + await medXToken.balanceOf(testPatientAccount) + "]");
            assert.equal(await medXToken.balanceOf(testPatientAccount), initialPatientTokenBalance);

            await medXToken.approveAndCall(caseFactory.address, (baseFee + halfBaseFee), swarmHash, { from: testPatientAccount });
            assert.equal(await caseFactory.getAllCaseListCount(), 1);
            assert.equal(await caseFactory.getPatientCaseListCount(testPatientAccount), 1);
            assert.equal(await medXToken.balanceOf(testPatientAccount), (initialPatientTokenBalance - (baseFee + halfBaseFee)));

            await medXToken.approveAndCall(caseFactory.address, (baseFee + halfBaseFee), swarmHash2, { from: testPatientAccount });
            assert.equal(await caseFactory.getAllCaseListCount(), 2);
            assert.equal(await caseFactory.getPatientCaseListCount(testPatientAccount), 2);
            assert.equal(await medXToken.balanceOf(testPatientAccount), (initialPatientTokenBalance - (2 * (baseFee + halfBaseFee))));

            let latestPatientCaseIndex = (await caseFactory.getPatientCaseListCount(testPatientAccount)) - 1;
            let latestPatientCaseAddress = await caseFactory.patientCases(testPatientAccount, latestPatientCaseIndex);
            smartLog("Latest patient case address [" + latestPatientCaseAddress + "]");

            let latestCase = caseContract.at(latestPatientCaseAddress);
            assert.equal(await latestCase.status(), CaseStatus.Open);
            assert.equal(web3.toAscii(await latestCase.caseDetailLocationHash()), swarmHash2);
            assert.equal(await medXToken.balanceOf(latestCase.address), (baseFee + halfBaseFee));

            /* Try to cancel case with account who isn't the patient for that case */
            await expectThrow(latestCase.cancelCase({ from: accounts[3] }));

            await latestCase.cancelCase({ from: testPatientAccount });
            assert.equal(await latestCase.status(), CaseStatus.Canceled);
            assert.equal(await medXToken.balanceOf(testPatientAccount), (initialPatientTokenBalance - (baseFee + halfBaseFee)));
            assert.equal(await medXToken.balanceOf(latestCase.address), 0);
        });

        it("should diagnose and accept case", async () => {
            let testPatientAccount = accounts[1];
            let swarmHash = "19be0ca2d257a9de8bfdaf406460309e1610d624bc15a91103f7a138a91d8fe2";
            let drAccountA = accounts[9];

            /* Open a new case */
            await medXToken.approveAndCall(caseFactory.address, (baseFee + halfBaseFee), swarmHash, { from: testPatientAccount });
            let latestPatientCaseIndex = (await caseFactory.getPatientCaseListCount(testPatientAccount)) - 1;
            let patientCase = caseContract.at(await caseFactory.patientCases(testPatientAccount, latestPatientCaseIndex));
            smartLog("Patient case address [" + patientCase.address + "]");
            assert.equal(await patientCase.status(), CaseStatus.Open);

            /* Authorize doctor A to view case details */
            await patientCase.requestAuthorization({ from: drAccountA });
            await patientCase.authorizeDoctor(drAccountA, "encryptionKey", { from: testPatientAccount });
            smartLog("Doctor authorization status [" + (await patientCase.authorizations(drAccountA))[0] + "]");
            assert.equal((await patientCase.authorizations(drAccountA))[0], AuthStatus.Approved);

            /* Doctor A diagnoses case */
            await patientCase.diagnoseCase("diagnosisHash", { from: drAccountA });
            smartLog("Patient case status [" + await patientCase.status() + "]");
            smartLog("Patient case diagnosing doctor A [" + await patientCase.diagnosingDoctorA() + "]");
            assert.equal(await patientCase.status(), CaseStatus.Evaluated);
            assert.equal(await patientCase.diagnosingDoctorA(), drAccountA);

            /* Patient accepts diagnosis */
            await patientCase.acceptDiagnosis({ from: testPatientAccount });
            assert.equal(await patientCase.status(), CaseStatus.Closed);

            /* Transfer tokens as payment */
            assert.equal(await medXToken.balanceOf(drAccountA), baseFee);
            assert.equal(await medXToken.balanceOf(testPatientAccount), (initialPatientTokenBalance - baseFee));
            assert.equal(await medXToken.balanceOf(patientCase.address), 0);
        });

        it("should diagnose, challenge and confirm case", async () => {
            let testPatientAccount = accounts[1];
            let swarmHash = "19be0ca2d257a9de8bfdaf406460309e1610d624bc15a91103f7a138a91d8fe2";
            let drAccountA = accounts[9];
            let drAccountB = accounts[8];

            /* Open a new case */
            await medXToken.approveAndCall(caseFactory.address, (baseFee + halfBaseFee), swarmHash, { from: testPatientAccount });
            let latestPatientCaseIndex = (await caseFactory.getPatientCaseListCount(testPatientAccount)) - 1;
            let patientCase = caseContract.at(await caseFactory.patientCases(testPatientAccount, latestPatientCaseIndex));
            assert.equal(await patientCase.status(), CaseStatus.Open);

            /* Authorize doctor A to view case details */
            await patientCase.requestAuthorization({ from: drAccountA });
            await patientCase.authorizeDoctor(drAccountA, "encryptionKey", { from: testPatientAccount });
            smartLog("Doctor authorization status [" + (await patientCase.authorizations(drAccountA))[0] + "]");
            assert.equal((await patientCase.authorizations(drAccountA))[0], AuthStatus.Approved);

            /* Doctor A diagnoses case */
            await patientCase.diagnoseCase("diagnosisHash", { from: drAccountA });
            smartLog("Patient case status [" + await patientCase.status() + "]");
            smartLog("Patient case diagnosing doctor A [" + await patientCase.diagnosingDoctorA() + "]");
            assert.equal(await patientCase.status(), CaseStatus.Evaluated);
            assert.equal(await patientCase.diagnosingDoctorA(), drAccountA);

            /* Patient challenges case */
            await patientCase.challengeDiagnosis({ from: testPatientAccount });
            assert.equal(await patientCase.status(), CaseStatus.Challenged);

            /* Try to confirm challenge with same account as the one who submitted the original diagnosis */
            await expectThrow(patientCase.diagnoseChallengedCase("secondaryDiagnosisHash", true, { from: drAccountA }));

            /* Authorize doctor B to view case details */
            await patientCase.requestAuthorization({ from: drAccountB });
            await patientCase.authorizeDoctor(drAccountB, "encryptionKey", { from: testPatientAccount });
            smartLog("Doctor authorization status [" + (await patientCase.authorizations(drAccountB))[0] + "]");
            assert.equal((await patientCase.authorizations(drAccountB))[0], AuthStatus.Approved);

            /* Doctor B confirms original diagnosis */
            await patientCase.diagnoseChallengedCase("secondaryDiagnosisHash", true, { from: drAccountB });
            assert.equal(await patientCase.status(), CaseStatus.ClosedConfirmed);
            assert.equal(await patientCase.diagnosingDoctorB(), drAccountB);

            /* Transfer tokens as payment */
            assert.equal(await medXToken.balanceOf(drAccountA), baseFee);
            assert.equal(await medXToken.balanceOf(drAccountB), halfBaseFee);
            assert.equal(await medXToken.balanceOf(testPatientAccount), (initialPatientTokenBalance - (baseFee + halfBaseFee)));
            assert.equal(await medXToken.balanceOf(patientCase.address), 0);
        });

        it("should diagnose, challenge and reject case", async () => {
            let testPatientAccount = accounts[1];
            let swarmHash = "19be0ca2d257a9de8bfdaf406460309e1610d624bc15a91103f7a138a91d8fe2";
            let drAccountA = accounts[9];
            let drAccountB = accounts[8];

            /* Open a new case */
            await medXToken.approveAndCall(caseFactory.address, (baseFee + halfBaseFee), swarmHash, { from: testPatientAccount });
            let latestPatientCaseIndex = (await caseFactory.getPatientCaseListCount(testPatientAccount)) - 1;
            let patientCase = caseContract.at(await caseFactory.patientCases(testPatientAccount, latestPatientCaseIndex));
            assert.equal(await patientCase.status(), CaseStatus.Open);

            /* Authorize doctor A to view case details */
            await patientCase.requestAuthorization({ from: drAccountA });
            await patientCase.authorizeDoctor(drAccountA, "encryptionKey", { from: testPatientAccount });
            assert.equal((await patientCase.authorizations(drAccountA))[0], AuthStatus.Approved);

            /* Doctor diagnoses case */
            await patientCase.diagnoseCase("diagnosisHash", { from: drAccountA });
            assert.equal(await patientCase.status(), CaseStatus.Evaluated);
            assert.equal(await patientCase.diagnosingDoctorA(), drAccountA);

            /* Patient challenges case */
            await patientCase.challengeDiagnosis({ from: testPatientAccount });
            assert.equal(await patientCase.status(), CaseStatus.Challenged);

            /* Try to reject diagnosis without being authorized to access the case files */
            //await expectThrow(patientCase.diagnoseChallengedCase("secondaryDiagnosisHash", false, { from: drAccountB }));

            /* Authorize doctor B to view case details */
            await patientCase.requestAuthorization({ from: drAccountB });
            await patientCase.authorizeDoctor(drAccountB, "encryptionKey", { from: testPatientAccount });
            smartLog("Doctor authorization status [" + (await patientCase.authorizations(drAccountB))[0] + "]");
            assert.equal((await patientCase.authorizations(drAccountB))[0], AuthStatus.Approved);

            /* Doctor B rejects original diagnosis by doctor A */
            await patientCase.diagnoseChallengedCase("secondaryDiagnosisHash", false, { from: drAccountB });
            assert.equal(await patientCase.status(), CaseStatus.ClosedRejected);
            assert.equal(await patientCase.diagnosingDoctorB(), drAccountB);

            /* Transfer tokens as payment */
            assert.equal(await medXToken.balanceOf(drAccountA), 0);
            assert.equal(await medXToken.balanceOf(drAccountB), halfBaseFee);
            assert.equal(await medXToken.balanceOf(testPatientAccount), (initialPatientTokenBalance - halfBaseFee));
            assert.equal(await medXToken.balanceOf(patientCase.address), 0);

        });
    });

    describe.skip('Doctor Authorization Request:', function() {
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
