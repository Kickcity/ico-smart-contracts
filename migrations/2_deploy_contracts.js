var KickToken = artifacts.require("./KickcityToken.sol");
var KickController = artifacts.require("./KickcityCrowdsale.sol");

module.exports = function(deployer) {
  deployer.deploy(KickToken).then(function() {
    // deployer.deploy(KickController, 0, 0, KickToken.address, 0x0);  
  });
};
