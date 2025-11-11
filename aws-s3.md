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


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (e.g., `my-app-bucket`)

- **`key`** (any) [min: 1, max: 1024] - Object key (file path) (e.g., `documents/report.pdf`)

- **`content`** (any) [min: 1] - Content to upload (string or base64) (e.g., `Hello World`)

- **`contentType`** (any, optional) [max: 100] - MIME type (e.g., `text/plain`)

- **`encoding`** (any, optional) [max: 20] - Content encoding (e.g., `base64`)





---


### `download`

Download object from bucket


**Parameters:**


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (e.g., `my-app-bucket`)

- **`key`** (any) [min: 1, max: 1024] - Object key (file path) (e.g., `documents/report.pdf`)

- **`encoding`** (any) [max: 20] - Return encoding (optional, "base64" for binary files) (e.g., `base64`)





---


### `list`

List objects in bucket


**Parameters:**


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (e.g., `my-app-bucket`)

- **`prefix`** (any, optional) [max: 1024] - Filter by key prefix (e.g., `documents/`)

- **`maxKeys`** (any, optional) [min: 1, max: 1000] - Maximum number of objects to return





---


### `remove`

Delete object from bucket


**Parameters:**


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (e.g., `my-app-bucket`)

- **`key`** (any) [min: 1, max: 1024] - Object key (file path) (e.g., `documents/old-report.pdf`)





---


### `removeMany`

Delete multiple objects from bucket


**Parameters:**


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (e.g., `my-app-bucket`)

- **`keys`** (any) [min: 1] - Array of object keys to delete (e.g., `["old/file1.txt","old/file2.txt"]`)





---


### `metadata`

Get object metadata


**Parameters:**


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (e.g., `my-app-bucket`)

- **`key`** (any) [min: 1, max: 1024] - Object key (file path) (e.g., `documents/report.pdf`)





---


### `copy`

Copy object within S3


**Parameters:**


- **`sourceBucket`** (any) [min: 1, max: 63] - Source bucket name (e.g., `my-source-bucket`)

- **`sourceKey`** (any) [min: 1, max: 1024] - Source object key (e.g., `documents/original.pdf`)

- **`destinationBucket`** (any) [min: 1, max: 63] - Destination bucket name (e.g., `my-dest-bucket`)

- **`destinationKey`** (any) [min: 1, max: 1024] - Destination object key (e.g., `backups/copy.pdf`)





---


### `presign`

Generate presigned URL for object access


**Parameters:**


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (e.g., `my-app-bucket`)

- **`key`** (any) [min: 1, max: 1024] - Object key (file path) (e.g., `documents/report.pdf`)

- **`expiresIn`** (any, optional) [min: 1, max: 604800] - Expiration time in seconds

- **`operation`** (any, optional) [max: 10] - Operation type (e.g., `get`)





---


### `buckets`

List all buckets





---


### `bucket`

Create a new bucket


**Parameters:**


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (must be globally unique) (e.g., `my-new-app-bucket-2024`)





---


### `removeBucket`

Delete a bucket (must be empty)


**Parameters:**


- **`bucket`** (any) [min: 1, max: 63] - Bucket name (e.g., `my-old-bucket`)





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
