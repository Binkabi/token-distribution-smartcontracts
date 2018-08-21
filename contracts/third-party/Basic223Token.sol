pragma solidity ^0.4.23;

import "./ERC223Basic.sol";
import "./ERC223Receiver.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol";

 /**
  *
  * @title Basic token ERC223 
  *        derived from Basic token ERC20
  * @dev see also: https://github.com/ethereum/EIPs/issues/223  
  *
  * created by IAM <DEV> (Elky Bachtiar) 
  * https://www.iamdeveloper.io
  *
  *
  * file: Basic223Token.sol
  * location: contracts/token/
  *
 */
contract Basic223Token is ERC223Basic, BasicToken {

    /**
    * @dev transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred
    * @param _data is arbitrary data sent with the token transferFrom. Simulates ether tx.data
    * @return bool successful or not
    */
    function transfer(address _to, uint _value, bytes _data) public returns (bool success) {
        require(_to != address(0), "Invalid address.");
        require(_value <= balances[msg.sender], "Sending amount exceeded balance of sender.");
        require(balances[_to].add(_value) > balances[_to], "Balance overflow was happened.");  // Detect balance overflow
    
        assert(super.transfer(_to, _value));               //@dev Save transfer

        if (isContract(_to)){
            return contractFallback(msg.sender, _to, _value, _data);
        }
        return true;
    }

    /**
    * @dev transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public returns (bool success) {        
        return transfer(_to, _value, new bytes(0));
    }


    //function that is called when transaction target is a contract
    function contractFallback(address _origin, address _to, uint _value, bytes _data) internal returns (bool success) {
        ERC223Receiver reciever = ERC223Receiver(_to);
        return reciever.tokenFallback(msg.sender, _origin, _value, _data);
    }

    //assemble the given address bytecode. If bytecode exists then the _addr is a contract.
    function isContract(address _addr) private view returns (bool is_contract) {
        uint256 length;
        /* solium-disable-next-line */
        assembly {
        //retrieve the size of the code on target address, this needs assembly
            length := extcodesize(_addr)
        }
        return (length > 0);
    }

}
