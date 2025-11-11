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


- **`sql`** (any) - {@min 1} {@max 10000} SQL query to execute (supports $1, $2, etc. for parameters) {@example SELECT * FROM users WHERE active = $1}

- **`params`** (any, optional) - Query parameters array  {@example [true]}




**Example:**

```typescript
SELECT * FROM users WHERE active = $1}
```


---


### `transaction`

Execute multiple SQL statements in a transaction


**Parameters:**


- **`statements`** (any) - {@min 1} Array of SQL statements with optional parameters {@example [{"sql":"INSERT INTO users (name) VALUES ($1)","params":["John"]},{"sql":"UPDATE accounts SET balance = balance + $1","params":[100]}]}





---


### `tables`

List all tables in the database


**Parameters:**


- **`schema`** (any, optional) - {@max 63} Schema name  {@example public}





---


### `describe`

Get table schema information


**Parameters:**


- **`table`** (any) - {@min 1} {@max 63} Table name {@example users}

- **`schema`** (any, optional) - {@max 63} Schema name  {@example public}




**Example:**

```typescript
users}
```


---


### `indexes`

List all indexes on a table


**Parameters:**


- **`table`** (any) - {@min 1} {@max 63} Table name {@example users}

- **`schema`** (any, optional) - {@max 63} Schema name  {@example public}




**Example:**

```typescript
users}
```


---


### `insert`

Execute a SQL INSERT statement


**Parameters:**


- **`table`** (any) - {@min 1} {@max 63} Table name {@example users}

- **`data`** (any) - {@min 1} Object with column names as keys {@example {"name":"John","email":"john@example.com"}}

- **`returning`** (any, optional) - Column names to return  {@example ["id","created_at"]}




**Example:**

```typescript
users}
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
