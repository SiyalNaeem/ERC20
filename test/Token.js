const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", () => {
  let tokenSupply = "100",
    token,
    owner,
    addr1,
    addr2,
    addr3;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);
  });

  describe("Deployment", () => {
    it("should assign total supply of token to owner/deployer", async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });
  describe("Transactions", () => {
    it("should transfer tokens between accounts", async () => {
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    it("should never allow transfer if amount is not sufficient", async () => {
      await expect(token.connect(addr1).transfer(addr2.address, 51)).to.be
        .reverted;
    });
  });
});
