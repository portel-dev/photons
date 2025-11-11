# Jira

Project management and issue tracking

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`JIRA_HOST`** [REQUIRED]
  - Type: string
  - Description: Jira instance URL (e.g., "your-domain.atlassian.net")
  

- **`JIRA_EMAIL`** [REQUIRED]
  - Type: string
  - Description: User email for authentication
  

- **`JIRA_APITOKEN`** [REQUIRED]
  - Type: string
  - Description: API token from Jira (required)
  





### Setup Instructions

- host: Jira instance URL (e.g., "your-domain.atlassian.net")
- email: User email for authentication
- apiToken: API token from Jira (required)


## 🔧 Tools

This photon provides **10** tools:


### `search`

List issues with JQL query


**Parameters:**


- **`jql`** (any) [min: 1, max: 1000] - JQL query string (e.g., `project = PROJ AND status = Open`)

- **`maxResults`** (any, optional) [min: 1, max: 100] - Maximum number of results

- **`fields`** (any) [max: 500] - Fields to return (optional, comma-separated) (e.g., `summary,status,assignee`)





---


### `get`

Get issue details


**Parameters:**


- **`issueKey`** (any) [min: 1, max: 50] - Issue key (e.g., `PROJ-123`)





---


### `create`

Create a new issue


**Parameters:**


- **`project`** (any) [min: 1, max: 50] - Project key (e.g., `PROJ`)

- **`summary`** (any) [min: 1, max: 200] - Issue title (e.g., `Login authentication fails for users`)

- **`issueType`** (any) [min: 1, max: 50] - Issue type (e.g., `Bug`)

- **`description`** (any, optional) [max: 5000] - Issue description (e.g., `Steps to reproduce: 1. Navigate to login 2. Enter credentials`)

- **`priority`** (any, optional) [max: 50] - Priority name (e.g., `High`)

- **`assignee`** (any, optional) [max: 100] - Assignee account ID (e.g., `5b10a2844c20165700ede21g`)





---


### `update`

Update an issue


**Parameters:**


- **`issueKey`** (any) [min: 1, max: 50] - Issue key (e.g., `PROJ-123`)

- **`summary`** (any, optional) [min: 1, max: 200] - New summary (e.g., `Updated: Login authentication fixed`)

- **`description`** (any, optional) [max: 5000] - New description (e.g., `Fixed by updating OAuth configuration`)

- **`priority`** (any, optional) [max: 50] - New priority (e.g., `Medium`)

- **`assignee`** (any, optional) [max: 100] - New assignee account ID (e.g., `5b10a2844c20165700ede21g`)





---


### `transition`

Transition issue to new status


**Parameters:**


- **`issueKey`** (any) [min: 1, max: 50] - Issue key (e.g., `PROJ-123`)

- **`transitionId`** (any) [min: 1, max: 50] - Transition ID or name (e.g., `21`)





---


### `transitions`

Get available transitions for issue


**Parameters:**


- **`issueKey`** (any) [min: 1, max: 50] - Issue key (e.g., `PROJ-123`)





---


### `comment`

Add comment to issue


**Parameters:**


- **`issueKey`** (any) [min: 1, max: 50] - Issue key (e.g., `PROJ-123`)

- **`comment`** (any) [min: 1, max: 5000] - Comment text (e.g., `This issue has been resolved in the latest deployment`)





---


### `comments`

Get comments for issue


**Parameters:**


- **`issueKey`** (any) [min: 1, max: 50] - Issue key (e.g., `PROJ-123`)

- **`maxResults`** (any, optional) [min: 1, max: 100] - Maximum number of comments





---


### `projects`

List all projects





---


### `project`

Get project details


**Parameters:**


- **`projectKey`** (any) [min: 1, max: 50] - Project key (e.g., `PROJ`)





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
photon mcp ./jira.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp jira.photon.ts ~/.photon/

# Run by name
photon mcp jira
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp jira --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
axios@^1.6.0
```


## 📄 License

MIT • Version 1.0.0
