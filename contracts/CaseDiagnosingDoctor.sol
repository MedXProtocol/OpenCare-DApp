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

  event TestEvent(address indexed _case);


  /**
   * @dev - The initial doctor can accept their evaluation either
   *        48 hours or 96 hours after diagnosing and get tokens owing to them
   */
  function acceptAllAsDoctor()
    external
    isDoctor()
  {
    emit TestEvent(msg.sender);
    Case[] memory cases = doctorOpenCases(msg.sender);

    for (uint256 i; i < cases.length; i++) {
      registry.caseFirstPhaseManager().acceptAsDoctor(cases[i]);
    }
  }

  function doctorOpenCases(address _doctorAddress) internal view returns (Case[]) {
    uint256 numOpenCases = registry.caseStatusManager().openCaseCount(_doctorAddress);
    Case[] memory cases = new Case[](numOpenCases);
    uint256 currentNodeId = registry.caseStatusManager().firstOpenCaseId(_doctorAddress);

    while (currentNodeId != 0) {
      address caseAddress = registry.caseStatusManager().openCaseAddress(_doctorAddress, currentNodeId);
      Case openCase = Case(caseAddress);

      // We're only interested in this case if the Doc is the diagnosing doctor
      if (
        _doctorAddress == openCase.diagnosingDoctor()
        && registry.caseScheduleManager().caseExpiredForDoctor(openCase)
      ) {
        cases[currentNodeId] = openCase;
      }

      currentNodeId = registry.caseStatusManager().nextOpenCaseId(_doctorAddress, currentNodeId);
    }

    return cases;
  }

}

// todo: check gas inn for loops and cancel if gas remaining is too low
//     make sure another doc cannot 'close all' on other doc's cases, even if challening doc
