# MongoDB

NoSQL database operations

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`MONGO_D_B_URI`** [REQUIRED]
  - Type: string
  - Description: MongoDB connection URI (required)
  

- **`MONGO_D_B_DATABASE`** [REQUIRED]
  - Type: string
  - Description: Default database name (required)
  





### Setup Instructions

- uri: MongoDB connection URI (required)
- database: Default database name (required)


## 🔧 Tools

This photon provides **13** tools:


### `find`

Find documents in a collection


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`filter`** (any) - Query filter (MongoDB query object) {@example {"age":{"$gt":25}}}

- **`limit`** (any, optional) - {@min 1} {@max 1000} Maximum number of documents to return

- **`sort`** (any) - Sort specification {@example {"age":-1}}




**Example:**

```typescript
users}
```


---


### `findOne`

Find a single document


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`filter`** (any) - {@min 1} Query filter (MongoDB query object) {@example {"email":"user@example.com"}}




**Example:**

```typescript
users}
```


---


### `insertOne`

Insert a document


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`document`** (any) - {@min 1} Document to insert {@example {"name":"John","email":"john@example.com","age":30}}




**Example:**

```typescript
users}
```


---


### `insertMany`

Insert multiple documents


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`documents`** (any) - {@min 1} Array of documents to insert {@example [{"name":"John"},{"name":"Jane"}]}




**Example:**

```typescript
users}
```


---


### `updateOne`

Update a document


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`filter`** (any) - {@min 1} Query filter to match documents {@example {"email":"user@example.com"}}

- **`update`** (any) - {@min 1} Update operations {@example {"$set":{"name":"John"}}}

- **`upsert`** (any, optional) - Create document if it doesn't exist




**Example:**

```typescript
users}
```


---


### `updateMany`

Update multiple documents


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`filter`** (any) - {@min 1} Query filter to match documents {@example {"age":{"$gt":25}}}

- **`update`** (any) - {@min 1} Update operations {@example {"$inc":{"loginCount":1}}}




**Example:**

```typescript
users}
```


---


### `removeOne`

Delete a document


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`filter`** (any) - {@min 1} Query filter to match document {@example {"email":"user@example.com"}}




**Example:**

```typescript
users}
```


---


### `removeMany`

Delete multiple documents


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`filter`** (any) - {@min 1} Query filter to match documents {@example {"status":"inactive"}}




**Example:**

```typescript
users}
```


---


### `aggregate`

Run aggregation pipeline


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example orders}

- **`pipeline`** (any) - {@min 1} Aggregation pipeline array {@example [{"$match":{"status":"completed"}},{"$group":{"_id":"$customerId","total":{"$sum":"$amount"}}}]}




**Example:**

```typescript
orders}
```


---


### `count`

Count documents matching filter


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`filter`** (any) - Query filter (optional, counts all if omitted) {@example {"status":"active"}}




**Example:**

```typescript
users}
```


---


### `collections`

List all collections in database





---


### `index`

Create an index on a collection


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`keys`** (any) - {@min 1} Index specification {@example {"email":1}}

- **`unique`** (any, optional) - Create unique index




**Example:**

```typescript
users}
```


---


### `distinct`

Get distinct values for a field


**Parameters:**


- **`collection`** (any) - {@min 1} {@max 120} Collection name {@example users}

- **`field`** (any) - {@min 1} {@max 200} Field name to get distinct values from {@example country}

- **`filter`** (any) - Optional query filter {@example {"status":"active"}}




**Example:**

```typescript
users}
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
photon mcp ./mongodb.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp mongodb.photon.ts ~/.photon/

# Run by name
photon mcp mongodb
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp mongodb --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
mongodb@^6.3.0
```


## 📄 License

MIT • Version 1.0.0
