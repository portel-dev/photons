# Filesystem

File and directory operations

## 📋 Overview

**Version:** 1.1.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`FILESYSTEM_WORKDIR`** [OPTIONAL]
  - Type: string
  - Description: Working directory base path (default: ~/Documents)
  - Default: `path.join(homedir(), '.photon')`

- **`FILESYSTEM_MAXFILESIZE`** [OPTIONAL]
  - Type: number
  - Description: Maximum file size in bytes (default: 10MB)
  - Default: `10485760`

- **`FILESYSTEM_ALLOWHIDDEN`** [OPTIONAL]
  - Type: boolean
  - Description: Allow access to hidden files/directories (default: false)
  - Default: `true`





### Setup Instructions

- workdir: Working directory base path (default: ~/Documents)
- maxFileSize: Maximum file size in bytes (default: 10MB)
- allowHidden: Allow access to hidden files/directories (default: false)


## 🔧 Tools

This photon provides **23** tools:


### `read`

Read file contents


**Parameters:**


- **`path`** (any) - File path (relative to workdir or absolute)

- **`encoding`** (any, optional) - File encoding





---


### `write`

Write content to file


**Parameters:**


- **`path`** (any) - File path (relative to workdir or absolute)

- **`content`** (any) - File content

- **`encoding`** (any, optional) - File encoding





---


### `append`

Append content to file


**Parameters:**


- **`path`** (any) - File path (relative to workdir or absolute)

- **`content`** (any) - Content to append

- **`encoding`** (any, optional) - File encoding





---


### `remove`

Remove a file


**Parameters:**


- **`path`** (any) - File path (relative to workdir or absolute)





---


### `copy`

Copy a file


**Parameters:**


- **`source`** (any) - Source file path

- **`destination`** (any) - Destination file path





---


### `move`

Move/rename a file


**Parameters:**


- **`source`** (any) - Source file path

- **`destination`** (any) - Destination file path





---


### `list`

List files in a directory


**Parameters:**


- **`path`** (any) - Directory path (relative to workdir or absolute, default: current workdir)

- **`recursive`** (any, optional) - List files recursively





---


### `mkdir`

Create a directory


**Parameters:**


- **`path`** (any) - Directory path (relative to workdir or absolute)

- **`recursive`** (any, optional) - Create parent directories if needed





---


### `rmdir`

Remove a directory


**Parameters:**


- **`path`** (any) - Directory path (relative to workdir or absolute)

- **`recursive`** (any, optional) - Remove directory and all contents





---


### `info`

Get file or directory information


**Parameters:**


- **`path`** (any) - File or directory path





---


### `exists`

Check if file or directory exists


**Parameters:**


- **`path`** (any) - File or directory path





---


### `search`

Search for files matching a pattern


**Parameters:**


- **`pattern`** (any) - File name pattern (glob-style: *.txt, **\/*.js)

- **`path`** (any, optional) - Directory to search





---


### `workdir`

Get current working directory





---


### `testBeforeAll`

No description available





---


### `testAfterAll`

No description available





---


### `testRead`

No description available





---


### `testWrite`

No description available





---


### `testExists`

No description available





---


### `testInfo`

No description available





---


### `testList`

No description available





---


### `testCopy`

No description available





---


### `testMkdir`

No description available





---


### `testGetWorkdir`

No description available





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
photon mcp ./filesystem.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp filesystem.photon.ts ~/.photon/

# Run by name
photon mcp filesystem
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp filesystem --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.1.0
