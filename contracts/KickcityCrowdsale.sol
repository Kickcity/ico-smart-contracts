pragma solidity ^0.4.11;

import 'bancor-contracts/solidity/contracts/SmartToken.sol';
import 'bancor-contracts/solidity/contracts/SmartTokenController.sol';
import 'bancor-contracts/solidity/contracts/Utils.sol';
import './KickcityToken.sol';


contract KickcityCrowdsale is Owned, SmartTokenController {
  uint256 public etherHardCap = 43100 ether;
  uint256 public etherCollected = 0;

  function setHardCap(uint256 newCap) ownerOnly {
     etherHardCap = newCap;
  }

  modifier capAvailable(uint256 contribution) {
    assert(safeAdd(etherCollected, contribution) <= etherHardCap);
    _;
  }

  uint256 private saleStartTime;
  uint256 private saleEndTime;

  modifier duringSale() {
    assert(now >= saleStartTime && now < saleEndTime);
    _;
  }

  address private kickcityWallet;

  function KickcityCrowdsale(uint256 start, uint256 end, KickcityToken _token, address beneficiary) SmartTokenController(_token) {
    saleStartTime = start;
    saleEndTime = end;
    kickcityWallet = beneficiary;
  }

  /**
  KICK token have 18 decimals, so we can calculate ether/kicks rate directly
  */
  uint256 private oneEtherInKicks = 3000;
  uint256 private minEtherContrib = 3 finney; // 0.003 ETH

  uint256 private additionalBonusValue = 100 ether;

  function calcKicks(uint256 etherVal) public returns (uint256 kicksVal) {
    assert(etherVal >= minEtherContrib);
    var value = safeMul(etherVal, oneEtherInKicks);
    if (etherVal < additionalBonusValue) {
      // 40% bonus for contributions less than 100ETH
      kicksVal = safeAdd(value, (value / 10 * 4)); 
    } else {
      // 100% bonus for contributions more than 100ETH
      kicksVal = safeMul(value, 2);
    }
  }

  // triggered on each contribution
  event Contribution(address indexed contributor, uint256 contributed, uint256 tokensReceived);

  function processContribution() private duringSale capAvailable(msg.value) {
    var contribution = msg.value;
    uint256 kicks = calcKicks(contribution);

    assert(kickcityWallet.send(contribution));
    token.issue(msg.sender, kicks);
    etherCollected += contribution;

    Contribution(msg.sender, contribution, kicks);
  }

// todo: limit gas price?
  function () payable {
    if (msg.value > 0) {
      processContribution();
    }
  }
}
