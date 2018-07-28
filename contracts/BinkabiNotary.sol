pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/NoOwner.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract BinkabiNotary is NoOwner {
    using SafeMath for uint256;

    // Define params
    mapping(uint256 => Document) hashDocument;
    struct Document {
        bytes32[] buyer;
        bytes32[] seller;
    }

    address public binkabiAddress;
    address public apiAddress;

    // Define condition
    modifier onlyApiBackend() {
        require(msg.sender == apiAddress);
        _;
    }

    constructor(address _binkabiAddress) public {
        binkabiAddress = _binkabiAddress;
    }

    function setApiAddress(address _address) onlyOwner public {
        apiAddress = _address;
    }

    /// @notice function call buy apiBackend, for upload hash of document for an order
    /// @param _orderId the Id of order,
    /// @param _hash list hash or document
    /// @param _isBuyer to check hash of buyer or seller (equal = 1 => buyer, equal = 0 => seller)
    function notarise(uint256 _orderId, bytes32[] _hash, bool _isBuyer) onlyApiBackend public {
        for (uint256 h = 0; h < _hash.length; h++) {
            if (_isBuyer) {
                hashDocument[_orderId].buyer.push(_hash[h]);
            } else {
                hashDocument[_orderId].seller.push(_hash[h]);
            }
        }

    }

    // @notice return hash of an order
    function getNotaries(uint256 _orderId) public view returns(bytes32[], bytes32[]) {
        return (hashDocument[_orderId].buyer, hashDocument[_orderId].seller);
    }

}