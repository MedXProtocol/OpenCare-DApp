pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";

contract BetaFaucet is Ownable, Initializable {
  mapping (address => bool) public sentAddresses;

  event EtherSent(address indexed recipient);

  // Constructor which allows us to fund contract on creation
  function BetaFaucet() public payable {
  }

  // `fallback` function called when eth is sent to this contract
  function () payable {
  }

  function initialize() public notInitialized {
    setInitialized();
    owner = msg.sender;
  }

  function sendEther(address _recipient) public onlyOwner {
    require(_recipient != address(0), "recipient address is empty");
    require(!sentAddresses[_recipient], "recipient has already received ether");
    require(address(this).balance >= 1, "contract is out of ether!");

    sentAddresses[_recipient] = true;
    emit EtherSent(_recipient);

    // 0.1 ether in wei
    _recipient.transfer(100000000000000000);
  }
}
