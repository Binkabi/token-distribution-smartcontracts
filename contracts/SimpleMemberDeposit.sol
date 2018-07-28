pragma solidity ^0.4.23;

import "./third-party/ERC223Receiver.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "openzeppelin-solidity/contracts/ownership/HasNoContracts.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract SimpleMemberDeposit is ERC223Receiver, Ownable, HasNoEther, HasNoContracts {

    using SafeMath for uint256;

    // Define log
    event Withdrawal(address _holder, uint256 _amount);
    event Active(address _holder, uint256 _amount);
    event Register(address _member, string _email);
    event AddAcceptToken(address _tokenContract);

    // Define params
    struct Member {
        string email;
        uint256 amount;
        bool isActive;
        uint blockActive;
        address contractAddress;
        uint256 createdAt;
    }
    mapping (address => Member) public members;
    string[] public emails;
    mapping (address => uint256) public memberActive;

    address public binkabiAddress;
    address public apiAddress;
    mapping(address => uint256) private deposit;
    address[] public acceptTokens;

    // Define condition
    modifier onlyBinkabi() {
        require(msg.sender == binkabiAddress);
        _;
    }

    modifier onlyApiBackend() {
        require(msg.sender == apiAddress);
        _;
    }

    modifier onlyTokenContract() {
//        require(isContract(msg.sender) == true);
        _;
    }

    constructor(address _binkabiAddress) public {
        acceptTokens.push(_binkabiAddress);
        binkabiAddress = _binkabiAddress;
    }

    /// @notice set api Address, only this address can call function
    function setApiAddress(address _address) onlyOwner public {
        apiAddress = _address;
    }

    function addTokenToListAccept(address _tokenAddress) onlyApiBackend public returns (bool) {
        for (uint256 i = 0; i < acceptTokens.length; i++){
            if (acceptTokens[i] == _tokenAddress) {
                return false;
            }
        }
        require(isContract(_tokenAddress) == true);
        acceptTokens.push(_tokenAddress);
        emit AddAcceptToken(_tokenAddress);
        return true;
    }

    function isContract(address _contractAddress) internal returns (bool) {
        // retrieve the size of the code on target address, this needs assembly
        uint length;
        assembly { length := extcodesize(_contractAddress) }
        return length > 0;
    }

    function tokenFallback(address _sender, address _origin, uint256 _value, bytes _data) public onlyTokenContract returns (bool success) {
        members[_sender].isActive = true;
        members[_sender].amount = members[_sender].amount.add(_value);
        members[_sender].contractAddress = msg.sender;
        members[_sender].blockActive = block.number;
        emit Active(_sender, _value);

        return true;
    }

    function registerMember(string _email, address _member) onlyApiBackend public {
        require(memberActive[_member] <= 0);
        for (uint256 i = 0; i < emails.length; i++) {
            require(keccak256(emails[i]) != keccak256(_email));
        }

        members[_member] = Member({
            email: _email,
            isActive: false,
            createdAt: now,
            blockActive: 0,
            contractAddress: 0x00,
            amount: 0
            });
        emails.push(_email);
        memberActive[_member] = 1;
        emit Register(_member, _email);
    }

    function getAmount(address _member) public view returns (uint256, uint, uint) {
        return (members[_member].amount, members[_member].blockActive, block.number);
    }

    function memberWithdrawal(address _member, uint256 _amount) onlyApiBackend public {
        require(members[_member].amount >= _amount);
        ERC20(members[_member].contractAddress).transfer(_member, _amount);
        members[_member].amount = members[_member].amount.sub(_amount);
        members[_member].isActive = false;
        emit Withdrawal(_member, _amount);
    }

    function isMembership(address _member) public view returns(bool, uint, uint) {
        bool _isActive;
        if (members[_member].amount > 0 && members[_member].isActive == true && (block.number - 5) >= members[_member].blockActive) {
            _isActive = true;
        }
        else {
            _isActive = false;
        }
        return (_isActive, block.number, members[_member].blockActive);
    }

}