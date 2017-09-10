import expectThrow from './helpers/expectThrow';

let medCredits = artifacts.require("./MedCredits.sol");
let medCreditsContract;

contract('MedCredits', function(accounts) {
    before(async () => {
        medCreditsContract = await medCredits.deployed();
    });

    it("Template Test", async () => {

    });
});
