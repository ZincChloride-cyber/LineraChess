# 🎮 LineraChess

**Real-Time Onchain Chess on Linera Blockchain**

LineraChess is a fully decentralized chess game built on the [Linera](https://linera.dev/) blockchain. Play chess with zero lag, instant move verification, and complete onchain transparency. Every move is cryptographically secured and stored on the blockchain.

![LineraChess Logo](./public/logo.png)

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
- **Blockchain**: Linera SDK
- **Game Logic**: chess.js + react-chessboard
- **Database**: Supabase (for game state)
- **State Management**: React Context API + TanStack Query

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Linera CLI** (optional, for production) - [Linera Docs](https://linera.dev/)
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

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Optional - for game history)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Linera Configuration (Optional - for production)
VITE_LINERA_NETWORK=testnet
VITE_LINERA_API_URL=your_linera_api_url
```

**Note**: The app works without these environment variables in development mode, but some features (like game history persistence) will be limited.

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080` (or another port if 8080 is in use).

### 5. Open in Browser

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:8081/`).

## 🎮 How to Play

1. **Connect Your Wallet**
   - Click "Connect Linera Wallet" in the top right
   - The app uses a mock wallet in development (for production, connect to a real Linera wallet)

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔗 Key Features Explained

### Wallet Connection
- Currently uses a mock wallet connection for development
- In production, integrates with Linera CLI or wallet extension
- Wallet state is persisted in localStorage

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

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_LINERA_NETWORK`
- `VITE_LINERA_API_URL`

## 📚 Learn More

- [Linera Documentation](https://linera.dev/)
- [Linera Manual](https://linera.dev/manual/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)

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

### Wallet Connection Issues
In development, the wallet is mocked. Make sure your Linera wallet is properly configured for production use.

### Database Connection Errors
The app works without Supabase, but game history won't persist. Make sure your environment variables are set correctly.

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [Linera Discord](https://discord.gg/linera)
- Visit [Linera Documentation](https://linera.dev/)

---

**Built with ❤️ on Linera Blockchain**

Enjoy playing chess on the blockchain! 🎉

