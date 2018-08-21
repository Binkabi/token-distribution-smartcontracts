pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "openzeppelin-solidity/contracts/ownership/HasNoContracts.sol";


contract BinkabiNotary is Ownable, HasNoEther, HasNoContracts {

    event Notarise(bytes32 indexed _referenceHash, bytes32 _hash);

    /// @notice function call by apiBackend, for upload hash of document
    /// @param _referenceHash Hash of the reference of the file to notarise
    /// @param _hash Hash of file to notarise
    function notarise(bytes32 _referenceHash, bytes32 _hash) public onlyOwner {
        emit Notarise(_referenceHash, _hash);
    }

}