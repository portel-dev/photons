# Time

Timezone and time conversion operations

> **9 tools** · API Photon · v1.0.0 · MIT


## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `TIME_LOCAL_TIMEZONE` | No | string | Override system timezone (optional, IANA timezone name) |



### Setup Instructions

- local_timezone: Override system timezone (optional, IANA timezone name)


## 🔧 Tools


### `now`

Current time in a specific timezone


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `timezone` | any | Yes | IANA timezone name (e.g. `America/New_York`) |





---


### `convert`

Convert time from one timezone to another


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source_timezone` | any | Yes | Source IANA timezone [min: 1, max: 100] (e.g. `America/New_York`) |
| `time` | any | Yes | Time in 24-hour format (HH:MM) [min: 1, max: 10, format: time] (e.g. `14:30`) |
| `target_timezone` | any | Yes | Target IANA timezone [min: 1, max: 100] (e.g. `Europe/London`) |
| `date` | any | Yes | Date in YYYY-MM-DD format (optional, default: today) [max: 20, format: date] (e.g. `2024-03-15`) |





---


### `timezones`

List common IANA timezones by region


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | any | Yes | Filter by region (e.g. `America`) |





---


### `testNow`

No description available





---


### `testNowWithTimezone`

No description available





---


### `testNowInvalidTimezone`

No description available





---


### `testTimezones`

No description available





---


### `testTimezonesRegion`

No description available





---


### `testConvert`

No description available





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
        T3[✅ testNow]
        PHOTON --> T3
        T4[✅ testNowWithTimezone]
        PHOTON --> T4
        T5[✅ testNowInvalidTimezone]
        PHOTON --> T5
        T6[✅ testTimezones]
        PHOTON --> T6
        T7[✅ testTimezonesRegion]
        PHOTON --> T7
        T8[✅ testConvert]
        PHOTON --> T8
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add time

# Get MCP config for your client
photon get time --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
