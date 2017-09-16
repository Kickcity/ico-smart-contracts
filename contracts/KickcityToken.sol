pragma solidity ^0.4.11;

import 'bancor-contracts/solidity/contracts/SmartToken.sol';

/**
  Kickcity token (KICK) is a regular Bancor Smart Token.
  Separate class is provided for reasons of readability and type-safety.
 */
contract KickcityToken is SmartToken {
    function KickcityToken() SmartToken("Kickcity Token", "KICK", 18) {  }
}