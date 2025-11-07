# mongodb

MongoDB - NoSQL database operations

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


- **`collection`** (any) - Collection name

- **`filter`** (any) - Query filter (MongoDB query object)

- **`limit`** (any, optional) - Maximum number of documents to return

- **`sort`** (any) - Sort specification (e.g., { age: -1 } for descending)





---


### `findOne`

Find a single document


**Parameters:**


- **`collection`** (any) - Collection name

- **`filter`** (any) - Query filter (MongoDB query object)





---


### `insertOne`

Insert a document


**Parameters:**


- **`collection`** (any) - Collection name

- **`document`** (any) - Document to insert





---


### `insertMany`

Insert multiple documents


**Parameters:**


- **`collection`** (any) - Collection name

- **`documents`** (any) - Array of documents to insert





---


### `updateOne`

Update a document


**Parameters:**


- **`collection`** (any) - Collection name

- **`filter`** (any) - Query filter to match documents

- **`update`** (any) - Update operations (e.g., { $set: { name: "John" } })

- **`upsert`** (any, optional) - Create document if it doesn't exist





---


### `updateMany`

Update multiple documents


**Parameters:**


- **`collection`** (any) - Collection name

- **`filter`** (any) - Query filter to match documents

- **`update`** (any) - Update operations





---


### `deleteOne`

Delete a document


**Parameters:**


- **`collection`** (any) - Collection name

- **`filter`** (any) - Query filter to match document





---


### `deleteMany`

Delete multiple documents


**Parameters:**


- **`collection`** (any) - Collection name

- **`filter`** (any) - Query filter to match documents





---


### `aggregate`

Run aggregation pipeline


**Parameters:**


- **`collection`** (any) - Collection name

- **`pipeline`** (any) - Aggregation pipeline array (e.g., [{ $match: {...} }, { $group: {...} }])





---


### `countDocuments`

Count documents matching filter


**Parameters:**


- **`collection`** (any) - Collection name

- **`filter`** (any) - Query filter (optional, counts all if omitted)





---


### `listCollections`

List all collections in database





---


### `createIndex`

Create an index on a collection


**Parameters:**


- **`collection`** (any) - Collection name

- **`keys`** (any) - Index specification (e.g., { email: 1 } for ascending)

- **`unique`** (any, optional) - Create unique index





---


### `distinct`

Get distinct values for a field


**Parameters:**


- **`collection`** (any) - Collection name

- **`field`** (any) - Field name to get distinct values from

- **`filter`** (any) - Optional query filter





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
photon ./mongodb.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp mongodb.photon.ts ~/.photon/

# Run by name
photon mongodb
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mongodb --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
mongodb@^6.3.0
```


## 📄 License

MIT • Version 1.0.0
