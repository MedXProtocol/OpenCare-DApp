pragma solidity ^0.4.23;

import "./Registry.sol";

contract Delegate {
  bytes32 private constant delegateRegistryPosition = keccak256("org.medcredits.delegate.registry");
  bytes32 private constant delegateKeyPosition = keccak256("org.medcredits.delegate.key");

  constructor (address _registry, bytes32 _key) public {
    require(_registry != address(0), "registry address cannot be blank");
    require(_key != bytes32(0), "_key cannot be blank");
    _setDelegateRegistry(_registry);
    _setDelegateKey(_key);
    address _impl = implementation();
    require(_impl != address(0), "_impl must be defined");
    require( /* solium-disable-next-line security/no-low-level-calls */
      _impl.delegatecall(bytes4(keccak256("initializeTarget(address,bytes32)")), _registry, _key),
      "constructor failed"
    );
  }

  function getDelegateRegistry() public view returns (address impl) {
    bytes32 position = delegateRegistryPosition;
    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      impl := sload(position)
    }
  }

  function getDelegateKey() public view returns (bytes32 key) {
    bytes32 position = delegateKeyPosition;
    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      key := sload(position)
    }
  }

  function _setDelegateRegistry(address registry) internal {
    bytes32 position = delegateRegistryPosition;
    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      sstore(position, registry)
    }
  }

  function _setDelegateKey(bytes32 key) internal {
    bytes32 position = delegateKeyPosition;
    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      sstore(position, key)
    }
  }

  /**
  * @dev Tells the address of the implementation where every call will be delegated.
  * @return address of the implementation to which it will be delegated
  */
  function implementation() public view returns (address) {
    Registry registry = Registry(getDelegateRegistry());
    return registry.lookup(getDelegateKey());
  }

  /**
  * @dev Fallback function allowing to perform a delegatecall to the given implementation.
  * This function will return whatever the implementation call returns
  */
  function () public payable {
    address _impl = implementation();
    require(_impl != address(0), "_impl cannot be blank");
    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize)
      let result := delegatecall(gas, _impl, ptr, calldatasize, 0, 0)
      let size := returndatasize
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }
}
