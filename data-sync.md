# Data Sync

Data Sync Workflow Synchronizes data between different sources with progress tracking

> **3 tools** · Workflow Photon · v1.5.1 · MIT

**Platform Features:** `generator` `streaming`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `exportToJson` ⚡

Export database query results to a JSON file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | SQL query to execute |
| `outputPath` | string | Yes | Path to save the JSON file |
| `batchSize` | number | No | Number of rows to process at a time |





---


### `importFromJson` ⚡

Import JSON data into a database table


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `inputPath` | string | Yes | Path to the JSON file |
| `tableName` | string | Yes | Target table name |
| `mode` | 'append' | 'replace' | 'upsert' | No | Insert mode: 'append', 'replace', or 'upsert' |





---


### `compare` ⚡

Compare data between two tables


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sourceTable` | string | Yes | Source table name |
| `targetTable` | string | Yes | Target table name |
| `keyColumn` | string | Yes | Column to use as key for comparison |





---





## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph data_sync["📦 Data Sync"]
        START([▶ Start])
        N0[📢 Executing query...]
        START --> N0
        N1[⏳ progress]
        N0 --> N1
        N2[📢 Processing batch ${i + 1}/$...]
        N1 --> N2
        N3[⏳ progress]
        N2 --> N3
        N4[📢 Writing to file...]
        N3 --> N4
        N5[⏳ progress]
        N4 --> N5
        N6[📢 Reading JSON file...]
        N5 --> N6
        N7[⏳ progress]
        N6 --> N7
        N8[📢 Clearing existing data...]
        N7 --> N8
        N9[📢 Inserting batch ${i + 1}/${...]
        N8 --> N9
        N10[📝 log]
        N9 --> N10
        N11[⏳ progress]
        N10 --> N11
        N12[⏳ progress]
        N11 --> N12
        N13[📢 Fetching source data...]
        N12 --> N13
        N14[⏳ progress]
        N13 --> N14
        N15[📢 Fetching target data...]
        N14 --> N15
        N16[⏳ progress]
        N15 --> N16
        N17[⏳ progress]
        N16 --> N17
        SUCCESS([✅ Success])
        N17 --> SUCCESS
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add data-sync

# Get MCP config for your client
photon info data-sync --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.5.1 · Portel
