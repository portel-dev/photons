# AWS S3

Cloud object storage operations

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`AWS_S3_ACCESSKEYID`** [REQUIRED]
  - Type: string
  - Description: AWS access key ID (required)
  

- **`AWS_S3_SECRETACCESSKEY`** [REQUIRED]
  - Type: string
  - Description: AWS secret access key (required)
  

- **`AWS_S3_REGION`** [OPTIONAL]
  - Type: string
  - Description: AWS region (default: us-east-1)
  - Default: `us-east-1`





### Setup Instructions

- accessKeyId: AWS access key ID (required)
- secretAccessKey: AWS secret access key (required)
- region: AWS region (default: us-east-1)


## 🔧 Tools

This photon provides **11** tools:


### `upload`

Upload object to bucket


**Parameters:**


- **`bucket`** (any) - Bucket name

- **`key`** (any) - Object key (file path)

- **`content`** (any) - Content to upload (string or base64)

- **`contentType`** (any) - MIME type (optional, e.g., "text/plain", "image/png")

- **`encoding`** (any) - Content encoding (optional, e.g., "base64" for binary files)





---


### `download`

Download object from bucket


**Parameters:**


- **`bucket`** (any) - Bucket name

- **`key`** (any) - Object key (file path)

- **`encoding`** (any) - Return encoding (optional, "base64" for binary files)





---


### `list`

List objects in bucket


**Parameters:**


- **`bucket`** (any) - Bucket name

- **`prefix`** (any, optional) - Filter by key prefix

- **`maxKeys`** (any, optional) - Maximum number of objects to return





---


### `remove`

Delete object from bucket


**Parameters:**


- **`bucket`** (any) - Bucket name

- **`key`** (any) - Object key (file path)





---


### `removeMany`

Delete multiple objects from bucket


**Parameters:**


- **`bucket`** (any) - Bucket name

- **`keys`** (any) - Array of object keys to delete





---


### `metadata`

Get object metadata


**Parameters:**


- **`bucket`** (any) - Bucket name

- **`key`** (any) - Object key (file path)





---


### `copy`

Copy object within S3


**Parameters:**


- **`sourceBucket`** (any) - Source bucket name

- **`sourceKey`** (any) - Source object key

- **`destinationBucket`** (any) - Destination bucket name

- **`destinationKey`** (any) - Destination object key





---


### `presign`

Generate presigned URL for object access


**Parameters:**


- **`bucket`** (any) - Bucket name

- **`key`** (any) - Object key (file path)

- **`expiresIn`** (any, optional) - Expiration time in seconds

- **`operation`** (any, optional) - Operation type





---


### `buckets`

List all buckets





---


### `bucket`

Create a new bucket


**Parameters:**


- **`bucket`** (any) - Bucket name (must be globally unique)





---


### `removeBucket`

Delete a bucket (must be empty)


**Parameters:**


- **`bucket`** (any) - Bucket name





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
photon mcp ./aws-s3.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp aws-s3.photon.ts ~/.photon/

# Run by name
photon mcp aws-s3
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp aws-s3 --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@aws-sdk/client-s3@^3.511.0, @aws-sdk/s3-request-presigner@^3.511.0
```


## 📄 License

MIT • Version 1.0.0
