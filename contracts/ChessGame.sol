// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ChessGame
 * @dev Smart contract for onchain chess game on Linera/EVMs
 */
contract ChessGame {
    struct Game {
        address player1;
        address player2;
        string fen; // Current board state in FEN notation
        bool isWhiteTurn;
        GameStatus status;
        address winner;
        uint256 createdAt;
        uint256 lastMoveAt;
        uint256 moveCount;
    }

    enum GameStatus {
        Waiting,    // Waiting for opponent
        Active,     // Game in progress
        Finished    // Game completed
    }

    struct Move {
        uint8 fromSquare;
        uint8 toSquare;
        uint8 promotion; // 0 = none, 1 = queen, 2 = rook, 3 = bishop, 4 = knight
    }

    // Mapping from gameId to Game
    mapping(bytes32 => Game) public games;
    
    // Mapping from player address to their active games
    mapping(address => bytes32[]) public playerGames;
    
    // Counter for unique game IDs
    uint256 private gameCounter;
    
    // Events
    event GameCreated(bytes32 indexed gameId, address indexed player1, address indexed player2);
    event MoveSubmitted(bytes32 indexed gameId, address indexed player, uint8 fromSquare, uint8 toSquare, uint8 promotion);
    event GameFinished(bytes32 indexed gameId, address indexed winner);
    event OpponentJoined(bytes32 indexed gameId, address indexed player2);

    /**
     * @dev Create a new chess game
     * @param opponentAddress Optional address of opponent. If zero address, game is open to anyone
     * @return gameId The unique identifier for the game
     */
    function createGame(address opponentAddress) external returns (bytes32) {
        bytes32 gameId = keccak256(abi.encodePacked(msg.sender, gameCounter, block.timestamp));
        gameCounter++;
        
        games[gameId] = Game({
            player1: msg.sender,
            player2: opponentAddress,
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Starting position
            isWhiteTurn: true,
            status: opponentAddress == address(0) ? GameStatus.Waiting : GameStatus.Active,
            winner: address(0),
            createdAt: block.timestamp,
            lastMoveAt: block.timestamp,
            moveCount: 0
        });
        
        playerGames[msg.sender].push(gameId);
        if (opponentAddress != address(0)) {
            playerGames[opponentAddress].push(gameId);
        }
        
        emit GameCreated(gameId, msg.sender, opponentAddress);
        
        return gameId;
    }

    /**
     * @dev Join an open game (where player2 is zero address)
     * @param gameId The game to join
     */
    function joinGame(bytes32 gameId) external {
        Game storage game = games[gameId];
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already has two players");
        require(game.player1 != msg.sender, "Cannot join your own game");
        require(game.status == GameStatus.Waiting, "Game is not waiting for opponent");
        
        game.player2 = msg.sender;
        game.status = GameStatus.Active;
        playerGames[msg.sender].push(gameId);
        
        emit OpponentJoined(gameId, msg.sender);
        emit GameCreated(gameId, game.player1, msg.sender);
    }

    /**
     * @dev Submit a move to the game
     * @param gameId The game to make a move in
     * @param fromSquare The square to move from (0-63, where 0 is a1, 63 is h8)
     * @param toSquare The square to move to
     * @param promotion Promotion piece (0 = none, 1 = queen, 2 = rook, 3 = bishop, 4 = knight)
     * @param newFen The new FEN notation after the move (validated off-chain)
     */
    function submitMove(
        bytes32 gameId,
        uint8 fromSquare,
        uint8 toSquare,
        uint8 promotion,
        string calldata newFen
    ) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game is not active");
        require(game.player1 != address(0), "Game does not exist");
        
        // Check if it's the player's turn
        bool isWhite = (msg.sender == game.player1 && game.isWhiteTurn) ||
                       (msg.sender == game.player2 && !game.isWhiteTurn);
        require(isWhite, "Not your turn");
        
        // Validate players
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player in this game");
        
        // Update game state
        game.fen = newFen;
        game.isWhiteTurn = !game.isWhiteTurn;
        game.lastMoveAt = block.timestamp;
        game.moveCount++;
        
        emit MoveSubmitted(gameId, msg.sender, fromSquare, toSquare, promotion);
    }

    /**
     * @dev Mark game as finished with a winner
     * @param gameId The game to finish
     * @param winner The address of the winner (or address(0) for draw)
     */
    function finishGame(bytes32 gameId, address winner) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game must be active");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player in this game");
        require(winner == game.player1 || winner == game.player2 || winner == address(0), "Invalid winner");
        
        game.status = GameStatus.Finished;
        game.winner = winner;
        
        emit GameFinished(gameId, winner);
    }

    /**
     * @dev Get game details
     * @param gameId The game to query
     * @return The game struct
     */
    function getGame(bytes32 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    /**
     * @dev Get all games for a player
     * @param player The player's address
     * @return An array of game IDs
     */
    function getPlayerGames(address player) external view returns (bytes32[] memory) {
        return playerGames[player];
    }

    /**
     * @dev Resign from a game
     * @param gameId The game to resign from
     */
    function resign(bytes32 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game must be active");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player in this game");
        
        address winner = msg.sender == game.player1 ? game.player2 : game.player1;
        game.status = GameStatus.Finished;
        game.winner = winner;
        
        emit GameFinished(gameId, winner);
    }
}

