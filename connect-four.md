# Connect Four

Play against AI with distributed locks Classic Connect Four game where you drop discs into columns trying to get four in a row. The AI opponent uses minimax with alpha-beta pruning to play strategically. Distributed locks ensure no two moves happen simultaneously - critical when multiple clients connect to the same game.

> **7 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator` `custom-ui` `stateful` `channels`

## ⚙️ Configuration

No configuration required.



## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `main` ⚡ | Open the Connect Four board |
| `drop` | Drop a piece into a column. |
| `board` | View the current board |
| `games` | List your games. |
| `resign` | Resign the current game |
| `stats` | Get your win/loss statistics |
| `replay` | Replay a completed game move by move |


## 🔧 Tools


### `main` ⚡

Open the Connect Four board





---


### `drop`

Drop a piece into a column. Uses a distributed lock to prevent simultaneous moves on the same game. In builtin mode: places your piece, then the built-in AI auto-responds. In MCP mode: places the current player's piece (player or AI) and switches turns. The MCP client calls this on its turn to play as 🟡.




**Example:**

```typescript
drop({ column: 4 })
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

List your games. Shows recent games with outcomes.




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





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph connect_four["📦 Connect Four"]
        direction TB
        PHOTON((🎯))
        T0[🌊 main (stream)]
        PHOTON --> T0
        T1[🗑️ drop]
        PHOTON --> T1
        T2[🔧 board]
        PHOTON --> T2
        T3[🔧 games]
        PHOTON --> T3
        T4[🔧 resign]
        PHOTON --> T4
        T5[🔧 stats]
        PHOTON --> T5
        T6[🔧 replay]
        PHOTON --> T6
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add connect-four

# Get MCP config for your client
photon info connect-four --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
