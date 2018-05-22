pragma solidity ^0.4.23;

import '../LinkedList.sol';

contract TestLinkedList {
  using LinkedList for LinkedList.UInt256;

  LinkedList.UInt256 public list;

  function enqueue(uint256 _value) external returns (uint256) {
    return list.enqueue(_value);
  }

  function dequeue() external returns (uint256) {
    return list.dequeue();
  }

  function remove(uint256 _node) external returns (uint256) {
    return list.remove(_node);
  }

  function prevId(uint256 _node) external view returns (uint256) {
    return list.prevId(_node);
  }

  function nextId(uint256 _node) external view returns (uint256) {
    return list.nextId(_node);
  }

  function value(uint256 _node) external view returns (uint256) {
    return list.value(_node);
  }

  function peek() external view returns (uint256) {
    return list.peek();
  }

  function peekId() external view returns (uint256) {
    return list.peekId();
  }

  function length() external view returns (uint256) {
    return list.length();
  }
}
