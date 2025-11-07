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


### `searchIssues`

List issues with JQL query


**Parameters:**


- **`jql`** (any) - JQL query string (e.g., "project = PROJ AND status = Open")

- **`maxResults`** (any, optional) - Maximum number of results

- **`fields`** (any) - Fields to return (optional, comma-separated)





---


### `getIssue`

Get issue details


**Parameters:**


- **`issueKey`** (any) - Issue key (e.g., "PROJ-123")





---


### `createIssue`

Create a new issue


**Parameters:**


- **`project`** (any) - Project key (e.g., "PROJ")

- **`summary`** (any) - Issue title

- **`issueType`** (any) - Issue type (e.g., "Bug", "Task", "Story")

- **`description`** (any, optional) - Issue description

- **`priority`** (any) - Priority name (optional, e.g., "High", "Medium", "Low")

- **`assignee`** (any, optional) - Assignee account ID





---


### `updateIssue`

Update an issue


**Parameters:**


- **`issueKey`** (any) - Issue key (e.g., "PROJ-123")

- **`summary`** (any, optional) - New summary

- **`description`** (any, optional) - New description

- **`priority`** (any, optional) - New priority

- **`assignee`** (any, optional) - New assignee account ID





---


### `transitionIssue`

Transition issue to new status


**Parameters:**


- **`issueKey`** (any) - Issue key (e.g., "PROJ-123")

- **`transitionId`** (any) - Transition ID or name





---


### `getTransitions`

Get available transitions for issue


**Parameters:**


- **`issueKey`** (any) - Issue key (e.g., "PROJ-123")





---


### `addComment`

Add comment to issue


**Parameters:**


- **`issueKey`** (any) - Issue key (e.g., "PROJ-123")

- **`comment`** (any) - Comment text





---


### `getComments`

Get comments for issue


**Parameters:**


- **`issueKey`** (any) - Issue key (e.g., "PROJ-123")

- **`maxResults`** (any, optional) - Maximum number of comments





---


### `listProjects`

List all projects





---


### `getProject`

Get project details


**Parameters:**


- **`projectKey`** (any) - Project key (e.g., "PROJ")





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
