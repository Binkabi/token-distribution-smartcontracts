pragma solidity ^0.4.23;

import "./third-party/Basic223Token.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";


contract BinkabiToken is Basic223Token, PausableToken, DetailedERC20 {
    constructor() DetailedERC20("Binkabi Token", "BKB", 18) public {
        balances[owner] = 10 ** (18 + 6 + 2); // 1e26
    }
}
