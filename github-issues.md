# GitHub Issues

Manage GitHub repository issues

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`GIT_HUB_ISSUES_TOKEN`** [REQUIRED]
  - Type: string
  - Description: GitHub personal access token (required)
  

- **`GIT_HUB_ISSUES_BASEURL`** [OPTIONAL]
  - Type: string
  - Description: GitHub API base URL (default: https://api.github.com)
  - Default: `https://api.github.com`





### Setup Instructions

- token: GitHub personal access token (required)
- baseUrl: GitHub API base URL (default: https://api.github.com)
Dependencies are auto-installed on first run.


## 🔧 Tools

This photon provides **7** tools:


### `list`

List issues in a repository


**Parameters:**


- **`owner`** (any) - Repository owner (username or organization)

- **`repo`** (any) - Repository name

- **`state`** (any, optional) - Issue state filter

- **`labels`** (any) - Comma-separated label names to filter by

- **`sort`** (any, optional) - Sort by created, updated, or comments

- **`per_page`** (any, optional) - Number of results per page





---


### `get`

Get a single issue by number


**Parameters:**


- **`owner`** (any) - Repository owner

- **`repo`** (any) - Repository name

- **`issue_number`** (any) - Issue number





---


### `create`

Create a new issue


**Parameters:**


- **`owner`** (any) - Repository owner

- **`repo`** (any) - Repository name

- **`title`** (any) - Issue title

- **`body`** (any) - Issue description/body

- **`labels`** (any) - Array of label names

- **`assignees`** (any) - Array of usernames to assign





---


### `update`

Update an existing issue


**Parameters:**


- **`owner`** (any) - Repository owner

- **`repo`** (any) - Repository name

- **`issue_number`** (any) - Issue number to update

- **`title`** (any, optional) - New title

- **`body`** (any, optional) - New body

- **`state`** (any, optional) - New state: open or closed

- **`labels`** (any, optional) - New labels





---


### `comment`

Add a comment to an issue


**Parameters:**


- **`owner`** (any) - Repository owner

- **`repo`** (any) - Repository name

- **`issue_number`** (any) - Issue number

- **`body`** (any) - Comment text





---


### `comments`

List comments on an issue


**Parameters:**


- **`owner`** (any) - Repository owner

- **`repo`** (any) - Repository name

- **`issue_number`** (any) - Issue number





---


### `search`

Search issues across repositories


**Parameters:**


- **`query`** (any) - Search query (e.g., "is:open label:bug")

- **`sort`** (any, optional) - Sort by created, updated, or comments

- **`order`** (any, optional) - Sort order: asc or desc

- **`per_page`** (any, optional) - Number of results per page





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
photon mcp ./github-issues.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp github-issues.photon.ts ~/.photon/

# Run by name
photon mcp github-issues
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp github-issues --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@octokit/rest@^20.0.0
```


## 📄 License

MIT • Version 1.0.0
