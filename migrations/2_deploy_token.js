var KickToken = artifacts.require("./KickcityToken.sol");

module.exports = function (deployer, network) {
  deployer.deploy(KickToken)
};