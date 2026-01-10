# Preferences

Preferences Photon

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **7** tools:


### `getPreferences`

Get current user preferences





---


### `getPreference`

Get a specific preference value


**Parameters:**


- **`key`** (any) - - The preference key to retrieve





---


### `editSettings`

Open the settings UI for editing preferences  Shows the settings form UI and handles user input. Demonstrates EmitUI yield type for MCP Apps.





---


### `previewTheme`

Preview a theme before applying  Shows an inline preview of the selected theme.





---


### `resetToDefaults`

Reset preferences to defaults  Loads defaults from the resources/defaults.json asset.





---


### `importPreferences`

Import preferences from JSON


**Parameters:**


- **`preferences`** (any) - - JSON object with preference values





---


### `exportPreferences`

Export current preferences as JSON





---





## 📥 Usage

### Install Photon CLI

```bash
npm install -g @portel/photon
```

### Run This Photon

**Option 1: Run directly from file**

```bash
# Clone/download the photon file
photon mcp ./preferences.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp preferences.photon.ts ~/.photon/

# Run by name
photon mcp preferences
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp preferences --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest
```


## 📄 License

MIT • Version 1.4.1
