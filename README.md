<!-- PHOTON_MARKETPLACE_START -->
# photons

> **Singular focus. Precise target.**

**Photons** are single-file TypeScript MCP servers that supercharge AI assistants with focused capabilities. Each photon delivers ONE thing exceptionally well - from filesystem operations to cloud integrations.

Built on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction), photons are:
- 📦 **One-command install** via [Photon CLI](https://github.com/portel-dev/photon)
- 🎯 **Laser-focused** on singular capabilities
- ⚡ **Zero-config** with auto-dependency management
- 🔌 **Universal** - works with Claude Desktop, Claude Code, and any MCP client

## 🏛️ Official Marketplace

This is the **official Photon marketplace** maintained by Portel. It comes pre-configured with Photon - no manual setup needed.

**Already available to you:**
- ✅ Pre-installed with Photon
- ✅ Automatically updated
- ✅ Production-ready photons
- ✅ Community-maintained

**Want to contribute?**
We welcome contributions! Submit pull requests for:
- 🐛 Bug fixes to existing photons
- ✨ Enhancements and new features
- 📦 New photons to add to the marketplace
- 📝 Documentation improvements

**Repository:** [github.com/portel-dev/photons](https://github.com/portel-dev/photons)

## 📦 Available Photons

| Photon | Focus | Tools | Features |
|--------|-------|-------|----------|
| [**AWS S3**](aws-s3.md) | Cloud object storage | 11 | - |
| [**Code Diagram**](code-diagram.md) | Mermaid visualization from source code | 3 | 🔌📦 |
| [**Connect Four**](connect-four.md) | Play against AI with distributed locks Classic Connect Four game where you drop discs into columns trying to get four in a row. The AI opponent uses minimax with alpha-beta pruning to play strategically. Distributed locks ensure no two moves happen simultaneously - critical when multiple clients connect to the same game. ## Quick Reference - `start` - Start a new game - `drop` - Drop your disc into a column (1-7) - `board` - View current board state - `games` - List your games - `stats` - Win/loss statistics | 8 | 🎨📡 |
| [**Daemon Features**](daemon-features.md) | Scheduled Jobs, Webhooks, Locks, Pub/Sub | 6 | 📡 |
| [**Dashboard**](dashboard.md) | Dashboard Photon A sleek dashboard demonstrating MCP Apps with UI templates. Each tool returns data that can be rendered in its linked UI. Data is persisted to ~/.photon/dashboard/data.json | 6 | 🎨🎨 |
| [**Data Sync Workflow**](data-sync.md) | Synchronizes data between sources | 3 | ⚡⚡ |
| [**Demo**](demo.md) | Feature showcase Comprehensive demonstration of Photon runtime features: return types, parameters, progress indicators, user input (elicitation), state management, and UI formats. | 14 | ⚡ |
| [**Deploy Pipeline**](deploy.md) | Multi-step workflow with checkpoints and approval gates | 3 | ⚡📡 |
| [**Docker**](docker.md) | Container management | 10 | - |
| [**Email**](email.md) | SMTP and IMAP email operations | 8 | - |
| [**Expenses**](expenses.md) | Expenses — Track spending with budgets and summaries | 4 | - |
| [**Feature Showcase**](feature-showcase.md) | Core Runtime Feature Demos Demonstrates every major Photon runtime feature with test methods to prove each one works. Run `photon test feature-showcase` to verify. Features covered: - Lifecycle hooks (onInitialize, onShutdown) - configure() / getConfig() convention - All io.emit types (status, progress, stream, log, toast, thinking, artifact) - All io.ask types (text, password, confirm, select, number, file, date, form) - @Template methods (MCP prompts) - @format annotations (primitive, json, table, markdown) - Private _helper methods (hidden from tools) - Instance state across calls - this.emit() for pub/sub | 12 | ⚡📡 |
| [**Filesystem**](filesystem.md) | File and directory operations | 12 | - |
| [**Form Inbox**](form-inbox.md) | Webhook-powered form submission collector | 12 | 📡 |
| [**Format Showcase**](format-showcase.md) | Auto-UI Format Demos Demonstrates every auto-UI format type with sample data so developers can see how each visualization looks and choose appropriately. Run any method in Beam to see the visual output. | 27 | 📡 |
| [**Git Box**](git-box.md) | Mailbox-style Git interface, manage repos like an inbox ## Quick Reference ### Repository Management | Method | Description | |--------|-------------| | `repos` | List all tracked repositories | | `repoAdd` | Add a repository to track | | `repoRemove` | Remove a repository from tracking | | `repoInit` | Initialize a new git repository | | `availableRepos` | Scan projects folder for repos | | `projectsRootSet` | Set the projects root folder | ### Working Tree | Method | Description | |--------|-------------| | `status` | Get staged/unstaged/untracked files | | `fileStage` | Stage a file for commit | | `fileUnstage` | Unstage a file | | `changesDiscard` | Discard changes in a file | | `diff` | Get diff for a file | | `fileContent` | Get file content | ### Commits | Method | Description | |--------|-------------| | `commits` | Get commit history | | `commitFiles` | Get files changed in a commit | | `commitDiff` | Get diff for a file in a commit | | `commit` | Create a commit | | `commitRevert` | Revert a commit | | `commitReset` | Reset to a commit | | `commitRecover` | Recover a lost commit | | `commitFixup` | Amend staged changes into older commit | | `commitMessageAmend` | Amend an older commit's message | | `commitsSquash` | Squash multiple commits | | `commitsSearch` | Search commits | ### Branches | Method | Description | |--------|-------------| | `branches` | List all branches | | `branchCreate` | Create a new branch | | `branchCreateSwitch` | Create and switch to branch | | `branchSwitch` | Switch to a branch | | `branchDelete` | Delete a branch | | `branchMerge` | Merge a branch | | `mergeAbort` | Abort an in-progress merge | ### Remote Operations | Method | Description | |--------|-------------| | `pull` | Pull changes from remote | | `push` | Push changes to remote | | `fetch` | Fetch updates from remote | ### Stash | Method | Description | |--------|-------------| | `stashes` | List all stashes | | `stashCreate` | Create a stash | | `stashApply` | Apply a stash (keep it) | | `stashPop` | Apply and remove a stash | | `stashDrop` | Delete a stash | | `stashShow` | Show stash diff | | `stashesClear` | Clear all stashes | ### History & Undo | Method | Description | |--------|-------------| | `reflog` | Get git operation history | | `undoLast` | Undo last git operation | | `blame` | Get blame info for file | | `changeFind` | Find commit that introduced change | ### Rebase & Cherry-pick | Method | Description | |--------|-------------| | `rebasePreview` | Preview commits to rebase | | `rebaseScripted` | Perform scripted rebase | | `rebaseContinue` | Continue rebase | | `rebaseAbort` | Abort rebase | | `cherryPick` | Cherry-pick commits | | `cherryPickContinue` | Continue cherry-pick | | `cherryPickAbort` | Abort cherry-pick | | `revertAbort` | Abort revert | ### Conflicts | Method | Description | |--------|-------------| | `conflicts` | Get current conflicts | | `conflictResolve` | Resolve with ours/theirs | | `conflictMarkResolved` | Mark file as resolved | ### Advanced | Method | Description | |--------|-------------| | `fileRemoveFromHistory` | Remove file from all history | | 58 | ⚡🎨💬 |
| [**Git**](git.md) | Local git repository operations | 11 | - |
| [**GitHub Issues**](github-issues.md) | Manage repository issues | 7 | - |
| [**Google Calendar**](google-calendar.md) | Schedule and manage events | 9 | - |
| [**Hello World**](hello-world.md) | The simplest possible photon A photon is just a TypeScript class where each method becomes an MCP tool. | 0 | - |
| [**Integration Demo — Dependencies, Assets, Stateful Workflows Demonstrates dependency management, asset discovery, stateful workflows with checkpoint/resume, and resource methods. Features covered:**](integration-demo.md) | Runtime version constraint (>=1.0.0) - CLI dependency check (node) - Stateful class annotation for resumable workflows - Checkpoint yields for workflow resumption - UI asset linking - Asset folder discovery (integration-demo/ui/) - @resource method (MCP resource) - @format annotations | 5 | ⚡🎨 |
| [**Jira**](jira.md) | Issue tracking and project management | 10 | - |
| [**Kanban Board Photon Task management for humans and AI. Use named instances (`_use('project-name')`) for per-project boards. Perfect for:**](kanban.md) | Project planning and task tracking - AI working memory across sessions - Human-AI collaboration on shared tasks ## Quick Reference **Tasks:** - `add()` - Create new task - `list()` - List tasks (with filters) - `show()` - Get single task with comments - `mine()` - Get tasks assigned to AI - `edit()` - Update task details - `move()` - Move task to column - `drop()` - Delete a task - `reorder()` - Reorder within column - `search()` - Search tasks by keyword - `sweep()` - Move multiple tasks at once **Comments & Dependencies:** - `comment()` - Add comment to task - `comments()` - Get task comments - `block()` - Set/remove task dependencies **Board Management:** - `board()` - Get full board state - `column()` - Add or remove a column - `stats()` - Get board statistics - `clear()` - Archive completed tasks - `hooks()` - Install Claude Code hooks - `configure()` - Configure settings | 26 | ⚡🎨📡 |
| [**Kitchen Sink**](kitchen-sink.md) | Kitchen Sink Photon Demonstrates every feature of the Photon runtime with meaningfully named functions. Use this as a reference for building your own photons. | 25 | ⚡🎨 |
| [**Calculator**](math.md) | Math expression evaluator Evaluate math expressions with functions like sqrt, sin, cos, mean, median, etc. | 1 | - |
| [**MCP Orchestrator Photon Demonstrates how to consume multiple MCPs (written in any language) as dependencies and orchestrate workflows that combine their capabilities. This photon shows how to: 1. Use this.mcp('name') to access external MCPs 2. Call tools on MCPs written in Python, Rust, Node.js, etc. 3. Combine data from multiple sources into unified workflows 4. Handle errors gracefully when MCPs are unavailable ## MCP Dependencies This photon can work with any MCPs configured in NCP:**](mcp-orchestrator.md) | `tavily` - Search API (Node.js MCP) - `browser` - Web automation (Node.js MCP) - `whatsapp` - Messaging (Python MCP via uv) - `sequential-thinking` - Reasoning (Node.js MCP) - Any other MCP configured in your NCP profile ## How it Works The `this.mcp('name')` method returns a proxy that: - Calls tools directly: `await this.mcp('tavily').search({ query: '...' })` - Lists tools: `await this.mcp('tavily').list()` - Finds tools: `await this.mcp('tavily').find('search')` | 10 | 🔌 |
| [**MongoDB**](mongodb.md) | Flexible document-oriented database | 14 | - |
| [**PostgreSQL**](postgres.md) | Powerful relational database | 7 | - |
| [**Preferences Photon Demonstrates MCP Apps with UI assets, prompts, and resources. Assets are auto-discovered from the preferences/ folder by convention. Asset folder structure (auto-served): preferences/ ui/ settings.html    **](preferences.md) | Main settings form theme-preview.html - Theme preview component prompts/ welcome.md        - Welcome message template resources/ defaults.json     - Default configuration | 7 | ⚡🎨💬⚡ |
| [**Progressive Rendering**](progressive-rendering.md) | Progressive Rendering — Same Data, Better Display Six methods return the same team data, each progressively enhanced. Run them side-by-side in Beam to see how Photon features improve rendering. | 6 | - |
| [**Redis**](redis.md) | High-performance in-memory data store | 18 | - |
| [**Slack**](slack.md) | Send and manage messages | 7 | - |
| [**SQLite**](sqlite.md) | File or in-memory SQL database | 9 | - |
| [**Tasks Basic**](tasks-basic.md) | Tasks Basic — Stateless task list A simple todo list that works during a session but loses state on restart. Compare with tasks-live to see what persistence adds. | 4 | - |
| [**Tasks Live**](tasks-live.md) | Tasks Live — Persistent reactive task list Same as tasks-basic but tasks survive restarts and UI updates in real-time. Uses `this.memory` for zero-boilerplate persistence. | 4 | - |
| [**Team Dashboard**](team-dashboard.md) | Team Dashboard Photon A TV/monitor-optimized dashboard that aggregates data from multiple photons to give the whole team visibility into project progress. Perfect for office displays, war rooms, or remote team syncs. | 20 | 🎨🎨 |
| [**Team Pulse**](team-pulse.md) | Team Pulse — Async standup with team feed | 4 | - |
| [**Time**](time.md) | Timezone and time conversion Timezone-aware time operations using native Node.js Intl API (zero dependencies). | 3 | - |
| [**Todo List**](todo.md) | Reactive collections in action Demonstrates Photon's reactive arrays: just use normal array methods (push, splice, filter) and the runtime automatically emits events so connected UIs update in real-time. | 0 | - |
| [**Weather**](weather.md) | Current weather and forecasts Zero-dependency weather API wrapper using Open-Meteo (free, no key required). | 2 | - |
| [**Web**](web.md) | Search and read webpages | 2 | ⚡ |


**Total:** 41 photons ready to use

---

## 🚀 Quick Start

### 1. Install Photon

```bash
npm install -g @portel/photon
```

### 2. Add Any Photon

```bash
photon add filesystem
photon add git
photon add aws-s3
```

### 3. Use It

```bash
# Run as MCP server
photon mcp filesystem

# Get config for your MCP client
photon get filesystem --mcp
```

Output (paste directly into your MCP client config):
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "photon",
      "args": ["mcp", "filesystem"]
    }
  }
}
```

Add the output to your MCP client's configuration. **Consult your client's documentation** for setup instructions.

**That's it!** Your AI assistant now has 41 focused tools at its fingertips.

---

## 🎨 Claude Code Integration

This marketplace is also available as a **Claude Code plugin**, enabling seamless installation of individual photons directly from Claude Code's plugin manager.

### Install as Claude Code Plugin

```bash
# In Claude Code, run:
/plugin marketplace add portel-dev/photons
```

Once added, you can install individual photons:

```bash
# Install specific photons you need
/plugin install filesystem@photons-marketplace
/plugin install git@photons-marketplace
/plugin install knowledge-graph@photons-marketplace
```

### Benefits of Claude Code Plugin

- **🎯 Granular Installation**: Install only the photons you need
- **🔄 Auto-Updates**: Plugin stays synced with marketplace
- **⚡ Zero Config**: Photon CLI auto-installs on first use
- **🛡️ Secure**: No credentials shared with AI (interactive setup available)
- **📦 Individual MCPs**: Each photon is a separate installable plugin

### How This Plugin Is Built

This marketplace doubles as a Claude Code plugin through automatic generation:

```bash
# Generate marketplace AND Claude Code plugin files
photon maker sync --claude-code
```

This single command:
1. Scans all `.photon.ts` files
2. Generates `.marketplace/photons.json` manifest
3. Creates `.claude-plugin/marketplace.json` for Claude Code
4. Generates documentation for each photon
5. Creates auto-install hooks for seamless setup

**Result**: One source of truth, two distribution channels (Photon CLI + Claude Code).

---

## ⚛️ What Are Photons?

**Photons** are laser-focused modules - each does ONE thing exceptionally well:
- 📁 **Filesystem** - File operations
- 🐙 **Git** - Repository management
- ☁️ **AWS S3** - Cloud storage
- 📅 **Google Calendar** - Calendar integration
- 🕐 **Time** - Timezone operations
- ... and more

Each photon delivers **singular focus** to a **precise target**.

**Key Features:**
- 🎯 Each photon does one thing perfectly
- 📦 41 production-ready photons available
- ⚡ Auto-installs dependencies
- 🔧 Works out of the box
- 📄 Single-file design (easy to fork and customize)

## 🎯 The Value Proposition

### Before Photon

For each MCP server:
1. Find and clone the repository
2. Install dependencies manually
3. Configure environment variables
4. Write MCP client config JSON by hand
5. Repeat for every server

### With Photon

```bash
# Install from marketplace
photon add filesystem

# Get MCP config
photon get filesystem --mcp
```

Output (paste directly into your MCP client config):
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "photon",
      "args": ["mcp", "filesystem"]
    }
  }
}
```

**That's it.** No dependencies, no environment setup, no configuration files.

**Difference:**
- ✅ One CLI, one command
- ✅ Zero configuration
- ✅ Instant installation
- ✅ Auto-dependencies
- ✅ Consistent experience

## 💡 Use Cases

**For Claude Users:**
```bash
photon add filesystem git github-issues
photon get --mcp  # Get config for all three
```
Add to Claude Desktop → Now Claude can read files, manage repos, create issues

**For Teams:**
```bash
photon add postgres mongodb redis
photon get --mcp
```
Give Claude access to your data infrastructure

**For Developers:**
```bash
photon add docker git slack
photon get --mcp
```
Automate your workflow through AI

## 🔍 Browse & Search

```bash
# List all photons
photon get

# Search by keyword
photon search calendar

# View details
photon get google-calendar

# Upgrade all
photon upgrade
```

## 🏢 For Enterprises

Create your own marketplace:

```bash
# 1. Organize photons
mkdir company-photons && cd company-photons

# 2. Generate marketplace
photon maker sync

# 3. Share with team
git push origin main

# Team members use:
photon marketplace add company/photons
photon add your-internal-tool
```

---

**Built with singular focus. Deployed with precise targeting.**

Made with ⚛️ by [Portel](https://github.com/portel-dev)

<!-- PHOTON_MARKETPLACE_END -->
