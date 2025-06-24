// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Crowdfunding {
    address public owner;
    uint public goal;
    uint public deadline;
    uint public totalRaised;
    mapping(address => uint) public contributions;
    bool public fundsClaimed;

    constructor(uint _goal, uint _durationInDays) {
        owner = msg.sender;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
    }

    function donate() external payable {
        require(block.timestamp < deadline, "Deadline passed");
        require(msg.value > 0, "No ETH sent");

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
    }

    function claimFunds() external {
        require(msg.sender == owner, "Not project owner");
        require(block.timestamp >= deadline, "Deadline not yet");
        require(totalRaised >= goal, "Goal not reached");
        require(!fundsClaimed, "Already claimed");

        fundsClaimed = true;
        payable(owner).transfer(address(this).balance);
    }

    function refund() external {
        require(block.timestamp >= deadline, "Deadline not yet");
        require(totalRaised < goal, "Goal was reached");

        uint amount = contributions[msg.sender];
        require(amount > 0, "Nothing to refund");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}

