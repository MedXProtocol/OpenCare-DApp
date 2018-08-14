pragma solidity ^0.4.23;

interface IRegistry {
  function register(bytes32 _key, address _targetContract) external;
  function deregister(bytes32 _key) external;
  function lookup(bytes32 _key) external view returns (address);
}
