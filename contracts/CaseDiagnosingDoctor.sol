// Methods which the Diagnosing Doctor would use to modify case information

pragma solidity ^0.4.23;

import './Case.sol';
import "./Initializable.sol";
import './Registry.sol';
import './RegistryLookup.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseDiagnosingDoctor is Ownable, Initializable {

  using RegistryLookup for Registry;

  Registry registry;

  /**
   * @dev - throws if called by any account other than a doctor.
   */
  modifier isDoctor() {
    require(registry.doctorManager().isDoctor(msg.sender), 'sender must be a Doctor');
    _;
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

  event AcceptedAllAsDoctor(address indexed _doctor);

  /**
   * @dev - The initial doctor can accept their evaluation either
   *        48 hours or 96 hours after diagnosing and get tokens owing to them
   */
  function acceptAllAsDoctor() external isDoctor {
    uint256 currentNodeId = registry.caseStatusManager().firstOpenCaseId(msg.sender);

    while (currentNodeId != 0) {
      address caseAddress = registry.caseStatusManager().openCaseAddress(msg.sender, currentNodeId);
      Case openCase = Case(caseAddress);

      // We're only interested in this case if the Doc is the diagnosing doctor
      if (
        msg.sender == openCase.diagnosingDoctor()
        && registry.caseScheduleManager().caseExpiredForDoctor(openCase)
      ) {
        registry.caseLifecycleManager().acceptAsDoctor(openCase);
      }
      currentNodeId = registry.caseStatusManager().nextOpenCaseId(msg.sender, currentNodeId);

      // Right now it costs about 400,000~ gas for a Doctor to close a case
      // If we don't have much gas left let's get out of this loop
      if (gasleft() < 400000) {
        break;
      }
    }

    emit AcceptedAllAsDoctor(msg.sender);
  }

}
