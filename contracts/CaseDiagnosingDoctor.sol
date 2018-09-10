// Methods which the Diagnosing Doctor would use to modify case information

pragma solidity ^0.4.23;

import './Case.sol';
import "./Initializable.sol";
import './Registry.sol';
import './RegistryLookup.sol';
import './DelegateTarget.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseDiagnosingDoctor is Ownable, Initializable, DelegateTarget {

  using RegistryLookup for Registry;

  Registry registry;
  address[] public caseAddresses;
  uint256[] public nodeIds;

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

  function initializeTarget(address _registry, bytes32 _key) public notInitialized {
    require(_registry != address(0), 'registry is not blank');
    registry = Registry(_registry);
    owner = msg.sender;
    setInitialized();
  }

  event AcceptedAllAsDoctor(address indexed _doctor);

  /**
   * @dev - The initial doctor can accept their evaluation either
   *        48 hours or 96 hours after diagnosing and get tokens owing to them
   */
  function acceptAllAsDoctor() public isDoctor {
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

  function caseCountForDoctor(address _doctorAddress) public view returns (uint256) {
    uint256 caseCount = 0;
    uint256 currentNodeId = registry.caseStatusManager().firstOpenCaseId(_doctorAddress);

    while (currentNodeId != 0) {
      address caseAddress = registry.caseStatusManager().openCaseAddress(_doctorAddress, currentNodeId);
      Case openCase = Case(caseAddress);

      caseAddresses.push(openCase);

      // We're only interested in this case if the Doc is the diagnosing doctor
      if (
        _doctorAddress == openCase.diagnosingDoctor()
        && registry.caseScheduleManager().caseExpiredForDoctor(openCase)
      ) {
        caseCount += 1;

      }
      currentNodeId = registry.caseStatusManager().nextOpenCaseId(_doctorAddress, currentNodeId);
    }

    return caseCount;
  }

  function arrayStats() public view returns (uint, uint) {
    return (nodeIds.length, caseAddresses.length);
  }

  // this works
  function doctorCloseCase(address _doctorAddress) public {
    uint256 currentNodeId = registry.caseStatusManager().firstOpenCaseId(_doctorAddress);
    address caseAddress = registry.caseStatusManager().openCaseAddress(_doctorAddress, currentNodeId);
    Case openCase = Case(caseAddress);
    registry.caseLifecycleManager().acceptAsDoctor(address(openCase));
  }

  function casesDoctor(address _doctorAddress) public {
    uint256 currentNodeId = registry.caseStatusManager().firstOpenCaseId(_doctorAddress);
    nodeIds.push(currentNodeId);

    while (currentNodeId != 0) {
      address caseAddress = registry.caseStatusManager().openCaseAddress(_doctorAddress, currentNodeId);
      caseAddresses.push(caseAddress);

      currentNodeId = registry.caseStatusManager().nextOpenCaseId(_doctorAddress, currentNodeId);
      nodeIds.push(currentNodeId);
    }

    nodeIds.push(currentNodeId);
    nodeIds.push(999);
  }

  function currentNodeForDoc(address _doctorAddress) public view returns (uint256) {
    return registry.caseStatusManager().firstOpenCaseId(_doctorAddress);
  }

  function currentCaseForDoc(address _doctorAddress) public view returns (address) {
    uint256 currentNodeId = registry.caseStatusManager().firstOpenCaseId(_doctorAddress);
    address caseAddress = registry.caseStatusManager().openCaseAddress(_doctorAddress, currentNodeId);
    return caseAddress;
  }

  function caseDiagnosingDoctor() public view returns (address) {
    return address(registry.caseDiagnosingDoctor());
  }

}
