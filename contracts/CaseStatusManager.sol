pragma solidity ^0.4.23;

import './ICase.sol';
import './Registry.sol';
import "./LinkedList.sol";
import './Initializable.sol';
import './CaseManager.sol';

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CaseStatusManager is Initializable, Pausable, Ownable {
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

  modifier onlyCase(address _case) {
    if (msg.sender != owner) {
      isCase(_case);
      require(msg.sender == _case, 'sender needs to be the case');
    }
    _;
  }

  function isCase(address _case) {
    require(_case != address(0), 'case address is blank');
    require(caseManager().caseIndices(_case) != uint256(0), 'case not found in caseManager caseIndices');
  }

  modifier isDoctorCase(address _doctor, ICase _case) {
    require(
         _doctor == _case.getDiagnosingDoctor()
      || _doctor == _case.getChallengingDoctor(), 'doctor needs to be diagnosingDoctor or challengingDoctor'
    );
    _;
  }

  function initialize(Registry _registry) public notInitialized {
    require(_registry != address(0), 'registry address cannot be blank');
    registry = _registry;
    owner = msg.sender;
    setInitialized();
  }

  function addOpenCase(address _doctor, ICase _case) external onlyCase(_case) isDoctorCase(_doctor, _case) {
    require(doctorOpenCaseNodeIndices[_doctor][address(_case)] == 0, 'case is already in open state for this doc');
    uint256 caseIndex = caseManager().caseIndices(_case);
    require(caseIndex != 0, "case not found in caseManager's caseIndices");
    uint256 nodeIndex = openDoctorCasesList[_doctor].enqueue(caseIndex);
    require(nodeIndex != 0, 'linked list did not return a nodeIndex');
    doctorOpenCaseNodeIndices[_doctor][_case] = nodeIndex;
    emit CaseStatusOpened(_doctor, _case);
  }

  function removeOpenCase(address _doctor, ICase _case) external onlyCase(_case) isDoctorCase(_doctor, _case) {
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
    return caseManager().caseList(openDoctorCasesList[_doctor].value(nodeId));
  }

  function addClosedCase(address _doctor, ICase _case) external onlyCase(_case) isDoctorCase(_doctor, _case) {
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

  function caseManager() internal view returns (CaseManager) {
    return CaseManager(registry.lookup(keccak256('CaseManager')));
  }
}
