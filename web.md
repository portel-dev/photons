# Web

Web Agent Photon (Search + Read)

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **2** tools:


### `search`

Search the web using DuckDuckGo.





---


### `read`

Read a webpage and extract its main content as Markdown. Uses Mozilla Readability to remove ads/navbars.





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
photon mcp ./web.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp web.photon.ts ~/.photon/

# Run by name
photon mcp web
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp web --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
axios@^1.6.0, cheerio@^1.0.0, turndown@^7.1.2, @mozilla/readability@^0.5.0, jsdom@^23.0.0, js-yaml@^4.1.0
```


## 📄 License

MIT • Version 1.0.0
