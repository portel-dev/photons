# Integration Demo

Integration Demo — Dependencies, Assets, Stateful Workflows

> **10 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator` `custom-ui` `stateful`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `info`

Show photon info, runtime version, and dependency status  Returns structured data about this photon's configuration, runtime compatibility, and available dependencies.





---


### `workflow` ⚡

A multi-step stateful workflow with checkpoint yields  Each checkpoint persists state to disk so the workflow can resume after interruption. Steps simulate a data processing pipeline.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | any | Yes | Input data to process |
| `steps` | any | Yes | Number of processing steps {@default 3} [min: 2, max: 10] |





---


### `status`

Integration demo status resource  Exposes a readable MCP resource with the current photon status.





---


### `assets`

List discovered assets for this photon  Returns information about the asset folder and its contents. The runtime auto-discovers the `integration-demo/` folder parallel to this `.photon.ts` file.





---


### `report`

Render platform details as a markdown report





---


### `testVersionInfo`

Verify info returns valid structure





---


### `testWorkflowSteps`

Verify workflow generator yields checkpoints and completes





---


### `testAssetDiscovery`

Verify asset folder structure





---


### `testResourceMethod`

Verify resource method returns valid data





---


### `testMarkdownReport`

Verify report returns markdown





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
        T5[✅ testVersionInfo]
        PHOTON --> T5
        T6[✅ testWorkflowSteps]
        PHOTON --> T6
        T7[✅ testAssetDiscovery]
        PHOTON --> T7
        T8[✅ testResourceMethod]
        PHOTON --> T8
        T9[✅ testMarkdownReport]
        PHOTON --> T9
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add integration-demo

# Get MCP config for your client
photon get integration-demo --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
