# Integration Demo

Integration Demo — Dependencies, Assets, Stateful Workflows

> **5 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator` `custom-ui` `stateful`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `info`

Show photon info, runtime version, and dependency status





---


### `workflow` ⚡

Multi-step stateful workflow with checkpoint yields


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `steps` | number | No | Number of processing steps {@default 3} [min: 2, max: 10] |





---


### `status`

Integration demo status resource





---


### `assets`

List discovered assets for this photon





---


### `report`

Render platform details as a markdown report





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph integration_demo["📦 Integration Demo"]
        direction TB
        PHOTON((🎯))
        T0[🔧 info]
        PHOTON --> T0
        T1[🌊 workflow (stream)]
        PHOTON --> T1
        T2[🔧 status]
        PHOTON --> T2
        T3[🔧 assets]
        PHOTON --> T3
        T4[🔧 report]
        PHOTON --> T4
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add integration-demo

# Get MCP config for your client
photon info integration-demo --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
