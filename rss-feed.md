# RSS Feed

Read and parse RSS/Atom feeds Like n8n's RSS Read node - monitor blogs, news, and content feeds

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **5** tools:


### `read`

Read and parse an RSS/Atom feed


**Parameters:**


- **`url`** (any) - Feed URL to parse

- **`limit`** (any, optional) - Maximum number of items to return





---


### `getNew`

Get new items since a specific date


**Parameters:**


- **`url`** (any) - Feed URL

- **`since`** (any) - ISO date string - only return items newer than this





---


### `search`

Search feed items by keyword


**Parameters:**


- **`url`** (any) - Feed URL

- **`query`** (any) - Search query (searches title and description)

- **`limit`** (any) - Maximum results





---


### `readMultiple`

Monitor multiple feeds at once


**Parameters:**


- **`urls`** (any) - Array of feed URLs

- **`limit`** (any) - Items per feed





---


### `info`

Get feed metadata without items


**Parameters:**


- **`url`** (any) - Feed URL





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
photon mcp ./rss-feed.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp rss-feed.photon.ts ~/.photon/

# Run by name
photon mcp rss-feed
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp rss-feed --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.4.1
