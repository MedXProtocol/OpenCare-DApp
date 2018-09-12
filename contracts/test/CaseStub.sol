pragma solidity ^0.4.23;

contract CaseStub {
  uint256 public deposited;
  address public patient;

  constructor (address _patient) public {
    patient = _patient;
  }

  function deposit() external payable {
    deposited += msg.value;
  }
}
