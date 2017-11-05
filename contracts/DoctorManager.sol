pragma solidity 0.4.15;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract DoctorManager is Ownable {
    mapping (address => bool) public doctors;

    function DoctorManager() {}

    function addDoctor(address _doctor) public onlyOwner {
        require(doctors[_doctor] == false);
        doctors[_doctor] = true;
    }

    function isDoctor(address _doctor) public returns (bool) {
        return doctors[_doctor];
    }
}
