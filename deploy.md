# Deploy

Multi-step workflow with checkpoints and approval gates

> **3 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator` `stateful` `channels`

## ⚙️ Configuration

No configuration required.




## 🔧 Tools


### `run` ⚡

Run deployment pipeline Multi-step workflow with checkpoints. Resumable if interrupted.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `app` | string | No | Application name {@default "my-app"} |





---


### `status`

Show last deployment status





---


### `history`

Deployment history


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | any | Yes | Recent deploys to show {@default 10} |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph deploy["📦 Deploy"]
        direction TB
        PHOTON((🎯))
        T0[🌊 run (stream)]
        PHOTON --> T0
        T1[🔧 status]
        PHOTON --> T1
        T2[🔧 history]
        PHOTON --> T2
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add deploy

# Get MCP config for your client
photon info deploy --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
