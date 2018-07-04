pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";

contract DoctorManager is Ownable, Initializable {
  mapping (address => uint256) public doctorIndices;
  mapping (uint256 => address) public doctorAddresses;
  mapping (uint256 => string) public doctorNames;

  uint256 public doctorCount;

  mapping (uint256 => bool) public doctorDeactivated;

  event AddDoctor(address indexed doctor);
  event DoctorDeactivated(address indexed doctor);
  event DoctorReactivated(address indexed doctor);

  function initialize () notInitialized {
    setInitialized();
    owner = msg.sender;
  }

  function addOrReactivateDoctor(address _doctor, string _name) public onlyOwner {
    require(_doctor != address(0), 'Doctor address provided is blank');
    uint256 index = doctorIndices[_doctor];
    address doctorAddress = doctorAddresses[index];
    if (_doctor == doctorAddress) {
      reactivateDoctor(_doctor, _name);
    } else {
      addDoctor(_doctor, _name);
    }
  }

  function addDoctor(address _doctor, string _name) private onlyOwner {
    require(!isDoctor(_doctor), "Address provided is already a doctor");
    doctorIndices[_doctor] = doctorCount;
    doctorAddresses[doctorCount] = _doctor;
    doctorNames[doctorCount] = _name;
    doctorCount += 1;
    emit AddDoctor(_doctor);
  }

  function reactivateDoctor(address _doctor, string _name) private onlyOwner {
    require(!isActive(_doctor), "Address provided is already activated, cannot reactivate");
    uint256 index = doctorIndices[_doctor];
    doctorDeactivated[index] = false;
    doctorNames[index] = _name;
    emit DoctorReactivated(_doctor);
  }

  function deactivateDoctor(address _doctor) public onlyOwner {
    require(_doctor != address(0));
    require(isActive(_doctor));
    uint256 index = doctorIndices[_doctor];
    doctorDeactivated[index] = true;
    emit DoctorDeactivated(_doctor);
  }

  function isDoctor(address _doctor) public view returns (bool) {
    require(_doctor != address(0));
    uint256 index = doctorIndices[_doctor];
    return (doctorAddresses[index] == _doctor) && isActive(_doctor);
  }

  function isActive(address _doctor) public view returns (bool) {
    require(_doctor != address(0));
    uint256 index = doctorIndices[_doctor];
    return !doctorDeactivated[index];
  }

  function name(address _doctor) public view returns (string) {
    require(_doctor != address(0));
    uint256 index = doctorIndices[_doctor];
    return doctorNames[index];
  }
}
