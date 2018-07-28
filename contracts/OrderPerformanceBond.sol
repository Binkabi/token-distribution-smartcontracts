pragma solidity ^0.4.23;

import "./third-party/ERC223Receiver.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "openzeppelin-solidity/contracts/ownership/HasNoContracts.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/// Accepts deposits of tokens by the parties to a trade deal. Allows the owner of the
/// contract to settle these in favour of either party, or refund the deposits to both.
contract OrderPerformanceBond is ERC223Receiver, Ownable, HasNoEther, HasNoContracts {
    using SafeMath for uint256;

    // Define params
    address public binkabiAddress;
    address public apiAddress;
    
    struct Order {
        address buyer;
        address seller;
        uint256 amountBuyer;
        uint256 amountSeller;
        bool isBuyerDeposited;
        bool isSellerDeposited;
        bool isRefunded;
        uint blockBuyerDeposit;
        uint blockSellerDeposit;
        uint256 createdAt;
    }
    mapping (uint256 => Order) orders;
    uint256[] public orderWaiting;

    // Define conditions
    modifier onlyBinkabi() {
        require(msg.sender == binkabiAddress);
        _;
    }
    
    modifier onlyApiBackend() {
        require(msg.sender == apiAddress);
        _;
    }

    // Define logs
    event MemberDeposit(uint256 _orderId, address _buyer, uint256 _amount);
    event RefundBKB(uint256 _orderId, address _member, uint256 _amount);
    event NewOrder(uint256 _orderId, address _buyer, address _seller);

    constructor(address _binkabiAddress) public {
        binkabiAddress = _binkabiAddress;
    }
     
    function setApiAddress(address _address) onlyOwner public {
        apiAddress = _address;
    }

    /// @dev As per https://medium.com/kinfoundation/the-new-erc223-token-standard-8dddbf1a5909
    /// This function will need to allocate tokens to an appropriate internal pot for each order.
    function tokenFallback(address _sender, address _origin, uint256 _value, bytes _data) onlyBinkabi public returns (bool success) {
        for (uint256 i = 0; i < orderWaiting.length; i++) {
            if (orders[orderWaiting[i]].buyer == _sender && orders[orderWaiting[i]].amountBuyer == _value){
                orders[orderWaiting[i]].isBuyerDeposited = true;
                orders[orderWaiting[i]].blockBuyerDeposit = block.number;
                emit MemberDeposit(orderWaiting[i], _sender, _value);
                if (orders[orderWaiting[i]].isSellerDeposited == true){
                    delete orderWaiting[i];
                }
                break;
            } else if (orders[orderWaiting[i]].seller == _sender && orders[orderWaiting[i]].amountSeller == _value){
                orders[orderWaiting[i]].isSellerDeposited = true;
                orders[orderWaiting[i]].blockSellerDeposit = block.number;
                emit MemberDeposit(orderWaiting[i], _sender, _value);
                if (orders[orderWaiting[i]].isBuyerDeposited == true){
                    delete orderWaiting[i];
                }
                break;
            }
        }
        return true;
    }

    /// @notice Create a bond for an `(_orderId)` for the performance of that order between
    /// @param _orderId to determine order
    /// @param _buyer is address of buyer in an order
    /// @param _seller is address of seller in an order
    /// @param _amountBuyer is amount need buyer deposit
    /// @param _amountSeller is amount need seller deposit
    function createOrderBond(uint256 _orderId, address _buyer, address _seller, uint256 _amountBuyer, uint256 _amountSeller) public onlyApiBackend {
        // Make sure orderId does not exist (never create before)
        require(orders[_orderId].createdAt == 0);

        // Make sure a member does not buy yourself
        require(_buyer != _seller);
        orders[_orderId] = Order({
            buyer: _buyer,
            seller: _seller,
            amountBuyer: _amountBuyer,
            amountSeller: _amountSeller,
            isBuyerDeposited: false,
            isSellerDeposited: false,
            isRefunded: false,
            blockBuyerDeposit: 0,
            blockSellerDeposit: 0,
            createdAt: now
        });
        emit NewOrder(_orderId, _buyer, _seller);
        orderWaiting.push(_orderId);
    }

    function orderDetail(uint256 _orderId) public returns(bool, bool, bool) {
        return (orders[_orderId].isBuyerDeposited, orders[_orderId].isSellerDeposited, orders[_orderId].isRefunded);
    }
    /// @notice Settle the bond for `(_orderId)` in favour of `(_party)`.
    /// @param _party The address of a party to the bond. If this address is neither
    /// the buyer or seller, this call will revert.
    function settleInFavourOf(uint256 _orderId, address _party) public view onlyOwner {
    }

    /// @notice Refund to all parties of `(_orderId)` the tokens deposited by them.
    function refund(uint256 _orderId) public onlyApiBackend {
        require(orders[_orderId].isRefunded == false);

        ERC20(binkabiAddress).transfer(orders[_orderId].buyer, orders[_orderId].amountBuyer);
        emit RefundBKB(_orderId, orders[_orderId].buyer, orders[_orderId].amountBuyer);
        ERC20(binkabiAddress).transfer(orders[_orderId].seller, orders[_orderId].amountSeller);
        emit RefundBKB(_orderId, orders[_orderId].seller, orders[_orderId].amountSeller);
        orders[_orderId].isRefunded = true;
    }

    /// @return Balance of tokens deposited by _owner against _orderId
    function balanceOf(uint256 _orderId, address _owner) public view returns (uint256) {
        if (orders[_orderId].createdAt == 0) {
            return 0;
        } else if (orders[_orderId].isRefunded == true) {
            return 0;
        }
        else if (orders[_orderId].buyer == _owner){
            if (orders[_orderId].isBuyerDeposited == false){
                return 0;
            }
            return orders[_orderId].amountBuyer;
        } else if (orders[_orderId].seller == _owner) {
            if (orders[_orderId].isSellerDeposited == false){
                return 0;
            }
            return orders[_orderId].amountSeller;
        }
        return 0;
    }

    // @notice for api backend get buyer/seller of an order to verify before upload document hash
    function getMember(uint256 _orderId) public view returns (address, address) {
        require(orders[_orderId].createdAt != 0);
        return (orders[_orderId].buyer, orders[_orderId].seller);
    }

}