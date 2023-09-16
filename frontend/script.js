const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const tokenABI = [
  "constructor(uint256 initialSupply) nonpayable",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
  "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];
let tokenContract = null;

const dexAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const dexABI = [
  "constructor(address _token, uint256 _price) nonpayable",
  "function associatedToken() view returns (address)",
  "function buy(uint256 numOfTokens) payable",
  "function getPrice(uint256 numOfTokens) view returns (uint256)",
  "function getTokenBalance() view returns (uint256)",
  "function sell()",
  "function withdrawFunds()",
  "function withdrawTokens()",
];
let dexContract = null;

async function getAccess() {
  if (tokenContract) return;
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
  dexContract = new ethers.Contract(dexAddress, dexABI, signer);
}

async function getPrice() {
  await getAccess();
  const price = await dexContract.getPrice(1);
  document.getElementById("tokenPrice").innerText = price;
  return price;
}

async function getTokenBalance() {
  await getAccess();
  const balance = await tokenContract.balanceOf(await signer.getAddress());
  document.getElementById("tokensBalance").innerText = balance;
}

async function getAvailableTokens() {
  await getAccess();
  const availableTokens = await dexContract.getTokenBalance();
  document.getElementById("tokensAvailable").innerText = availableTokens;
}

async function grantAccess() {
  await getAccess();
  const value = document.getElementById("tokenGrant").value;
  await tokenContract
    .approve(dexAddress, value)
    .then((_) => alert("Success"))
    .catch((err) => alert(err));
}

async function sell() {
  await getAccess();
  await dexContract
    .sell()
    .then((_) => alert("Success"))
    .catch((err) => alert(err));
}

async function buy() {
  await getAccess();
  const tokensToBuy = document.getElementById("tokensToBuy").value;
  const value = (await getPrice()) * tokensToBuy;
  await dexContract
    .buy(tokensToBuy, { value })
    .then((_) => alert("Success"))
    .catch((err) => alert(err));
}
