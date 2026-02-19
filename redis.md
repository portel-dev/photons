# Redis

High-performance in-memory data store

> **18 tools** · API Photon · v1.0.0 · MIT


## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `REDIS_URL` | No | string | No description available (default: `redis://localhost:6379`) |
| `REDIS_PASSWORD` | No | string | No description available |
| `REDIS_DATABASE` | No | number | No description available |




## 🔧 Tools


### `get`

Get value by key


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Key name [min: 1, max: 512] (e.g. `user:123:session`) |





---


### `set`

Set key-value pair


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Key name [min: 1, max: 512] (e.g. `user:123:name`) |
| `value` | string | Yes | Value to store (e.g. `John`) |
| `ttl` | number | No | Time to live in seconds (max 30 days) [min: 1, max: 2592000] |





---


### `del`

Delete one or more keys


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keys` | string[] | Yes | Key name(s) to delete (e.g. `["user:123","user:124"]`) |





---


### `exists`

Check if key exists


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Key name [min: 1, max: 512] (e.g. `user:123`) |





---


### `keys`

Get all keys matching pattern


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | string | Yes | Key pattern [min: 1, max: 200] (e.g. `user:*`) |





---


### `incr`

Increment numeric value


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Key name [min: 1, max: 512] (e.g. `counter:page_views`) |
| `amount` | number | No | Amount to increment by [min: 1] |





---


### `decr`

Decrement numeric value


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Key name [min: 1, max: 512] (e.g. `counter:stock`) |
| `amount` | number | No | Amount to decrement by [min: 1] |





---


### `expire`

Set expiration time on key


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Key name [min: 1, max: 512] (e.g. `session:123`) |
| `seconds` | number | Yes | Seconds until expiration (max 30 days) [min: 1, max: 2592000] |





---


### `ttl`

Get time to live for key


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Key name [min: 1, max: 512] (e.g. `session:123`) |





---


### `lpush`

Push value to list (left side)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | List key name [min: 1, max: 512] (e.g. `queue:jobs`) |
| `values` | string[] | Yes | Array of values to push (e.g. `["job1","job2"]`) |





---


### `rpush`

Push value to list (right side)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | List key name [min: 1, max: 512] (e.g. `queue:jobs`) |
| `values` | string[] | Yes | Array of values to push (e.g. `["job1","job2"]`) |





---


### `lpop`

Pop value from list (left side)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | List key name [min: 1, max: 512] (e.g. `queue:jobs`) |





---


### `rpop`

Pop value from list (right side)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | List key name [min: 1, max: 512] (e.g. `queue:jobs`) |





---


### `llen`

Get list length


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | List key name [min: 1, max: 512] (e.g. `queue:jobs`) |





---


### `hget`

Get hash field value


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Hash key name [min: 1, max: 512] (e.g. `user:123`) |
| `field` | string | Yes | Field name [min: 1, max: 200] (e.g. `name`) |





---


### `hset`

Set hash field value


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Hash key name [min: 1, max: 512] (e.g. `user:123`) |
| `field` | string | Yes | Field name [min: 1, max: 200] (e.g. `name`) |
| `value` | string | Yes | Value to set (e.g. `John`) |





---


### `hgetall`

Get all fields and values in hash


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Hash key name [min: 1, max: 512] (e.g. `user:123`) |





---


### `flush`

Flush all data from current database





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph redis["📦 Redis"]
        direction TB
        PHOTON((🎯))
        T0[📖 get]
        PHOTON --> T0
        T1[✏️ set]
        PHOTON --> T1
        T2[🔧 del]
        PHOTON --> T2
        T3[🔧 exists]
        PHOTON --> T3
        T4[🔧 keys]
        PHOTON --> T4
        T5[🔧 incr]
        PHOTON --> T5
        T6[🔧 decr]
        PHOTON --> T6
        T7[🔧 expire]
        PHOTON --> T7
        T8[🔧 ttl]
        PHOTON --> T8
        T9[🔧 lpush]
        PHOTON --> T9
        T10[🔧 rpush]
        PHOTON --> T10
        T11[🔧 lpop]
        PHOTON --> T11
        T12[🔧 rpop]
        PHOTON --> T12
        T13[🔧 llen]
        PHOTON --> T13
        T14[🔧 hget]
        PHOTON --> T14
        T15[🔧 hset]
        PHOTON --> T15
        T16[🔧 hgetall]
        PHOTON --> T16
        T17[🔧 flush]
        PHOTON --> T17
    end

    subgraph deps["Dependencies"]
        direction TB
        NPM0[📚 redis]
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add redis

# Get MCP config for your client
photon info redis --mcp
```

## 📦 Dependencies


```
redis@^4.6.0
```

---

MIT · v1.0.0 · Portel
