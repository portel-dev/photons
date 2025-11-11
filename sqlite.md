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


- **`path`** (any) - {@min 1} {@max 500} Database file path (use ":memory:" for in-memory database) {@example ./mydb.sqlite}

- **`readonly`** (any, optional) - Open in readonly mode  {@example false}




**Example:**

```typescript
./mydb.sqlite}
```


---


### `query`

Execute a SELECT query


**Parameters:**


- **`sql`** (any) - {@min 1} {@max 10000} SQL query string {@example SELECT * FROM users WHERE id = ?}

- **`params`** (any) - Query parameters (for prepared statements) {@example [1]}




**Example:**

```typescript
SELECT * FROM users WHERE id = ?}
```


---


### `queryOne`

Execute a single SELECT query and return first row


**Parameters:**


- **`sql`** (any) - {@min 1} {@max 10000} SQL query string {@example SELECT * FROM users WHERE id = ?}

- **`params`** (any) - Query parameters (for prepared statements) {@example [1]}




**Example:**

```typescript
SELECT * FROM users WHERE id = ?}
```


---


### `execute`

Execute an INSERT, UPDATE, or DELETE statement


**Parameters:**


- **`sql`** (any) - {@min 1} {@max 10000} SQL statement string {@example INSERT INTO users (name, email) VALUES (?, ?)}

- **`params`** (any) - Statement parameters (for prepared statements) {@example ["John","john@example.com"]}




**Example:**

```typescript
INSERT INTO users (name, email) VALUES (?, ?)}
```


---


### `transaction`

Execute multiple SQL statements in a transaction


**Parameters:**


- **`statements`** (any) - {@min 1} Array of SQL statements with optional parameters {@example [{"sql":"INSERT INTO users (name) VALUES (?)","params":["John"]},{"sql":"UPDATE accounts SET balance = balance + ?","params":[100]}]}





---


### `tables`

List all tables in the database





---


### `schema`

Get schema information for a table


**Parameters:**


- **`table`** (any) - {@min 1} {@max 200} Table name {@example users}





---


### `close`

Close the database connection





---


### `backup`

Create a backup of the database


**Parameters:**


- **`destination`** (any) - {@min 1} {@max 500} Path to backup file {@example ./mydb.backup.sqlite}





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
