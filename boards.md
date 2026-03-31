# Boards

Modern Kanban Boards Photon Task management for humans and AI. Use named instances (`_use('project-name')`) for per-project boards. Perfect for project planning, AI working memory across sessions, and human-AI collaboration on shared tasks.

> **19 tools** · Streaming Photon · v2.0.0 · MIT

**Platform Features:** `generator` `custom-ui` `stateful` `channels`

## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `BOARDS_TASKS` | No | Task[] | No description available (default: ``) |
| `BOARDS_COLUMNS` | No | string[] | No description available (default: `...DEFAULT_COLUMNS`) |
| `BOARDS_CONFIG` | No | BoardConfig | No description available (default: `[object Object]`) |




## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `main` ⚡ | Open the Kanban board. |
| `board` | Get the current board state |
| `stats` | Get board statistics |
| `settings` | Board settings |
| `list` | Get all tasks, optionally filtered |
| `mine` | Get tasks assigned to AI |
| `add` | Create a new task |
| `move` | Move a task to a different column |
| `reorder` | Reorder a task |
| `drop` | Delete a task |
| `edit` | Update a task's details |
| `search` | Search tasks by keyword |
| `comment` | Add a comment to a task |
| `show` | Get a task with full details including comments |
| `column` | Add or remove a column |
| `clear` | Clear completed tasks (archive them) |
| `sweep` | Batch move tasks |
| `block` | Set task dependencies |
| `comments` | Get comments for a task |


## 🔧 Tools


### `main` ⚡

Open the Kanban board. Visual drag-and-drop board for managing tasks. Both humans and AI can interact with this board - humans through the UI, AI through MCP methods. ## AI Workflow (IMPORTANT). When working on tasks as an AI assistant: 1. **Check assigned tasks**: Use `mine` to find tasks assigned to you 2. **Work in "In Progress"**: Tasks you're actively working on should be here 3. **Move to "Review" when done**: Do NOT move directly to "Done"! - "Review" means: AI finished, waiting for human verification - Only humans should move tasks from "Review" to "Done" 4. **Add comments**: Document what you did for the reviewer. This keeps humans in the loop and ensures quality control.





---


### `board`

Get the current board state





---


### `stats`

Get board statistics





---


### `settings`

Board settings





---


### `list`

Get all tasks, optionally filtered





---


### `mine`

Get tasks assigned to AI





---


### `add`

Create a new task





---


### `move`

Move a task to a different column





---


### `reorder`

Reorder a task





---


### `drop`

Delete a task





---


### `edit`

Update a task's details





---


### `search`

Search tasks by keyword





---


### `comment`

Add a comment to a task





---


### `show`

Get a task with full details including comments





---


### `column`

Add or remove a column





---


### `clear`

Clear completed tasks (archive them)





---


### `sweep`

Batch move tasks





---


### `block`

Set task dependencies





---


### `comments`

Get comments for a task





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph boards["📦 Boards"]
        direction TB
        PHOTON((🎯))
        T0[🌊 main (stream)]
        PHOTON --> T0
        T1[🔧 board]
        PHOTON --> T1
        T2[🔧 stats]
        PHOTON --> T2
        T3[✏️ settings]
        PHOTON --> T3
        T4[📖 list]
        PHOTON --> T4
        T5[🔧 mine]
        PHOTON --> T5
        T6[✏️ add]
        PHOTON --> T6
        T7[🔧 move]
        PHOTON --> T7
        T8[🔧 reorder]
        PHOTON --> T8
        T9[🗑️ drop]
        PHOTON --> T9
        T10[🔄 edit]
        PHOTON --> T10
        T11[📖 search]
        PHOTON --> T11
        T12[🔧 comment]
        PHOTON --> T12
        T13[🔧 show]
        PHOTON --> T13
        T14[🔧 column]
        PHOTON --> T14
        T15[🗑️ clear]
        PHOTON --> T15
        T16[🔧 sweep]
        PHOTON --> T16
        T17[🔧 block]
        PHOTON --> T17
        T18[🔧 comments]
        PHOTON --> T18
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add boards

# Get MCP config for your client
photon info boards --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v2.0.0 · Portel
