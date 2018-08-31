pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";

contract FromBlockNumber is Ownable, Initializable {
  uint256 public blockNumber;

  function initialize () public notInitialized {
    setInitialized();
    blockNumber = block.number;
    owner = msg.sender;
  }

  function setBlockNumber (uint _blockNumber) public onlyOwner {
    blockNumber = _blockNumber;
  }
}
