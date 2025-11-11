# Git

Local git repository operations

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`GIT_REPOPATH`** [OPTIONAL]
  - Type: string
  - Description: Default repository path (default: current directory)
  - Default: `process.cwd()`





### Setup Instructions

- repoPath: Default repository path (default: current directory)


## 🔧 Tools

This photon provides **11** tools:


### `status`

Get git status of repository


**Parameters:**


- **`path`** (any, optional) - Repository path





---


### `log`

View commit history


**Parameters:**


- **`path`** (any, optional) - {@max 500} Repository path

- **`maxCount`** (any, optional) - {@min 1} {@max 100} Maximum number of commits to retrieve

- **`branch`** (any, optional) - {@max 200} Branch name to get logs from  {@example main}





---


### `diff`

Show differences in repository


**Parameters:**


- **`path`** (any, optional) - {@max 500} Repository path

- **`staged`** (any, optional) - Show staged changes only

- **`file`** (any, optional) - {@max 500} Specific file to show diff for





---


### `branches`

List all branches in repository


**Parameters:**


- **`path`** (any, optional) - Repository path





---


### `branch`

Create a new branch


**Parameters:**


- **`name`** (any) - {@min 1} {@max 200} Branch name to create {@example feature/new-feature}

- **`path`** (any, optional) - {@max 500} Repository path

- **`checkout`** (any, optional) - Checkout the new branch after creation




**Example:**

```typescript
feature/new-feature}
```


---


### `checkout`

Checkout (switch to) a branch


**Parameters:**


- **`name`** (any) - {@min 1} {@max 200} Branch name to checkout {@example main}

- **`path`** (any, optional) - {@max 500} Repository path




**Example:**

```typescript
main}
```


---


### `removeBranch`

Delete a branch


**Parameters:**


- **`name`** (any) - {@min 1} {@max 200} Branch name to delete {@example old-feature}

- **`path`** (any, optional) - {@max 500} Repository path

- **`force`** (any, optional) - Force delete even if not fully merged




**Example:**

```typescript
old-feature}
```


---


### `add`

Stage files for commit


**Parameters:**


- **`files`** (any) - {@min 1} Array of file paths to stage (use '.' for all files) {@example ["src/index.ts","README.md"]}

- **`path`** (any, optional) - {@max 500} Repository path




**Example:**

```typescript
["src/index.ts","README.md"]}
```


---


### `commit`

Create a commit


**Parameters:**


- **`message`** (any) - {@min 1} {@max 500} Commit message {@example fix: resolve authentication bug}

- **`path`** (any, optional) - {@max 500} Repository path

- **`author`** (any) - {@max 200} Optional author override (format: "Name <email>")




**Example:**

```typescript
fix: resolve authentication bug}
```


---


### `push`

Push commits to remote repository


**Parameters:**


- **`path`** (any, optional) - {@max 500} Repository path

- **`remote`** (any, optional) - {@max 200} Remote name  {@example origin}

- **`branch`** (any, optional) - {@max 200} Branch name  {@example main}

- **`force`** (any, optional) - Force push




**Example:**

```typescript
origin}
```


---


### `pull`

Pull changes from remote repository


**Parameters:**


- **`path`** (any, optional) - {@max 500} Repository path

- **`remote`** (any, optional) - {@max 200} Remote name  {@example origin}

- **`branch`** (any, optional) - {@max 200} Branch name  {@example main}




**Example:**

```typescript
origin}
```


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
photon mcp ./git.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp git.photon.ts ~/.photon/

# Run by name
photon mcp git
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp git --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
simple-git@^3.21.0
```


## 📄 License

MIT • Version 1.0.0
