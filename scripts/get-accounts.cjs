const hre = require("hardhat");

async function main() {
  console.log("\n📋 Hardhat Test Accounts (Default Test Mnemonic)\n");
  console.log("=".repeat(80));
  
  // Hardhat default mnemonic: "test test test test test test test test test test test junk"
  const mnemonic = "test test test test test test test test test test test junk";
  const { ethers } = hre;
  
  // Generate 20 accounts from the mnemonic using HD wallet
  for (let i = 0; i < 20; i++) {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, path);
    
    // Check balance if provider is available
    let balanceInEth = "N/A";
    try {
      const provider = hre.ethers.provider;
      if (provider) {
        const balance = await provider.getBalance(wallet.address);
        balanceInEth = ethers.formatEther(balance);
      } else {
        balanceInEth = "10000.0 ETH (default)";
      }
    } catch (e) {
      // Provider not available, that's ok
      balanceInEth = "10000.0 ETH (default)";
    }
    
    console.log(`\nAccount ${i + 1}:`);
    console.log(`  Address:    ${wallet.address}`);
    console.log(`  Private Key: ${wallet.privateKey}`);
    console.log(`  Balance:    ${balanceInEth}`);
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("\n💡 Tip: Copy a private key and import it into MetaMask!");
  console.log("   MetaMask → Account menu → Import Account → Paste private key\n");
  console.log("🔗 Connect MetaMask to Hardhat network:");
  console.log("   Network Name: Hardhat Local");
  console.log("   RPC URL: http://127.0.0.1:8545");
  console.log("   Chain ID: 1337");
  console.log("   Currency Symbol: ETH\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

