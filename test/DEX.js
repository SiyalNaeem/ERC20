const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX", () => {
  let tokenSupply = "100",
    price = 100,
    token,
    tokenAddress,
    dex,
    dexAddress,
    owner,
    addr1,
    addr2,
    addr3;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);
    tokenAddress = await token.getAddress();

    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(tokenAddress, price);
    dexAddress = await dex.getAddress();
  });

  describe("Sell", () => {
    it("Should fail if contract is not approved", async () => {
      await expect(dex.sell()).to.be.reverted;
    });
    it("Should allow DEX to transfer tokens", async () => {
      await token.approve(dexAddress, 100);
    });
    it("Should not allow non-owner to call sell()", async () => {
      await expect(dex.connect(addr1).sell()).to.be.reverted;
    });
    it("Sell should transfer tokens from owner to contract", async () => {
      await expect(dex.sell()).to.changeTokenBalances(
        token,
        [owner.address, dexAddress],
        [-100, 100]
      );
    });
  });

  describe("Getters", async () => {
    it("should return correct token balance", async () => {
      expect(await dex.getTokenBalance()).to.equal(100);
    });

    it("should return correct token price", async () => {
      expect(await dex.getPrice(10)).to.equal(price * 10);
    });
  });

  describe("Buy", async () => {
    it("User can buy tokens", async () => {
      await expect(
        dex.connect(addr1).buy(10, { value: 1000 })
      ).to.changeTokenBalances(token, [dexAddress, addr1.address], [-10, 10]);
    });

    it("User cannot buy invalid number of tokens", async () => {
      await expect(dex.connect(addr1).buy(91, { value: 9100 })).to.be.reverted;
    });

    it("User cannot buy with invalid value", async () => {
      await expect(dex.connect(addr1).buy(5, { value: 510 })).to.be.reverted;
    });
  });

  describe("Withdraw tokens", async () => {
    it("Non-owners cannot withdraw tokens", async () => {
      await expect(dex.connect(addr1).withdrawTokens()).to.be.reverted;
    });

    it("Owners can withdraw tokens", async () => {
      await expect(dex.withdrawTokens()).to.changeTokenBalances(
        token,
        [dexAddress, owner.address],
        [-90, 90]
      );
    });
  });

  describe("Withdraw funds", async () => {
    it("owner can withdraw token proceeds", async () => {
      await expect(dex.withdrawFunds()).to.changeEtherBalances(
        [owner.address, dexAddress],
        [1000, -1000]
      );
    });

    it("Non-owner cannot withdraw token proceeds", async () => {
      await expect(dex.connect(addr1).withdrawFunds()).to.be.reverted;
    });
  });
});
