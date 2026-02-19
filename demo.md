# Demo

Feature showcase Comprehensive demonstration of Photon runtime features: return types, parameters, progress indicators, user input (elicitation), state management, and UI formats.

> **14 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator`

## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `DEMO_APIKEY` | No | string | No description available (default: `demo-key`) |




## 🔧 Tools


### `echo`

Echo a message


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | - (e.g. `Hello, Photon!`) |





---


### `add`

Add two numbers


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `a` | number | Yes | - (e.g. `5`) |
| `b` | number | Yes | - (e.g. `3`) |





---


### `greet`

Greet someone


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | - (e.g. `Alice`) |





---


### `showProgress` ⚡

Show progress with steps


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `steps` | number | No | - (e.g. `5`) |





---


### `askName` ⚡

Interactive name prompt





---


### `confirmAction` ⚡

Confirmation prompt





---


### `selectOption` ⚡

Selection from options





---


### `multiStepForm` ⚡

Multi-step registration form





---


### `counter`

Counter state management


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | 'increment' | 'decrement' | 'reset' | 'get' | Yes | - [choice: increment,decrement,reset,get] |





---


### `todos`

Todo management


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | 'add' | 'remove' | 'list' | 'clear' | Yes | - [choice: add,remove,list,clear] |
| `item` | string | No | Optional item text |





---


### `users`

Sample users table





---


### `docs`

Documentation in markdown





---


### `tree`

Sample tree structure





---


### `config`

Get current config





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph demo["📦 Demo"]
        direction TB
        PHOTON((🎯))
        T0[🔧 echo]
        PHOTON --> T0
        T1[✏️ add]
        PHOTON --> T1
        T2[🔧 greet]
        PHOTON --> T2
        T3[🌊 showProgress (stream)]
        PHOTON --> T3
        T4[🌊 askName (stream)]
        PHOTON --> T4
        T5[🌊 confirmAction (stream)]
        PHOTON --> T5
        T6[🌊 selectOption (stream)]
        PHOTON --> T6
        T7[🌊 multiStepForm (stream)]
        PHOTON --> T7
        T8[🔧 counter]
        PHOTON --> T8
        T9[🔧 todos]
        PHOTON --> T9
        T10[🔧 users]
        PHOTON --> T10
        T11[🔧 docs]
        PHOTON --> T11
        T12[🔧 tree]
        PHOTON --> T12
        T13[⚙️ config]
        PHOTON --> T13
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
