pragma solidity ^0.4.23;

import './Case.sol';
import './Registry.sol';
import "./LinkedList.sol";
import './Initializable.sol';
import './CaseManager.sol';
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseStatusManager is Initializable, Ownable {
  using LinkedList for LinkedList.UInt256;

  Registry registry;

  /**
    * This mapping stores the list index of an open case for each doctor
    */
  mapping (address => mapping (address => uint256)) public doctorOpenCaseNodeIndices;
  mapping (address => LinkedList.UInt256) public openDoctorCasesList;

  mapping (address => address[]) public doctorClosedCases;
  mapping (address => mapping(address => bool)) closedCases;

  event CaseOpened(address indexed doctor, address indexed caseAddress);
  event CaseClosed(address indexed doctor, address indexed caseAddress);

  modifier onlyCase(address _case) {
    if (msg.sender != owner) {
      isCase(_case);
      require(msg.sender == _case);
    }
    _;
  }

  function isCase(address _case) {
    require(_case != address(0));
    require(caseManager().caseIndices(_case) != uint256(0));
  }

  modifier isDoctorCase(address _doctor, Case _case) {
    require(_doctor == _case.getDiagnosingDoctor() || _doctor == _case.getChallengingDoctor());
    _;
  }

  function initialize (Registry _registry) public notInitialized {
    require(_registry != address(0));
    registry = _registry;
    owner = msg.sender;
    setInitialized();
  }

  function addOpenCase(address _doctor, Case _case) external onlyCase(_case) isDoctorCase(_doctor, _case) {
    require(doctorOpenCaseNodeIndices[_doctor][address(_case)] == 0, 'this case has not been added for this doctor');
    uint256 caseIndex = caseManager().caseIndices(_case);
    require(caseIndex != 0, 'addOpenCase: caseIndex exists');
    uint256 nodeIndex = openDoctorCasesList[_doctor].enqueue(caseIndex);
    require(nodeIndex != 0, 'addOpenCase: nodeIndex exists');
    doctorOpenCaseNodeIndices[_doctor][_case] = nodeIndex;
    emit CaseOpened(_doctor, _case);
  }

  function removeOpenCase(address _doctor, Case _case) external onlyCase(_case) isDoctorCase(_doctor, _case) {
    uint256 nodeIndex = doctorOpenCaseNodeIndices[_doctor][address(_case)];
    require(nodeIndex != 0);
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

  function addClosedCase(address _doctor, Case _case) external onlyCase(_case) isDoctorCase(_doctor, _case) {
    require(closedCases[_doctor][_case] == false);
    doctorClosedCases[_doctor].push(address(_case));
    closedCases[_doctor][_case] = true;
    emit CaseClosed(_doctor, _case);
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
