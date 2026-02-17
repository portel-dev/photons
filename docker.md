# Docker

Container management operations Provides Docker container and image operations using Dockerode. Supports container lifecycle, logs, stats, and image management. Common use cases: - Container management: "List running containers", "Start the database container" - Monitoring: "Show container logs", "Get container stats" - Image management: "Pull nginx image", "List all images" Example: listContainers({ all: true }) Configuration: - socketPath: Docker socket path (default: /var/run/docker.sock)

> **10 tools** · API Photon · v1.0.0 · MIT


## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `DOCKER_M_C_P_SOCKETPATH` | No | string | Docker socket path (default: /var/run/docker.sock) (default: `/var/run/docker.sock`) |



### Setup Instructions

- socketPath: Docker socket path (default: /var/run/docker.sock)


## 🔧 Tools


### `containers`

List containers


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `all` | any | No | Show all containers |





---


### `start`

Start a container


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Container ID or name [min: 1, max: 200] (e.g. `my-container`) |





---


### `stop`

Stop a container


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Container ID or name [min: 1, max: 200] (e.g. `my-container`) |
| `timeout` | number | No | Seconds to wait before killing [min: 0, max: 300] |





---


### `restart`

Restart a container


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Container ID or name [min: 1, max: 200] (e.g. `my-container`) |
| `timeout` | number | No | Seconds to wait before killing [min: 0, max: 300] |





---


### `remove`

Remove a container


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Container ID or name [min: 1, max: 200] (e.g. `my-container`) |
| `force` | boolean | No | Force remove even if running |





---


### `logs`

Get container logs


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Container ID or name [min: 1, max: 200] (e.g. `my-container`) |
| `tail` | number | No | Number of lines from the end of logs [min: 1, max: 10000] |
| `timestamps` | boolean | No | Show timestamps |





---


### `images`

List images





---


### `pull`

Pull an image


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Image name [min: 1, max: 200] (e.g. `nginx`) |
| `tag` | string | No | Image tag [max: 50] (e.g. `alpine`) |





---


### `removeImage`

Remove an image


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Image ID or name [min: 1, max: 200] (e.g. `nginx:alpine`) |
| `force` | boolean | No | Force removal even if used by containers |





---


### `stats`

Get container stats


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Container ID or name [min: 1, max: 200] (e.g. `my-container`) |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph docker["📦 Docker"]
        direction TB
        PHOTON((🎯))
        T0[🔧 containers]
        PHOTON --> T0
        T1[▶️ start]
        PHOTON --> T1
        T2[⏹️ stop]
        PHOTON --> T2
        T3[🔧 restart]
        PHOTON --> T3
        T4[🗑️ remove]
        PHOTON --> T4
        T5[🔧 logs]
        PHOTON --> T5
        T6[🔧 images]
        PHOTON --> T6
        T7[🔧 pull]
        PHOTON --> T7
        T8[🗑️ removeImage]
        PHOTON --> T8
        T9[🔧 stats]
        PHOTON --> T9
    end

    subgraph deps["Dependencies"]
        direction TB
        NPM0[📚 dockerode]
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add docker

# Get MCP config for your client
photon info docker --mcp
```

## 📦 Dependencies


```
dockerode@^4.0.0
```

---

MIT · v1.0.0 · Portel
