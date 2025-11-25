# Fetch

Web content fetching and markdown conversion

## 📋 Overview

**Version:** 1.2.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`FETCH_USER_AGENT`** [OPTIONAL]
  - Type: string
  - Description: Custom User-Agent header (optional, default: "Photon-MCP-Fetch/1.0")
  





### Setup Instructions

- user_agent: Custom User-Agent header (optional, default: "Photon-MCP-Fetch/1.0")
Dependencies are auto-installed on first run.


## 🔧 Tools

This photon provides **2** tools:


### `url`

Fetch a URL and convert to markdown


**Parameters:**


- **`url`** (any) [min: 1, max: 2000, format: uri] - The URL to fetch (e.g., `https://example.com`)

- **`max_length`** (any, optional) [min: 1, max: 50000] - Maximum length of returned content

- **`start_index`** (any, optional) [min: 0] - Start index for pagination

- **`raw`** (any, optional) - Return raw HTML instead of markdown

- **`readability`** (any, optional) - Extract main content using Readability





---


### `batch`

Fetch multiple URLs in parallel and join them


**Parameters:**


- **`urls`** (any) [min: 1, max: 10] - Array of URLs to fetch (e.g., `["https://example.com","https://example.org"]`)

- **`max_length`** (any, optional) [min: 1, max: 50000] - Maximum length per URL

- **`readability`** (any, optional) - Extract main content using Readability





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
photon mcp ./fetch.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp fetch.photon.ts ~/.photon/

# Run by name
photon mcp fetch
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp fetch --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
turndown@^7.2.0, @mozilla/readability@^0.5.0, jsdom@^25.0.0, js-yaml@^4.1.0
```


## 📄 License

MIT • Version 1.2.0
