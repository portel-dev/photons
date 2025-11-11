# Filesystem

File and directory operations

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`FILESYSTEM_WORKDIR`** [OPTIONAL]
  - Type: string
  - Description: Working directory base path (default: ~/Documents)
  - Default: `path.join(homedir(), 'Documents')`

- **`FILESYSTEM_MAXFILESIZE`** [OPTIONAL]
  - Type: number
  - Description: Maximum file size in bytes (default: 10MB)
  - Default: `10485760`

- **`FILESYSTEM_ALLOWHIDDEN`** [OPTIONAL]
  - Type: boolean
  - Description: Allow access to hidden files/directories (default: false)
  





### Setup Instructions

- workdir: Working directory base path (default: ~/Documents)
- maxFileSize: Maximum file size in bytes (default: 10MB)
- allowHidden: Allow access to hidden files/directories (default: false)


## 🔧 Tools

This photon provides **13** tools:


### `read`

Read file contents


**Parameters:**


- **`path`** (any) - {@min 1} File path (relative to workdir or absolute) {@example README.md}

- **`encoding`** (any) - File encoding {@example utf-8}




**Example:**

```typescript
README.md}
```


---


### `write`

Write content to file


**Parameters:**


- **`path`** (any) - {@min 1} File path (relative to workdir or absolute) {@example report.json}

- **`content`** (any) - {@min 1} File content {@example {"name":"John"}}

- **`encoding`** (any) - File encoding {@example utf-8}




**Example:**

```typescript
report.json}
```


---


### `append`

Append content to file


**Parameters:**


- **`path`** (any) - {@min 1} File path (relative to workdir or absolute) {@example log.txt}

- **`content`** (any) - {@min 1} Content to append {@example New log entry\n}

- **`encoding`** (any) - File encoding {@example utf-8}




**Example:**

```typescript
log.txt}
```


---


### `remove`

Remove a file


**Parameters:**


- **`path`** (any) - {@min 1} File path (relative to workdir or absolute) {@example old-file.txt}




**Example:**

```typescript
old-file.txt}
```


---


### `copy`

Copy a file


**Parameters:**


- **`source`** (any) - {@min 1} Source file path {@example config.json}

- **`destination`** (any) - {@min 1} Destination file path {@example config.backup.json}




**Example:**

```typescript
config.json}
```


---


### `move`

Move/rename a file


**Parameters:**


- **`source`** (any) - {@min 1} Source file path {@example old-name.txt}

- **`destination`** (any) - {@min 1} Destination file path {@example new-name.txt}




**Example:**

```typescript
old-name.txt}
```


---


### `list`

List files in a directory


**Parameters:**


- **`path`** (any) - Directory path (relative to workdir or absolute, default: current workdir) {@example my-folder}

- **`recursive`** (any, optional) - List files recursively




**Example:**

```typescript
my-folder}
```


---


### `mkdir`

Create a directory


**Parameters:**


- **`path`** (any) - {@min 1} Directory path (relative to workdir or absolute) {@example new-folder}

- **`recursive`** (any, optional) - Create parent directories if needed




**Example:**

```typescript
new-folder}
```


---


### `rmdir`

Remove a directory


**Parameters:**


- **`path`** (any) - {@min 1} Directory path (relative to workdir or absolute) {@example old-folder}

- **`recursive`** (any, optional) - Remove directory and all contents




**Example:**

```typescript
old-folder}
```


---


### `info`

Get file or directory information


**Parameters:**


- **`path`** (any) - {@min 1} File or directory path {@example README.md}




**Example:**

```typescript
README.md}
```


---


### `exists`

Check if file or directory exists


**Parameters:**


- **`path`** (any) - {@min 1} File or directory path {@example config.json}




**Example:**

```typescript
config.json}
```


---


### `search`

Search for files matching a pattern


**Parameters:**


- **`pattern`** (any) - {@min 1} File name pattern (glob-style: *.txt, **\/*.js) {@example *.txt}

- **`path`** (any, optional) - Directory to search  {@example documents}




**Example:**

```typescript
.txt}
```


---


### `workdir`

Get current working directory





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

MIT • Version 1.0.0
