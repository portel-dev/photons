# Preferences

Preferences Photon

> **7 tools** · Workflow Photon · v1.5.1 · MIT

**Platform Features:** `generator` `custom-ui` `elicitation` `streaming`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `getPreferences`

Get current user preferences





---


### `getPreference`

Get a specific preference value


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | any | Yes | - The preference key to retrieve |





---


### `editSettings` ⚡

Open the settings UI for editing preferences  Shows the settings form UI and handles user input. Demonstrates EmitUI yield type for MCP Apps.





---


### `previewTheme` ⚡

Preview a theme before applying  Shows an inline preview of the selected theme.





---


### `resetToDefaults` ⚡

Reset preferences to defaults  Loads defaults from the resources/defaults.json asset.





---


### `importPreferences`

Import preferences from JSON


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `preferences` | any | Yes | - JSON object with preference values |





---


### `exportPreferences`

Export current preferences as JSON





---





## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph preferences["📦 Preferences"]
        START([▶ Start])
        N0[📢 Opening settings...]
        START --> N0
        N1[📣 ui]
        N0 --> N1
        N2{❓ form}
        N1 --> N2
        N3[🎉 Settings unchanged]
        N2 --> N3
        N4[🎉 Settings saved!]
        N3 --> N4
        N5[📢 Previewing ${params.theme} ...]
        N4 --> N5
        N6[📣 ui]
        N5 --> N6
        N7{🙋 confirm}
        N6 --> N7
        N8([❌ Cancelled])
        N7 -->|No| N8
        N7 -->|Yes| N9
        N9[Continue]
        N10[🎉 Theme applied!]
        N9 --> N10
        N11{🙋 confirm}
        N10 --> N11
        N12([❌ Cancelled])
        N11 -->|No| N12
        N11 -->|Yes| N13
        N13[Continue]
        N14[🎉 Reset cancelled]
        N13 --> N14
        N15[⏳ progress]
        N14 --> N15
        N16[⏳ progress]
        N15 --> N16
        N17[🎉 Preferences reset to defaults]
        N16 --> N17
        SUCCESS([✅ Success])
        N17 --> SUCCESS
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add preferences

# Get MCP config for your client
photon get preferences --mcp
```

## 📦 Dependencies


```
@portel/photon-core@latest
```

---

MIT · v1.5.1 · Portel
