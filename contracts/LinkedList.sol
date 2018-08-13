pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';

library LinkedList {
  using SafeMath for uint256;

  struct UInt256 {
    uint256 idIndex;
    uint256 count;

    uint256 head;
    uint256 tail;

    mapping (uint256 => uint256) element;
    mapping (uint256 => uint256) prev;
    mapping (uint256 => uint256) next;
  }

  /**
  Inserts a node into the tail
  */
  function enqueue(UInt256 storage self, uint256 _value) internal returns (uint256) {
    self.idIndex = self.idIndex.add(1);
    self.count = self.count.add(1);
    uint256 id = self.idIndex;
    self.element[id] = _value;

    if (self.tail > 0) {
      self.next[self.tail] = id;
      self.prev[id] = self.tail;
    } else {
      self.head = id;
    }

    self.tail = id;

    return id;
  }

  function dequeue(UInt256 storage self) internal returns (uint256) {
    if (self.head == 0) { return 0; }

    uint256 head = self.head;
    if (head == self.tail) {
      self.head = 0;
      self.tail = 0;
    } else {
      uint256 next = self.next[self.head];
      self.prev[next] = 0;
      self.head = next;
    }

    self.count = self.count.sub(1);

    return self.element[head];
  }

  function remove(UInt256 storage self, uint256 _node) internal returns (uint256) {
    uint256 prev = self.prev[_node];
    uint256 next = self.next[_node];

    // attach previous
    if (self.tail == _node) {
      self.tail = prev;
      self.next[prev] = 0;
    } else {
      self.next[prev] = next;
    }

    if (self.head == _node) {
      self.head = next;
      self.prev[next] = 0;
    } else {
      self.prev[next] = prev;
    }

    self.count = self.count.sub(1);

    return self.element[_node];
  }

  function value(UInt256 storage self, uint256 _node) internal view returns (uint256) {
    return self.element[_node];
  }

  function prevId(UInt256 storage self, uint256 _node) internal view returns (uint256) {
    return self.prev[_node];
  }

  function nextId(UInt256 storage self, uint256 _node) internal view returns (uint256) {
    return self.next[_node];
  }

  function peek(UInt256 storage self) internal view returns (uint256) {
    return self.element[self.head];
  }

  function peekId(UInt256 storage self) internal view returns (uint256) {
    return self.head;
  }

  function tailId(UInt256 storage self) internal view returns (uint256) {
    return self.tail;
  }

  function length(UInt256 storage self) internal view returns (uint256) {
    return self.count;
  }
}
