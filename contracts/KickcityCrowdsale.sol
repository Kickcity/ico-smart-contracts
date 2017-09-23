pragma solidity ^0.4.4;

import './KickcityAbstractCrowdsale.sol';

contract KickcityCrowdsale is KickcityAbstractCrowdsale {
    function KickcityCrowdsale(uint256 start, uint256 end, KickcityToken _token, address beneficiary) KickcityAbstractCrowdsale(start, end, _token, beneficiary) { }

    function calcKicks(uint256 etherVal) constant public returns (uint256 kicksVal) {
        assert(etherVal >= minEtherContrib);
        uint256 value = safeMul(etherVal, oneEtherInKicks);
        if (now <= saleStartTime + 1 days) {
            kicksVal = safeAdd(value, safeMul(value / 10, 4)); 
        } else {
            kicksVal = value;
        }
      }
}
