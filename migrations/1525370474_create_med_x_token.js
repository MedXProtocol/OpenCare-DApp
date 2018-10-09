const MedXToken = artifacts.require("./MedXToken.sol");
const tdr = require('truffle-deploy-registry')

module.exports = function(deployer, networkName) {
  deployer.deploy(MedXToken).then(instance => {
    if (!tdr.isDryRunNetworkName(networkName)) {
      return tdr.appendInstance(instance)
    }
  })
};
