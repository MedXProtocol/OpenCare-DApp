pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";

contract DoctorManager is Ownable, Initializable {
  mapping (address => DoctorDetails) public doctors;

  event AddDoctor(address indexed doctor);

  struct DoctorDetails {
    bool isActive;
    bool isCertified;
    uint256 fee;
  }

  function initialize () notInitialized {
    setInitialized();
    owner = msg.sender;
  }

  function addDoctor(address _doctor) public onlyOwner {
    require(doctors[_doctor].isActive == false);
    doctors[_doctor].isActive = true;
    doctors[_doctor].isCertified = false;
    doctors[_doctor].fee = 0;
    emit AddDoctor(_doctor);
  }

  function isDoctor(address _doctor) constant public returns (bool) {
    return doctors[_doctor].isActive;
  }

  function getOwner() public view returns (address) {
    return owner;
  }
}
