pragma solidity ^0.4.23;

import './Case.sol';
import './Initializable.sol';
import './Registry.sol';
import './RegistryLookup.sol';
import './DelegateTarget.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseScheduleManager is Initializable, Ownable, DelegateTarget {

  using RegistryLookup for Registry;

  uint private secondsInDay;

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

  event CaseInitializedAt(address caseAddress, uint256 timestamp);
  event CaseUpdatedAt(address caseAddress, uint256 timestamp);

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
    return (block.timestamp - updatedAt[_caseAddress]) > secondsInADay();
  }

  function doctorWaitedTwoDays(address _caseAddress) public view returns (bool) {
    return (block.timestamp - updatedAt[_caseAddress]) > (secondsInADay() * 2);
  }

  function doctorWaitedFourDays(address _caseAddress) public view returns (bool) {
    return (block.timestamp - updatedAt[_caseAddress]) > (secondsInADay() * 4);
  }

  function caseExpiredForDoctor(Case _case) external view returns (bool) {
    return (
         _case.status() == Case.CaseStatus.Evaluated   && doctorWaitedTwoDays(_case)
      || _case.status() == Case.CaseStatus.Challenging && doctorWaitedFourDays(_case)
    );
  }

  /**
   * @dev - Contract should not accept any ether
   */
  function () public payable {
    revert();
  }

  function initializeTarget(address _registry, bytes32) public notInitialized {
    require(_registry != address(0), 'registry is not blank');
    registry = Registry(_registry);
    secondsInDay = 86400;
    owner = msg.sender;
    setInitialized();
  }

  function initializeCase(address _caseAddress) external onlyCaseManager() {
    createdAt[_caseAddress] = block.timestamp;
    updatedAt[_caseAddress] = block.timestamp;
    emit CaseInitializedAt(_caseAddress, block.timestamp);
  }

  function touchUpdatedAt(address _caseAddress) public onlyCasePhaseManagers {
    updatedAt[_caseAddress] = block.timestamp;
    emit CaseUpdatedAt(_caseAddress, block.timestamp);
  }

  function secondsInADay() public view returns (uint) {
    return secondsInDay;
  }

  function setSecondsInADay(uint _secondsInDay) public onlyOwner {
    secondsInDay = _secondsInDay;
  }
}
