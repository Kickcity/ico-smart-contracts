pragma solidity ^0.4.11;

import './KickcityAbstractCrowdsale.sol';

contract KickcityPresale is KickcityAbstractCrowdsale {
    function KickcityPresale(uint256 start,uint256 end,KickcityToken _token, address beneficiary) KickcityAbstractCrowdsale(start, end, _token, beneficiary) { }

    uint256 private additionalBonusValue = 100 ether;

    function calcKicks(uint256 etherVal) constant public returns (uint256 kicksVal) {
        assert(etherVal >= minEtherContrib);
        uint256 value = safeMul(etherVal, oneEtherInKicks);
        if (etherVal < additionalBonusValue) {
            // 40% bonus for contributions less than 100ETH
            kicksVal = safeAdd(value, safeMul(value / 10, 4)); 
        } else {
            // 100% bonus for contributions more than 100ETH
            kicksVal = safeMul(value, 2);
        }
    }
}
