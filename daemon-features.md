# Daemon Features

Scheduled Jobs, Webhooks, Locks, Pub/Sub

> **6 tools** · API Photon · v1.0.0 · MIT

**Platform Features:** `channels`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `scheduledHeartbeat`

Heartbeat - writes timestamp to state file every minute





---


### `handleWebhook`

Receive a webhook payload and echo it back with metadata





---


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

Show daemon feature status. Reads the heartbeat state file to show when the scheduled job last ran and how many times it has executed.





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph daemon_features["📦 Daemon Features"]
        direction TB
        PHOTON((🎯))
        T0[🔧 scheduledHeartbeat]
        PHOTON --> T0
        T1[🔧 handleWebhook]
        PHOTON --> T1
        T2[🔧 critical]
        PHOTON --> T2
        T3[🔧 protect]
        PHOTON --> T3
        T4[📤 publish]
        PHOTON --> T4
        T5[🔧 status]
        PHOTON --> T5
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
