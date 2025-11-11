# Slack

Send messages and manage Slack workspace

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`SLACK_TOKEN`** [REQUIRED]
  - Type: string
  - Description: Slack Bot Token (required, starts with xoxb-)
  





### Setup Instructions

- token: Slack Bot Token (required, starts with xoxb-)
Dependencies are auto-installed on first run.


## 🔧 Tools

This photon provides **7** tools:


### `post`

Post a message to a channel or user


**Parameters:**


- **`channel`** (any) [min: 1] - Channel name or ID (e.g., `#general`)

- **`text`** (any) [min: 1] - Message text (e.g., `Hello team!`)

- **`thread_ts`** (any, optional) - Thread timestamp to reply to

- **`blocks`** (any) - Rich message blocks (optional, JSON string)





---


### `channels`

List all channels in the workspace


**Parameters:**


- **`types`** (any) - Channel types (e.g., `public_channel`)

- **`limit`** (any, optional) [min: 1, max: 1000] - Maximum number of channels to return





---


### `channel`

Get channel information


**Parameters:**


- **`channel`** (any) [min: 1] - Channel name or ID (e.g., `#general`)





---


### `history`

Get conversation history from a channel


**Parameters:**


- **`channel`** (any) [min: 1] - Channel name or ID (e.g., `#general`)

- **`limit`** (any, optional) [min: 1, max: 100] - Number of messages to retrieve

- **`oldest`** (any) - Start of time range (Unix timestamp)

- **`latest`** (any) - End of time range (Unix timestamp)





---


### `react`

Add a reaction to a message


**Parameters:**


- **`channel`** (any) [min: 1] - Channel name or ID (e.g., `#general`)

- **`timestamp`** (any) [min: 1] - Message timestamp

- **`name`** (any) [min: 1] - Reaction emoji name (without colons) (e.g., `thumbsup`)





---


### `upload`

Upload a file to a channel


**Parameters:**


- **`channel`** (any) [min: 1] - Channel name or ID (e.g., `#general`)

- **`content`** (any) [min: 1] - File content (text)

- **`filename`** (any) [min: 1] - Filename (e.g., `report.txt`)

- **`title`** (any, optional) - File title

- **`initial_comment`** (any, optional) - Comment to add with the file





---


### `search`

Search for messages in the workspace


**Parameters:**


- **`query`** (any) [min: 1] - Search query (e.g., `deployment`)

- **`count`** (any, optional) [min: 1, max: 100] - Number of results to return

- **`sort`** (any) - Sort order (e.g., `score`)





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
photon mcp ./slack.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp slack.photon.ts ~/.photon/

# Run by name
photon mcp slack
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp slack --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@slack/web-api@^7.0.0
```


## 📄 License

MIT • Version 1.0.0
