var KickToken = artifacts.require("./KickcityToken.sol");
var KickcityCrowdsale = artifacts.require("./KickcityCrowdsale");

// debug dates
const startDayTest = 1522189800; // Tuesday, 27 March 2018 22:30:00
const endDayTest = 1522540799; // Saturday, 31 March 2018 23:59:59 GMT

// presale dates
const startDayReal = 1519912800; // Thursday, 1 March 2018 14:00:00 GMT
const endDayReal = 1522540799; // Saturday, 31 March 2018 23:59:59 GMT

module.exports = function (deployer, network) {
  let walletAddr;
  let startTime;
  let endTime;
  if (network == "development") {
    walletAddr = "0x5750253e90be3b41f14c8aaaff9982d2fd5c0ad8";
    startTime = startDayTest;
    endTime = endDayTest;
  } else if (network == "staging") {
    walletAddr = "0x326386d6d39b651D7b74fa6E9434BA3d53952549"
    startTime = startDayTest;
    endTime = endDayTest;
  } else if (network == "live") {
    startTime = startDayReal;
    endTime = endDayReal;
    walletAddr = "0x5cfa12bc9Db011C0d0b181511a82eACFf27e94C5"
  } else {
    throw new Error("Undefined network " + network)
  }

  deployer.deploy(KickcityCrowdsale, startTime, endTime, KickToken.address, walletAddr)
    .then(function () {
      return KickToken.deployed();
    }).then(function (token) {
      token.transferOwnership(KickcityCrowdsale.address);
      return KickcityCrowdsale.deployed()
    }).then(function (controller) {
      controller.acceptTokenOwnership();
    });
};
