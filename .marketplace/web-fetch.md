# web-fetch

Web Fetch - Web content fetching and markdown conversion

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`WEB_FETCH_USER_AGENT`** [OPTIONAL]
  - Type: string
  - Description: Custom User-Agent header (optional, default: "Photon-MCP-Fetch/1.0")
  





### Setup Instructions

- user_agent: Custom User-Agent header (optional, default: "Photon-MCP-Fetch/1.0")
Dependencies are auto-installed on first run.


## 🔧 Tools

This photon provides **2** tools:


### `fetch`

Fetch a URL and convert to markdown


**Parameters:**


- **`url`** (any) - The URL to fetch

- **`max_length`** (any, optional) - Maximum length of returned content

- **`start_index`** (any, optional) - Start index for pagination

- **`raw`** (any, optional) - Return raw HTML instead of markdown





---


### `fetchBatch`

Fetch multiple URLs in parallel


**Parameters:**


- **`urls`** (any) - Array of URLs to fetch

- **`max_length`** (any, optional) - Maximum length per URL





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
photon ./web-fetch.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp web-fetch.photon.ts ~/.photon/

# Run by name
photon web-fetch
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon web-fetch --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
turndown@^7.2.0
```


## 📄 License

MIT • Version 1.0.0
