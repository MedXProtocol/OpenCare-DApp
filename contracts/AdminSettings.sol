pragma solidity ^0.4.23;

import "./Initializable.sol";
import './Registry.sol';
import './RegistryLookup.sol';
import './DelegateTarget.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract AdminSettings is Ownable, Initializable {

  using RegistryLookup for Registry;

  /*
    MEMORY START
    _do not_ remove any of these once they are deployed to a network (Ropsten,
    Mainnet, etc.) and only append to the bottom (before the END comment)
  */
  UsageRestrictions public usageRestrictions;

  Registry public registry;
  /*
    MEMORY END
    It is safe to add new data definitions here
  */

  enum UsageRestrictions {
    Locked,          // 0
    OpenToEveryone,  // 1
    OnlyDoctors      // 2
  }

  event UsageRestrictionsUpdated(UsageRestrictions usageRestrictions);

  /**
   * @dev - Contract should not accept any ether
   */
  function () public payable {
    revert();
  }

  function initializeTarget(address _registry, bytes32 _key) public notInitialized {
    setInitialized();
    owner = msg.sender;
    registry = Registry(_registry);
    setUsageRestrictions(UsageRestrictions.OpenToEveryone);
  }

  function setUsageRestrictions(UsageRestrictions _usageRestrictions) public onlyOwner {
    usageRestrictions = _usageRestrictions;
  }

}
