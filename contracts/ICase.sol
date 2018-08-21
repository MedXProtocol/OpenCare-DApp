pragma solidity ^0.4.23;

contract ICase {
  function getDiagnosingDoctor() public view returns (address);
  function getChallengingDoctor() public view returns (address);
  function initialize (
      address _patient,
      bytes _encryptedCaseKey,
      bytes _caseKeySalt,
      bytes _caseHash,
      uint256 _caseFee,
      address _token,
      address _registry
  ) external;
  // function setDiagnosingDoctor (address _doctor, bytes _doctorEncryptedKey) external;
}
