const AccountManager = artifacts.require("AccountManager.sol");
const deploy = require('./support/deploy')

module.exports = function(deployer) {
  deploy(artifacts, deployer, AccountManager).then(async (accountManager) => {
    let key = await accountManager.publicKeys(web3.eth.accounts[0])
  })
};
