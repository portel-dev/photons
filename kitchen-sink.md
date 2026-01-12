# Kitchen Sink

Kitchen Sink Photon

## 📋 Overview

**Version:** 1.0.0
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`KITCHEN_SINK_PHOTON_APIKEY`** [OPTIONAL]
  - Type: string
  - Description: No description available
  - Default: `<your-api-key>`

- **`KITCHEN_SINK_PHOTON_BASEURL`** [OPTIONAL]
  - Type: string
  - Description: No description available
  - Default: `https://api.example.com`

- **`KITCHEN_SINK_PHOTON_DEBUG`** [OPTIONAL]
  - Type: boolean
  - Description: No description available
  






## 🔧 Tools

This photon provides **25** tools:


### `basicStringReturn`

Returns a simple string  Demonstrates the simplest tool - no parameters, returns a string.





---


### `basicNumberReturn`

Returns a number  Tools can return any JSON-serializable type.





---


### `basicBooleanReturn`

Returns a boolean





---


### `basicObjectReturn`

Returns an object  Complex objects are automatically serialized to JSON.





---


### `basicArrayReturn`

Returns an array





---


### `paramString`

Demonstrates string parameter


**Parameters:**


- **`message`** (any) - The message to echo back





---


### `paramNumber`

Demonstrates number parameter


**Parameters:**


- **`value`** (any) - A numeric value to double





---


### `paramBoolean`

Demonstrates boolean parameter


**Parameters:**


- **`enabled`** (any) - Whether the feature is enabled





---


### `paramEnum`

Demonstrates enum parameter (string literals)


**Parameters:**


- **`level`** (any) - Log level to use





---


### `paramOptional`

Demonstrates optional parameter with default


**Parameters:**


- **`name`** (any) - Name to greet (optional, defaults to "World")

- **`excited`** (any) - Add exclamation marks





---


### `paramArray`

Demonstrates array parameter


**Parameters:**


- **`items`** (any) - List of items to process





---


### `paramObject`

Demonstrates object parameter


**Parameters:**


- **`user`** (any) - User object with name and age





---


### `paramMultipleRequired`

Demonstrates multiple required parameters


**Parameters:**


- **`firstName`** (any) - First name (required)

- **`lastName`** (any) - Last name (required)

- **`age`** (any) - Age (required)





---


### `streamingText`

Streams text word by word  Async generators enable streaming responses. Each yield sends a chunk to the client.





---


### `streamingNumbers`

Streams numbered items


**Parameters:**


- **`count`** (any) - Number of items to stream





---


### `streamingObjects`

Streams JSON objects  You can stream structured data too - each yield is a complete chunk.





---


### `progressDemo`

Demonstrates progress reporting using io helper  Uses async generator with `io.emit.*` to send progress updates.


**Parameters:**


- **`duration`** (any) - Duration in seconds (default 5)





---


### `memoryCounter`

Simple counter with in-memory state  State persists during the server session but resets on restart.


**Parameters:**


- **`action`** (any) - What to do with the counter





---


### `memoryTodoList`

In-memory todo list


**Parameters:**


- **`action`** (any) - What to do

- **`item`** (any) - Item to add or remove





---


### `uiGetUsers`

Get all users with visual card display  Returns data for the users UI template.





---


### `uiGetDashboard`

Get dashboard metrics  Returns data for the dashboard UI template.





---


### `uiSearch`

Search results with rich display


**Parameters:**


- **`query`** (any) - Search query string





---


### `errorHandlingDemo`

Demonstrates proper error handling  Thrown errors are caught and returned as MCP error responses.


**Parameters:**


- **`shouldFail`** (any) - Whether to simulate a failure





---


### `errorValidation`

Demonstrates validation errors


**Parameters:**


- **`value`** (any) - Must be between 1 and 100





---


### `showConfig`

Shows current configuration  Demonstrates accessing constructor parameters (env vars).





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
photon mcp ./kitchen-sink.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp kitchen-sink.photon.ts ~/.photon/

# Run by name
photon mcp kitchen-sink
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp kitchen-sink --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.0.0
