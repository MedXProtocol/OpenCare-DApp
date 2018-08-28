pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";

contract DoctorManager is Ownable, Initializable {

  /*
    MEMORY START
    _do not_ remove any of these once they are deployed to a network (Ropsten,
    Mainnet, etc.) and only append to the bottom (before the END comment)
  */
  mapping (address => uint256) public doctorIndices;
  mapping (uint256 => address) public doctorAddresses;
  mapping (uint256 => string) public doctorNames;

  uint256 public doctorCount;

  mapping (uint256 => bool) public doctorDeactivated;
  mapping (uint256 => string) public doctorCountries;
  mapping (uint256 => string) public doctorRegions;
  /*
    MEMORY END
    It is safe to add new data definitions here
  */

  event AddDoctor(address indexed doctor);
  event DoctorDeactivated(address indexed doctor);
  event DoctorReactivated(address indexed doctor);

  function initialize() public notInitialized {
    setInitialized();
    owner = msg.sender;

    doctorIndices[address(0)] = doctorCount;
    doctorAddresses[doctorCount] = address(0);
    doctorNames[doctorCount] = '';
    doctorCount += 1;
  }

  function addOrReactivateDoctor(
    address _doctor,
    string _name,
    string _country,
    string _region
  ) public onlyOwner {
    address doctorAddress = doctorAddresses[doctorIndex(_doctor)];
    if (_doctor == doctorAddress) {
      reactivateDoctor(_doctor, _name, _country, _region);
    } else {
      addDoctor(_doctor, _name, _country, _region);
    }
  }

  function addDoctor(
    address _doctor,
    string _name,
    string _country,
    string _region
  ) private onlyOwner {
    require(!isDoctor(_doctor), "Address provided is already a doctor");
    doctorIndices[_doctor] = doctorCount;
    doctorAddresses[doctorCount] = _doctor;
    doctorNames[doctorCount] = _name;
    doctorCountries[doctorCount] = _country;
    doctorRegions[doctorCount] = _region;
    doctorCount += 1;
    emit AddDoctor(_doctor);
  }

  function reactivateDoctor(address _doctor,
    string _name,
    string _country,
    string _region
  ) private onlyOwner {
    require(!isActive(_doctor), "Address provided is already activated, cannot reactivate");
    uint256 index = doctorIndex(_doctor);
    doctorDeactivated[index] = false;
    doctorNames[index] = _name;
    doctorCountries[index] = _country;
    doctorRegions[index] = _region;
    emit DoctorReactivated(_doctor);
  }

  function deactivateDoctor(address _doctor) public onlyOwner {
    uint256 index = doctorIndex(_doctor);
    require(isActive(_doctor), 'Doctor is not active');
    doctorDeactivated[index] = true;
    emit DoctorDeactivated(_doctor);
  }

  function doctorIndex(address _doctor) private view returns (uint256) {
    require(_doctor != address(0), "Doctor address provided is blank");
    uint256 index = doctorIndices[_doctor];
    if (doctorAddresses[index] == _doctor) {
      return index;
    } else {
      return 0;
    }
  }

  function isDoctor(address _doctor) public view returns (bool) {
    return isActive(_doctor);
  }

  function isActive(address _doctor) public view returns (bool) {
    uint256 index = doctorIndex(_doctor);
    return index != 0 && !doctorDeactivated[index];
  }

  function name(address _doctor) public view returns (string) {
    return doctorNames[doctorIndex(_doctor)];
  }
}
