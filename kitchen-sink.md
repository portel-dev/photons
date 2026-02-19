# Kitchen Sink

Kitchen Sink Photon

> **25 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator` `custom-ui`

## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `KITCHEN_SINK_PHOTON_APIKEY` | No | string | No description available (default: `<your-api-key>`) |
| `KITCHEN_SINK_PHOTON_BASEURL` | No | string | No description available (default: `https://api.example.com`) |
| `KITCHEN_SINK_PHOTON_DEBUG` | No | boolean | No description available |




## 🔧 Tools


### `basicStringReturn`

Returns a simple string. Demonstrates the simplest tool - no parameters, returns a string.





---


### `basicNumberReturn`

Returns a number. Tools can return any JSON-serializable type.





---


### `basicBooleanReturn`

Returns a boolean





---


### `basicObjectReturn`

Returns an object. Complex objects are automatically serialized to JSON.





---


### `basicArrayReturn`

Returns an array





---


### `paramString`

Demonstrates string parameter


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The message to echo back |





---


### `paramNumber`

Demonstrates number parameter


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `value` | number | Yes | A numeric value to double |





---


### `paramBoolean`

Demonstrates boolean parameter


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enabled` | boolean | Yes | Whether the feature is enabled |





---


### `paramEnum`

Demonstrates enum parameter (string literals)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `level` | 'debug' | 'info' | 'warn' | 'error' | Yes | Log level to use |





---


### `paramOptional`

Demonstrates optional parameter with default


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Name to greet (optional, defaults to "World") |
| `excited` | boolean | No | Add exclamation marks |





---


### `paramArray`

Demonstrates array parameter


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `items` | string[] | Yes | List of items to process |





---


### `paramObject`

Demonstrates object parameter


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user` | { name: string | Yes | User object with name and age |





---


### `paramMultipleRequired`

Demonstrates multiple required parameters


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firstName` | string | Yes | First name (required) |
| `lastName` | string | Yes | Last name (required) |
| `age` | number | Yes | Age (required) |





---


### `streamingText` ⚡

Streams text word by word. Async generators enable streaming responses. Each yield sends a chunk to the client.





---


### `streamingNumbers` ⚡

Streams numbered items


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `count` | number | Yes | Number of items to stream |





---


### `streamingObjects` ⚡

Streams JSON objects. You can stream structured data too - each yield is a complete chunk.





---


### `progressDemo` ⚡

Demonstrates progress reporting using io helper. Uses async generator with `io.emit.*` to send progress updates.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `duration` | number | No | Duration in seconds (default 5) |





---


### `memoryCounter`

Simple counter with in-memory state. State persists during the server session but resets on restart.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | 'increment' | 'decrement' | 'reset' | 'get' | Yes | What to do with the counter |





---


### `memoryTodoList`

In-memory todo list


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | 'add' | 'remove' | 'list' | 'clear' | Yes | What to do |
| `item` | string | No | Item to add or remove |





---


### `uiGetUsers`

Get all users with visual card display. Returns data for the users UI template.





---


### `uiGetDashboard`

Get dashboard metrics. Returns data for the dashboard UI template.





---


### `uiSearch`

Search results with rich display


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query string |





---


### `errorHandlingDemo`

Demonstrates proper error handling. Thrown errors are caught and returned as MCP error responses.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `shouldFail` | boolean | Yes | Whether to simulate a failure |





---


### `errorValidation`

Demonstrates validation errors


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `value` | number | Yes | Must be between 1 and 100 |





---


### `showConfig`

Shows current configuration. Demonstrates accessing constructor parameters (env vars).





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph kitchen_sink["📦 Kitchen Sink"]
        direction TB
        PHOTON((🎯))
        T0[🔧 basicStringReturn]
        PHOTON --> T0
        T1[🔧 basicNumberReturn]
        PHOTON --> T1
        T2[🔧 basicBooleanReturn]
        PHOTON --> T2
        T3[🔧 basicObjectReturn]
        PHOTON --> T3
        T4[🔧 basicArrayReturn]
        PHOTON --> T4
        T5[🔧 paramString]
        PHOTON --> T5
        T6[🔧 paramNumber]
        PHOTON --> T6
        T7[🔧 paramBoolean]
        PHOTON --> T7
        T8[🔧 paramEnum]
        PHOTON --> T8
        T9[🔧 paramOptional]
        PHOTON --> T9
        T10[🔧 paramArray]
        PHOTON --> T10
        T11[🔧 paramObject]
        PHOTON --> T11
        T12[🔧 paramMultipleRequired]
        PHOTON --> T12
        T13[🌊 streamingText (stream)]
        PHOTON --> T13
        T14[🌊 streamingNumbers (stream)]
        PHOTON --> T14
        T15[🌊 streamingObjects (stream)]
        PHOTON --> T15
        T16[🌊 progressDemo (stream)]
        PHOTON --> T16
        T17[🔧 memoryCounter]
        PHOTON --> T17
        T18[🔧 memoryTodoList]
        PHOTON --> T18
        T19[🔧 uiGetUsers]
        PHOTON --> T19
        T20[🔧 uiGetDashboard]
        PHOTON --> T20
        T21[🔧 uiSearch]
        PHOTON --> T21
        T22[🔧 errorHandlingDemo]
        PHOTON --> T22
        T23[🔧 errorValidation]
        PHOTON --> T23
        T24[🔧 showConfig]
        PHOTON --> T24
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add kitchen-sink

# Get MCP config for your client
photon info kitchen-sink --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
