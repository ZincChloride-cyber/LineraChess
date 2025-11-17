const hre = require("hardhat");

async function main() {
  console.log("Deploying ChessGame contract...");

  const ChessGame = await hre.ethers.getContractFactory("ChessGame");
  const chessGame = await ChessGame.deploy();

  await chessGame.waitForDeployment();

  const address = await chessGame.getAddress();
  console.log("ChessGame deployed to:", address);
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  console.log("\n✅ Deployment successful!");
  console.log("\n📝 Add these to your .env file:");
  console.log(`VITE_CHESS_CONTRACT_ADDRESS=${address}`);
  console.log(`VITE_CHESS_CONTRACT_CHAIN_ID=0x${Number(network.chainId).toString(16)}`);
  
  // Determine network name
  let networkName = network.name;
  const chainId = Number(network.chainId);
  if (chainId === 11155111) {
    networkName = "Sepolia";
  } else if (chainId === 80001) {
    networkName = "Mumbai";
  } else if (chainId === 1337) {
    networkName = "Localhost";
  }
  console.log(`VITE_CHESS_CONTRACT_NETWORK_NAME=${networkName}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

