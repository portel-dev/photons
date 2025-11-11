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


- **`path`** (any) [min: 1] - File path (relative to workdir or absolute) (e.g., `README.md`)

- **`encoding`** (any) - File encoding (e.g., `utf-8`)




**Example:**

```typescript
read("README.md")
```


---


### `write`

Write content to file


**Parameters:**


- **`path`** (any) [min: 1] - File path (relative to workdir or absolute) (e.g., `report.json`)

- **`content`** (any) [min: 1] - File content (e.g., `{"name":"John"}`)

- **`encoding`** (any) - File encoding (e.g., `utf-8`)




**Example:**

```typescript
write("report.json", '{"name": "John"}')
```


---


### `append`

Append content to file


**Parameters:**


- **`path`** (any) [min: 1] - File path (relative to workdir or absolute) (e.g., `log.txt`)

- **`content`** (any) [min: 1] - Content to append (e.g., `New log entry\n`)

- **`encoding`** (any) - File encoding (e.g., `utf-8`)




**Example:**

```typescript
append("log.txt", "New log entry\n")
```


---


### `remove`

Remove a file


**Parameters:**


- **`path`** (any) [min: 1] - File path (relative to workdir or absolute) (e.g., `old-file.txt`)




**Example:**

```typescript
remove("old-file.txt")
```


---


### `copy`

Copy a file


**Parameters:**


- **`source`** (any) [min: 1] - Source file path (e.g., `config.json`)

- **`destination`** (any) [min: 1] - Destination file path (e.g., `config.backup.json`)




**Example:**

```typescript
copy("config.json", "config.backup.json")
```


---


### `move`

Move/rename a file


**Parameters:**


- **`source`** (any) [min: 1] - Source file path (e.g., `old-name.txt`)

- **`destination`** (any) [min: 1] - Destination file path (e.g., `new-name.txt`)




**Example:**

```typescript
move("old-name.txt", "new-name.txt")
```


---


### `list`

List files in a directory


**Parameters:**


- **`path`** (any) - Directory path (relative to workdir or absolute, default: current workdir) (e.g., `my-folder`)

- **`recursive`** (any, optional) - List files recursively




**Example:**

```typescript
list()
```


---


### `mkdir`

Create a directory


**Parameters:**


- **`path`** (any) [min: 1] - Directory path (relative to workdir or absolute) (e.g., `new-folder`)

- **`recursive`** (any, optional) - Create parent directories if needed




**Example:**

```typescript
mkdir("new-folder")
```


---


### `rmdir`

Remove a directory


**Parameters:**


- **`path`** (any) [min: 1] - Directory path (relative to workdir or absolute) (e.g., `old-folder`)

- **`recursive`** (any, optional) - Remove directory and all contents




**Example:**

```typescript
rmdir("old-folder")
```


---


### `info`

Get file or directory information


**Parameters:**


- **`path`** (any) [min: 1] - File or directory path (e.g., `README.md`)




**Example:**

```typescript
info("README.md")
```


---


### `exists`

Check if file or directory exists


**Parameters:**


- **`path`** (any) [min: 1] - File or directory path (e.g., `config.json`)




**Example:**

```typescript
exists("config.json")
```


---


### `search`

Search for files matching a pattern


**Parameters:**


- **`pattern`** (any) [min: 1] - File name pattern (glob-style: *.txt, **\/*.js) (e.g., `*.txt`)

- **`path`** (any, optional) - Directory to search (e.g., `documents`)




**Example:**

```typescript
search("*.txt")
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
