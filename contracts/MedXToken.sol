pragma solidity 0.4.18;

import "./ITokenRecipient.sol";
import "zeppelin-solidity/contracts/token/MintableToken.sol";

contract MedXToken is MintableToken {
    string public constant name = "MedX Token";
    string public constant symbol = "MEDX";
    uint8 public constant decimals = 18;

    /**
     * @dev - Empty constructor
     */
    function MedXToken() {}

    /**
     * @dev - Allow another contract to spend some tokens on your behalf
     * @param _spender - Contract that will spend the tokens
     * @param _value - Amount of tokens to spend
     * @param _extraData - Additional data to pass to the receiveApproval
     * @return -  A boolean that indicates if the operation was successful.
     */
    function approveAndCall(ITokenRecipient _spender, uint256 _value, bytes _extraData) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        _spender.receiveApproval(msg.sender, _value, this, _extraData);
        return true;
    }
}
