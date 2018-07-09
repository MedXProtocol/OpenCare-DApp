pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";
import "./MedXToken.sol";

contract BetaFaucet is Ownable, Initializable {
  mapping (address => bool) public sentAddresses;
  mapping (address => bool) public sentMedXAddresses;

  event EtherSent(address indexed recipient);
  event MedXSent(address indexed recipient, uint256 value);

  MedXToken public medXToken;

  // Constructor which allows us to fund contract on creation
  function BetaFaucet() public payable {
  }

  // `fallback` function called when eth is sent to this contract
  function () payable {
  }

  /**
   * @dev - Creates a new BetaFaucet contract with the given parameters
   * @param _medXToken - the MedX token contract
   */
  function initialize (MedXToken _medXToken) external notInitialized {
    setInitialized();
    owner = msg.sender;

    medXToken = _medXToken;
  }

  function sendEther(address _recipient) public onlyOwner {
    require(_recipient != address(0), "recipient address is empty");
    require(!sentAddresses[_recipient], "recipient has already received ether");
    require(address(this).balance >= 100000000000000000, "contract is out of ether!");

    sentAddresses[_recipient] = true;
    emit EtherSent(_recipient);

    // 0.1 ether in wei
    _recipient.transfer(100000000000000000);
  }

  function sendMedX(address _recipient) public onlyOwner {
    // require(_recipient != address(0), "recipient address is empty");
    // require(!sentMedXAddresses[_recipient], "recipient has already received MedX");

    // sentMedXAddresses[_recipient] = true;
    // emit MedXSent(_recipient, 15000000000);

    medXToken.mint(_recipient, 15000000000); // 15 MedX

    // medXToken.transfer(_recipient, 15000000000);
    // MedXToken.transferFrom(betaFaucetContractAddress, _recipient, 15000000000); // 15 MedX
  }
}
