const Registry = artifacts.require("./Registry.sol");
const appendInstance = require('truffle-deploy-registry').appendInstance

module.exports = function(deployer) {
  deployer.deploy(Registry).then(appendInstance)
}
