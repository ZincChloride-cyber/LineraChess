const hre = require("hardhat");

async function main() {
  console.log("\n📋 Accounts from Running Hardhat Node\n");
  console.log("=".repeat(80));
  
  const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Hardhat default mnemonic
  const mnemonic = "test test test test test test test test test test test junk";
  const { ethers } = hre;
  
  // Generate accounts - Hardhat uses these paths for the default accounts
  for (let i = 0; i < 20; i++) {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, path);
    
    try {
      const balance = await provider.getBalance(wallet.address);
      const balanceInEth = ethers.formatEther(balance);
      
      console.log(`\nAccount ${i + 1}:`);
      console.log(`  Address:    ${wallet.address}`);
      console.log(`  Private Key: ${wallet.privateKey}`);
      console.log(`  Balance:    ${balanceInEth} ETH`);
    } catch (e) {
      console.log(`\nAccount ${i + 1}: ${wallet.address}`);
      console.log(`  Private Key: ${wallet.privateKey}`);
      console.log(`  Error: Could not check balance`);
    }
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("\n💡 How to Import into MetaMask:");
  console.log("   1. Open MetaMask");
  console.log("   2. Click account icon (top right) → Import Account");
  console.log("   3. Paste the Private Key (starting with 0x)");
  console.log("   4. Click Import\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error.message);
    console.log("\n💡 Make sure Hardhat node is running: npx hardhat node");
    process.exit(1);
  });



