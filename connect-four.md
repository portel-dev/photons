# Connect Four

Play against AI with distributed locks

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **8** tools:


### `newGame`

Start a new Connect Four game  You play as 🔴 (Red), AI plays as 🟡 (Yellow). Player always goes first.




**Example:**

```typescript
newGame()
```


---


### `dropPiece`

Drop a piece into a column  Uses a distributed lock to prevent simultaneous moves on the same game. After your move, the AI immediately responds with its move.




**Example:**

```typescript
dropPiece({ column: 4 })
```


---


### `board`

View the current board




**Example:**

```typescript
board()
```


---


### `games`

List your games  Shows recent games with outcomes.




**Example:**

```typescript
games()
```


---


### `resign`

Resign the current game





---


### `stats`

Get your win/loss statistics





---


### `replay`

Replay a completed game move by move





---


### `scheduledCleanup`

Cleanup stale games  Removes active games with no moves for over 7 days and completed games older than 90 days.





---





## 📥 Usage

### Install Photon CLI

```bash
npm install -g @portel/photon
```

### Run This Photon

**Option 1: Run directly from file**

```bash
# Clone/download the photon file
photon mcp ./connect-four.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp connect-four.photon.ts ~/.photon/

# Run by name
photon mcp connect-four
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp connect-four --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest
```


## 📄 License

MIT • Version 1.0.0
