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


- **`owner`** (any) [min: 1, max: 100] - Repository owner (username or organization) (e.g., `octocat`)

- **`repo`** (any) [min: 1, max: 100] - Repository name (e.g., `hello-world`)

- **`state`** (any, optional) - Issue state filter (e.g., `open`)

- **`labels`** (any) [max: 500] - Comma-separated label names to filter by (e.g., `bug,enhancement`)

- **`sort`** (any, optional) - Sort by created, updated, or comments (e.g., `created`)

- **`per_page`** (any, optional) [min: 1, max: 100] - Number of results per page





---


### `get`

Get a single issue by number


**Parameters:**


- **`owner`** (any) [min: 1, max: 100] - Repository owner (e.g., `octocat`)

- **`repo`** (any) [min: 1, max: 100] - Repository name (e.g., `hello-world`)

- **`issue_number`** (any) [min: 1] - Issue number (e.g., `42`)





---


### `create`

Create a new issue


**Parameters:**


- **`owner`** (any) [min: 1, max: 100] - Repository owner (e.g., `octocat`)

- **`repo`** (any) [min: 1, max: 100] - Repository name (e.g., `hello-world`)

- **`title`** (any) [min: 1, max: 200] - Issue title (e.g., `Bug in user authentication`)

- **`body`** (any) [max: 5000] - Issue description/body (e.g., `Steps to reproduce: 1. Login 2. Navigate to profile`)

- **`labels`** (any) [min: 1] - Array of label names (e.g., `["bug","priority-high"]`)

- **`assignees`** (any) [min: 1] - Array of usernames to assign (e.g., `["octocat","hubot"]`)





---


### `update`

Update an existing issue


**Parameters:**


- **`owner`** (any) [min: 1, max: 100] - Repository owner (e.g., `octocat`)

- **`repo`** (any) [min: 1, max: 100] - Repository name (e.g., `hello-world`)

- **`issue_number`** (any) [min: 1] - Issue number to update (e.g., `42`)

- **`title`** (any, optional) [min: 1, max: 200] - New title (e.g., `Updated: Bug in user authentication`)

- **`body`** (any, optional) [max: 5000] - New body (e.g., `Additional details: This also affects mobile users`)

- **`state`** (any, optional) - New state: open or closed (e.g., `closed`)

- **`labels`** (any, optional) [min: 1] - New labels (e.g., `["bug","fixed"]`)





---


### `comment`

Add a comment to an issue


**Parameters:**


- **`owner`** (any) [min: 1, max: 100] - Repository owner (e.g., `octocat`)

- **`repo`** (any) [min: 1, max: 100] - Repository name (e.g., `hello-world`)

- **`issue_number`** (any) [min: 1] - Issue number (e.g., `42`)

- **`body`** (any) [min: 1, max: 5000] - Comment text (e.g., `This issue has been fixed in the latest commit`)





---


### `comments`

List comments on an issue


**Parameters:**


- **`owner`** (any) [min: 1, max: 100] - Repository owner (e.g., `octocat`)

- **`repo`** (any) [min: 1, max: 100] - Repository name (e.g., `hello-world`)

- **`issue_number`** (any) [min: 1] - Issue number (e.g., `42`)





---


### `search`

Search issues across repositories


**Parameters:**


- **`query`** (any) [min: 1, max: 500] - Search query (e.g., `is:open label:bug repo:octocat/hello-world`)

- **`sort`** (any, optional) - Sort by created, updated, or comments (e.g., `created`)

- **`order`** (any, optional) - Sort order: asc or desc (e.g., `desc`)

- **`per_page`** (any, optional) [min: 1, max: 100] - Number of results per page





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
