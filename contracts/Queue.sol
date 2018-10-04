pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/math/SafeMath.sol";

library Queue {
  using SafeMath for uint256;

  struct UInt256 {
    uint256 first;
    uint256 last;
    mapping (uint256 => uint256) queue;
  }

  function create() internal pure returns (UInt256) {
    return UInt256(1, 0);
  }

  function enqueue(UInt256 storage self, uint256 _value) internal {
    self.last = self.last.add(1);
    self.queue[self.last] = _value;
  }

  function dequeue(UInt256 storage self) internal returns (uint256) {
    require(self.last >= self.first, "the last entry must be greater than or equal to the first");
    uint256 value = self.queue[self.first];
    delete self.queue[self.first];
    self.first = self.first.add(1);
    return value;
  }

  function peek(UInt256 storage self) internal view returns (uint256) {
    require(self.last >= self.first, "the last entry must be greater than or equal to the first");
    return self.queue[self.first];
  }

  function count(UInt256 storage self) internal view returns (uint256) {
    return self.last.add(1).sub(self.first);
  }
}
