# Redis

In-memory data store and cache

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`REDIS_URL`** [OPTIONAL]
  - Type: string
  - Description: Redis connection URL (default: redis://localhost:6379)
  - Default: `redis://localhost:6379`

- **`REDIS_PASSWORD`** [OPTIONAL]
  - Type: string
  - Description: Redis password (optional)
  

- **`REDIS_DATABASE`** [OPTIONAL]
  - Type: number
  - Description: Database number (default: 0)
  





### Setup Instructions

- url: Redis connection URL (default: redis://localhost:6379)
- password: Redis password (optional)
- database: Database number (default: 0)


## 🔧 Tools

This photon provides **23** tools:


### `get`

Get value by key


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Key name (e.g., `user:123:session`)





---


### `set`

Set key-value pair


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Key name (e.g., `user:123:name`)

- **`value`** (any) [min: 1] - Value to store (e.g., `John`)

- **`ttl`** (any) [min: 1, max: 2592000] - Time to live in seconds (optional, max 30 days) (e.g., `3600`)





---


### `del`

Delete one or more keys


**Parameters:**


- **`keys`** (any) [min: 1] - Key name(s) to delete (string or array) (e.g., `["user:123","user:124"]`)





---


### `exists`

Check if key exists


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Key name (e.g., `user:123`)





---


### `keys`

Get all keys matching pattern


**Parameters:**


- **`pattern`** (any) [min: 1, max: 200] - Key pattern (e.g., `user:*`)





---


### `incr`

Increment numeric value


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Key name (e.g., `counter:page_views`)

- **`amount`** (any, optional) [min: 1] - Amount to increment by (e.g., `5`)





---


### `decr`

Decrement numeric value


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Key name (e.g., `counter:stock`)

- **`amount`** (any, optional) [min: 1] - Amount to decrement by (e.g., `3`)





---


### `expire`

Set expiration time on key


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Key name (e.g., `session:123`)

- **`seconds`** (any) [min: 1, max: 2592000] - Seconds until expiration (max 30 days) (e.g., `3600`)





---


### `ttl`

Get time to live for key


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Key name (e.g., `session:123`)





---


### `lpush`

Push value to list (left side)


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - List key name (e.g., `queue:jobs`)

- **`values`** (any) [min: 1] - Array of values to push (e.g., `["job1","job2"]`)





---


### `rpush`

Push value to list (right side)


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - List key name (e.g., `queue:jobs`)

- **`values`** (any) [min: 1] - Array of values to push (e.g., `["job1","job2"]`)





---


### `lpop`

Pop value from list (left side)


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - List key name (e.g., `queue:jobs`)





---


### `rpop`

Pop value from list (right side)


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - List key name (e.g., `queue:jobs`)





---


### `llen`

Get list length


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - List key name (e.g., `queue:jobs`)





---


### `hget`

Get hash field value


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Hash key name (e.g., `user:123`)

- **`field`** (any) [min: 1, max: 200] - Field name (e.g., `name`)





---


### `hset`

Set hash field value


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Hash key name (e.g., `user:123`)

- **`field`** (any) [min: 1, max: 200] - Field name (e.g., `name`)

- **`value`** (any) [min: 1] - Value to set (e.g., `John`)





---


### `hgetall`

Get all fields and values in hash


**Parameters:**


- **`key`** (any) [min: 1, max: 512] - Hash key name (e.g., `user:123`)





---


### `flush`

Flush all data from current database





---


### `testAfterAll`

No description available





---


### `testSetGet`

No description available





---


### `testDel`

No description available





---


### `testExists`

No description available





---


### `testSetWithTtl`

No description available





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
photon mcp ./redis.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp redis.photon.ts ~/.photon/

# Run by name
photon mcp redis
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp redis --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
redis@^4.6.0
```


## 📄 License

MIT • Version 1.0.0
