pragma solidity ^0.4.23;

/**
Designed to be compatible with the MakerDAO feed contract: https://makerdao.com/feeds/
https://etherscan.io/address/0x729D19f657BD0614b4985Cf1D82531c67569197B
*/

interface IEtherPriceFeed {
  function read() external view returns (bytes32);
}
