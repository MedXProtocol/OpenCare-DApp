pragma solidity ^0.4.23;

contract AccountManager {
  mapping(address => bytes) public publicKeys;

  function setPublicKey(bytes _publicKey) external {
    publicKeys[msg.sender] = _publicKey;
  }
}
