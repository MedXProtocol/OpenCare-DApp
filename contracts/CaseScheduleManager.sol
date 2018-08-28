pragma solidity ^0.4.23;

import './Case.sol';
import './Initializable.sol';
import './Registry.sol';
import './RegistryLookup.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseScheduleManager is Initializable, Ownable {

  using RegistryLookup for Registry;

  uint constant secondsInADay = 120;

  /*
    MEMORY START
    _do not_ remove any of these once they are deployed to a network (Ropsten,
    Mainnet, etc.) and only append to the bottom (before the END comment)
  */
  mapping(address => uint) public createdAt;
  mapping(address => uint) public updatedAt;

  Registry registry;
  /*
    MEMORY END
    It is safe to add new data definitions here
  */

  modifier onlyCaseManager() {
    require(
      msg.sender == address(registry.caseManager()),
      'sender needs to be the case manager ... and thats gold, Steven!'
    );
    _;
  }

  /**
   * @dev - throws unless is instance of either the first (initial diagnosis)
            or the second (challenge/second opinion) CasePhaseManager
   */
  modifier onlyCasePhaseManagers() {
    require(isCasePhaseManager(), 'must be one of the Case Phase Manager contracts');
    _;
  }

  function isCasePhaseManager() internal view returns (bool) {
    return (
         (msg.sender == address(registry.caseFirstPhaseManager()))
      || (msg.sender == address(registry.caseSecondPhaseManager()))
    );
  }

  function patientWaitedOneDay(address _caseAddress) external view returns (bool) {
    return (block.timestamp - updatedAt[_caseAddress]) > secondsInADay;
  }

  function doctorWaitedTwoDays(address _caseAddress) external view returns (bool) {
    return (block.timestamp - updatedAt[_caseAddress]) > (secondsInADay * 2);
  }


  /**
   * @dev - Contract should not accept any ether
   */
  function () public payable {
    revert();
  }

  function initialize(Registry _registry) public notInitialized {
    require(_registry != address(0), 'registry is not blank');
    registry = _registry;
    owner = msg.sender;
    setInitialized();
  }

  function initializeCase(address _caseAddress) external onlyCaseManager() {
    createdAt[_caseAddress] = block.timestamp;
    updatedAt[_caseAddress] = block.timestamp;
  }

  function touchUpdatedAt(address _caseAddress) public onlyCasePhaseManagers {
    updatedAt[_caseAddress] = block.timestamp;
  }

}
