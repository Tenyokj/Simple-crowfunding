const { ethers } = require("hardhat");

async function main() {
  const goalInEth = "10";
  const durationInDays = 3;

  const goal = ethers.parseEther(goalInEth); // 10 ETH

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const contract = await Crowdfunding.deploy(goal, durationInDays);
  await contract.waitForDeployment();

  console.log("✅ Contract deployed to:", contract.target);
  console.log(`🎯 Goal: ${goalInEth} ETH`);
  console.log(`⏳ Deadline in days: ${durationInDays}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
