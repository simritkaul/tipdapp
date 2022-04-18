// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Tipdapp {

    uint256 private seed;

    event NewTip(address indexed _from, uint256 _timestamp, string _message);

    struct Tip {
        address tipper;
        string message;
        uint256 timestamp;
    }

    Tip[] tips;

    mapping(address => uint256) public lastWavedAt;

    constructor() payable {
        console.log("Contract initialised.");

        seed = (block.timestamp + block.difficulty) % 100;
    }

    function sendTip(string memory _message) public {

        require(lastWavedAt[msg.sender] + 10 minutes < block.timestamp, "Wait for 10 minutes before sharing a new tip");

        // Update the current timestamp we have for the user
        lastWavedAt[msg.sender] = block.timestamp;
        console.log("%s tipped: w/ message %s", msg.sender, _message);

        // This is where I actually store the tip data in the array.
        tips.push(Tip(msg.sender, _message, block.timestamp));

        // Generate a new seed for the next user that sends a tip
        seed = (block.difficulty + block.timestamp + seed) % 100; 
        console.log("Random # generated: %d", seed);  

        // Give a 50% chance that the user wins the prize.
        if (seed <= 50) {
            console.log("%s won!", msg.sender);

            // The same code we had before to send the prize.
            uint256 prizeAmount = 0.0001 ether;
            require(prizeAmount <= address(this).balance, "Trying to withdraw more money than the contract has.");
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewTip(msg.sender, block.timestamp, _message);
    }

    // I added a function getAllTips which will return the struct array, tips, to us.
    // This will make it easy to retrieve the tips from our website!
    function getAllTips() public view returns (Tip[] memory) {
        return tips;
    }

}