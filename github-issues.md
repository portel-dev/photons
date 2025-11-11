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


- **`owner`** (any) - {@min 1} {@max 100} Repository owner (username or organization) {@example octocat}

- **`repo`** (any) - {@min 1} {@max 100} Repository name {@example hello-world}

- **`state`** (any, optional) - Issue state filter  {@example open}

- **`labels`** (any) - {@max 500} Comma-separated label names to filter by {@example bug,enhancement}

- **`sort`** (any, optional) - Sort by created, updated, or comments  {@example created}

- **`per_page`** (any, optional) - {@min 1} {@max 100} Number of results per page




**Example:**

```typescript
octocat}
```


---


### `get`

Get a single issue by number


**Parameters:**


- **`owner`** (any) - {@min 1} {@max 100} Repository owner {@example octocat}

- **`repo`** (any) - {@min 1} {@max 100} Repository name {@example hello-world}

- **`issue_number`** (any) - {@min 1} Issue number {@example 42}




**Example:**

```typescript
octocat}
```


---


### `create`

Create a new issue


**Parameters:**


- **`owner`** (any) - {@min 1} {@max 100} Repository owner {@example octocat}

- **`repo`** (any) - {@min 1} {@max 100} Repository name {@example hello-world}

- **`title`** (any) - {@min 1} {@max 200} Issue title {@example Bug in user authentication}

- **`body`** (any) - {@max 5000} Issue description/body {@example Steps to reproduce: 1. Login 2. Navigate to profile}

- **`labels`** (any) - {@min 1} Array of label names {@example ["bug","priority-high"]}

- **`assignees`** (any) - {@min 1} Array of usernames to assign {@example ["octocat","hubot"]}




**Example:**

```typescript
octocat}
```


---


### `update`

Update an existing issue


**Parameters:**


- **`owner`** (any) - {@min 1} {@max 100} Repository owner {@example octocat}

- **`repo`** (any) - {@min 1} {@max 100} Repository name {@example hello-world}

- **`issue_number`** (any) - {@min 1} Issue number to update {@example 42}

- **`title`** (any, optional) - {@min 1} {@max 200} New title  {@example Updated: Bug in user authentication}

- **`body`** (any, optional) - {@max 5000} New body  {@example Additional details: This also affects mobile users}

- **`state`** (any, optional) - New state: open or closed  {@example closed}

- **`labels`** (any, optional) - {@min 1} New labels  {@example ["bug","fixed"]}




**Example:**

```typescript
octocat}
```


---


### `comment`

Add a comment to an issue


**Parameters:**


- **`owner`** (any) - {@min 1} {@max 100} Repository owner {@example octocat}

- **`repo`** (any) - {@min 1} {@max 100} Repository name {@example hello-world}

- **`issue_number`** (any) - {@min 1} Issue number {@example 42}

- **`body`** (any) - {@min 1} {@max 5000} Comment text {@example This issue has been fixed in the latest commit}




**Example:**

```typescript
octocat}
```


---


### `comments`

List comments on an issue


**Parameters:**


- **`owner`** (any) - {@min 1} {@max 100} Repository owner {@example octocat}

- **`repo`** (any) - {@min 1} {@max 100} Repository name {@example hello-world}

- **`issue_number`** (any) - {@min 1} Issue number {@example 42}




**Example:**

```typescript
octocat}
```


---


### `search`

Search issues across repositories


**Parameters:**


- **`query`** (any) - {@min 1} {@max 500} Search query {@example is:open label:bug repo:octocat/hello-world}

- **`sort`** (any, optional) - Sort by created, updated, or comments  {@example created}

- **`order`** (any, optional) - Sort order: asc or desc  {@example desc}

- **`per_page`** (any, optional) - {@min 1} {@max 100} Number of results per page




**Example:**

```typescript
is:open label:bug repo:octocat/hello-world}
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
