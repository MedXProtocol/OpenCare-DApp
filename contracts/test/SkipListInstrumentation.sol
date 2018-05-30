pragma solidity ^0.4.23;

import "../SkipList.sol";
import "../LinkedList.sol";

library SkipListInstrumentation {
  using LinkedList for LinkedList.UInt256;

  function tailId(SkipList.UInt256 storage self) external view returns (uint256) {
    return self.list.tailId();
  }

  function segmentId(SkipList.UInt256 storage self, address _address, uint256 _nodeId) external view returns (uint256) {
    return self.nodeToSegment[_address][_nodeId];
  }

  function peekSegmentId(SkipList.UInt256 storage self, address _address) public view returns (uint256) {
    return self.nodeToSegment[_address][self.list.peekId()];
  }

  function peekLastBadNodeId(SkipList.UInt256 storage self, address _address) external view returns (uint256) {
    return self.segmentToLastBadNode[peekSegmentId(self, _address)];
  }

  function segmentLastBadNodeId(SkipList.UInt256 storage self, uint256 _segmentId) external view returns (uint256) {
    return self.segmentToLastBadNode[_segmentId];
  }

  function prevId(SkipList.UInt256 storage self, uint256 _nodeId) external view returns (uint256) {
    return self.list.prevId(_nodeId);
  }

  function nextId(SkipList.UInt256 storage self, uint256 _nodeId) external view returns (uint256) {
    return self.list.nextId(_nodeId);
  }
}
