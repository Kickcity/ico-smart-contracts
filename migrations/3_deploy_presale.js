var KickToken = artifacts.require("./KickcityToken.sol");
var KickcityPresale = artifacts.require("./KickcityPresale");

// debug dates
const sep24 = 1506263538; // Sunday, 24 September 2017 14:32:18
const oct24 = 1508855538; // Tuesday, 24 October 2017 14:32:18

// presale dates
const oct4  = 1507122000; // Wednesday, 4 October 2017 13:00:00
const oct18 = 1508371199; // Wednesday, 18 October 2017 23:59:59

module.exports = function (deployer, network) {
  let walletAddr;
  let startTime;
  let endTime;
  if (network == "development") {
    walletAddr = "0x5750253e90be3b41f14c8aaaff9982d2fd5c0ad8";
    startTime = sep24;
    endTime = oct24;
  } else if (network == "staging") {
    walletAddr = "0x326386d6d39b651D7b74fa6E9434BA3d53952549"
    startTime = sep24;
    endTime = oct24;
  } else if (network == "live") {
    startTime = oct4;
    endTime = oct18;
    throw new Error("Configuration is not defined for network " + network)
  } else {
    throw new Error("Undefined network " + network)
  }

  deployer.deploy(KickcityPresale, startTime, endTime, KickToken.address, walletAddr)
};
