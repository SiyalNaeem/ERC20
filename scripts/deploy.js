// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy("100");
  await token.waitForDeployment();

  const DEX = await hre.ethers.getContractFactory("DEX");
  const dex = await DEX.deploy(await token.getAddress(), 100);
  await dex.waitForDeployment();

  await writeDeploymentInfo(token, "Token.json");
  await writeDeploymentInfo(dex, "DEX.json");
}

async function writeDeploymentInfo(contract, filename = "") {
  const contractAddress = await contract.getAddress();
  const signerAddress = await hre.ethers.getSigner(contractAddress);
  console.log(signerAddress);
  const data = {
    network: hre.network.name,
    contract: {
      address: contractAddress,
      signerAddress: signerAddress.address,
      abi: contract.interface.format(),
    },
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, content, { encoding: "utf8" });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
