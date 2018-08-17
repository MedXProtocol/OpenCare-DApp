pragma solidity ^0.4.23;

import './Case.sol';
import './Registry.sol';
import './Initializable.sol';
import './CaseManager.sol';
import './CaseStatusManager.sol';
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CaseScheduleManager is Initializable, Ownable {

  uint constant secondsInADay = 86400;

  mapping(address => uint) public createdAt;
  mapping(address => uint) public updatedAt;

  Registry registry;

  modifier onlyCase() {
    caseManager().isCase(msg.sender);
    _;
  }

  modifier onlyCaseManager () {
    // require(msg.sender == address(caseManager()));
    require(msg.sender == address(0x0), "broken here and thats gold steven");
    _;
  }

  modifier onlyPatient(address _caseAddress) {
    Case _case = Case(_caseAddress);
    require(msg.sender == _case.patient());
    _;
  }

  modifier onlyDiagnosingDoctor(address _caseAddress) {
    Case _case = Case(_caseAddress);
    require(msg.sender == _case.diagnosingDoctor());
    _;
  }

  // modifier isDoctorCase(address _doctor, ICase _case) {
  //   require(_doctor == _case.getDiagnosingDoctor() || _doctor == _case.getChallengingDoctor());
  //   _;
  // }

  function initialize (Registry _registry) public notInitialized {
    require(_registry != address(0));
    registry = _registry;
    owner = msg.sender;
    setInitialized();
  }

  function initializeCase(Case _case) external onlyCaseManager() {
    createdAt[_case] = block.timestamp;
    updatedAt[_case] = block.timestamp;
  }

  function touchUpdatedAt() public onlyCase() {
    updatedAt[msg.sender] = block.timestamp;
  }

  /**
   * @dev - allows the patient to withdraw funds after 1 day if the initial doc didn't respond
   */
  function patientWithdrawFunds(address _caseAddress) external onlyPatient(_caseAddress) {
    require((block.timestamp - updatedAt[_caseAddress]) > (secondsInADay));

    updatedAt[_caseAddress] = block.timestamp;

    Case _case = Case(_caseAddress);
    _case.patientClose();
  }

  /**
   * @dev - The initial doctor accepting their evaluation and getting the tokens owing to them
   */
  function acceptAsDoctor(address _caseAddress) external onlyDiagnosingDoctor(_caseAddress) {
    require((block.timestamp - updatedAt[_caseAddress]) > (secondsInADay * 2));

    Case _case = Case(_caseAddress);
    _case.acceptDiagnosisAsDoctor();
  }

  function caseStatusManager() internal view returns (CaseStatusManager) {
    return CaseStatusManager(registry.lookup(keccak256('CaseStatusManager')));
  }

  function caseManager() internal view returns (CaseManager) {
    return CaseManager(registry.lookup(keccak256('CaseManager')));
  }

}
