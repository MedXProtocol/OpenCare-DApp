pragma solidity ^0.4.23;

import "./Case.sol";

contract ICaseManager {
  function addOpenCase(address _doctor, Case _case) external;
  function removeOpenCase(address _doctor, Case _case) external;
  function addClosedCase(address _doctor, Case _case) external;
  function addChallengeDoctor(address _doctor) external;
}
