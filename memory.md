# Memory

Knowledge graph-based persistent memory

## 📋 Overview

**Version:** 1.1.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`MEMORY_STORAGE_PATH`** [OPTIONAL]
  - Type: string
  - Description: Path to store knowledge graph JSON (default: ~/.photon/memory.json)
  





### Setup Instructions

- storage_path: Path to store knowledge graph JSON (default: ~/.photon/memory.json)


## 🔧 Tools

This photon provides **10** tools:


### `createEntities`

Create new entities with observations


**Parameters:**


- **`entities`** (any) - Array of entities with name, type, and observations





---


### `createRelations`

Create relations between entities


**Parameters:**


- **`relations`** (any) - Array of relations with from, to, and type





---


### `addObservations`

Add observations to an entity


**Parameters:**


- **`entityName`** (any) - Entity name

- **`observations`** (any) - Array of observation strings





---


### `deleteEntities`

Delete entities and their relations


**Parameters:**


- **`entityNames`** (any) - Array of entity names to delete





---


### `deleteObservations`

Delete specific observations from an entity


**Parameters:**


- **`entityName`** (any) - Entity name

- **`observations`** (any) - Array of observations to delete (exact match)





---


### `deleteRelations`

Delete relations


**Parameters:**


- **`relations`** (any) - Array of relations to delete





---


### `readGraph`

Read the entire knowledge graph





---


### `searchNodes`

Search for entities matching a query


**Parameters:**


- **`query`** (any) - Search query (searches names, types, and observations)





---


### `openNodes`

Open specific entities by name with their relations


**Parameters:**


- **`names`** (any) - Array of entity names to retrieve





---


### `clearGraph`

Clear the entire knowledge graph





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
photon mcp ./memory.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp memory.photon.ts ~/.photon/

# Run by name
photon mcp memory
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp memory --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.1.0
