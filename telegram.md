# Telegram

Send messages via Telegram Bot API Like n8n's Telegram node - notifications and bot automation

## 📋 Overview

**Version:** 1.0.0
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`TELEGRAM_BOTTOKEN`** [REQUIRED]
  - Type: string
  - Description: No description available
  






## 🔧 Tools

This photon provides **12** tools:


### `send`

Send a text message


**Parameters:**


- **`chatId`** (any) - Chat ID or @username

- **`text`** (any) - Message text (supports Markdown or HTML)

- **`parseMode`** (any) - Parse mode: Markdown, MarkdownV2, or HTML

- **`disableNotification`** (any) - Send silently

- **`replyToMessageId`** (any) - Message ID to reply to





---


### `sendPhoto`

Send a photo


**Parameters:**


- **`chatId`** (any) - Chat ID or @username

- **`photo`** (any) - Photo URL or file_id

- **`caption`** (any) - Photo caption

- **`parseMode`** (any) - Parse mode for caption





---


### `sendDocument`

Send a document/file


**Parameters:**


- **`chatId`** (any) - Chat ID or @username

- **`document`** (any) - Document URL or file_id

- **`caption`** (any) - Document caption





---


### `sendLocation`

Send a location


**Parameters:**


- **`chatId`** (any) - Chat ID or @username

- **`latitude`** (any) - Latitude

- **`longitude`** (any) - Longitude





---


### `sendPoll`

Send a poll


**Parameters:**


- **`chatId`** (any) - Chat ID or @username

- **`question`** (any) - Poll question

- **`options`** (any) - Poll options (2-10 options)

- **`isAnonymous`** (any) - Is the poll anonymous

- **`type`** (any) - Poll type: regular or quiz





---


### `alert`

Send a formatted alert message


**Parameters:**


- **`chatId`** (any) - Chat ID

- **`level`** (any) - Alert level

- **`title`** (any) - Alert title

- **`message`** (any) - Alert message

- **`details`** (any) - Additional details





---


### `deployment`

Send a deployment notification


**Parameters:**


- **`chatId`** (any) - Chat ID

- **`app`** (any) - Application name

- **`version`** (any) - Version

- **`environment`** (any) - Environment

- **`status`** (any) - Deployment status

- **`url`** (any) - Deployment URL





---


### `getMe`

Get bot information





---


### `getChat`

Get chat information


**Parameters:**


- **`chatId`** (any) - Chat ID or @username





---


### `getUpdates`

Get recent updates (incoming messages)


**Parameters:**


- **`offset`** (any) - Update offset

- **`limit`** (any) - Maximum updates to return

- **`timeout`** (any) - Long polling timeout in seconds





---


### `deleteMessage`

Delete a message


**Parameters:**


- **`chatId`** (any) - Chat ID

- **`messageId`** (any) - Message ID to delete





---


### `pinMessage`

Pin a message


**Parameters:**


- **`chatId`** (any) - Chat ID

- **`messageId`** (any) - Message ID to pin

- **`disableNotification`** (any) - Don't notify members





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
photon mcp ./telegram.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp telegram.photon.ts ~/.photon/

# Run by name
photon mcp telegram
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp telegram --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.0.0
