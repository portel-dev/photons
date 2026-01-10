# Content Creator

Content Creator Photon

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`CONTENT_CREATOR_PHOTON_APIKEY`** [OPTIONAL]
  - Type: string
  - Description: No description available
  

- **`CONTENT_CREATOR_PHOTON_FORMATTER`** [OPTIONAL]
  - Type: any
  - Description: No description available
  






## 🔧 Tools

This photon provides **4** tools:


### `research`

Research a topic by searching the web and summarizing findings


**Parameters:**


- **`topic`** (any) - - Topic to research

- **`depth`** (any, optional) - - How many sources to analyze





---


### `generate`

Generate content from research results


**Parameters:**


- **`research`** (any) - - Research results from research()

- **`style`** (any) - - Content style: 'professional', 'casual', 'technical'

- **`length`** (any) - - Target length: 'short' (tweet), 'medium' (linkedin), 'long' (blog)





---


### `formatContent`

Format generated content for multiple platforms





---


### `createContent`

Complete workflow: Research → Generate → Format  Interactive workflow that guides user through content creation





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
photon mcp ./content-creator.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp content-creator.photon.ts ~/.photon/

# Run by name
photon mcp content-creator
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp content-creator --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest, @anthropic-ai/sdk@latest
```


## 📄 License

MIT • Version 1.4.1
