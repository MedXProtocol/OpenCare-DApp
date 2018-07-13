pragma solidity ^0.4.23;

import "./Registry.sol";
import "./CaseManager.sol";

contract AccountManager {
  mapping(address => bytes) public publicKeys;

  Registry public registry;
  address owner;

  function setRegistry(Registry _registry) external {
    require(registry == address(0));
    owner = msg.sender;
    registry = _registry;
  }

  function setPublicKey(address _address, bytes _publicKey) external {
    bool isSender = msg.sender == _address;
    bool isCaseManager = msg.sender == address(caseManager());
    require(isSender || isCaseManager);
    publicKeys[_address] = _publicKey;
  }

  function caseManager() returns (CaseManager) {
    return CaseManager(registry.lookup(keccak256('CaseManager')));
  }
}
