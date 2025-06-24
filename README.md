# Simple Crowdfunding 🪙

A minimal crowdfunding smart contract written in Solidity. Donors can send ETH until the deadline. If the funding goal is reached, the project owner can withdraw the funds. Otherwise, donors can refund their contributions.

---

## ✨ Features

- Anyone can donate ETH to support the project.
- If the goal is **reached before deadline**, the owner can claim the funds.
- If the goal is **not reached**, all contributors can get a refund.
- Includes full Hardhat tests and deployment script.

---

## 🚀 Tech Stack

- [Solidity ^0.8.20](https://docs.soliditylang.org/)
- [Hardhat](https://hardhat.org/)
- [Chai + Mocha](https://www.chaijs.com/)
- [Ethers.js](https://docs.ethers.org/)

---

## 🧪 Run Tests

```bash
npx hardhat test

## 📦 Deploy to Local or Testnet

Update the deployment script at scripts/deploy.js if needed, then run:

npx hardhat run scripts/deploy.js --network localhost
# or for testnet
npx hardhat run scripts/deploy.js --network sepolia

## 🔧 Contract Overview

function donate() external payable;
function claimFunds() external;
function refund() external;

    donate(): Send ETH to support the project before the deadline.

    claimFunds(): Called by the owner after the deadline if goal is reached.

    refund(): Called by donors if goal is not reached after the deadline.
