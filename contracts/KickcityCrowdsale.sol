pragma solidity ^0.4.4;

import './KickcityAbstractCrowdsale.sol';

contract KickcityCrowdsale is KickcityAbstractCrowdsale {
  function KickcityCrowdsale(uint256 start, uint256 end, KickcityToken _token, address beneficiary) KickcityAbstractCrowdsale(start, end, _token, beneficiary) { }

  function calcKicks(uint256 etherVal) constant public returns (uint256 kicksVal) {
    assert(etherVal >= minEtherContrib);
    uint256 value = safeMul(etherVal, oneEtherInKicks);
    if (now <= saleStartTime + 1 days) {
      // 15% bonus in first day
      kicksVal = safeAdd(value, safeMul(value / 100, 15)); 
    } else if (now <= saleStartTime + 10 days) {
      // 10% bonus in 2-10 day
      kicksVal = safeAdd(value, value / 10); 
    } else if (now <= saleStartTime + 20 days) {
      // 5% bonus in 11-20 day
      kicksVal = safeAdd(value, value / 20);
    } else {
      kicksVal = value;
    }
  }
}
