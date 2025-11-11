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


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`filter`** (any) - Query filter (MongoDB query object) (e.g., `{"age":{"$gt":25}}`)

- **`limit`** (any, optional) [min: 1, max: 1000] - Maximum number of documents to return

- **`sort`** (any) - Sort specification (e.g., `{"age":-1}`)





---


### `findOne`

Find a single document


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`filter`** (any) [min: 1] - Query filter (MongoDB query object) (e.g., `{"email":"user@example.com"}`)





---


### `insertOne`

Insert a document


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`document`** (any) [min: 1] - Document to insert (e.g., `{"name":"John","email":"john@example.com","age":30}`)





---


### `insertMany`

Insert multiple documents


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`documents`** (any) [min: 1] - Array of documents to insert (e.g., `[{"name":"John"},{"name":"Jane"}]`)





---


### `updateOne`

Update a document


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`filter`** (any) [min: 1] - Query filter to match documents (e.g., `{"email":"user@example.com"}`)

- **`update`** (any) [min: 1] - Update operations (e.g., `{"$set":{"name":"John"}}`)

- **`upsert`** (any, optional) - Create document if it doesn't exist





---


### `updateMany`

Update multiple documents


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`filter`** (any) [min: 1] - Query filter to match documents (e.g., `{"age":{"$gt":25}}`)

- **`update`** (any) [min: 1] - Update operations (e.g., `{"$inc":{"loginCount":1}}`)





---


### `removeOne`

Delete a document


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`filter`** (any) [min: 1] - Query filter to match document (e.g., `{"email":"user@example.com"}`)





---


### `removeMany`

Delete multiple documents


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`filter`** (any) [min: 1] - Query filter to match documents (e.g., `{"status":"inactive"}`)





---


### `aggregate`

Run aggregation pipeline


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `orders`)

- **`pipeline`** (any) [min: 1] - Aggregation pipeline array (e.g., `[{"$match":{"status":"completed"}},{"$group":{"_id":"$customerId","total":{"$sum":"$amount"}}}]`)





---


### `count`

Count documents matching filter


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`filter`** (any) - Query filter (optional, counts all if omitted) (e.g., `{"status":"active"}`)





---


### `collections`

List all collections in database





---


### `index`

Create an index on a collection


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`keys`** (any) [min: 1] - Index specification (e.g., `{"email":1}`)

- **`unique`** (any, optional) - Create unique index





---


### `distinct`

Get distinct values for a field


**Parameters:**


- **`collection`** (any) [min: 1, max: 120] - Collection name (e.g., `users`)

- **`field`** (any) [min: 1, max: 200] - Field name to get distinct values from (e.g., `country`)

- **`filter`** (any) - Optional query filter (e.g., `{"status":"active"}`)





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
