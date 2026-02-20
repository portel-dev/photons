# PostgreSQL

Powerful relational database

> **7 tools** · API Photon · v1.1.0 · MIT


## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `POSTGRE_S_Q_L_DATABASE` | Yes | string | No description available |
| `POSTGRE_S_Q_L_USER` | Yes | string | No description available |
| `POSTGRE_S_Q_L_PASSWORD` | Yes | string | No description available |
| `POSTGRE_S_Q_L_HOST` | No | string | No description available (default: `localhost`) |
| `POSTGRE_S_Q_L_PORT` | No | number | No description available (default: `5432`) |
| `POSTGRE_S_Q_L_SSL` | No | boolean | No description available |




## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `query` | Execute a SQL query |
| `transaction` | Execute multiple statements in a transaction |
| `tables` | List all tables in database |
| `describe` | Get schema information for a table |
| `indexes` | List all indexes on a table |
| `insert` | Insert a document |
| `stats` | Get database statistics |


## 🔧 Tools


### `query`

Execute a SQL query


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sql` | string | Yes | SQL query [field: textarea] (e.g. `SELECT * FROM users WHERE active = $1`) |
| `params` | any[] | No | Query parameters (use $1, $2, etc.) |





---


### `transaction`

Execute multiple statements in a transaction


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `statements` | Array<{ sql: string | Yes | Array of SQL statements with optional parameters |





---


### `tables`

List all tables in database


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schema` | any | No | Schema name |





---


### `describe`

Get schema information for a table


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | string | Yes | Table name (e.g. `users`) |
| `schema` | string | No | Schema name |





---


### `indexes`

List all indexes on a table


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | string | Yes | Table name (e.g. `users`) |
| `schema` | string | No | Schema name |





---


### `insert`

Insert a document


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | string | Yes | Table name (e.g. `users`) |
| `data` | Record<string | Yes | Object with column names as keys |
| `returning` | string[] | No | Column names to return |





---


### `stats`

Get database statistics





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
photon info postgres --mcp
```

## 📦 Dependencies


```
pg@^8.11.0
```

---

MIT · v1.1.0 · Portel
