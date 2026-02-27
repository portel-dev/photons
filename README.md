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
| [**Boards**](boards.md) | Modern Kanban Boards Photon Task management for humans and AI. Use named instances (`_use('project-name')`) for per-project boards. Perfect for project planning, AI working memory across sessions, and human-AI collaboration on shared tasks. | 1 | ⚡🎨📡 |
| [**Code Diagram**](code-diagram.md) | Mermaid visualization from source code | 3 | 🔌📦 |
| [**Connect Four**](connect-four.md) | Play against AI with distributed locks Classic Connect Four game where you drop discs into columns trying to get four in a row. The AI opponent uses minimax with alpha-beta pruning to play strategically. Distributed locks ensure no two moves happen simultaneously - critical when multiple clients connect to the same game. | 7 | ⚡🎨📡 |
| [**Daemon Features**](daemon-features.md) | Scheduled Jobs, Webhooks, Locks, Pub/Sub | 4 | 📡 |
| [**Dashboard**](dashboard.md) | Dashboard Photon A sleek dashboard demonstrating MCP Apps with UI templates. Each tool returns data that can be rendered in its linked UI. Data is persisted to ~/.photon/dashboard/data.json | 6 | 🎨🎨 |
| [**Data Sync Workflow**](data-sync.md) | Synchronizes data between sources | 3 | ⚡⚡ |
| [**Demo**](demo.md) | Feature showcase Comprehensive demonstration of Photon runtime features: return types, parameters, progress indicators, user input (elicitation), state management, and UI formats. | 14 | ⚡ |
| [**Deploy Pipeline**](deploy.md) | Multi-step workflow with checkpoints and approval gates | 3 | ⚡📡 |
| [**Docker**](docker.md) | Container management | 10 | - |
| [**Email**](email.md) | SMTP and IMAP email operations | 8 | - |
| [**Expenses**](expenses.md) | Expenses — Track spending with budgets and summaries | 4 | - |
| [**Feature Showcase**](feature-showcase.md) | Core Runtime Feature Demos Demonstrates every major Photon runtime feature with test methods to prove each one works. Run `photon test feature-showcase` to verify. | 10 | ⚡📡 |
| [**Filesystem**](filesystem.md) | File and directory operations | 12 | - |
| [**Form Inbox**](form-inbox.md) | Webhook-powered form submission collector | 8 | 📡 |
| [**Format Showcase**](format-showcase.md) | Auto-UI Format Demos Demonstrates every auto-UI format type with sample data so developers can see how each visualization looks and choose appropriately. Run any method in Beam to see the visual output. | 27 | 📡 |
| [**Git Box**](git-box.md) | Mailbox-style Git interface, manage repos like an inbox | 56 | ⚡🎨💬 |
| [**Git**](git.md) | Local git repository operations | 11 | - |
| [**GitHub Issues**](github-issues.md) | Manage repository issues | 7 | - |
| [**Google Calendar**](google-calendar.md) | Schedule and manage events | 9 | - |
| [**Hello World**](hello-world.md) | The simplest possible photon A photon is just a TypeScript class where each method becomes an MCP tool. | 0 | - |
| [**Input Showcase**](input-showcase.md) | Input Showcase | 0 | - |
| [**Integration Demo**](integration-demo.md) | Integration Demo — Dependencies, Assets, Stateful Workflows | 5 | ⚡🎨 |
| [**Jira**](jira.md) | Issue tracking and project management | 10 | - |
| [**Kanban**](kanban.md) | Kanban Board Photon Task management for humans and AI. Use named instances (`_use('project-name')`) for per-project boards. Perfect for project planning, AI working memory across sessions, and human-AI collaboration on shared tasks. | 19 | ⚡🎨📡 |
| [**Kitchen Sink**](kitchen-sink.md) | Kitchen Sink Photon Demonstrates every feature of the Photon runtime with meaningfully named functions. Use this as a reference for building your own photons. | 25 | ⚡🎨 |
| [**Calculator**](math.md) | Math expression evaluator Evaluate math expressions with functions like sqrt, sin, cos, mean, median, etc. | 1 | - |
| [**MCP Orchestrator**](mcp-orchestrator.md) | Combine multiple MCPs into powerful workflows | 10 | 🔌 |
| [**MongoDB**](mongodb.md) | Flexible document-oriented database | 14 | - |
| [**PostgreSQL**](postgres.md) | Powerful relational database | 7 | - |
| [**Preferences Photon**](preferences.md) | MCP App with UI assets and settings | 7 | ⚡🎨💬⚡ |
| [**Progressive Rendering**](progressive-rendering.md) | Same Data, Better Display Six methods return the same team data, each progressively enhanced. | 6 | - |
| [**Redis**](redis.md) | High-performance in-memory data store | 18 | - |
| [**Slack**](slack.md) | Send and manage messages | 7 | - |
| [**Spreadsheet**](spreadsheet.md) | Spreadsheet — CSV-backed spreadsheet with formulas A spreadsheet engine that works on plain CSV files. Formulas (=SUM, =AVG, etc.) are stored directly in CSV cells and evaluated at runtime. Named instances map to CSV files: `_use('budget')` → `budget.csv` in your spreadsheets folder. Pass a full path to open any CSV: `_use('/path/to/data.csv')`. | 16 | 🎨 |
| [**SQLite**](sqlite.md) | File or in-memory SQL database | 9 | - |
| [**Tasks Basic**](tasks-basic.md) | Tasks Basic — Stateless task list A simple todo list that works during a session but loses state on restart. Compare with tasks-live to see what persistence adds. | 4 | - |
| [**Tasks Live**](tasks-live.md) | Tasks Live — Persistent reactive task list Same as tasks-basic but tasks survive restarts and UI updates in real-time. Uses `this.memory` for zero-boilerplate persistence. | 4 | - |
| [**Team Dashboard**](team-dashboard.md) | Team Dashboard Photon A TV/monitor-optimized dashboard that aggregates data from multiple photons to give the whole team visibility into project progress. Perfect for office displays, war rooms, or remote team syncs. | 20 | 🎨🎨 |
| [**Team Pulse**](team-pulse.md) | Team Pulse — Async standup with team feed | 4 | - |
| [**Time**](time.md) | Timezone and time conversion Timezone-aware time operations using native Node.js Intl API (zero dependencies). | 3 | - |
| [**Todo List**](todo.md) | Reactive collections in action Demonstrates Photon's reactive arrays: just use normal array methods (push, splice, filter) and the runtime automatically emits events so connected UIs update in real-time. | 0 | - |
| [**Weather**](weather.md) | Current weather and forecasts Zero-dependency weather API wrapper using Open-Meteo (free, no key required). | 2 | - |
| [**Web**](web.md) | Search and read webpages | 2 | ⚡ |


**Total:** 44 photons ready to use

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

**That's it!** Your AI assistant now has 44 focused tools at its fingertips.

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
- 📦 44 production-ready photons available
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
