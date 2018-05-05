pragma solidity 0.4.23;

contract Initializable {
    bool private initialized = false;

    modifier wasInitialized {
        require(initialized);
        _;
    }

    modifier notInitialized {
        require(!initialized);
        _;
    }

    function setInitialized() internal notInitialized returns (bool) {
        initialized = true;
        return true;
    }
}
