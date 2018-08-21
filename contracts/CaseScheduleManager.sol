pragma solidity ^0.4.23;

import './Case.sol';
import './Registry.sol';
import './Initializable.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseScheduleManager is Initializable, Ownable {

  uint constant secondsInADay = 86400;

  mapping(address => uint) public createdAt;
  mapping(address => uint) public updatedAt;

  Registry registry;

  modifier onlyCaseManager() {
    require(
      msg.sender == address(registry.caseManager()),
      'sender needs to be the case manager ... and thats gold, Steven!'
    );
    _;
  }

  function patientWaitedOneDay(address _caseAddress) external view {
    require(
      (block.timestamp - updatedAt[_caseAddress]) > secondsInADay,
      'not enough time has passed'
    );
  }

  function doctorWaitedTwoDays(address _caseAddress) external view {
    require(
      (block.timestamp - updatedAt[_caseAddress]) > (secondsInADay * 2),
      'not enough time has passed'
    );
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

  function touchUpdatedAt(address _caseAddress) public {
    Case _case = Case(_caseAddress);
    require(
      _case.isCasePhaseManager(),
      'Must be an instance of either the Case First or Second Phase Manager contracts'
    );

    updatedAt[_caseAddress] = block.timestamp;
  }

}
