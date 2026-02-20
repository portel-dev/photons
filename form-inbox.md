# Form Inbox

Webhook-powered form submission collector

> **8 tools** · API Photon · v1.0.0 · MIT

**Platform Features:** `stateful` `channels`

## ⚙️ Configuration

No configuration required.



## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `forms` | List all forms with submission counts |
| `create` | Create a new form with field definitions |
| `delete` | Delete a form and all its submissions |
| `submissions` | List submissions for a form with pagination |
| `submission` | Get a single submission detail |
| `remove` | Delete a submission |
| `export` | Export submissions as JSON or CSV |
| `stats` | Submission statistics across all forms |


## 🔧 Tools


### `forms`

List all forms with submission counts





---


### `create`

Create a new form with field definitions





---


### `delete`

Delete a form and all its submissions





---


### `submissions`

List submissions for a form with pagination





---


### `submission`

Get a single submission detail





---


### `remove`

Delete a submission





---


### `export`

Export submissions as JSON or CSV





---


### `stats`

Submission statistics across all forms





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph form_inbox["📦 Form Inbox"]
        direction TB
        PHOTON((🎯))
        T0[🔧 forms]
        PHOTON --> T0
        T1[✏️ create]
        PHOTON --> T1
        T2[🗑️ delete]
        PHOTON --> T2
        T3[🔧 submissions]
        PHOTON --> T3
        T4[🔧 submission]
        PHOTON --> T4
        T5[🗑️ remove]
        PHOTON --> T5
        T6[📥 export]
        PHOTON --> T6
        T7[🔧 stats]
        PHOTON --> T7
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add form-inbox

# Get MCP config for your client
photon info form-inbox --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
