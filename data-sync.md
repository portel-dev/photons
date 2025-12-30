# Data Sync

Data Sync Workflow Synchronizes data between different sources with progress tracking

## 📋 Overview

**Version:** 1.0.0
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **3** tools:


### `exportToJson`

Export database query results to a JSON file


**Parameters:**


- **`query`** (any) - SQL query to execute

- **`outputPath`** (any) - Path to save the JSON file

- **`batchSize`** (any) - Number of rows to process at a time





---


### `importFromJson`

Import JSON data into a database table


**Parameters:**


- **`inputPath`** (any) - Path to the JSON file

- **`tableName`** (any) - Target table name

- **`mode`** (any) - Insert mode: 'append', 'replace', or 'upsert'





---


### `compare`

Compare data between two tables


**Parameters:**


- **`sourceTable`** (any) - Source table name

- **`targetTable`** (any) - Target table name

- **`keyColumn`** (any) - Column to use as key for comparison





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
photon mcp ./data-sync.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp data-sync.photon.ts ~/.photon/

# Run by name
photon mcp data-sync
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp data-sync --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.0.0
