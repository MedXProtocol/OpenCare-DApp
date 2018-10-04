const Registry = artifacts.require("./Registry.sol");
const tdr = require('truffle-deploy-registry')

module.exports = function(deployer, networkName) {
  deployer.deploy(Registry).then((instance) => {
    if (!tdr.isDryRunNetworkName(networkName)) {
      return tdr.appendInstance(instance)
    })
  })
}
