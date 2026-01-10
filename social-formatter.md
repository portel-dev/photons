# Social Formatter

Social Media Formatter

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **4** tools:


### `format`

Format markdown content for multiple social media platforms


**Parameters:**


- **`content`** (any) - - Markdown content to format

- **`platforms`** (any, optional) - - Target platforms

- **`includeHashtags`** (any) - - Auto-extract hashtags from content





---


### `formatSingle`

Format content for a single platform





---


### `getPlatforms`

Get platform constraints





---


### `createThread`

Create a thread from long content (for Twitter, Threads, etc.)





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
photon mcp ./social-formatter.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp social-formatter.photon.ts ~/.photon/

# Run by name
photon mcp social-formatter
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp social-formatter --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest
```


## 📄 License

MIT • Version 1.4.1
