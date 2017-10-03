var KickToken = artifacts.require("./KickcityToken.sol");
var KickController = artifacts.require("./KickcityPresale");

module.exports = function (deployer) {
  deployer.then(function () {
      return KickToken.deployed();
    }).then(function (token) {
      token.transferOwnership(KickController.address);
      return KickController.deployed()
    }).then(function (controller) {
      controller.acceptTokenOwnership();
    });
};
