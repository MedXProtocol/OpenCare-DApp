pragma solidity ^0.4.23;

import "./Case.sol";
import "./Initializable.sol";
import './Registry.sol';
import './RegistryLookup.sol';
import './DelegateTarget.sol';

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract CasePaymentManager is Ownable, Initializable, DelegateTarget {
  using RegistryLookup for Registry;
  using SafeMath for uint256;

  uint256 public baseCaseFeeUsdWei;
  mapping (address => address) caseTokenContract;
  Registry registry;

  modifier onlyCaseManager() {
    require(msg.sender == address(registry.caseManager()), 'Only the CaseManager can send');
    _;
  }

  function initializeTarget(address _registry, bytes32 _key) public notInitialized {
    require(_registry != 0x0);
    setInitialized();
    owner = msg.sender;
    registry = Registry(_registry);
  }

  function getCaseTokenContract(Case _case) public view returns (ERC20) {
    return ERC20(caseTokenContract[_case]);
  }

  function caseFeeTokenWei(address _tokenContract) public view returns (uint256) {
    if (_tokenContract == address(registry.dai())) {
      return baseCaseFeeUsdWei;
    } else if (_tokenContract == address(registry.weth9())){
      return caseFeeEtherWei();
    } else {
      revert('Unknown token contract');
    }
  }

  function initializeCase(Case _case, address _tokenContract) external payable {
    require(caseTokenContract[_case] == address(0), 'the case token contract has already been initialized');
    caseTokenContract[_case] = _tokenContract;
    ERC20 dai = registry.dai();
    if (_tokenContract == address(registry.weth9())) {
      require(msg.value >= requiredDepositTokenWei(_tokenContract), 'not enough ether');
      _case.deposit.value(msg.value)();
    } else if (_tokenContract == address(dai)) {
      dai.transferFrom(_case.patient(), _case, requiredDepositTokenWei(_tokenContract));
    } else {
      revert('Unknown token contract');
    }
  }

  function requiredDepositTokenWei(address _tokenContract) public view returns (uint256) {
    uint256 caseFeeWei = caseFeeTokenWei(_tokenContract);
    return caseFeeWei.add(caseFeeWei.mul(50).div(100));
  }

  /**
   * @dev - sets the base case fee - only affects new cases
   */
  function setBaseCaseFeeUsdWei(uint256 _baseCaseFeeUsdWei) public onlyOwner {
    require(_baseCaseFeeUsdWei > 0);
    baseCaseFeeUsdWei = _baseCaseFeeUsdWei;
  }

  function caseFeeEtherWei() public view returns (uint256) {
    return baseCaseFeeUsdWei.div(usdPerEther());
  }

  function usdPerEther() public view returns (uint256) {
    uint256 usdPerEth = uint256(registry.etherPriceFeed().read());
    return usdPerEth.div(1000000000000000000);
  }
}
