pragma solidity ^0.4.23;

import "./ITokenRecipient.sol";
import "zeppelin-solidity/contracts/token/MintableToken.sol";

contract MedXToken is MintableToken {
  string public constant name = "MedX Token";
  string public constant symbol = "MEDX";
  uint8 public constant decimals = 18;
}
