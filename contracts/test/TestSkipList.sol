pragma solidity ^0.4.23;

import '../SkipList.sol';
import '../LinkedList.sol';

contract TestSkipList {
  using SkipList for SkipList.UInt256;

  SkipList.UInt256 list;

  function enqueue(address _address, uint256 _value) external returns (uint256) {
    return list.enqueue(_address, _value);
  }

  function dequeue(address _address) external returns (uint256) {
    return list.dequeue(_address);
  }

  function peek(address _address) external view returns (uint256) {
    return list.peek(_address);
  }

  function peekId(address _address) external view returns (uint256) {
    return list.peekId(_address);
  }

  function length() external view returns (uint256) {
    return list.length();
  }
}
