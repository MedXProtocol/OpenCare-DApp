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
  constructor() public payable {
  }

  // `fallback` function called when eth is sent to this contract
  function () payable {
  }

  /**
   * @dev - Creates a new BetaFaucet contract with the given parameters
   */
  function initialize() external notInitialized {
    setInitialized();
    owner = msg.sender;
  }

  /**
   * @dev - Updates the MedXToken contract address once
   * @param _medXToken - the MedX token contract
   */
  function updateMedXTokenAddress(MedXToken _medXToken) external {
    if (medXToken == address(0)) {
      medXToken = _medXToken;
    }
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
    require(_recipient != address(0), "recipient address is empty");
    require(!sentMedXAddresses[_recipient], "recipient has already received MedX");

    sentMedXAddresses[_recipient] = true;
    emit MedXSent(_recipient, 15000000000);

    medXToken.transfer(_recipient, 15000000000);
  }
}
