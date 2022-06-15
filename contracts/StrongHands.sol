//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
// import "@aave/protocol-v2/contracts/misc/WETHGateway.sol";

// import "./interfaces/ILendingPoolAddressesProvider.sol";
// import "./interfaces/IWETHGateway.sol";

import "hardhat/console.sol";

contract StrongHands is Ownable {
    // LendingPoolAddressesProvider provider =
    //     LendingPoolAddressesProvider(
    //         address(0x24a42fD28C976A61Df5D00D0599C34c4f90748c8)
    //     );
    // LendingPool lendingPool = LendingPool(provider.getLendingPool());

    // LendingPoolAddressesProvider provider;

    // address public WETHGateway;
    // WETHGateway WETHGatewayInstance;

    uint256 maxDays = 20 days;
    address payable[] users;
    uint256 totalUsersBlances;

    address payable public contractOwner;

    struct User {
        uint256 totalDeposit;
        uint256 lockedTime;
        uint256 lockedETH;
    }

    constructor() {
        // address _provider, address _WETHGateway
        // provider = LendingPoolAddressesProvider(_provider);
        // WETHGatewayInstance = WETHGateway(_WETHGateway);
        contractOwner == msg.sender;
    }

    mapping(address => User) user;

    function depositETH() public payable {
        user[msg.sender].totalDeposit += msg.value;
        user[msg.sender].lockedTime = block.timestamp + maxDays;

        users.push(payable(msg.sender));
        totalUsersBlances += user[msg.sender].totalDeposit;

        // WETHGatewayInstance.depositETH(onBehalfOf, 0);
    }

    function withdrawETH() public {
        require(user[msg.sender].totalDeposit > 0, "Not enough funds!");

        // WETHGatewayInstance.withdrawETH(
        //     user[msg.sender].totalDeposit,
        //     adress(this)
        // );

        if (user[msg.sender].lockedTime - block.timestamp <= 0)
            payable(msg.sender).transfer(user[msg.sender].totalDeposit);
        else {
            payable(msg.sender).transfer(
                (user[msg.sender].totalDeposit *
                    ((user[msg.sender].lockedTime - block.timestamp + 1 days) /
                        maxDays) *
                    50) / 100
            );
            user[msg.sender].lockedETH =
                user[msg.sender].totalDeposit -
                ((user[msg.sender].totalDeposit *
                    ((user[msg.sender].lockedTime - block.timestamp + 1 days) /
                        maxDays) *
                    50) / 100);

            totalUsersBlances -= user[msg.sender].totalDeposit;

            for (uint256 i = 0; i < users.length; i++) {
                if (msg.sender != users[i])
                    users[i].transfer(
                        (user[users[i]].totalDeposit / totalUsersBlances) *
                            user[msg.sender].lockedETH
                    );
            }
        }
    }

    function getLockedETH() public view returns (uint256) {
        return user[msg.sender].lockedETH;
    }

    function getUserDeposit() public view returns (uint256) {
        return user[msg.sender].totalDeposit;
    }

    function getUserLockedTime() public view returns (uint256) {
        return user[msg.sender].lockedTime;
    }

    function getTotalUsersBlances() public view returns (uint256) {
        return totalUsersBlances;
    }
}
