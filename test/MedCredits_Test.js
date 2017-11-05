import expectThrow from './helpers/expectThrow';

let medCredits = artifacts.require("./MedCredits.sol");
let medCreditsContract;

let PhysicianStatus = { NotApproved:0, Approved:1 };

contract('MedCredits', function(accounts) {
    before(async () => {
        medCreditsContract = await medCredits.deployed();
    });

    it("Create Case", async () => {
        let iterator;
        assert.equal(await medCreditsContract.caseCount(), 0);
        for (iterator = 0; iterator < 3; iterator++) {
            await medCreditsContract.createCase("Symptoms here " + iterator, {from: accounts[iterator]});
        }
        assert.equal(await medCreditsContract.caseCount(), iterator);
    });

    it("Add Physician ", async () => {
        await medCreditsContract.addPhysician(accounts[9], "Dr Name", {from: accounts[0]});
        let doctor = await medCreditsContract.physicians(accounts[9]);
        assert.equal(doctor[0], PhysicianStatus.NotApproved);

        await medCreditsContract.approvePhysician(accounts[9], {from: accounts[0]});

        doctor = await medCreditsContract.physicians(accounts[9]);
        assert.equal(doctor[0], PhysicianStatus.Approved);
    });

    it("List cases", async () => {
        /* check that only approved doctors can view listed cases */
        /* test will failis contract 'reverts' */
        await expectThrow(medCreditsContract.getCase(0, {from: accounts[2]}));

        let totalCases = await medCreditsContract.caseCount();
        for (let i = 0; i < totalCases; i++) {
            console.log(await medCreditsContract.getCase(i, {from: accounts[9]}))
        }
    });
});
