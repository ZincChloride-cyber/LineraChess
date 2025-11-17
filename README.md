# 🎮 LineraChess

**Real-Time Onchain Chess on Linera Blockchain**

LineraChess is a fully decentralized chess game built on the [Linera](https://linera.dev/) blockchain. Play chess with zero lag, instant move verification, and complete onchain transparency. Every move is cryptographically secured and stored on the blockchain.

![LineraChess Logo](./public/logo.png)

## Demo Link
-https://linera-chess.vercel.app/

## ✨ Features


- 🚀 **Lightning Fast** - Instant move verification with Linera's parallel execution
- 🔗 **Fully Onchain** - Every move is stored on the blockchain
- 🎯 **Real-Time** - Play chess with real-time synchronization
- 💼 **Wallet Integration** - Connect your Linera wallet to play
- 📊 **Match History** - Track all your games and statistics
- 🛡️ **Verifiable** - Every game is cryptographically secured
- 🎨 **Beautiful UI** - Modern, responsive interface built with React and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **Blockchain**: Hardhat + Ethers.js + MetaMask SDK
- **Smart Contracts**: Solidity (ChessGame.sol)
- **Game Logic**: chess.js + react-chessboard
- **Database**: Supabase (for game state/history)
- **State Management**: React Context API + TanStack Query

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MetaMask Browser Extension** - [Download here](https://metamask.io/)
- **Hardhat** - Installed automatically via npm dependencies
- **Supabase Account** (optional, for game history) - [Sign up here](https://supabase.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd LineraChess
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter peer dependency issues (especially with React versions), use:

```bash
npm install --legacy-peer-deps
```

### 3. Set Up Local Blockchain (Hardhat)

For local development, you'll need to run a local Hardhat node:

**Terminal 1 - Start Hardhat Node:**
```bash
npx hardhat node
```

This will start a local blockchain on `http://127.0.0.1:8545` with 20 pre-funded test accounts. Keep this terminal running.

**Terminal 2 - Deploy the Contract:**
```bash
npm run deploy:local
```

This will deploy the ChessGame contract to your local Hardhat network. **Copy the contract address** from the output - you'll need it for the `.env` file.

### 4. Configure MetaMask for Local Development

1. **Add Hardhat Network to MetaMask:**
   - Open MetaMask → Network dropdown → "Add Network" → "Add a network manually"
   - Enter:
     - **Network Name**: `Hardhat Local`
     - **RPC URL**: `http://127.0.0.1:8545`
     - **Chain ID**: `1337`
     - **Currency Symbol**: `ETH`
   - Click **Save**

2. **Import a Test Account:**
   - In MetaMask, click account icon → "Import Account"
   - Use one of the private keys from the Hardhat node output (or see `HARDHAT_ACCOUNTS.md`)
   - Example private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - These accounts come pre-funded with 10,000 ETH for testing

### 5. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Chess Contract Configuration (Required for blockchain features)
VITE_CHESS_CONTRACT_ADDRESS=0x...  # Paste the contract address from step 3
VITE_CHESS_CONTRACT_CHAIN_ID=0x539  # 0x539 = 1337 (Hardhat local)
VITE_CHESS_CONTRACT_NETWORK_NAME=Localhost

# Supabase Configuration (Optional - for game history)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

**Note**: 
- The contract address and chain ID are **required** for blockchain features to work
- Supabase is optional - the app will work without it, but game history won't persist

### 6. Start the Development Server

**Terminal 3 - Start Frontend:**
```bash
npm run dev
```

The app will be available at `http://localhost:8080` (or another port if 8080 is in use - check the terminal output).

### 7. Open in Browser

Open your browser and navigate to `http://localhost:8080` (or the port shown in the terminal).

**Make sure:**
- Hardhat node is running (Terminal 1)
- Contract is deployed (Terminal 2)
- MetaMask is connected to Hardhat Local network
- You're using a test account with ETH

## 🎮 How to Play

1. **Connect Your Wallet**
   - Click "Connect MetaMask" in the top right
   - Connect your MetaMask wallet to start playing

2. **Start a Game**
   - Navigate to the Game page
   - Click "Create New Game"
   - Wait for an opponent or invite a friend by sharing your game ID

3. **Make Moves**
   - Drag and drop chess pieces on the board
   - Each move is validated and submitted to the Linera blockchain
   - Wait for your opponent's turn

4. **View History**
   - Check the "History" page to see your past games
   - View statistics and game outcomes

## 📁 Project Structure

```
LineraChess/
├── public/                 # Static assets
│   ├── logo.png           # Site logo (add your logo here)
│   └── favicon.ico        # Browser favicon
├── src/
│   ├── components/        # React components
│   │   ├── ChessBoard.tsx    # Main chess board component
│   │   ├── WalletConnect.tsx # Wallet connection UI
│   │   └── ui/               # shadcn/ui components
│   ├── contexts/          # React contexts
│   │   ├── WalletContext.tsx  # Wallet state management
│   │   └── GameContext.tsx    # Game state management
│   ├── pages/             # Page components
│   │   ├── Index.tsx         # Homepage
│   │   ├── Game.tsx          # Game page
│   │   └── MatchHistory.tsx  # History page
│   ├── services/          # Business logic
│   │   └── gameService.ts    # Game management service
│   ├── lib/               # Utilities
│   │   ├── linera.ts         # Linera blockchain integration
│   │   └── utils.ts          # Helper functions
│   └── integrations/      # Third-party integrations
│       └── supabase/         # Supabase client
├── supabase/
│   └── migrations/        # Database migrations
└── package.json
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Smart Contracts
- `npm run deploy:local` - Deploy contract to local Hardhat network
- `npm run deploy:sepolia` - Deploy contract to Sepolia testnet
- `npm run deploy:mumbai` - Deploy contract to Mumbai testnet
- `npx hardhat node` - Start local Hardhat blockchain node

## 🔗 Key Features Explained

### Wallet Connection
- Connects to MetaMask wallet extension
- Users must explicitly connect their wallet - no auto-connection
- Wallet state is persisted in localStorage only when connected

### Game Creation
- Creates a new game on Linera blockchain
- Generates a unique game ID
- Stores initial game state

### Move Submission
- Validates moves using chess.js
- Submits valid moves to Linera blockchain
- Updates game state in real-time
- Enforces turn-based gameplay

### Database Integration
- Uses Supabase for game history and state
- Falls back gracefully if database is unavailable
- Supports both development and production modes

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

The production files will be in the `dist/` directory.

### Deploy to Vercel/Netlify

1. Push your code to GitHub
2. Connect your repository to Vercel/Netlify
3. Set environment variables in the deployment platform
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `VITE_CHESS_CONTRACT_ADDRESS` - Deployed contract address
- `VITE_CHESS_CONTRACT_CHAIN_ID` - Chain ID (e.g., `0xaa36a7` for Sepolia)
- `VITE_CHESS_CONTRACT_NETWORK_NAME` - Network name (e.g., `Sepolia`)
- `VITE_SUPABASE_URL` - (Optional) Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - (Optional) Supabase anon key

## 📚 Learn More

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Chess.js Documentation](https://github.com/jhlywa/chess.js)

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🐛 Troubleshooting

### Port Already in Use
If port 8080 is in use, Vite will automatically try another port. Check the terminal output for the actual port number.

### Module Not Found Errors
Run `npm install --legacy-peer-deps` if you encounter dependency issues.

### Hardhat Node Not Running
If you see "Local blockchain node is not responding" errors:
- Make sure `npx hardhat node` is running in a separate terminal
- Verify it's running on `http://127.0.0.1:8545`
- Check that no other process is using port 8545

### Contract Not Deployed
If you see "No smart contract detected" errors:
- Make sure you've deployed the contract: `npm run deploy:local`
- Verify the contract address in your `.env` file matches the deployment output
- Ensure you're connected to the correct network in MetaMask (Hardhat Local)

### Wallet Connection Issues
- Make sure MetaMask is installed and enabled in your browser
- Verify MetaMask is connected to the Hardhat Local network (Chain ID: 1337)
- Ensure you've imported a test account with ETH balance
- Try disconnecting and reconnecting your wallet in the app

### Wrong Network in MetaMask
If the app warns about network mismatch:
- Switch MetaMask to "Hardhat Local" network
- Verify Chain ID is 1337
- Check that your `.env` has `VITE_CHESS_CONTRACT_CHAIN_ID=0x539`

### Database Connection Errors
The app works without Supabase, but game history won't persist. Make sure your environment variables are set correctly if you want to use Supabase features.

### Transaction Failures
- Ensure your MetaMask account has ETH (test accounts come with 10,000 ETH)
- Check that the Hardhat node is still running
- Verify the contract address is correct in `.env`
- Try resetting your MetaMask account: Settings → Advanced → Reset Account

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [Hardhat Discord](https://discord.gg/hardhat)
- Visit [Hardhat Documentation](https://hardhat.org/docs)

---

**Built with ❤️ on Linera Blockchain**

Enjoy playing chess on the blockchain! 🎉

