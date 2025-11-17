# Chess Contract Deployment Guide

## ✅ Contract Successfully Deployed

The ChessGame smart contract has been deployed to the local Hardhat network.

### Contract Details

- **Contract Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Network**: Localhost (Hardhat)
- **Chain ID**: `1337` (0x539 in hex)

## 📝 Environment Variables

Create a `.env` file in the root directory with the following:

```env
# Chess Game Smart Contract Configuration
VITE_CHESS_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_CHESS_CONTRACT_CHAIN_ID=0x539
VITE_CHESS_CONTRACT_NETWORK_NAME=Localhost

# Supabase Configuration (Optional - for game history)
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## 🚀 Running the Local Blockchain

To start the local Hardhat blockchain:

```bash
npx hardhat node
```

This will start a local blockchain at `http://127.0.0.1:8545` with 20 test accounts pre-funded with 10,000 ETH each.

## 🔗 Connecting MetaMask

To connect MetaMask to the local Hardhat network:

1. Open MetaMask
2. Click the network dropdown at the top
3. Select "Add Network" → "Add a network manually"
4. Enter the following details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

5. Import one of the test accounts:
   - Copy a private key from the Hardhat node output
   - In MetaMask: Account → Import Account → Paste private key

## 📦 Deploying to Testnet

### Sepolia Testnet (recommended for two-player testing)

1. **Fund two wallets**
   - Get Sepolia ETH for **two separate MetaMask accounts** from a faucet: `https://sepoliafaucet.com/`

2. **Set up Hardhat environment variables in `.env` (local only, never commit real keys)**
   ```env
   SEPOLIA_RPC_URL=https://rpc.sepolia.org
   PRIVATE_KEY=<private_key_of_deployer_wallet>
   ETHERSCAN_API_KEY=<optional_etherscan_key_for_verification>
   ```

3. **Deploy the contract to Sepolia**
   ```bash
   npm run deploy:sepolia
   # or: npx hardhat run scripts/deploy.cjs --network sepolia
   ```
   - Copy the `ChessGame deployed to:` address from the output.

4. **Configure the frontend to point to Sepolia**
   In your local `.env` (and in your hosting provider’s env settings for production), set:
   ```env
   VITE_CHESS_CONTRACT_ADDRESS=<deployed_address>
   VITE_CHESS_CONTRACT_CHAIN_ID=0xaa36a7  # Sepolia chain ID
   VITE_CHESS_CONTRACT_NETWORK_NAME=Sepolia
   ```

5. **Rebuild the frontend**
   ```bash
   npm run build
   ```

### Mumbai Testnet (Polygon)

1. Get Mumbai MATIC from a faucet: `https://faucet.polygon.technology/`
2. Set up your `.env` file for deployment:
   ```env
   MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
   PRIVATE_KEY=<private_key_of_deployer_wallet>
   ```

3. Deploy:
   ```bash
   npm run deploy:mumbai
   # or: npx hardhat run scripts/deploy.cjs --network mumbai
   ```

4. Update `.env` with the new contract address:
   ```env
   VITE_CHESS_CONTRACT_ADDRESS=<deployed_address>
   VITE_CHESS_CONTRACT_CHAIN_ID=0x13881  # Mumbai chain ID
   VITE_CHESS_CONTRACT_NETWORK_NAME=Mumbai
   ```

## 🧪 Testing the Contract

The contract has been updated to interact with the actual smart contract instead of simulating. When you:

1. **Create a game**: Calls `createGame()` on the contract
2. **Make a move**: Calls `submitMove()` on the contract
3. **Finish a game**: Can call `finishGame()` or `resign()` on the contract

All transactions will be sent to MetaMask for user approval.

## 📋 Contract Functions

The ChessGame contract includes:

- `createGame(address opponentAddress)` - Create a new game
- `joinGame(bytes32 gameId)` - Join an open game
- `submitMove(bytes32 gameId, uint8 fromSquare, uint8 toSquare, uint8 promotion, string newFen)` - Submit a move
- `finishGame(bytes32 gameId, address winner)` - Mark game as finished
- `resign(bytes32 gameId)` - Resign from a game
- `getGame(bytes32 gameId)` - Get game details

## 🔍 Verifying Contract Deployment

The app automatically verifies that the contract is deployed at the configured address. If the contract is not found, you'll see an error message.

## 🛠️ Troubleshooting

### "Contract not found" error
- Make sure you've deployed the contract **to the same network your wallet is on** (e.g. Sepolia)
- Verify the `VITE_CHESS_CONTRACT_ADDRESS` in `.env` (local) and your hosting provider env is correct
- Ensure MetaMask is connected to the correct network (chain ID matches `VITE_CHESS_CONTRACT_CHAIN_ID`)

### "User rejected the transaction"
- User clicked "Reject" in MetaMask
- Check MetaMask has enough gas/ETH

### "Not your turn" error
- Verify the game state and current player
- Check that your wallet address matches the player's address

## 📚 Next Steps

1. Start the local blockchain: `npx hardhat node`
2. Connect MetaMask to local network
3. Start the frontend: `npm run dev`
4. Connect your wallet and start playing!

---

**Note**: Remember to never commit your `.env` file with real private keys or secrets to version control!

