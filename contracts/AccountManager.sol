pragma solidity ^0.4.23;

import './Registry.sol';
import './RegistryLookup.sol';
import "./DelegateTarget.sol";
import './Initializable.sol';

contract AccountManager is Initializable, DelegateTarget {

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

  function initializeTarget(address _registry, bytes32 _key) public notInitialized {
    require(_registry != address(0), 'a registry address needs to be provided');
    owner = msg.sender;
    registry = Registry(_registry);
  }

  function setPublicKey(address _address, bytes _publicKey) external {
    bool isSender = (msg.sender == _address);
    bool isCaseManager = (msg.sender == address(registry.caseManager()));
    bool isOwner = msg.sender == owner;
    require(isSender || isCaseManager || isOwner, 'must be a sender, owner or case manager');
    if (!isOwner) { // allow override, just in case
      require(publicKeys[_address].length == 0, 'the public key is already defined');
    }
    publicKeys[_address] = _publicKey;
    emit PublicKeySet(_address, _publicKey);
  }
}
