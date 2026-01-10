# Uptime Monitor

Uptime Monitor Workflow Monitors website availability and sends alerts

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **3** tools:


### `check`

Check multiple URLs and alert on failures


**Parameters:**


- **`urls`** (any) - URLs to monitor

- **`channel`** (any) - Slack channel for alerts

- **`timeout`** (any) - Request timeout in ms





---


### `setup`

Interactive setup to configure monitoring





---


### `stats`

Get uptime statistics from historical data





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
photon mcp ./uptime-monitor.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp uptime-monitor.photon.ts ~/.photon/

# Run by name
photon mcp uptime-monitor
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp uptime-monitor --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.4.1
