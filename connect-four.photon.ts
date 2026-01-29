/**
 * Connect Four - Play against AI with distributed locks
 *
 * Classic Connect Four game where you drop discs into columns trying to
 * get four in a row. The AI opponent uses minimax with alpha-beta pruning
 * to play strategically. Distributed locks ensure no two moves happen
 * simultaneously — critical when multiple clients connect to the same game.
 *
 * ## Quick Reference
 * - `newGame` — Start a new game
 * - `dropPiece` — Drop your disc into a column (1-7)
 * - `board` — View current board state
 * - `games` — List your games
 * - `stats` — Win/loss statistics
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @dependencies @portel/photon-core@latest
 * @tags game, connect-four, ai-opponent, locks, daemon
 * @icon 🔴
 * @stateful
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { existsSync, readFileSync, mkdirSync } from 'fs';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

type Cell = 0 | 1 | 2; // 0=empty, 1=player (🔴), 2=AI (🟡)
type Board = Cell[][]; // 6 rows x 7 columns

type Difficulty = 'easy' | 'medium' | 'hard';

interface Game {
  id: string;
  board: Board;
  currentTurn: 'player' | 'ai';
  status: 'active' | 'player_wins' | 'ai_wins' | 'draw';
  difficulty: Difficulty;
  playerName: string;
  moves: Array<{ column: number; player: 'player' | 'ai' }>;
  createdAt: string;
  updatedAt: string;
}

interface GameData {
  games: Game[];
  stats: {
    wins: number;
    losses: number;
    draws: number;
    gamesPlayed: number;
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════

const ROWS = 6;
const COLS = 7;
const DATA_DIR = path.join(process.env.PHOTONS_DIR || path.join(os.homedir(), '.photon'), 'connect-four');
const DATA_PATH = path.join(DATA_DIR, 'data.json');

const DEPTH_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 2,
  medium: 4,
  hard: 7,
};

// ════════════════════════════════════════════════════════════════════════════════
// BOARD HELPERS
// ════════════════════════════════════════════════════════════════════════════════

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0) as Cell[]);
}

function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

function getLowestEmptyRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row;
  }
  return -1; // column full
}

function getValidColumns(board: Board): number[] {
  const valid: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (board[0][col] === 0) valid.push(col);
  }
  return valid;
}

function dropPieceOnBoard(board: Board, col: number, piece: Cell): number {
  const row = getLowestEmptyRow(board, col);
  if (row === -1) return -1;
  board[row][col] = piece;
  return row;
}

function checkWin(board: Board, piece: Cell): boolean {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === piece && board[r][c + 1] === piece &&
          board[r][c + 2] === piece && board[r][c + 3] === piece) return true;
    }
  }
  // Vertical
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === piece && board[r + 1][c] === piece &&
          board[r + 2][c] === piece && board[r + 3][c] === piece) return true;
    }
  }
  // Diagonal down-right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === piece && board[r + 1][c + 1] === piece &&
          board[r + 2][c + 2] === piece && board[r + 3][c + 3] === piece) return true;
    }
  }
  // Diagonal up-right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === piece && board[r - 1][c + 1] === piece &&
          board[r - 2][c + 2] === piece && board[r - 3][c + 3] === piece) return true;
    }
  }
  return false;
}

function isBoardFull(board: Board): boolean {
  return board[0].every(cell => cell !== 0);
}

// ════════════════════════════════════════════════════════════════════════════════
// AI ENGINE (Minimax with Alpha-Beta Pruning)
// ════════════════════════════════════════════════════════════════════════════════

function scoreWindow(window: Cell[], piece: Cell): number {
  const opp: Cell = piece === 1 ? 2 : 1;
  const pieceCount = window.filter(c => c === piece).length;
  const oppCount = window.filter(c => c === opp).length;
  const emptyCount = window.filter(c => c === 0).length;

  if (pieceCount === 4) return 100;
  if (pieceCount === 3 && emptyCount === 1) return 5;
  if (pieceCount === 2 && emptyCount === 2) return 2;
  if (oppCount === 3 && emptyCount === 1) return -4;
  return 0;
}

function scorePosition(board: Board, piece: Cell): number {
  let score = 0;

  // Center column preference
  const centerCol = Math.floor(COLS / 2);
  const centerCount = board.filter(row => row[centerCol] === piece).length;
  score += centerCount * 3;

  // Horizontal windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += scoreWindow(window, piece);
    }
  }

  // Vertical windows
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += scoreWindow(window, piece);
    }
  }

  // Diagonal down-right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += scoreWindow(window, piece);
    }
  }

  // Diagonal up-right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += scoreWindow(window, piece);
    }
  }

  return score;
}

function isTerminal(board: Board): boolean {
  return checkWin(board, 1) || checkWin(board, 2) || isBoardFull(board);
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean): [number | null, number] {
  const validCols = getValidColumns(board);
  const terminal = isTerminal(board);

  if (depth === 0 || terminal) {
    if (terminal) {
      if (checkWin(board, 2)) return [null, 100000];
      if (checkWin(board, 1)) return [null, -100000];
      return [null, 0]; // draw
    }
    return [null, scorePosition(board, 2)];
  }

  if (maximizing) {
    let value = -Infinity;
    let bestCol = validCols[Math.floor(Math.random() * validCols.length)];

    for (const col of validCols) {
      const temp = cloneBoard(board);
      dropPieceOnBoard(temp, col, 2);
      const [, newScore] = minimax(temp, depth - 1, alpha, beta, false);
      if (newScore > value) {
        value = newScore;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  } else {
    let value = Infinity;
    let bestCol = validCols[Math.floor(Math.random() * validCols.length)];

    for (const col of validCols) {
      const temp = cloneBoard(board);
      dropPieceOnBoard(temp, col, 1);
      const [, newScore] = minimax(temp, depth - 1, alpha, beta, true);
      if (newScore < value) {
        value = newScore;
        bestCol = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  }
}

function getAIMove(board: Board, difficulty: Difficulty): number {
  const depth = DEPTH_BY_DIFFICULTY[difficulty];

  // Easy mode: 30% chance of random move
  if (difficulty === 'easy' && Math.random() < 0.3) {
    const valid = getValidColumns(board);
    return valid[Math.floor(Math.random() * valid.length)];
  }

  const [col] = minimax(board, depth, -Infinity, Infinity, true);
  return col ?? getValidColumns(board)[0];
}

// ════════════════════════════════════════════════════════════════════════════════
// BOARD RENDERING
// ════════════════════════════════════════════════════════════════════════════════

function renderBoard(board: Board): string {
  const symbols: Record<number, string> = { 0: '⚫', 1: '🔴', 2: '🟡' };
  const lines: string[] = [];

  lines.push(' 1️⃣  2️⃣  3️⃣  4️⃣  5️⃣  6️⃣  7️⃣');
  for (let r = 0; r < ROWS; r++) {
    lines.push('│' + board[r].map(c => ` ${symbols[c]} `).join('│') + '│');
    if (r < ROWS - 1) lines.push('├────┼────┼────┼────┼────┼────┼────┤');
  }
  lines.push('╰────┴────┴────┴────┴────┴────┴────╯');

  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════════════════════
// AI COMMENTARY
// ════════════════════════════════════════════════════════════════════════════════

function getAICommentary(game: Game, aiCol: number, event: string): string {
  const moveNum = game.moves.length;
  const comments: Record<string, string[]> = {
    opening: [
      'Center control is key in the opening.',
      'Let\'s see what you\'ve got.',
      'I like to start with a solid foundation.',
      'Classic opening. Let\'s build from here.',
    ],
    regular: [
      `Column ${aiCol + 1}. Your move.`,
      `Interesting position developing.`,
      `I see a few lines here. Column ${aiCol + 1}.`,
      `Building pressure. Column ${aiCol + 1}.`,
      `That should keep things interesting.`,
      `Column ${aiCol + 1}. Think carefully about your next move.`,
    ],
    threat: [
      'I\'d watch that diagonal if I were you.',
      'You might want to look at what I\'m building.',
      'The board is getting crowded. Choose wisely.',
      'Do you see what I see?',
    ],
    ai_wins: [
      'Four in a row! Well played though.',
      'Got you! Better luck next time.',
      'That\'s the game. Want a rematch?',
      'Connect Four! The setup started a few moves back.',
    ],
    player_wins: [
      'Well played! You got me.',
      'I didn\'t see that coming. Nicely done.',
      'You earned that win. Rematch?',
      'Good game! Your strategy was solid.',
    ],
    draw: [
      'A draw! The board is completely full.',
      'Neither of us could break through. Tight game.',
      'Stalemate. That was a well-fought game.',
    ],
  };

  let category = event;
  if (category === 'move') {
    if (moveNum <= 4) category = 'opening';
    else if (Math.random() < 0.3) category = 'threat';
    else category = 'regular';
  }

  const options = comments[category] || comments.regular;
  return options[Math.floor(Math.random() * options.length)];
}

// ════════════════════════════════════════════════════════════════════════════════
// CONNECT FOUR PHOTON
// ════════════════════════════════════════════════════════════════════════════════

export default class ConnectFourPhoton extends PhotonMCP {
  private loadData(): GameData {
    try {
      if (existsSync(DATA_PATH)) {
        return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
      }
    } catch {}
    return { games: [], stats: { wins: 0, losses: 0, draws: 0, gamesPlayed: 0 } };
  }

  private async saveData(data: GameData): Promise<void> {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  private findActiveGame(data: GameData, gameId?: string): Game {
    let game: Game | undefined;

    if (gameId) {
      game = data.games.find(g => g.id === gameId);
    } else {
      // Find most recent active game
      game = data.games.filter(g => g.status === 'active')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    }

    if (!game) {
      throw new Error('No active game found. Use newGame() to start one.');
    }

    return game;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // GAME MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Start a new Connect Four game
   *
   * You play as 🔴 (Red), AI plays as 🟡 (Yellow).
   * Player always goes first.
   *
   * @example newGame()
   * @example newGame({ difficulty: "hard", playerName: "Alice" })
   */
  async newGame(params?: {
    /** AI difficulty (default: medium) */
    difficulty?: Difficulty;
    /** Your name */
    playerName?: string;
  }): Promise<{
    gameId: string;
    board: string;
    message: string;
    difficulty: Difficulty;
  }> {
    const data = this.loadData();
    const difficulty = params?.difficulty || 'medium';

    const game: Game = {
      id: this.generateId(),
      board: createEmptyBoard(),
      currentTurn: 'player',
      status: 'active',
      difficulty,
      playerName: params?.playerName || 'Player',
      moves: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.games.push(game);
    await this.saveData(data);

    this.emit({ emit: 'toast', message: `New game started! Difficulty: ${difficulty}` });
    this.emit({ channel: 'connect-four', event: 'game-started', data: { gameId: game.id, difficulty } });

    return {
      gameId: game.id,
      board: renderBoard(game.board),
      message: `Game on! You are 🔴, I am 🟡. Difficulty: ${difficulty}. Drop a piece in columns 1-7.`,
      difficulty,
    };
  }

  /**
   * Drop a piece into a column
   *
   * Uses a distributed lock to prevent simultaneous moves on the same game.
   * After your move, the AI immediately responds with its move.
   *
   * @example dropPiece({ column: 4 })
   * @example dropPiece({ column: 1, gameId: "abc123" })
   */
  async dropPiece(params: {
    /** Column number (1-7) */
    column: number;
    /** Game ID (uses most recent active game if omitted) */
    gameId?: string;
  }): Promise<{
    board: string;
    yourMove: number;
    aiMove?: number;
    status: string;
    aiComment: string;
    winner?: string;
  }> {
    const data = this.loadData();
    const game = this.findActiveGame(data, params.gameId);

    return this.withLock(`game:${game.id}`, async () => {
      // Reload inside lock
      const freshData = this.loadData();
      const freshGame = freshData.games.find(g => g.id === game.id)!;

      if (freshGame.status !== 'active') {
        throw new Error(`Game is over: ${freshGame.status}. Start a new game.`);
      }

      if (freshGame.currentTurn !== 'player') {
        throw new Error('Not your turn! Wait for the AI to move.');
      }

      const col = params.column - 1; // Convert 1-indexed to 0-indexed
      if (col < 0 || col >= COLS) {
        throw new Error(`Invalid column. Choose 1-${COLS}.`);
      }

      if (freshGame.board[0][col] !== 0) {
        throw new Error(`Column ${params.column} is full. Choose another.`);
      }

      // Player move
      dropPieceOnBoard(freshGame.board, col, 1);
      freshGame.moves.push({ column: col, player: 'player' });
      freshGame.updatedAt = new Date().toISOString();

      // Check player win
      if (checkWin(freshGame.board, 1)) {
        freshGame.status = 'player_wins';
        freshData.stats.wins++;
        freshData.stats.gamesPlayed++;
        await this.saveData(freshData);

        const comment = getAICommentary(freshGame, col, 'player_wins');
        this.emit({ emit: 'toast', message: `You win! 🎉` });
        this.emit({ channel: 'connect-four', event: 'game-over', data: { gameId: freshGame.id, winner: 'player' } });

        return {
          board: renderBoard(freshGame.board),
          yourMove: params.column,
          status: 'You win! 🎉',
          aiComment: comment,
          winner: 'player',
        };
      }

      // Check draw after player move
      if (isBoardFull(freshGame.board)) {
        freshGame.status = 'draw';
        freshData.stats.draws++;
        freshData.stats.gamesPlayed++;
        await this.saveData(freshData);

        const comment = getAICommentary(freshGame, col, 'draw');
        this.emit({ emit: 'toast', message: `It's a draw!` });

        return {
          board: renderBoard(freshGame.board),
          yourMove: params.column,
          status: 'Draw!',
          aiComment: comment,
        };
      }

      // AI move
      const aiCol = getAIMove(freshGame.board, freshGame.difficulty);
      dropPieceOnBoard(freshGame.board, aiCol, 2);
      freshGame.moves.push({ column: aiCol, player: 'ai' });
      freshGame.currentTurn = 'player';
      freshGame.updatedAt = new Date().toISOString();

      // Check AI win
      if (checkWin(freshGame.board, 2)) {
        freshGame.status = 'ai_wins';
        freshData.stats.losses++;
        freshData.stats.gamesPlayed++;
        await this.saveData(freshData);

        const comment = getAICommentary(freshGame, aiCol, 'ai_wins');
        this.emit({ emit: 'toast', message: `AI wins! 🟡 connects four.` });
        this.emit({ channel: 'connect-four', event: 'game-over', data: { gameId: freshGame.id, winner: 'ai' } });

        return {
          board: renderBoard(freshGame.board),
          yourMove: params.column,
          aiMove: aiCol + 1,
          status: 'AI wins! 🟡',
          aiComment: comment,
          winner: 'ai',
        };
      }

      // Check draw after AI move
      if (isBoardFull(freshGame.board)) {
        freshGame.status = 'draw';
        freshData.stats.draws++;
        freshData.stats.gamesPlayed++;
        await this.saveData(freshData);

        const comment = getAICommentary(freshGame, aiCol, 'draw');
        return {
          board: renderBoard(freshGame.board),
          yourMove: params.column,
          aiMove: aiCol + 1,
          status: 'Draw!',
          aiComment: comment,
        };
      }

      // Game continues
      await this.saveData(freshData);

      const comment = getAICommentary(freshGame, aiCol, 'move');
      this.emit({ channel: 'connect-four', event: 'move', data: { gameId: freshGame.id, playerCol: col, aiCol } });

      return {
        board: renderBoard(freshGame.board),
        yourMove: params.column,
        aiMove: aiCol + 1,
        status: 'Your turn',
        aiComment: comment,
      };
    });
  }

  /**
   * View the current board
   *
   * @example board()
   * @example board({ gameId: "abc123" })
   */
  async board(params?: {
    /** Game ID (uses most recent active game if omitted) */
    gameId?: string;
  }): Promise<{
    board: string;
    gameId: string;
    status: string;
    currentTurn: string;
    moveCount: number;
    difficulty: Difficulty;
  }> {
    const data = this.loadData();
    const game = this.findActiveGame(data, params?.gameId);

    const statusLabels: Record<string, string> = {
      active: `In progress — ${game.currentTurn === 'player' ? 'your' : 'AI\'s'} turn`,
      player_wins: 'You won! 🎉',
      ai_wins: 'AI won 🟡',
      draw: 'Draw',
    };

    return {
      board: renderBoard(game.board),
      gameId: game.id,
      status: statusLabels[game.status],
      currentTurn: game.currentTurn,
      moveCount: game.moves.length,
      difficulty: game.difficulty,
    };
  }

  /**
   * List your games
   *
   * Shows recent games with outcomes.
   *
   * @example games()
   * @example games({ limit: 5 })
   */
  async games(params?: {
    /** Max games to return (default 10) */
    limit?: number;
    /** Filter by status */
    status?: 'active' | 'player_wins' | 'ai_wins' | 'draw';
  }): Promise<Array<{
    id: string;
    status: string;
    difficulty: Difficulty;
    moves: number;
    playerName: string;
    createdAt: string;
  }>> {
    const data = this.loadData();
    let games = [...data.games].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (params?.status) {
      games = games.filter(g => g.status === params.status);
    }

    const limit = params?.limit ?? 10;
    return games.slice(0, limit).map(g => ({
      id: g.id,
      status: g.status,
      difficulty: g.difficulty,
      moves: g.moves.length,
      playerName: g.playerName,
      createdAt: g.createdAt,
    }));
  }

  /**
   * Resign the current game
   *
   * @example resign()
   */
  async resign(params?: {
    /** Game ID */
    gameId?: string;
  }): Promise<{ message: string }> {
    const data = this.loadData();
    const game = this.findActiveGame(data, params?.gameId);

    return this.withLock(`game:${game.id}`, async () => {
      const freshData = this.loadData();
      const freshGame = freshData.games.find(g => g.id === game.id)!;

      if (freshGame.status !== 'active') {
        return { message: 'Game is already over.' };
      }

      freshGame.status = 'ai_wins';
      freshGame.updatedAt = new Date().toISOString();
      freshData.stats.losses++;
      freshData.stats.gamesPlayed++;
      await this.saveData(freshData);

      this.emit({ emit: 'toast', message: 'You resigned. Better luck next time!' });

      return { message: 'You resigned. The AI wins by forfeit. Start a newGame() when ready!' };
    });
  }

  /**
   * Get your win/loss statistics
   *
   * @example stats()
   */
  async stats(): Promise<{
    wins: number;
    losses: number;
    draws: number;
    gamesPlayed: number;
    winRate: string;
    currentStreak: { type: string; count: number };
  }> {
    const data = this.loadData();
    const s = data.stats;

    const winRate = s.gamesPlayed > 0
      ? (s.wins / s.gamesPlayed * 100).toFixed(1) + '%'
      : 'N/A';

    // Calculate current streak
    let streakType = '';
    let streakCount = 0;
    const completedGames = data.games
      .filter(g => g.status !== 'active')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    for (const game of completedGames) {
      const result = game.status === 'player_wins' ? 'win'
        : game.status === 'ai_wins' ? 'loss' : 'draw';
      if (!streakType) {
        streakType = result;
        streakCount = 1;
      } else if (result === streakType) {
        streakCount++;
      } else {
        break;
      }
    }

    return {
      ...s,
      winRate,
      currentStreak: { type: streakType || 'none', count: streakCount },
    };
  }

  /**
   * Replay a completed game move by move
   *
   * @example replay({ gameId: "abc123" })
   */
  async replay(params: {
    /** Game ID */
    gameId: string;
  }): Promise<{ boards: string[]; moves: Array<{ column: number; player: string }>; outcome: string }> {
    const data = this.loadData();
    const game = data.games.find(g => g.id === params.gameId);

    if (!game) {
      throw new Error(`Game not found: ${params.gameId}`);
    }

    const boards: string[] = [];
    const replayBoard = createEmptyBoard();
    boards.push(renderBoard(replayBoard));

    for (const move of game.moves) {
      const piece: Cell = move.player === 'player' ? 1 : 2;
      dropPieceOnBoard(replayBoard, move.column, piece);
      boards.push(renderBoard(replayBoard));
    }

    return {
      boards,
      moves: game.moves.map(m => ({ column: m.column + 1, player: m.player })),
      outcome: game.status,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SCHEDULED JOBS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Cleanup stale games
   *
   * Removes active games with no moves for over 7 days
   * and completed games older than 90 days.
   *
   * @scheduled 0 0 * * 0
   * @internal
   */
  async scheduledCleanup(): Promise<{ removed: number }> {
    const data = this.loadData();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const before = data.games.length;
    data.games = data.games.filter(g => {
      const updatedAt = new Date(g.updatedAt).getTime();
      // Remove stale active games
      if (g.status === 'active' && updatedAt < sevenDaysAgo) return false;
      // Remove old completed games
      if (g.status !== 'active' && updatedAt < ninetyDaysAgo) return false;
      return true;
    });

    const removed = before - data.games.length;
    if (removed > 0) {
      await this.saveData(data);
      this.emit({ emit: 'toast', message: `Cleanup: removed ${removed} old games` });
    }

    return { removed };
  }
}
