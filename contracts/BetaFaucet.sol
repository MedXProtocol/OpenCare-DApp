pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";
import "./MedXToken.sol";

contract BetaFaucet is Ownable, Initializable {
  mapping (address => bool) public sentAddresses;
  mapping (address => bool) public sentMedXAddresses;

  event EtherSent(address indexed recipient, uint256 value);
  event MedXSent(address indexed recipient, uint256 value);

  MedXToken public medXToken;

  using SafeMath for uint128;
  using SafeMath for uint32;

  uint128 public constant etherToTransfer = 100000000000000000;
  uint32 public constant gasAmount = 1000000;

  using SafeMath for uint256;

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
  function updateMedXTokenAddress(MedXToken _medXToken) external onlyOwner {
    if (medXToken == address(0)) {
      medXToken = _medXToken;
    }
  }

  function withdrawEther() external onlyOwner {
    owner.transfer(address(this).balance.sub(gasAmount));
  }

  function sendEther(address _recipient, uint256 _amount) public onlyOwner {
    require(_recipient != address(0), "recipient address is empty");
    require(!sentAddresses[_recipient], "recipient has already received ether");
    require(_amount > 0, "amount must be positive");
    require(_amount < 1.01 ether, "amount must be below the upper limit");
    require(address(this).balance >= _amount.add(gasAmount), "contract is out of ether!");

    sentAddresses[_recipient] = true;
    emit EtherSent(_recipient, _amount);

    // 0.1 ether in wei
    _recipient.transfer(_amount);
  }

  function sendMedX(address _recipient, uint256 _amount) public onlyOwner {
    require(_recipient != address(0), "recipient address is empty");
    require(!sentMedXAddresses[_recipient], "recipient has already received MedX");
    require(_amount > 0, "amount must be positive");
    require(_amount < 501 ether, "amount must be below the upper limit");
    require(medXToken.balanceOf(address(this)) >= _amount, "contract is out of MedX!");

    sentMedXAddresses[_recipient] = true;
    emit MedXSent(_recipient, _amount);

    medXToken.transfer(_recipient, _amount);
  }
}
