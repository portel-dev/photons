# Tasks Basic

Basic Task List — stateless, in-memory A simple todo list that works during a session but loses state on restart. Compare with tasks-live to see what @stateful adds.

> **4 tools** · API Photon · v1.8.4 · MIT

**Platform Features:** `stateful`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `list`

No description available





---


### `add`

No description available





---


### `complete`

No description available





---


### `clean`

No description available





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph tasks_basic["📦 Tasks Basic"]
        direction TB
        PHOTON((🎯))
        T0[📖 list]
        PHOTON --> T0
        T1[✏️ add]
        PHOTON --> T1
        T2[🔧 complete]
        PHOTON --> T2
        T3[🔧 clean]
        PHOTON --> T3
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add tasks-basic

# Get MCP config for your client
photon info tasks-basic --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.8.4
