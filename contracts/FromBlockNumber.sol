pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";
import './DelegateTarget.sol';

contract FromBlockNumber is Ownable, Initializable, DelegateTarget {
  uint256 public blockNumber;

  function initializeTarget (address _registry, bytes32 _key) public notInitialized {
    setInitialized();
    blockNumber = block.number;
    owner = msg.sender;
  }

  function setBlockNumber (uint _blockNumber) public onlyOwner {
    blockNumber = _blockNumber;
  }
}
