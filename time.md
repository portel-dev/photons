# Time

Timezone and time conversion Timezone-aware time operations using native Node.js Intl API (zero dependencies).

> **3 tools** · API Photon · v1.0.0 · MIT


## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `TIME_LOCAL_TIMEZONE` | No | string | No description available |





## 🔧 Tools


### `now`

Current time in a timezone


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `timezone` | any | Yes | IANA timezone (e.g. `America/New_York`) |





---


### `convert`

Convert time between timezones


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source_timezone` | string | Yes | Source IANA timezone (e.g. `America/New_York`) |
| `time` | string | Yes | Time in HH:MM format (e.g. `14:30`) |
| `target_timezone` | string | Yes | Target IANA timezone (e.g. `Europe/London`) |
| `date` | string | No | Date in YYYY-MM-DD format (e.g. `2024-03-15`) |





---


### `timezones`

List common timezones


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | any | Yes | Filter by region [choice: America,Europe,Asia,Africa,Pacific,Atlantic,Indian] |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph time["📦 Time"]
        direction TB
        PHOTON((🎯))
        T0[🔧 now]
        PHOTON --> T0
        T1[🔧 convert]
        PHOTON --> T1
        T2[🔧 timezones]
        PHOTON --> T2
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add time

# Get MCP config for your client
photon info time --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
