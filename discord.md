# Discord

Send messages and manage Discord via webhooks Like n8n's Discord node - notifications, alerts, and automation

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`DISCORD_WEBHOOKURL`** [REQUIRED]
  - Type: string
  - Description: No description available
  






## 🔧 Tools

This photon provides **6** tools:


### `send`

Send a simple text message


**Parameters:**


- **`content`** (any) - Message content (max 2000 chars)

- **`username`** (any) - Override the webhook's default username

- **`avatarUrl`** (any) - Override the webhook's default avatar





---


### `embed`

Send a rich embed message


**Parameters:**


- **`title`** (any) - Embed title

- **`description`** (any) - Embed description

- **`color`** (any) - Color as hex string (e.g., "#FF0000") or decimal

- **`fields`** (any) - Array of {name, value, inline} objects

- **`footer`** (any) - Footer text

- **`thumbnail`** (any) - Thumbnail URL

- **`image`** (any) - Image URL

- **`url`** (any) - URL to link the title to





---


### `alert`

Send an alert notification (pre-styled embed)


**Parameters:**


- **`level`** (any) - Alert level: info, success, warning, error

- **`title`** (any) - Alert title

- **`message`** (any) - Alert message

- **`details`** (any) - Optional additional details





---


### `deployment`

Send a deployment notification


**Parameters:**


- **`app`** (any) - Application name

- **`version`** (any) - Version deployed

- **`environment`** (any) - Deployment environment

- **`status`** (any) - Deployment status

- **`url`** (any) - Optional URL to the deployment

- **`author`** (any) - Who triggered the deployment





---


### `commits`

Send a GitHub-style commit notification


**Parameters:**


- **`repo`** (any) - Repository name

- **`branch`** (any) - Branch name

- **`commits`** (any) - Array of {message, author, sha, url}

- **`compareUrl`** (any) - URL to compare changes





---


### `metrics`

Send a monitoring/metrics notification


**Parameters:**


- **`title`** (any) - Metric title

- **`metrics`** (any) - Array of {label, value, unit} objects

- **`status`** (any) - Overall status





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
photon mcp ./discord.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp discord.photon.ts ~/.photon/

# Run by name
photon mcp discord
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp discord --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.4.1
