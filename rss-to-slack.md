# Rss To Slack

RSS to Slack Workflow Monitors RSS feeds and posts new items to Slack

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **2** tools:


### `monitor`

Monitor an RSS feed and post new items to Slack Uses generators to emit progress updates





---


### `setup`

Interactive setup - asks user for configuration





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
photon mcp ./rss-to-slack.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp rss-to-slack.photon.ts ~/.photon/

# Run by name
photon mcp rss-to-slack
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp rss-to-slack --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.4.1
