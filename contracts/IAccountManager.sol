pragma solidity ^0.4.23;

contract IAccountManager {
  function publicKeys(address _patient) public view returns (bytes);
  function setPublicKey(address _patient, bytes _patientPublicKey) external;
}
