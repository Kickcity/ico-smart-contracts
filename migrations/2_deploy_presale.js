var KickToken = artifacts.require("./KickcityToken.sol");
var KickcityPresale = artifacts.require("./KickcityPresale");

const sep24 = 1506263538; //Sunday, 24 September 2017 14:32:18
const oct24 = 1508855538; //Tuesday, 24 October 2017 14:32:18

module.exports = function (deployer, network) {
  let walletAddr;
  let startTime;
  let endTime;
  if (network == "development") {
    walletAddr = 0x0;
    startTime = sep24;
    endTime = oct24;
  } else if (network == "staging") {
    walletAddr = "0x6db8ed129ddb46c1eb019fb06b1c16c88ec814f3";
    startTime = sep24;
    endTime = oct24;
  } else {
    throw new Error("Configuration is not defined for network " + network)
  }
  deployer.deploy(KickToken)
    .then(function () {
      return deployer.deploy(KickcityPresale, startTime, endTime, KickToken.address, walletAddr)
    })
};
