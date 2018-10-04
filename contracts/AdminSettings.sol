pragma solidity ^0.4.23;

import "./Initializable.sol";
import "./Registry.sol";
import "./RegistryLookup.sol";
import "./DelegateTarget.sol";

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

  bool public betaFaucetRegisterDoctor;
  /*
    MEMORY END
    It is safe to add new data definitions here
  */

  enum UsageRestrictions {
    Locked,          // 0
    OpenToEveryone,  // 1
    OnlyDoctors      // 2
  }

  event UsageRestrictionsUpdated(UsageRestrictions _usageRestrictions);
  event BetaFaucetRegisterDoctorUpdated(bool _betaFaucetRegisterDoctor);

  /**
   * @dev - Contract should not accept any ether
   */
  function () public payable {
    revert("is not payable");
  }

  function initializeTarget(address _registry, bytes32) public notInitialized {
    setInitialized();
    owner = msg.sender;
    registry = Registry(_registry);
    setBetaFaucetRegisterDoctor(true);
    setUsageRestrictions(UsageRestrictions.OpenToEveryone);
  }

  function setBetaFaucetRegisterDoctor(bool _betaFaucetRegisterDoctor) public onlyOwner {
    betaFaucetRegisterDoctor = _betaFaucetRegisterDoctor;
    emit BetaFaucetRegisterDoctorUpdated(_betaFaucetRegisterDoctor);
  }

  function setUsageRestrictions(UsageRestrictions _usageRestrictions) public onlyOwner {
    usageRestrictions = _usageRestrictions;
    emit UsageRestrictionsUpdated(_usageRestrictions);
  }

  function updateAdminSettings(
    UsageRestrictions _usageRestrictions,
    bool _betaFaucetRegiterDoctor
  ) public onlyOwner {
    setBetaFaucetRegisterDoctor(_betaFaucetRegiterDoctor);
    setUsageRestrictions(_usageRestrictions);
  }

}
