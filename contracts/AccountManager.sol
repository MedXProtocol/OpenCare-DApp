pragma solidity ^0.4.23;

import './Registry.sol';
import './RegistryLookup.sol';

contract AccountManager {

  using RegistryLookup for Registry;

  mapping(address => bytes) public publicKeys;

  Registry public registry;
  address owner;

  function setRegistry(Registry _registry) external {
    require(registry == address(0), 'a registry address needs to be provided');
    owner = msg.sender;
    registry = _registry;
  }

  function setPublicKey(address _address, bytes _publicKey) external {
    bool isSender = (msg.sender == _address);
    bool isCaseManager = (msg.sender == address(registry.caseManager()));
    require(isSender || isCaseManager, 'must be a sender or case manager');
    publicKeys[_address] = _publicKey;
  }

}
