const Migrations = artifacts.require("./Migrations.sol");
const tdr = require('truffle-deploy-registry')

module.exports = function(deployer, networkName) {
  deployer.deploy(Migrations).then((instance) => {
    if (!tdr.isDryRunNetworkName(networkName)) {
      return tdr.appendInstance(instance)
    }
  })
};
