pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Registry is Ownable {
  mapping(bytes32 => address) registry;

  function register(bytes32 _key, address _targetContract) external onlyOwner {
    require(_targetContract != address(0));
    require(_key != bytes32(0));
    registry[_key] = _targetContract;
  }

  function lookup(bytes32 _key) external view returns (address) {
    return registry[_key];
  }
}
