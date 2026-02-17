# GitHub Issues

Manage GitHub repository issues Provides tools to list, create, update, and comment on GitHub issues. Requires a GitHub personal access token with repo scope. Common use cases: - Issue tracking: "List all open issues in my repo" - Bug reporting: "Create a new bug issue with details" - Issue management: "Close issue #123 and add a comment" Example: listIssues({ owner: "user", repo: "project", state: "open" }) Configuration: - token: GitHub personal access token (required) - baseUrl: GitHub API base URL (default: https://api.github.com) Dependencies are auto-installed on first run.

> **7 tools** · API Photon · v1.1.0 · MIT


## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `GIT_HUB_ISSUES_TOKEN` | Yes | string | GitHub personal access token (required) |
| `GIT_HUB_ISSUES_BASEURL` | No | string | GitHub API base URL (default: https://api.github.com) (default: `https://api.github.com`) |



### Setup Instructions

- token: GitHub personal access token (required)
- baseUrl: GitHub API base URL (default: https://api.github.com)
Dependencies are auto-installed on first run.


## 🔧 Tools


### `listIssues`

List issues in a repository


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner (username or organization) |
| `repo` | string | Yes | Repository name |
| `state` | 'open' | 'closed' | 'all' | No | Issue state filter |
| `labels` | string | No | Comma-separated label names to filter by |
| `sort` | 'created' | 'updated' | 'comments' | No | Sort by created, updated, or comments |
| `per_page` | number | No | Number of results per page |





---


### `getIssue`

Get a single issue by number


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner |
| `repo` | string | Yes | Repository name |
| `issue_number` | number | Yes | Issue number |





---


### `createIssue`

Create a new issue


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner |
| `repo` | string | Yes | Repository name |
| `title` | string | Yes | Issue title |
| `body` | string | No | Issue description/body |
| `labels` | string[] | No | Array of label names |
| `assignees` | string[] | No | Array of usernames to assign |





---


### `updateIssue`

Update an existing issue


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner |
| `repo` | string | Yes | Repository name |
| `issue_number` | number | Yes | Issue number to update |
| `title` | string | No | New title |
| `body` | string | No | New body |
| `state` | 'open' | 'closed' | No | New state: open or closed |
| `labels` | string[] | No | New labels |





---


### `addComment`

Add a comment to an issue


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner |
| `repo` | string | Yes | Repository name |
| `issue_number` | number | Yes | Issue number |
| `body` | string | Yes | Comment text |





---


### `listComments`

List comments on an issue


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner |
| `repo` | string | Yes | Repository name |
| `issue_number` | number | Yes | Issue number |





---


### `searchIssues`

Search issues across repositories


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (e.g., "is:open label:bug") |
| `sort` | 'created' | 'updated' | 'comments' | No | Sort by created, updated, or comments |
| `order` | 'asc' | 'desc' | No | Sort order: asc or desc |
| `per_page` | number | No | Number of results per page |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph github_issues["📦 Github Issues"]
        direction TB
        PHOTON((🎯))
        T0[📖 listIssues]
        PHOTON --> T0
        T1[📖 getIssue]
        PHOTON --> T1
        T2[✏️ createIssue]
        PHOTON --> T2
        T3[🔄 updateIssue]
        PHOTON --> T3
        T4[✏️ addComment]
        PHOTON --> T4
        T5[📖 listComments]
        PHOTON --> T5
        T6[📖 searchIssues]
        PHOTON --> T6
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add github-issues

# Get MCP config for your client
photon info github-issues --mcp
```

## 📦 Dependencies


```
@octokit/rest@^20.0.0
```

---

MIT · v1.1.0 · Portel
