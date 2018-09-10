pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract Dai is MintableToken {
  string public constant name = "Dai Stable Token";
  string public constant symbol = "DAI";
  uint8 public constant decimals = 18;
}
