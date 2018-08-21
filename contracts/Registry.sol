pragma solidity ^0.4.23;

import "./CaseManager.sol";
import "./CaseLifecycleManager.sol";
import "./CaseScheduleManager.sol";
import "./CaseStatusManager.sol";
import "./CaseFirstPhaseManager.sol";
import "./CaseSecondPhaseManager.sol";
import "./DoctorManager.sol";

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract Registry is Ownable, Pausable {
  mapping(bytes32 => address) registry;

  function register(bytes32 _key, address _targetContract) external onlyOwner {
    require(_targetContract != address(0), '_targetContract cannot be blank');
    require(_key != bytes32(0), '_key cannot be blank');
    registry[_key] = _targetContract;
  }

  function deregister(bytes32 _key) external onlyOwner {
    require(_key != bytes32(0), '_key cannot be blank');
    delete registry[_key];
  }

  function lookup(bytes32 _key) public view returns (address) {
    return registry[_key];
  }

  function caseManager() external view returns (CaseManager) {
    return CaseManager(lookup(keccak256("CaseManager")));
  }

  function caseLifecycleManager() external view returns (CaseLifecycleManager) {
    return CaseLifecycleManager(lookup(keccak256("CaseLifecycleManager")));
  }

  function caseStatusManager() external view returns (CaseStatusManager) {
    return CaseStatusManager(lookup(keccak256("CaseStatusManager")));
  }

  function caseScheduleManager() external view returns (CaseScheduleManager) {
    return CaseScheduleManager(lookup(keccak256("CaseScheduleManager")));
  }

  function caseFirstPhaseManager() external view returns (CaseFirstPhaseManager) {
    return CaseFirstPhaseManager(lookup(keccak256("CaseFirstPhaseManager")));
  }

  function caseSecondPhaseManager() external view returns (CaseSecondPhaseManager) {
    return CaseSecondPhaseManager(lookup(keccak256("CaseSecondPhaseManager")));
  }

  function doctorManager() external view returns (DoctorManager) {
    return DoctorManager(lookup(keccak256("DoctorManager")));
  }

}
