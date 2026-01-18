# Demo Photon

Comprehensive feature demonstration

## 📋 Overview

**Version:** 1.0.0
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`DEMO_PHOTON_APIKEY`** [OPTIONAL]
  - Type: string
  - Description: No description available
  - Default: `demo-key`






## 🔧 Tools

This photon provides **21** tools:


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


**Parameters:**


- **`message`** (any) - The message to echo





---


### `add`

Add two numbers


**Parameters:**


- **`a`** (any) - First number

- **`b`** (any) - Second number





---


### `greet`

Greet with optional name


**Parameters:**


- **`name`** (any, optional) - Optional name





---


### `setLogLevel`

Set log level


**Parameters:**


- **`level`** (any) - Log level to set





---


### `showProgress`

Demonstrates progress indicators


**Parameters:**


- **`steps`** (any) - Number of steps to execute





---


### `showSpinner`

Spinner progress (indeterminate)





---


### `askName`

Ask for user's name interactively





---


### `confirmAction`

Confirm action with user





---


### `selectOption`

Select from options





---


### `multiStepForm`

Multi-step form with progress





---


### `counter`

Counter with persistent state


**Parameters:**


- **`action`** (any) - Action to perform





---


### `todos`

Todo list manager


**Parameters:**


- **`action`** (any) - Action to perform

- **`item`** (any) - Todo item text





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





## 📥 Usage

### Install Photon CLI

```bash
npm install -g @portel/photon
```

### Run This Photon

**Option 1: Run directly from file**

```bash
# Clone/download the photon file
photon mcp ./demo.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp demo.photon.ts ~/.photon/

# Run by name
photon mcp demo
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp demo --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.0.0
