pragma solidity ^0.4.23;

contract Mock {
  event Called(bytes data);

  function () payable public {
    emit Called(msg.data);
  }
}
