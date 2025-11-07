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


- **`channel`** (any) - Channel name (e.g., "#general") or channel ID

- **`text`** (any) - Message text

- **`thread_ts`** (any, optional) - Thread timestamp to reply to

- **`blocks`** (any) - Rich message blocks (optional, JSON string)





---


### `channels`

List all channels in the workspace


**Parameters:**


- **`types`** (any, optional) - Channel types: public_channel, private_channel, mpim, im

- **`limit`** (any, optional) - Maximum number of channels to return





---


### `channel`

Get channel information


**Parameters:**


- **`channel`** (any) - Channel name (e.g., "#general") or channel ID





---


### `history`

Get conversation history from a channel


**Parameters:**


- **`channel`** (any) - Channel name (e.g., "#general") or channel ID

- **`limit`** (any, optional) - Number of messages to retrieve

- **`oldest`** (any) - Start of time range (Unix timestamp)

- **`latest`** (any) - End of time range (Unix timestamp)





---


### `react`

Add a reaction to a message


**Parameters:**


- **`channel`** (any) - Channel name (e.g., "#general") or channel ID

- **`timestamp`** (any) - Message timestamp

- **`name`** (any) - Reaction emoji name (without colons, e.g., "thumbsup")





---


### `upload`

Upload a file to a channel


**Parameters:**


- **`channel`** (any) - Channel name (e.g., "#general") or channel ID

- **`content`** (any) - File content (text)

- **`filename`** (any) - Filename

- **`title`** (any, optional) - File title

- **`initial_comment`** (any, optional) - Comment to add with the file





---


### `search`

Search for messages in the workspace


**Parameters:**


- **`query`** (any) - Search query

- **`count`** (any, optional) - Number of results to return

- **`sort`** (any, optional) - Sort order: score or timestamp





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
