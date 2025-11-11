# SQLite Photon MCP

SQLite database operations

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`S_Q_LITE_PATH`** [OPTIONAL]
  - Type: string
  - Description: No description available
  






## 🔧 Tools

This photon provides **9** tools:


### `open`

Open a SQLite database


**Parameters:**


- **`path`** (any) - Database file path (use ":memory:" for in-memory database)

- **`readonly`** (any, optional) - Open in readonly mode




**Example:**

```typescript
open("./mydb.sqlite")
```


---


### `query`

Execute a SELECT query


**Parameters:**


- **`sql`** (any) - SQL query string

- **`params`** (any) - Query parameters (for prepared statements)




**Example:**

```typescript
query("SELECT * FROM users")
```


---


### `queryOne`

Execute a single SELECT query and return first row


**Parameters:**


- **`sql`** (any) - SQL query string

- **`params`** (any) - Query parameters (for prepared statements)




**Example:**

```typescript
queryOne("SELECT * FROM users WHERE id = ?", [1])
```


---


### `execute`

Execute an INSERT, UPDATE, or DELETE statement


**Parameters:**


- **`sql`** (any) - SQL statement string

- **`params`** (any) - Statement parameters (for prepared statements)




**Example:**

```typescript
execute("INSERT INTO users (name, email) VALUES (?, ?)", ["John", "john@example.com"])
```


---


### `transaction`

Execute multiple SQL statements in a transaction


**Parameters:**


- **`statements`** (any) - Array of SQL statements with optional parameters





---


### `tables`

List all tables in the database





---


### `schema`

Get schema information for a table


**Parameters:**


- **`table`** (any) - Table name




**Example:**

```typescript
schema("users")
```


---


### `close`

Close the database connection





---


### `backup`

Create a backup of the database


**Parameters:**


- **`destination`** (any) - Path to backup file




**Example:**

```typescript
backup("./mydb.backup.sqlite")
```


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
photon mcp ./sqlite.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp sqlite.photon.ts ~/.photon/

# Run by name
photon mcp sqlite
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp sqlite --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
better-sqlite3@^11.0.0
```


## 📄 License

MIT • Version 1.0.0
