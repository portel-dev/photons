# Feature Showcase

Core Runtime Feature Demos Demonstrates every major Photon runtime feature with test methods to prove each one works. Run `photon test feature-showcase` to verify. Features covered: - Lifecycle hooks (onInitialize, onShutdown) - configure() / getConfig() convention - All io.emit types (status, progress, stream, log, toast, thinking, artifact) - All io.ask types (text, password, confirm, select, number, file, date, form) - @Template methods (MCP prompts) - @format annotations (primitive, json, table, markdown) - Private _helper methods (hidden from tools) - Instance state across calls - this.emit() for pub/sub

> **12 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator` `channels`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `configure`

Set configuration values


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `theme` | 'light' | 'dark' | 'auto' | No | UI theme preference |
| `maxItems` | number | No | Maximum items to display {@default 10} [min: 1, max: 100] |
| `verbose` | boolean | No | Enable verbose logging |





---


### `getConfig`

Get current configuration





---


### `emits` ⚡

Demonstrates all io.emit types in a single generator. Yields status, progress, stream, log, toast, thinking, and artifact emissions to prove each type works.





---


### `asks` ⚡

Demonstrates all io.ask types interactively. Each ask type prompts the user for input, then returns a summary.





---


### `review`

A code review prompt template. Returns a structured prompt for code review assistance.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `language` | string | Yes | Programming language |
| `code` | string | Yes | Code snippet to review |





---


### `formatPrimitive`

Returns a plain string





---


### `formatJson`

Returns structured JSON data





---


### `formatTable`

Returns tabular data





---


### `formatMarkdown`

Returns markdown content





---


### `increment`

Increment the counter and return current value. Proves instance state persists across tool calls.





---


### `count`

Get the current counter value





---


### `broadcast`

Broadcast an event on a named channel


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | string | Yes | Channel name |
| `message` | string | Yes | Message to broadcast |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph feature_showcase["📦 Feature Showcase"]
        direction TB
        PHOTON((🎯))
        T0[⚙️ configure]
        PHOTON --> T0
        T1[📖 getConfig]
        PHOTON --> T1
        T2[🌊 emits (stream)]
        PHOTON --> T2
        T3[🌊 asks (stream)]
        PHOTON --> T3
        T4[🔧 review]
        PHOTON --> T4
        T5[🔧 formatPrimitive]
        PHOTON --> T5
        T6[🔧 formatJson]
        PHOTON --> T6
        T7[🔧 formatTable]
        PHOTON --> T7
        T8[🔧 formatMarkdown]
        PHOTON --> T8
        T9[🔧 increment]
        PHOTON --> T9
        T10[🔧 count]
        PHOTON --> T10
        T11[🔧 broadcast]
        PHOTON --> T11
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add feature-showcase

# Get MCP config for your client
photon info feature-showcase --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
