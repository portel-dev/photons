# Feature Showcase

Feature Showcase — Core Runtime Feature Demos

> **20 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator` `channels`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `configure`

Set configuration values


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `theme` | any | Yes | UI theme preference |
| `maxItems` | any | Yes | Maximum items to display {@default 10} [min: 1, max: 100] |
| `verbose` | any | Yes | Enable verbose logging |





---


### `getConfig`

Get current configuration





---


### `emits` ⚡

Demonstrates all io.emit types in a single generator  Yields status, progress, stream, log, toast, thinking, and artifact emissions to prove each type works.





---


### `asks` ⚡

Demonstrates all io.ask types interactively  Each ask type prompts the user for input, then returns a summary.





---


### `review`

A code review prompt template  Returns a structured prompt for code review assistance.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `language` | any | Yes | Programming language |
| `code` | any | Yes | Code snippet to review |





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

Increment the counter and return current value  Proves instance state persists across tool calls.





---


### `count`

Get the current counter value





---


### `broadcast`

Broadcast an event on a named channel


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | any | Yes | Channel name |
| `message` | any | Yes | Message to broadcast |





---


### `testLifecycleHooksRan`

Verify onInitialize lifecycle hook ran





---


### `testConfigureRoundtrip`

Verify configure/getConfig roundtrip





---


### `testEmitTypes`

Verify all emit types work in the generator





---


### `testPrivateMethodHidden`

Verify private methods are not in getToolMethods()





---


### `testInstanceState`

Verify instance state persists across calls





---


### `testFormatAnnotations`

Verify format annotation methods return correct types





---


### `testTemplateMethod`

Verify template method returns prompt structure





---


### `testBroadcast`

Verify broadcast sends to channel





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
        T12[✅ testLifecycleHooksRan]
        PHOTON --> T12
        T13[✅ testConfigureRoundtrip]
        PHOTON --> T13
        T14[✅ testEmitTypes]
        PHOTON --> T14
        T15[✅ testPrivateMethodHidden]
        PHOTON --> T15
        T16[✅ testInstanceState]
        PHOTON --> T16
        T17[✅ testFormatAnnotations]
        PHOTON --> T17
        T18[✅ testTemplateMethod]
        PHOTON --> T18
        T19[✅ testBroadcast]
        PHOTON --> T19
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add feature-showcase

# Get MCP config for your client
photon get feature-showcase --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
