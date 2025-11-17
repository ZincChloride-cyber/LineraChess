const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.VITE_CHESS_CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  console.log(`Verifying contract at ${contractAddress}...`);
  
  const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const code = await provider.getCode(contractAddress);
  
  if (code && code !== "0x") {
    console.log("✅ Contract is deployed!");
    console.log(`   Address: ${contractAddress}`);
    console.log(`   Code length: ${(code.length - 2) / 2} bytes`);
    
    // Try to get contract info
    try {
      const ChessGame = await hre.ethers.getContractAt("ChessGame", contractAddress, provider);
      console.log("\n📋 Contract Interface:");
      console.log("   - createGame(address)");
      console.log("   - joinGame(bytes32)");
      console.log("   - submitMove(bytes32, uint8, uint8, uint8, string)");
      console.log("   - getGame(bytes32)");
      console.log("   - finishGame(bytes32, address)");
      console.log("   - resign(bytes32)");
    } catch (e) {
      console.log("   (Could not load contract interface)");
    }
  } else {
    console.log("❌ Contract not found at this address");
    console.log("   Please deploy the contract first:");
    console.log("   npx hardhat run scripts/deploy.cjs --network localhost");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error.message);
    console.log("\n💡 Make sure Hardhat node is running: npx hardhat node");
    process.exit(1);
  });

