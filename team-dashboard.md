# Team Dashboard

Team Dashboard Photon

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **18** tools:


### `main`

Open the Team Dashboard  TV-optimized display showing project progress, recent activity, and service health. Auto-refreshes for always-on displays.





---


### `getDashboardData`

Get all dashboard data  Aggregates data from Kanban, Git, GitHub, and service monitors into a single dashboard-ready payload.





---


### `getDebugPaths`

Debug: Show resolved paths





---


### `getKanbanStats`

Get Kanban board statistics  Reads from the Kanban photon's data file to get task counts and progress.





---


### `getRecentCommits`

Get recent Git commits  Fetches the last 10 commits from the configured Git repository.





---


### `checkServices`

Check service health  Pings configured services to check if they're up or down.





---


### `getGitHubStats`

Get GitHub issues and PRs from configured repos  Fetches open issue and PR counts from all configured GitHub repositories. Uses the public GitHub API (no auth required for public repos).





---


### `getTodaysFocus`

Get today's focus task  Returns the highest priority in-progress task from the Kanban board.





---


### `getSummary`

Get a quick summary for AI  Returns a text summary of the dashboard state, perfect for AI to understand project status at a glance.





---


### `getConfig`

Get dashboard configuration





---


### `updateConfig`

Update dashboard configuration





---


### `addService`

Add a service to monitor





---


### `removeService`

Remove a service from monitoring





---


### `setGitRepo`

Set the Git repository path





---


### `setTeamName`

Set team name displayed on dashboard





---


### `addGitHubRepo`

Add a GitHub repository to track


**Parameters:**


- **`repo`** (any) - - Repository in "owner/repo" format (e.g., "facebook/react")





---


### `removeGitHubRepo`

Remove a GitHub repository from tracking


**Parameters:**


- **`repo`** (any) - - Repository in "owner/repo" format





---


### `listGitHubRepos`

List all tracked GitHub repositories





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
photon mcp ./team-dashboard.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp team-dashboard.photon.ts ~/.photon/

# Run by name
photon mcp team-dashboard
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp team-dashboard --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest
```


## 📄 License

MIT • Version 1.0.0
