# AWS S3

Cloud object storage

> **11 tools** · API Photon · v1.0.0 · MIT


## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `AWS_S3_ACCESSKEYID` | Yes | string | No description available |
| `AWS_S3_SECRETACCESSKEY` | Yes | string | No description available |
| `AWS_S3_REGION` | No | string | No description available (default: `us-east-1`) |




## 🔧 Tools


### `buckets`

List all buckets





---


### `bucket`

Create a new bucket


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (globally unique) (e.g. `my-app-bucket-2024`) |





---


### `drop`

Delete a bucket (must be empty)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (e.g. `my-old-bucket`) |





---


### `list`

List objects in bucket


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (e.g. `my-app-bucket`) |
| `prefix` | string | No | Filter by prefix (e.g. `documents/`) |
| `maxKeys` | number | No | Maximum objects to return {@default 1000} |





---


### `upload`

Upload object to S3


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (e.g. `my-app-bucket`) |
| `key` | string | Yes | Object key/path (e.g. `documents/report.pdf`) |
| `content` | string | Yes | File content (string or base64) |
| `contentType` | string | No | MIME type (e.g. `text/plain`) |
| `encoding` | string | No | Content encoding [choice: base64] |





---


### `download`

Download object from S3


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (e.g. `my-app-bucket`) |
| `key` | string | Yes | Object key/path (e.g. `documents/report.pdf`) |
| `encoding` | string | No | Return encoding [choice: base64] |





---


### `metadata`

Get object metadata


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (e.g. `my-app-bucket`) |
| `key` | string | Yes | Object key/path (e.g. `documents/report.pdf`) |





---


### `copy`

Copy object within S3


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sourceBucket` | string | Yes | Source bucket (e.g. `my-source-bucket`) |
| `sourceKey` | string | Yes | Source object key (e.g. `documents/original.pdf`) |
| `destinationBucket` | string | Yes | Destination bucket (e.g. `my-dest-bucket`) |
| `destinationKey` | string | Yes | Destination object key (e.g. `backups/copy.pdf`) |





---


### `delete`

Delete object from bucket


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (e.g. `my-app-bucket`) |
| `key` | string | Yes | Object key/path (e.g. `documents/old-report.pdf`) |





---


### `purge`

Delete multiple objects from bucket


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (e.g. `my-app-bucket`) |
| `keys` | string[] | Yes | Array of object keys to delete (e.g. `["old/file1.txt","old/file2.txt"]`) |





---


### `presign`

Generate presigned URL for object


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes | Bucket name (e.g. `my-app-bucket`) |
| `key` | string | Yes | Object key/path (e.g. `documents/report.pdf`) |
| `expiresIn` | number | No | Expiration time in seconds {@default 3600} |
| `operation` | string | No | Operation type [choice: get,put] |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph aws_s3["📦 Aws S3"]
        direction TB
        PHOTON((🎯))
        T0[🔧 buckets]
        PHOTON --> T0
        T1[🔧 bucket]
        PHOTON --> T1
        T2[🗑️ drop]
        PHOTON --> T2
        T3[📖 list]
        PHOTON --> T3
        T4[📤 upload]
        PHOTON --> T4
        T5[📥 download]
        PHOTON --> T5
        T6[🔧 metadata]
        PHOTON --> T6
        T7[🔧 copy]
        PHOTON --> T7
        T8[🗑️ delete]
        PHOTON --> T8
        T9[🔧 purge]
        PHOTON --> T9
        T10[🔧 presign]
        PHOTON --> T10
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add aws-s3

# Get MCP config for your client
photon info aws-s3 --mcp
```

## 📦 Dependencies


```
@aws-sdk/client-s3@^3.0.0, @aws-sdk/s3-request-presigner@^3.0.0
```

---

MIT · v1.0.0 · Portel
