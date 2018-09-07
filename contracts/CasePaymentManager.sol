pragma solidity ^0.4.23;

import "./Case.sol";
import "./Initializable.sol";
import './Registry.sol';
import './RegistryLookup.sol';

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract CasePaymentManager is Ownable, Initializable {
  using RegistryLookup for Registry;
  using SafeMath for uint256;

  uint256 public baseCaseFeeUsd;
  mapping (address => address) caseTokenContract;
  Registry registry;

  modifier onlyCaseManager() {
    require(msg.sender == address(registry.caseManager()), 'Only the CaseManager can send');
    _;
  }

  function initialize(Registry _registry) external notInitialized {
    require(address(_registry) != 0x0);
    setInitialized();
    owner = msg.sender;
    registry = _registry;
  }

  function getCaseTokenContract(Case _case) public view returns (ERC20) {
    return ERC20(caseTokenContract[_case]);
  }

  function caseFeeTokenWei(address _tokenContract) public view returns (uint256) {
    if (_tokenContract == address(registry.dai())) {
      return baseCaseFeeUsd;
    } else if (_tokenContract == address(registry.weth9())){
      return caseFeeEtherWei();
    } else {
      revert('Unknown token contract');
    }
  }

  function initializeCase(Case _case, address _tokenContract) external payable onlyCaseManager {
    require(caseTokenContract[_case] == address(0));
    caseTokenContract[_case] = _tokenContract;
    ERC20 dai = registry.dai();
    if (_tokenContract == address(registry.weth9())) {
      require(msg.value >= _case.requiredDeposit(), 'not enough ether');
      _case.deposit.value(msg.value)();
    } else if (_tokenContract == address(dai)) {
      dai.transferFrom(_case.patient(), _case, _case.requiredDeposit());
    }
  }

  /**
   * @dev - sets the base case fee - only affects new cases
   */
  function setBaseCaseFeeUsd(uint256 _baseCaseFeeUsd) public onlyOwner {
    require(_baseCaseFeeUsd > 0);
    baseCaseFeeUsd = _baseCaseFeeUsd;
  }

  function caseFeeEtherWei() public view returns (uint256) {
    return baseCaseFeeUsd.div(usdPerEtherWei());
  }

  function usdPerEtherWei() public view returns (uint256) {
    uint256 usdPerEth = uint256(registry.etherPriceFeed().read());
    return usdPerEth.div(1000000000000000000);
  }
}
