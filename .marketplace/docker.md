# docker

Docker - Container management operations

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


### `listContainers`

List containers


**Parameters:**


- **`all`** (any, optional) - Show all containers





---


### `startContainer`

Start a container


**Parameters:**


- **`id`** (any) - Container ID or name





---


### `stopContainer`

Stop a container


**Parameters:**


- **`id`** (any) - Container ID or name

- **`timeout`** (any, optional) - Seconds to wait before killing





---


### `restartContainer`

Restart a container


**Parameters:**


- **`id`** (any) - Container ID or name

- **`timeout`** (any, optional) - Seconds to wait before killing





---


### `removeContainer`

Remove a container


**Parameters:**


- **`id`** (any) - Container ID or name

- **`force`** (any, optional) - Force remove even if running





---


### `getLogs`

Get container logs


**Parameters:**


- **`id`** (any) - Container ID or name

- **`tail`** (any, optional) - Number of lines from the end of logs

- **`timestamps`** (any, optional) - Show timestamps





---


### `listImages`

List images





---


### `pullImage`

Pull an image


**Parameters:**


- **`name`** (any) - Image name (e.g., "nginx", "redis:alpine")

- **`tag`** (any, optional) - Image tag





---


### `removeImage`

Remove an image


**Parameters:**


- **`id`** (any) - Image ID or name

- **`force`** (any, optional) - Force removal even if used by containers





---


### `getStats`

Get container stats


**Parameters:**


- **`id`** (any) - Container ID or name





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
photon ./docker.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp docker.photon.ts ~/.photon/

# Run by name
photon docker
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon docker --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
dockerode@^4.0.0
```


## 📄 License

MIT • Version 1.0.0
