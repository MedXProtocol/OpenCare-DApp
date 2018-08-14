pragma solidity ^0.4.23;

interface IDoctorManager {
  function isDoctor(address _doctor) public view returns (bool);
}
