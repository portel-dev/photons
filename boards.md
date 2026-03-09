# Boards

Modern Kanban Boards Photon Task management for humans and AI. Use named instances (`_use('project-name')`) for per-project boards. Perfect for project planning, AI working memory across sessions, and human-AI collaboration on shared tasks.

> **1 tools** · Streaming Photon · v2.0.0 · MIT

**Platform Features:** `generator` `custom-ui` `stateful` `channels`

## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `BOARDS_TASKS` | No | Task[] | No description available |
| `BOARDS_COLUMNS` | No | string[] | No description available |
| `BOARDS_CONFIG` | No | BoardConfig | No description available |





## 🔧 Tools


### `main` ⚡

Open the Kanban board. Visual drag-and-drop board for managing tasks. Both humans and AI can interact with this board - humans through the UI, AI through MCP methods. ## AI Workflow (IMPORTANT). When working on tasks as an AI assistant: 1. **Check assigned tasks**: Use `mine` to find tasks assigned to you 2. **Work in "In Progress"**: Tasks you're actively working on should be here 3. **Move to "Review" when done**: Do NOT move directly to "Done"! - "Review" means: AI finished, waiting for human verification - Only humans should move tasks from "Review" to "Done" 4. **Add comments**: Document what you did for the reviewer. This keeps humans in the loop and ensures quality control.





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph boards["📦 Boards"]
        direction TB
        PHOTON((🎯))
        T0[🌊 main (stream)]
        PHOTON --> T0
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
