# Dashboard

Dashboard Photon

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **5** tools:


### `getOverview`

Get dashboard overview with key metrics  Returns metrics that can be displayed in a card grid UI.





---


### `getTasks`

Get all tasks with filtering options  Returns task list for the task board UI.





---


### `getActivity`

Get recent activity feed  Returns activity stream for the timeline UI.





---


### `addTask`

Add a new task


**Parameters:**


- **`title`** (any) - Task title

- **`priority`** (any) - Task priority





---


### `updateTaskStatus`

Update task status


**Parameters:**


- **`id`** (any) - Task ID

- **`status`** (any) - New status





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

MIT • Version 1.4.1
