# Code Diagram

Generate Mermaid diagrams from TypeScript/JavaScript code

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **3** tools:


### `generate`

Generate a Mermaid diagram from code string


**Parameters:**


- **`code`** (any) - The TypeScript/JavaScript code to analyze

- **`type`** (any, optional) - Diagram type: 'auto' | 'workflow' | 'api' | 'deps' | 'calls'

- **`style`** (any, optional) - Diagram style: 'linear' (quick overview) | 'branching' (shows if/else/switch)

- **`name`** (any, optional) - Optional name for the diagram





---


### `fromFile`

Generate a Mermaid diagram from a file


**Parameters:**


- **`path`** (any) - Path to the TypeScript/JavaScript file

- **`type`** (any, optional) - Diagram type: 'auto' | 'workflow' | 'api' | 'deps' | 'calls'

- **`style`** (any, optional) - Diagram style: 'linear' | 'branching'





---


### `types`

List available diagram types and styles





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
photon mcp ./code-diagram.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp code-diagram.photon.ts ~/.photon/

# Run by name
photon mcp code-diagram
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp code-diagram --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
typescript@^5.0.0
```


## 📄 License

MIT • Version 1.0.0
