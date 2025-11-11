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

This photon provides **18** tools:


### `get`

Get value by key


**Parameters:**


- **`key`** (any) - Key name





---


### `set`

Set key-value pair


**Parameters:**


- **`key`** (any) - Key name

- **`value`** (any) - Value to store

- **`ttl`** (any, optional) - Time to live in seconds




**Example:**

```typescript
set("user:123", "John", 3600)
```


---


### `del`

Delete one or more keys


**Parameters:**


- **`keys`** (any) - Key name(s) to delete (string or array)




**Example:**

```typescript
del("user:123")
```


---


### `exists`

Check if key exists


**Parameters:**


- **`key`** (any) - Key name





---


### `keys`

Get all keys matching pattern


**Parameters:**


- **`pattern`** (any) - Key pattern (e.g., "user:*", "*session*")





---


### `incr`

Increment numeric value


**Parameters:**


- **`key`** (any) - Key name

- **`amount`** (any, optional) - Amount to increment by




**Example:**

```typescript
incr("counter", 5)
```


---


### `decr`

Decrement numeric value


**Parameters:**


- **`key`** (any) - Key name

- **`amount`** (any, optional) - Amount to decrement by




**Example:**

```typescript
decr("counter", 3)
```


---


### `expire`

Set expiration time on key


**Parameters:**


- **`key`** (any) - Key name

- **`seconds`** (any) - Seconds until expiration





---


### `ttl`

Get time to live for key


**Parameters:**


- **`key`** (any) - Key name





---


### `lpush`

Push value to list (left side)


**Parameters:**


- **`key`** (any) - List key name

- **`values`** (any) - Array of values to push or rest parameters




**Example:**

```typescript
lpush("queue", "job1", "job2", "job3")
```


---


### `rpush`

Push value to list (right side)


**Parameters:**


- **`key`** (any) - List key name

- **`values`** (any) - Array of values to push or rest parameters




**Example:**

```typescript
rpush("queue", "job1", "job2", "job3")
```


---


### `lpop`

Pop value from list (left side)


**Parameters:**


- **`key`** (any) - List key name





---


### `rpop`

Pop value from list (right side)


**Parameters:**


- **`key`** (any) - List key name





---


### `llen`

Get list length


**Parameters:**


- **`key`** (any) - List key name





---


### `hget`

Get hash field value


**Parameters:**


- **`key`** (any) - Hash key name

- **`field`** (any) - Field name





---


### `hset`

Set hash field value


**Parameters:**


- **`key`** (any) - Hash key name

- **`field`** (any) - Field name

- **`value`** (any) - Value to set





---


### `hgetall`

Get all fields and values in hash


**Parameters:**


- **`key`** (any) - Hash key name





---


### `flush`

Flush all data from current database





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
