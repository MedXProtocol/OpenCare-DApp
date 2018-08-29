pragma solidity ^0.4.23;

import './Registry.sol';
import './RegistryLookup.sol';

contract AccountManager {

  using RegistryLookup for Registry;

  /*
    MEMORY START
    _do not_ remove any of these once they are deployed to a network (Ropsten,
    Mainnet, etc.) and only append to the bottom (before the END comment)
  */
  mapping(address => bytes) public publicKeys;

  Registry public registry;
  address owner;
  /*
    MEMORY END
    It is safe to add new data definitions here
  */

  event PublicKeySet(address indexed user, bytes publicKey);

  function setRegistry(Registry _registry) external {
    require(registry == address(0), 'a registry address needs to be provided');
    owner = msg.sender;
    registry = _registry;
  }

  function setPublicKey(address _address, bytes _publicKey) external {
    bool isSender = (msg.sender == _address);
    bool isCaseManager = (msg.sender == address(registry.caseManager()));
    bool isOwner = msg.sender == owner;
    require(isSender || isCaseManager || isOwner, 'must be a sender, owner or case manager');
    publicKeys[_address] = _publicKey;
    emit PublicKeySet(_address, _publicKey);
  }

}
