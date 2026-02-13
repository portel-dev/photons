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
| [**AWS S3**](aws-s3.md) | Cloud object storage operations | 11 | - |
| [**Code Diagram**](code-diagram.md) | Generate a Mermaid diagram from a file | 3 | 🔌📦 |
| [**Connect Four**](connect-four.md) | Play against AI with distributed locks | 8 | 🎨📡 |
| [**Daemon Features**](daemon-features.md) | Scheduled Jobs, Webhooks, Locks, Pub/Sub | 6 | 📡 |
| [**Dashboard**](dashboard.md) | Dashboard Photon | 6 | 🎨🎨 |
| [**Data Sync**](data-sync.md) | Data Sync Workflow Synchronizes data between different sources with progress tracking | 3 | ⚡⚡ |
| [**Demo Photon**](demo.md) | Comprehensive feature demonstration | 21 | ⚡ |
| [**Docker**](docker.md) | Container management operations | 10 | - |
| [**Email**](email.md) | Send and receive emails via SMTP and IMAP | 8 | - |
| [**Feature Showcase**](feature-showcase.md) | Core Runtime Feature Demos | 12 | ⚡📡 |
| [**Filesystem**](filesystem.md) | File and directory operations | 13 | - |
| [**Form Inbox**](form-inbox.md) | Webhook-powered form submission collector | 12 | 📡 |
| [**Format Showcase**](format-showcase.md) | Auto-UI Format Demos | 21 | - |
| [**Git Box**](git-box.md) | Mailbox-style Git interface, manage repos like an inbox | 58 | ⚡🎨💬 |
| [**Git**](git.md) | Local git repository operations | 11 | - |
| [**GitHub Issues**](github-issues.md) | Manage GitHub repository issues | 7 | - |
| [**Google Calendar**](google-calendar.md) | Calendar integration | 9 | - |
| [**Hello World**](hello-world.md) | The simplest possible photon | 0 | - |
| [**Integration Demo**](integration-demo.md) | Integration Demo — Dependencies, Assets, Stateful Workflows | 5 | ⚡🎨 |
| [**Jira**](jira.md) | Project management and issue tracking | 10 | - |
| [**Kanban**](kanban.md) | Kanban Board Photon | 33 | ⚡🎨💬📡 |
| [**Kitchen Sink**](kitchen-sink.md) | Kitchen Sink Photon | 25 | ⚡🎨 |
| [**Math Photon MCP**](math.md) | Advanced math expression evaluator | 1 | - |
| [**Mcp Orchestrator**](mcp-orchestrator.md) | MCP Orchestrator Photon | 10 | 🔌 |
| [**MongoDB**](mongodb.md) | NoSQL database operations | 13 | - |
| [**PostgreSQL**](postgres.md) | Database operations for PostgreSQL | 7 | - |
| [**Preferences**](preferences.md) | Preferences Photon | 7 | ⚡🎨💬⚡ |
| [**Progressive Rendering**](progressive-rendering.md) | Progressive Rendering — Same Data, Better Display | 6 | - |
| [**Redis**](redis.md) | In-memory data store and cache | 18 | - |
| [**Truth Serum**](serum.md) | Forces unfiltered honesty, no hedging or diplomacy @description Powerful prompt serums that force specific cognitive behaviors @icon 💉 /
export default class Serum {
  / | 10 | - |
| [**Slack**](slack.md) | Send messages and manage Slack workspace | 7 | - |
| [**SQLite Photon MCP**](sqlite.md) | SQLite database operations | 9 | - |
| [**Tasks Basic**](tasks-basic.md) | Basic Task List — stateless, in-memory | 4 | - |
| [**Tasks Live**](tasks-live.md) | Live Task List — stateful, reactive, persistent | 4 | - |
| [**Team Dashboard**](team-dashboard.md) | Team Dashboard Photon | 20 | 🎨🎨 |
| [**Time**](time.md) | Timezone and time conversion operations | 3 | - |
| [**Todo List**](todo.md) | Reactive collections in action | 0 | - |
| [**Weather**](weather.md) | Wrap any API in 20 lines | 2 | - |
| [**Web**](web.md) | Web Agent Photon (Search + Read) | 2 | ⚡ |


**Total:** 39 photons ready to use

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

**That's it!** Your AI assistant now has 39 focused tools at its fingertips.

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
- 📦 39 production-ready photons available
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
