# git

Git - Local git repository operations

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


- **`path`** (any, optional) - Repository path

- **`maxCount`** (any, optional) - Maximum number of commits to retrieve

- **`branch`** (any, optional) - Branch name to get logs from





---


### `diff`

Show differences in repository


**Parameters:**


- **`path`** (any, optional) - Repository path

- **`staged`** (any, optional) - Show staged changes only

- **`file`** (any, optional) - Specific file to show diff for





---


### `listBranches`

List all branches in repository


**Parameters:**


- **`path`** (any, optional) - Repository path





---


### `createBranch`

Create a new branch


**Parameters:**


- **`name`** (any) - Branch name to create

- **`path`** (any, optional) - Repository path

- **`checkout`** (any, optional) - Checkout the new branch after creation





---


### `checkoutBranch`

Checkout (switch to) a branch


**Parameters:**


- **`name`** (any) - Branch name to checkout

- **`path`** (any, optional) - Repository path





---


### `deleteBranch`

Delete a branch


**Parameters:**


- **`name`** (any) - Branch name to delete

- **`path`** (any, optional) - Repository path

- **`force`** (any, optional) - Force delete even if not fully merged





---


### `add`

Stage files for commit


**Parameters:**


- **`files`** (any) - Array of file paths to stage (use '.' for all files)

- **`path`** (any, optional) - Repository path





---


### `commit`

Create a commit


**Parameters:**


- **`message`** (any) - Commit message

- **`path`** (any, optional) - Repository path

- **`author`** (any) - Optional author override (format: "Name <email>")





---


### `push`

Push commits to remote repository


**Parameters:**


- **`path`** (any, optional) - Repository path

- **`remote`** (any, optional) - Remote name

- **`branch`** (any, optional) - Branch name

- **`force`** (any, optional) - Force push





---


### `pull`

Pull changes from remote repository


**Parameters:**


- **`path`** (any, optional) - Repository path

- **`remote`** (any, optional) - Remote name

- **`branch`** (any, optional) - Branch name





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
photon ./git.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp git.photon.ts ~/.photon/

# Run by name
photon git
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon git --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
simple-git@^3.21.0
```


## 📄 License

MIT • Version 1.0.0
