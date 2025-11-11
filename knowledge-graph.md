# Knowledge Graph

Persistent knowledge graph with entities and relations

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`KNOWLEDGE_GRAPH_STORAGE_PATH`** [OPTIONAL]
  - Type: string
  - Description: Path to store knowledge graph JSON (default: ~/.photon/knowledge-graph.json)
  





### Setup Instructions

- storage_path: Path to store knowledge graph JSON (default: ~/.photon/knowledge-graph.json)


## 🔧 Tools

This photon provides **11** tools:


### `entities`

Create new entities with observations


**Parameters:**


- **`entities`** (any) [min: 1] - Array of entities to create (e.g., `[{"name":"project-api","entityType":"project","observations":["80% complete"]}]`)





---


### `relations`

Create relations between entities


**Parameters:**


- **`relations`** (any) [min: 1] - Array of relations (e.g., `[{"from":"user","to":"project-api","relationType":"working_on"}]`)





---


### `observe`

Add observations to an entity


**Parameters:**


- **`entityName`** (any) [min: 1] - Entity name (e.g., `project-api`)

- **`observations`** (any) [min: 1] - Array of observation strings (e.g., `["deployed to staging"]`)





---


### `removeEntities`

Delete entities and their relations


**Parameters:**


- **`entityNames`** (any) [min: 1] - Array of entity names to delete (e.g., `["old-project","archived-task"]`)





---


### `removeObservations`

Delete specific observations from an entity


**Parameters:**


- **`entityName`** (any) [min: 1] - Entity name

- **`observations`** (any) [min: 1] - Array of observations to delete (exact match)





---


### `removeRelations`

Delete relations


**Parameters:**


- **`relations`** (any) [min: 1] - Array of relations to delete





---


### `graph`

Read the entire knowledge graph





---


### `search`

Search for entities matching a query


**Parameters:**


- **`query`** (any) [min: 1] - Search query (searches names, types, and observations) (e.g., `TypeScript`)





---


### `nodes`

Open specific entities by name with their relations


**Parameters:**


- **`names`** (any) [min: 1] - Array of entity names to retrieve (e.g., `["user","project-api"]`)





---


### `clear`

Clear the entire knowledge graph





---


### `export`

Export knowledge graph in various formats


**Parameters:**


- **`format`** (any) - Export format (e.g., `json`)

- **`path`** (any) - Optional file path to save the export (e.g., `~/exports/graph.json`)





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
photon mcp ./knowledge-graph.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp knowledge-graph.photon.ts ~/.photon/

# Run by name
photon mcp knowledge-graph
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp knowledge-graph --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.0.0
