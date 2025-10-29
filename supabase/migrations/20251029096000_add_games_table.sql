-- Create games table for chess game state
CREATE TABLE IF NOT EXISTS public.games (
  id text PRIMARY KEY,
  player1 text NOT NULL,
  player2 text,
  current_player text NOT NULL DEFAULT 'white' CHECK (current_player IN ('white', 'black')),
  fen text NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  move_history text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  winner text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Anyone can view games
CREATE POLICY "Anyone can view games"
  ON public.games FOR SELECT
  USING (true);

-- Anyone can create games (players will be identified by Linera wallet addresses)
CREATE POLICY "Anyone can create games"
  ON public.games FOR INSERT
  WITH CHECK (true);

-- Players can update their own games
CREATE POLICY "Players can update games"
  ON public.games FOR UPDATE
  USING (
    player1 = current_setting('app.current_user_address', true) OR
    player2 = current_setting('app.current_user_address', true)
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_games_player1 ON public.games(player1);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON public.games(player2);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_updated_at ON public.games(updated_at DESC);

