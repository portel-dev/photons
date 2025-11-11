# PostgreSQL

Database operations for PostgreSQL

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`POSTGRE_S_Q_L_DATABASE`** [REQUIRED]
  - Type: string
  - Description: Database name (required)
  

- **`POSTGRE_S_Q_L_USER`** [REQUIRED]
  - Type: string
  - Description: Database user (required)
  

- **`POSTGRE_S_Q_L_PASSWORD`** [REQUIRED]
  - Type: string
  - Description: Database password (required)
  

- **`POSTGRE_S_Q_L_HOST`** [OPTIONAL]
  - Type: string
  - Description: Database host (default: localhost)
  - Default: `localhost`

- **`POSTGRE_S_Q_L_PORT`** [OPTIONAL]
  - Type: number
  - Description: Database port (default: 5432)
  - Default: `5432`

- **`POSTGRE_S_Q_L_SSL`** [OPTIONAL]
  - Type: boolean
  - Description: Enable SSL connection (default: false)
  





### Setup Instructions

- host: Database host (default: localhost)
- port: Database port (default: 5432)
- database: Database name (required)
- user: Database user (required)
- password: Database password (required)
- ssl: Enable SSL connection (default: false)
Dependencies are auto-installed on first run.


## 🔧 Tools

This photon provides **7** tools:


### `query`

Execute a SQL query


**Parameters:**


- **`sql`** (any) - SQL query to execute (supports $1, $2, etc. for parameters)

- **`params`** (any, optional) - Query parameters array




**Example:**

```typescript
query("SELECT * FROM users")
```


---


### `transaction`

Execute multiple SQL statements in a transaction


**Parameters:**


- **`statements`** (any) - Array of SQL statements with optional parameters





---


### `tables`

List all tables in the database


**Parameters:**


- **`schema`** (any, optional) - Schema name




**Example:**

```typescript
tables()
```


---


### `describe`

Get table schema information


**Parameters:**


- **`table`** (any) - Table name

- **`schema`** (any, optional) - Schema name




**Example:**

```typescript
describe("users")
```


---


### `indexes`

List all indexes on a table


**Parameters:**


- **`table`** (any) - Table name

- **`schema`** (any, optional) - Schema name




**Example:**

```typescript
indexes("users")
```


---


### `insert`

Execute a SQL INSERT statement


**Parameters:**


- **`table`** (any) - Table name

- **`data`** (any) - Object with column names as keys

- **`returning`** (any, optional) - Column names to return




**Example:**

```typescript
insert("users", { name: "John", email: "john@example.com" })
```


---


### `stats`

Get database statistics





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
photon mcp ./postgres.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp postgres.photon.ts ~/.photon/

# Run by name
photon mcp postgres
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp postgres --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
pg@^8.11.0
```


## 📄 License

MIT • Version 1.0.0
