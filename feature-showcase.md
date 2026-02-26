# Feature Showcase

Core Runtime Feature Demos Demonstrates every major Photon runtime feature with test methods to prove each one works. Run `photon test feature-showcase` to verify.

> **10 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator` `channels`

## ⚙️ Configuration

No configuration required.



## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `emits` ⚡ | Demonstrates all io.emit types in a single generator. |
| `asks` ⚡ | Demonstrates all io.ask types interactively. |
| `review` | A code review prompt template. |
| `formatPrimitive` | Returns a plain string |
| `formatJson` | Returns structured JSON data |
| `formatTable` | Returns tabular data |
| `formatMarkdown` | Returns markdown content |
| `increment` | Increment the counter and return current value. |
| `count` | Get the current counter value |
| `broadcast` | Broadcast an event on a named channel |


## 🔧 Tools


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
        T0[🌊 emits (stream)]
        PHOTON --> T0
        T1[🌊 asks (stream)]
        PHOTON --> T1
        T2[🔧 review]
        PHOTON --> T2
        T3[🔧 formatPrimitive]
        PHOTON --> T3
        T4[🔧 formatJson]
        PHOTON --> T4
        T5[🔧 formatTable]
        PHOTON --> T5
        T6[🔧 formatMarkdown]
        PHOTON --> T6
        T7[🔧 increment]
        PHOTON --> T7
        T8[🔧 count]
        PHOTON --> T8
        T9[🔧 broadcast]
        PHOTON --> T9
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
