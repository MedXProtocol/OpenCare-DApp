pragma solidity ^0.4.23;

import "./CaseManager.sol";
import "./CaseDiagnosingDoctor.sol";
import "./CaseLifecycleManager.sol";
import "./CaseScheduleManager.sol";
import "./CaseStatusManager.sol";
import './CaseFirstPhaseManager.sol';
import './CaseSecondPhaseManager.sol';
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

}
