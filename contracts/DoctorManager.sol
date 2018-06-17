pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";

contract DoctorManager is Ownable, Initializable {
  mapping (address => uint256) doctorIndices;
  mapping (uint256 => address) doctorAddresses;

  uint256 public doctorCount;

  event AddDoctor(address indexed doctor);

  function initialize () notInitialized {
    setInitialized();
    owner = msg.sender;
  }

  function addDoctor(address _doctor) public onlyOwner {
    require(_doctor != address(0));
    doctorIndices[_doctor] = doctorCount;
    doctorAddresses[doctorCount] = _doctor;
    doctorCount += 1;
    emit AddDoctor(_doctor);
  }

  function isDoctor(address _doctor) public view returns (bool) {
    require(_doctor != address(0));
    uint256 index = doctorIndices[_doctor];
    return doctorAddresses[index] == _doctor;
  }
}
