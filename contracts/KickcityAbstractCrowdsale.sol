pragma solidity ^0.4.11;

import 'bancor-contracts/solidity/contracts/SmartToken.sol';
import 'bancor-contracts/solidity/contracts/SmartTokenController.sol';
import 'bancor-contracts/solidity/contracts/Utils.sol';
import './KickcityToken.sol';


contract KickcityAbstractCrowdsale is Owned, SmartTokenController {
  uint256 public etherHardCap = 43100 ether;
  uint256 public etherCollected = 0;

  function setHardCap(uint256 newCap) ownerOnly {
     etherHardCap = newCap;
  }

  modifier capAvailable(uint256 contribution) {
    assert(safeAdd(etherCollected, contribution) <= etherHardCap);
    _;
  }

  uint256 internal saleStartTime;
  uint256 internal saleEndTime;

  modifier duringSale() {
    assert(now >= saleStartTime && now < saleEndTime);
    _;
  }

  uint256 private maxGasPrice = 0.05 szabo; // 50 Gwei

  modifier validGasPrice() {
    assert(tx.gasprice <= maxGasPrice);
    _;
  }

  address private kickcityWallet;

  function KickcityAbstractCrowdsale(uint256 start, uint256 end, KickcityToken _token, address beneficiary) SmartTokenController(_token) {
    assert(start < end);
    assert(beneficiary != 0x0);
    saleStartTime = start;
    saleEndTime = end;
    kickcityWallet = beneficiary;
  }

  /**
  KICK token have 18 decimals, so we can calculate ether/kicks rate directly
  */
  uint256 internal oneEtherInKicks = 3000;
  uint256 internal minEtherContrib = 3 finney; // 0.003 ETH

  function calcKicks(uint256 etherVal) constant public returns (uint256 kicksVal);

  // triggered on each contribution
  event Contribution(address indexed contributor, uint256 contributed, uint256 tokensReceived);

  function processContribution() private validGasPrice duringSale capAvailable(msg.value) {
    uint256 contribution = msg.value;
    uint256 kicks = calcKicks(contribution);

    assert(kickcityWallet.send(contribution));
    token.issue(msg.sender, kicks);
    etherCollected = safeAdd(etherCollected, contribution);

    Contribution(msg.sender, contribution, kicks);
  }

  function () payable {
    if (msg.value > 0) {
      processContribution();
    }
  }
}
