# Daemon Features

Scheduled Jobs, Webhooks, Locks, Pub/Sub

> **4 tools** · API Photon · v1.0.0 · MIT

**Platform Features:** `channels`

## ⚙️ Configuration

No configuration required.




## 🔧 Tools


### `critical`

Critical operation with distributed lock





---


### `protect`

Manual distributed locking with this.withLock()





---


### `publish`

Publish a message to a named channel





---


### `status`

Show daemon feature status





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph daemon_features["📦 Daemon Features"]
        direction TB
        PHOTON((🎯))
        T0[🔧 critical]
        PHOTON --> T0
        T1[🔧 protect]
        PHOTON --> T1
        T2[📤 publish]
        PHOTON --> T2
        T3[🔧 status]
        PHOTON --> T3
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add daemon-features

# Get MCP config for your client
photon info daemon-features --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
