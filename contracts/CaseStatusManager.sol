pragma solidity ^0.4.23;

import './Case.sol';
import "./LinkedList.sol";
import './Initializable.sol';
import './Registry.sol';
import './RegistryLookup.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseStatusManager is Initializable, Ownable {

  using RegistryLookup for Registry;
  using LinkedList for LinkedList.UInt256;

  Registry registry;

  /**
    * This mapping stores the list index of an open case for each doctor
    */
  mapping (address => mapping (address => uint256)) public doctorOpenCaseNodeIndices;
  mapping (address => LinkedList.UInt256) public openDoctorCasesList;

  mapping (address => address[]) public doctorClosedCases;
  mapping (address => mapping(address => bool)) closedCases;

  event CaseStatusOpened(address indexed doctor, address indexed caseAddress);
  event CaseStatusClosed(address indexed doctor, address indexed caseAddress);

  /**
   * @dev - throws unless is instance of either the first (initial diagnosis)
            or the second (challenge/second opinion) CasePhaseManager
   */
  modifier onlyCasePhaseManagers() {
    require(isCasePhaseManager(), 'must be an instance of a Case Phase Manager contract');
    _;
  }

  function isCasePhaseManager() internal view returns (bool) {
    return (
         (msg.sender == address(registry.caseFirstPhaseManager()))
      || (msg.sender == address(registry.caseSecondPhaseManager()))
    );
  }

  modifier isDoctorCase(address _doctor, Case _case) {
    require(
      _doctor == _case.diagnosingDoctor() || _doctor == _case.challengingDoctor(),
      'doctor needs to be diagnosingDoctor or challengingDoctor'
    );
    _;
  }

  function initialize(Registry _registry) public notInitialized {
    require(_registry != address(0), 'registry address cannot be blank');
    registry = _registry;
    owner = msg.sender;
    setInitialized();
  }

  function addOpenCase(address _doctor, Case _case)
    external
    onlyCasePhaseManagers
    isDoctorCase(_doctor, _case)
  {
    require(doctorOpenCaseNodeIndices[_doctor][address(_case)] == 0, 'case is already in open state for this doc');
    uint256 caseIndex = registry.caseManager().caseIndices(_case);
    require(caseIndex != 0, "case not found in caseManager's caseIndices");
    uint256 nodeIndex = openDoctorCasesList[_doctor].enqueue(caseIndex);
    require(nodeIndex != 0, 'linked list did not return a nodeIndex');
    doctorOpenCaseNodeIndices[_doctor][_case] = nodeIndex;
    emit CaseStatusOpened(_doctor, _case);
  }

  function removeOpenCase(address _doctor, Case _case)
    external
    onlyCasePhaseManagers
    isDoctorCase(_doctor, _case)
  {
    uint256 nodeIndex = doctorOpenCaseNodeIndices[_doctor][address(_case)];
    require(nodeIndex != 0, 'nodeIndex not found in doctorOpenCase linked list');
    doctorOpenCaseNodeIndices[_doctor][_case] = 0;
    openDoctorCasesList[_doctor].remove(nodeIndex);
  }

  /**
    * @return The number of open cases for a doctor
    */
  function openCaseCount(address _doctor) public view returns (uint256) {
    return openDoctorCasesList[_doctor].length();
  }

  /**
    * @return The node id of the first open case for a doctor
    */
  function firstOpenCaseId(address _doctor) external view returns (uint256) {
    return openDoctorCasesList[_doctor].peekId();
  }

  /**
    * @return The node id of the node that follows the given node
    */
  function nextOpenCaseId(address _doctor, uint256 nodeId) external view returns (uint256) {
    return openDoctorCasesList[_doctor].nextId(nodeId);
  }

  /**
    * @return The address of the case for the given node
    */
  function openCaseAddress(address _doctor, uint256 nodeId) external view returns (address) {
    return registry.caseManager().caseList(openDoctorCasesList[_doctor].value(nodeId));
  }

  function addClosedCase(address _doctor, Case _case)
    external
    onlyCasePhaseManagers
    isDoctorCase(_doctor, _case)
  {
    require(closedCases[_doctor][_case] == false, "closed cases for this doctor's case was not false");
    doctorClosedCases[_doctor].push(address(_case));
    closedCases[_doctor][_case] = true;
    emit CaseStatusClosed(_doctor, _case);
  }

  /**
    * @return The number of closed cases for a doctor
    */
  function closedCaseCount(address _doctor) external view returns (uint256) {
    return doctorClosedCases[_doctor].length;
  }

  function closedCaseAtIndex(address _doctor, uint256 _index) external view returns (address) {
    if (_index < doctorClosedCases[_doctor].length) {
      return doctorClosedCases[_doctor][_index];
    } else {
      return 0;
    }
  }

}
