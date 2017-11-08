pragma solidity 0.4.15;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract DoctorManager is Ownable {
    mapping (address => DoctorDetails) public doctors;
    struct DoctorDetails {
        bool isActive;
        bool isCertified;
        uint256 fee;
    }

    function DoctorManager() {}

    function addDoctor(address _doctor) public onlyOwner {
        require(doctors[_doctor].isActive == false);
        doctors[_doctor].isActive = true;
        doctors[_doctor].isCertified = false;
        doctors[_doctor].fee = 0;
    }

    function isDoctor(address _doctor) constant public returns (bool) {
        return doctors[_doctor].isActive;
    }
}
