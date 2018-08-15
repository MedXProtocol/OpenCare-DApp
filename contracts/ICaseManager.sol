pragma solidity ^0.4.23;

import "./ICase.sol";

contract ICaseManager {
  function addOpenCase(address _doctor, ICase _case) external;
  function removeOpenCase(address _doctor, ICase _case) external;
  function addClosedCase(address _doctor, ICase _case) external;
  function addChallengeDoctor(address _doctor) external;
}
