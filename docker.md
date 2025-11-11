# Docker

Container management operations

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`DOCKER_M_C_P_SOCKETPATH`** [OPTIONAL]
  - Type: string
  - Description: Docker socket path (default: /var/run/docker.sock)
  - Default: `/var/run/docker.sock`





### Setup Instructions

- socketPath: Docker socket path (default: /var/run/docker.sock)


## 🔧 Tools

This photon provides **10** tools:


### `containers`

List containers


**Parameters:**


- **`all`** (any, optional) - Show all containers





---


### `start`

Start a container


**Parameters:**


- **`id`** (any) [min: 1, max: 200] - Container ID or name (e.g., `my-container`)





---


### `stop`

Stop a container


**Parameters:**


- **`id`** (any) [min: 1, max: 200] - Container ID or name (e.g., `my-container`)

- **`timeout`** (any, optional) [min: 0, max: 300] - Seconds to wait before killing





---


### `restart`

Restart a container


**Parameters:**


- **`id`** (any) [min: 1, max: 200] - Container ID or name (e.g., `my-container`)

- **`timeout`** (any, optional) [min: 0, max: 300] - Seconds to wait before killing





---


### `remove`

Remove a container


**Parameters:**


- **`id`** (any) [min: 1, max: 200] - Container ID or name (e.g., `my-container`)

- **`force`** (any, optional) - Force remove even if running





---


### `logs`

Get container logs


**Parameters:**


- **`id`** (any) [min: 1, max: 200] - Container ID or name (e.g., `my-container`)

- **`tail`** (any, optional) [min: 1, max: 10000] - Number of lines from the end of logs

- **`timestamps`** (any, optional) - Show timestamps





---


### `images`

List images





---


### `pull`

Pull an image


**Parameters:**


- **`name`** (any) [min: 1, max: 200] - Image name (e.g., `nginx`)

- **`tag`** (any, optional) [max: 50] - Image tag (e.g., `alpine`)





---


### `removeImage`

Remove an image


**Parameters:**


- **`id`** (any) [min: 1, max: 200] - Image ID or name (e.g., `nginx:alpine`)

- **`force`** (any, optional) - Force removal even if used by containers





---


### `stats`

Get container stats


**Parameters:**


- **`id`** (any) [min: 1, max: 200] - Container ID or name (e.g., `my-container`)





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
photon mcp ./docker.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp docker.photon.ts ~/.photon/

# Run by name
photon mcp docker
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp docker --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
dockerode@^4.0.0
```


## 📄 License

MIT • Version 1.0.0
