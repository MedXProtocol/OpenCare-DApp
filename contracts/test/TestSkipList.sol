pragma solidity ^0.4.23;

import '../SkipList.sol';
import './SkipListInstrumentation.sol';
import '../LinkedList.sol';

contract TestSkipList {
  using SkipListInstrumentation for SkipList.UInt256;
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

  function tailId() external view returns (uint256) {
    return list.tailId();
  }

  function segmentId(address _address, uint256 _nodeId) external view returns (uint256) {
    return list.segmentId(_address, _nodeId);
  }

  function peekSegmentId(address _address) external view returns (uint256) {
    return list.peekSegmentId(_address);
  }

  function segmentLastBadNodeId(uint256 _segmentId) external view returns (uint256) {
    return list.segmentLastBadNodeId(_segmentId);
  }

  function peekLastBadNodeId(address _address) external view returns (uint256) {
    return list.peekLastBadNodeId(_address);
  }

  function prevId(uint256 _nodeId) external view returns (uint256) {
    return list.prevId(_nodeId);
  }

  function nextId(uint256 _nodeId) external view returns (uint256) {
    return list.nextId(_nodeId);
  }
}
