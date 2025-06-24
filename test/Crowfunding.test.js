const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { parseEther } = require("ethers");
const { ethers } = require("hardhat");

describe("Crowdfunding", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    const goal = ethers.parseEther("10");
    const durationInDays = 1; // 1 day

    const contract = await Crowdfunding.deploy(goal, durationInDays);
    await contract.waitForDeployment();

    return { contract, owner, user1, user2, goal };
  }

  it("must accept donation", async function() {
    const {contract, owner, user1, contributions} = await loadFixture(deployFixture);

    const amount = parseEther("1");

    await expect(() => contract.connect(user1).donate({value: amount}))
        .to.changeEtherBalance(contract, amount);

    expect(await contract.contributions(user1.address)).to.equal(amount);
    expect(await contract.totalRaised()).to.equal(amount);
  })

  it("should not accept donation without ETH", async function() {
    const {contract, user1} = await loadFixture(deployFixture);

    await expect(contract.connect(user1).donate({value: 0}))
        .to.be.revertedWith("No ETH sent");
  })

  it("should not accept donation after deadline", async function() {
    const {contract, user1} = await loadFixture(deployFixture);

    await ethers.provider.send("evm_increaseTime", [2 * 86400]);
    await ethers.provider.send("evm_mine")

    await expect(contract.connect(user1).donate({value: 1}))
        .to.be.revertedWith("Deadline passed");
  })

  it("the owner can take the funds back if successful", async function() {
    const { contract, owner, user1, goal } = await loadFixture(deployFixture);

    await contract.connect(user1).donate({ value: goal });

    await ethers.provider.send("evm_increaseTime", [2 * 86400]);
    await ethers.provider.send("evm_mine");

    const beforeBalance = await ethers.provider.getBalance(owner.address);

    const tx = await contract.connect(owner).claimFunds();
    const receipt = await tx.wait();

    const gasUsed = receipt.gasUsed;
    const gasPrice = receipt.gasPrice;
    const gasCost = gasUsed * gasPrice;

    const afterBalance = await ethers.provider.getBalance(owner.address);
    const goalBigInt = goal;

    expect(afterBalance).to.equal(beforeBalance + goalBigInt - gasCost);
    expect(await contract.fundsClaimed()).to.be.true;
  });


  it("non-owner cannot withdraw funds.", async function() {
     const { contract, user1 } = await loadFixture(deployFixture);

     await expect(contract.connect(user1).claimFunds()).to.be.revertedWith("Not project owner");
  });

  it("cant withdraw funds again", async function() {
    const {contract, owner, user1, goal} = await loadFixture(deployFixture);

    await contract.connect(user1).donate({value: goal});

    await ethers.provider.send("evm_increaseTime", [2 * 86400]);
    await ethers.provider.send("evm_mine")

    await contract.connect(owner).claimFunds();

    await expect(contract.connect(owner).claimFunds())
      .to.be.revertedWith("Already claimed");
  });

  it("user can get refund on failure", async function() {
    const {contract, user1} = await loadFixture(deployFixture);

    const donation = ethers.parseEther("1");
    await contract.connect(user1).donate({ value: donation });

    await ethers.provider.send("evm_increaseTime", [2 * 86400]);
    await ethers.provider.send("evm_mine");

    await expect(() =>
      contract.connect(user1).refund()
    ).to.changeEtherBalance(user1, donation);

    expect(await contract.contributions(user1.address)).to.equal(0);
  });

  it("cant get a refund without a deposit", async function() {
    const {contract, user1} = await loadFixture(deployFixture);

    await ethers.provider.send("evm_increaseTime", [2 * 86400]);
    await ethers.provider.send("evm_mine");

    await expect(contract.connect(user1).refund())
      .to.be.revertedWith("Nothing to refund");
  });
  
  it("cant get refund if goal is reached", async function() {
    const {contract, user1, goal} = await loadFixture(deployFixture);

    await contract.connect(user1).donate({ value: goal });

    await ethers.provider.send("evm_increaseTime", [2 * 86400]);
    await ethers.provider.send("evm_mine");

    console.log("raised", (await contract.totalRaised()).toString());
    console.log("goal", goal.toString());

    await expect(contract.connect(user1).refund())
      .to.be.revertedWith("Goal was reached");
  });
})