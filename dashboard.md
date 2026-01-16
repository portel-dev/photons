# Dashboard

Dashboard Photon

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **6** tools:


### `overview`

Dashboard overview with key metrics  Returns metrics that can be displayed in a card grid UI.





---


### `main`

Dashboard main view - Task management





---


### `activity`

Recent activity feed  Returns activity stream for the timeline UI.





---


### `add`

Add a new task


**Parameters:**


- **`title`** (any) - Task title

- **`priority`** (any) - Task priority





---


### `update`

Update task status


**Parameters:**


- **`id`** (any) - Task ID

- **`status`** (any) - New status





---


### `delete`

Delete a task


**Parameters:**


- **`id`** (any) - Task ID to delete





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
photon mcp ./dashboard.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp dashboard.photon.ts ~/.photon/

# Run by name
photon mcp dashboard
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp dashboard --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest
```


## 📄 License

MIT • Version 1.0.0
