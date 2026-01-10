# Github Pr Notifier

GitHub PR Notifier Workflow Monitors GitHub PRs and sends notifications to Slack

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

Monitor a repository for new PRs and notify Slack


**Parameters:**


- **`owner`** (any) - Repository owner

- **`repo`** (any) - Repository name

- **`channel`** (any) - Slack channel to notify

- **`labels`** (any) - Optional: only notify for PRs with these labels





---


### `summary`

Get a summary of open PRs across multiple repos


**Parameters:**


- **`repos`** (any) - Array of owner/repo strings





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
photon mcp ./github-pr-notifier.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp github-pr-notifier.photon.ts ~/.photon/

# Run by name
photon mcp github-pr-notifier
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp github-pr-notifier --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.4.1
