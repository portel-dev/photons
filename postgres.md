# PostgreSQL

Database operations for PostgreSQL

> **11 tools** · API Photon · v1.1.0 · MIT


## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `POSTGRE_S_Q_L_DATABASE` | Yes | string | Database name (required) |
| `POSTGRE_S_Q_L_USER` | Yes | string | Database user (required) |
| `POSTGRE_S_Q_L_PASSWORD` | Yes | string | Database password (required) |
| `POSTGRE_S_Q_L_HOST` | No | string | Database host (default: localhost) (default: `localhost`) |
| `POSTGRE_S_Q_L_PORT` | No | number | Database port (default: 5432) (default: `5432`) |
| `POSTGRE_S_Q_L_SSL` | No | boolean | Enable SSL connection (default: false) |



### Setup Instructions

- host: Database host (default: localhost)
- port: Database port (default: 5432)
- database: Database name (required)
- user: Database user (required)
- password: Database password (required)
- ssl: Enable SSL connection (default: false)
Dependencies are auto-installed on first run.


## 🔧 Tools


### `query`

Execute a SQL query


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sql` | any | Yes | SQL query to execute (supports $1, $2, etc. for parameters) |
| `params` | any | No | Query parameters array |





---


### `transaction`

Execute multiple SQL statements in a transaction


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `statements` | any | Yes | Array of SQL statements with optional parameters |





---


### `tables`

List all tables in the database


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schema` | any | No | Schema name |





---


### `describe`

Get table schema information


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | any | Yes | Table name |
| `schema` | any | No | Schema name |





---


### `indexes`

List all indexes on a table


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | any | Yes | Table name |
| `schema` | any | No | Schema name |





---


### `insert`

Execute a SQL INSERT statement


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | any | Yes | Table name |
| `data` | any | Yes | Object with column names as keys |
| `returning` | any | No | Column names to return |





---


### `stats`

Get database statistics





---


### `testQuery`

No description available





---


### `testQueryWithParams`

No description available





---


### `testTables`

No description available





---


### `testStats`

No description available





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph postgres["📦 Postgres"]
        direction TB
        PHOTON((🎯))
        T0[📖 query]
        PHOTON --> T0
        T1[🔧 transaction]
        PHOTON --> T1
        T2[🔧 tables]
        PHOTON --> T2
        T3[🔧 describe]
        PHOTON --> T3
        T4[🔧 indexes]
        PHOTON --> T4
        T5[✏️ insert]
        PHOTON --> T5
        T6[🔧 stats]
        PHOTON --> T6
        T7[✅ testQuery]
        PHOTON --> T7
        T8[✅ testQueryWithParams]
        PHOTON --> T8
        T9[✅ testTables]
        PHOTON --> T9
        T10[✅ testStats]
        PHOTON --> T10
    end

    subgraph deps["Dependencies"]
        direction TB
        NPM0[📚 pg]
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add postgres

# Get MCP config for your client
photon get postgres --mcp
```

## 📦 Dependencies


```
pg@^8.11.0
```

---

MIT · v1.1.0 · Portel
