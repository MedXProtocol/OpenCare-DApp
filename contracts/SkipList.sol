pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './LinkedList.sol';

/**
A LinkedList with the additional property that whoever enqueues an item is not
the one to remove it.

All functions are O(1).
*/
library SkipList {
  using SafeMath for uint256;
  using LinkedList for LinkedList.UInt256;

  struct UInt256 {
    LinkedList.UInt256 list;

    uint256 lastSegmentId;
    mapping(uint256 => uint256) segmentToLastBadNode;
    mapping(address => mapping(uint256 => uint256)) nodeToSegment;
  }

  function enqueue(UInt256 storage self, address _address, uint256 _value) external returns (uint256) {
    /*
      If a skip segment exists for the current node, then update it to point to this node
      Else start a new skip segment for this node
    */
    uint256 tailId = self.list.tailId();
    uint256 newId = self.list.enqueue(_value);
    uint256 segmentId = self.nodeToSegment[_address][tailId];
    if (segmentId == 0) {
      // start a new segment
      self.lastSegmentId = self.lastSegmentId.add(1);
      segmentId = self.lastSegmentId;
      self.segmentToLastBadNode[segmentId] = newId;
    } else {
      // update the last segment's last bad node
      self.segmentToLastBadNode[segmentId] = newId;
    }
    // set this node's segment
    self.nodeToSegment[_address][newId] = segmentId;
    return newId;
  }

  function dequeue(UInt256 storage self, address _address) external returns (uint256) {
    /*
      If a skip segment exists for the current node, then remove the node's previous
      element
      else just return the head element
    */

    uint256 nodeId = self.list.peekId();
    uint256 targetValue = 0;
    uint256 segmentId = self.nodeToSegment[_address][nodeId];
    if (segmentId != 0) {
      uint256 targetNodeId = self.list.prevId(self.segmentToLastBadNode[segmentId]);
      if (targetNodeId != 0) {
        targetValue = self.list.remove(targetNodeId);
      }
    } else {
      targetValue = self.list.dequeue();
    }
    return targetValue;
  }

  function peek(UInt256 storage self, address _address) external view returns (uint256) {
    uint256 nodeId = peekId(self, _address);
    return self.list.value(nodeId);
  }

  function peekId(UInt256 storage self, address _address) public view returns (uint256) {
    uint256 nodeId = self.list.peekId();
    uint256 targetNodeId;
    uint256 segmentId = self.nodeToSegment[_address][nodeId];
    if (segmentId != 0) {
      targetNodeId = self.list.prevId(self.segmentToLastBadNode[segmentId]);
    } else {
      targetNodeId = nodeId;
    }
    return targetNodeId;
  }

  function length(UInt256 storage self) external view returns (uint256) {
    return self.list.length();
  }
}
