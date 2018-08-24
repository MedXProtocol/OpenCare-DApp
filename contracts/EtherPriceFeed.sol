pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IEtherPriceFeed.sol";

contract EtherPriceFeed is Ownable, IEtherPriceFeed {
  bytes32 value;

  function set(uint256 _value) public onlyOwner {
    value = bytes32(_value);
  }

  function read() public view returns (bytes32) {
    return value;
  }
}
