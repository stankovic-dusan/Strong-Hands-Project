import { ethers, waffle } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import "@nomiclabs/hardhat-web3";
import { StrongHands } from "../typechain/StrongHands";

chai.use(solidity);
const { expect } = chai;
const provider = waffle.provider;
require("@nomiclabs/hardhat-web3");

describe("StrongHands Contract", () => {
  let strongHands: StrongHands;
  let signers: any;

  beforeEach(async () => {
    signers = await ethers.getSigners();

    const strongHandsFactory = await ethers.getContractFactory(
      "StrongHands",
      signers[0]
    );

    strongHands = (await strongHandsFactory.deploy()) as StrongHands;
    await strongHands.deployed();

    expect(strongHands.address).to.properAddress;
  });

  describe("Strong Hands", async () => {
    it("shoud deposit ETH", async () => {
      await strongHands.depositETH({
        value: ethers.constants.WeiPerEther.mul(20),
      });

      expect(await provider.getBalance(strongHands.address)).to.be.equal(
        ethers.constants.WeiPerEther.mul(20)
      );

      strongHands = await strongHands.connect(signers[1]);

      await strongHands.depositETH({
        value: ethers.constants.WeiPerEther.mul(30),
      });

      strongHands = await strongHands.connect(signers[2]);

      await strongHands.depositETH({
        value: ethers.constants.WeiPerEther.mul(40),
      });

      strongHands = await strongHands.connect(signers[3]);

      await strongHands.depositETH({
        value: ethers.constants.WeiPerEther.mul(70),
      });

      expect(await strongHands.getTotalUsersBlances()).to.be.equal(
        ethers.constants.WeiPerEther.mul(160)
      );
    });

    it("should withdraw ETH", async () => {
      // SIGNERS BALANCE BEFORE DEPOSIT
      provider.getBalance(signers[1].address).then((balance) => {
        // convert a currency unit from wei to ether
        const balanceInEth = ethers.utils.formatEther(balance);
        console.log(`Signer 1 balance: ${balanceInEth} ETH`);
      });
      provider.getBalance(signers[2].address).then((balance) => {
        // convert a currency unit from wei to ether
        const balanceInEth = ethers.utils.formatEther(balance);
        console.log(`Signer 2 balance: ${balanceInEth} ETH`);
      });

      strongHands = await strongHands.connect(signers[1]);

      await strongHands.depositETH({
        value: ethers.constants.WeiPerEther.mul(30),
      });

      provider.getBalance(signers[1].address).then((balance) => {
        // convert a currency unit from wei to ether
        const balanceInEth = ethers.utils.formatEther(balance);
        console.log(`Signer 1 balance: ${balanceInEth} ETH`);
      });

      strongHands = await strongHands.connect(signers[2]);

      await strongHands.depositETH({
        value: ethers.constants.WeiPerEther.mul(40),
      });

      provider.getBalance(signers[2].address).then((balance) => {
        // convert a currency unit from wei to ether
        const balanceInEth = ethers.utils.formatEther(balance);
        console.log(`Signer 2 balance: ${balanceInEth} ETH`);
      });

      expect(await strongHands.getTotalUsersBlances()).to.be.equal(
        ethers.constants.WeiPerEther.mul(70)
      );

      await strongHands.withdrawETH();

      provider.getBalance(signers[1].address).then((balance) => {
        // convert a currency unit from wei to ether
        const balanceInEth = ethers.utils.formatEther(balance);
        console.log(`Signer 1 balance: ${balanceInEth} ETH`);
      });

      expect(await strongHands.getTotalUsersBlances()).to.be.equal(
        ethers.constants.WeiPerEther.mul(30)
      );
    });
  });
});
