# Demo Photon

Comprehensive feature demonstration Demonstrates all Photon runtime features with Node.js compatible syntax. This version avoids TypeScript parameter properties for compatibility.

> **21 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator`

## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `DEMO_PHOTON_APIKEY` | No | string | No description available (default: `demo-key`) |




## 🔧 Tools


### `getString`

Returns a simple string





---


### `getNumber`

Returns a number





---


### `getBoolean`

Returns a boolean





---


### `getObject`

Returns an object





---


### `getArray`

Returns an array





---


### `echo`

Echo back a message


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The message to echo |





---


### `add`

Add two numbers


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `a` | number | Yes | First number |
| `b` | number | Yes | Second number |





---


### `greet`

Greet with optional name


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Optional name |





---


### `setLogLevel`

Set log level


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `level` | 'debug' | 'info' | 'warn' | 'error' | Yes | Log level to set |





---


### `showProgress` ⚡

Demonstrates progress indicators


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `steps` | number | No | Number of steps to execute |





---


### `showSpinner` ⚡

Spinner progress (indeterminate)





---


### `askName` ⚡

Ask for user's name interactively





---


### `confirmAction` ⚡

Confirm action with user





---


### `selectOption` ⚡

Select from options





---


### `multiStepForm` ⚡

Multi-step form with progress





---


### `counter`

Counter with persistent state


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | 'increment' | 'decrement' | 'reset' | 'get' | Yes | Action to perform |





---


### `todos`

Todo list manager


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | 'add' | 'remove' | 'list' | 'clear' | Yes | Action to perform |
| `item` | string | No | Todo item text |





---


### `getUsers`

Returns users as table





---


### `getDocs`

Returns markdown documentation





---


### `getTree`

Returns hierarchical tree data





---


### `getConfig`

Get configuration (demonstrates accessing constructor params)





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph demo["📦 Demo"]
        direction TB
        PHOTON((🎯))
        T0[📖 getString]
        PHOTON --> T0
        T1[📖 getNumber]
        PHOTON --> T1
        T2[📖 getBoolean]
        PHOTON --> T2
        T3[📖 getObject]
        PHOTON --> T3
        T4[📖 getArray]
        PHOTON --> T4
        T5[🔧 echo]
        PHOTON --> T5
        T6[✏️ add]
        PHOTON --> T6
        T7[🔧 greet]
        PHOTON --> T7
        T8[✏️ setLogLevel]
        PHOTON --> T8
        T9[🌊 showProgress (stream)]
        PHOTON --> T9
        T10[🌊 showSpinner (stream)]
        PHOTON --> T10
        T11[🌊 askName (stream)]
        PHOTON --> T11
        T12[🌊 confirmAction (stream)]
        PHOTON --> T12
        T13[🌊 selectOption (stream)]
        PHOTON --> T13
        T14[🌊 multiStepForm (stream)]
        PHOTON --> T14
        T15[🔧 counter]
        PHOTON --> T15
        T16[🔧 todos]
        PHOTON --> T16
        T17[📖 getUsers]
        PHOTON --> T17
        T18[📖 getDocs]
        PHOTON --> T18
        T19[📖 getTree]
        PHOTON --> T19
        T20[📖 getConfig]
        PHOTON --> T20
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add demo

# Get MCP config for your client
photon info demo --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
