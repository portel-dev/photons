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

| Photon | Focus | Tools | Details |
|--------|-------|-------|---------|
| **AWS S3** | Cloud object storage operations | 11 | [View →](aws-s3.md) |
| **Code Diagram** | Generate a Mermaid diagram from a file | 3 | [View →](code-diagram.md) |
| **Content Creator** | Content Creator Photon | 4 | [View →](content-creator.md) |
| **Dashboard** | Dashboard Photon | 6 | [View →](dashboard.md) |
| **Data Sync** | Data Sync Workflow Synchronizes data between different sources with progress tracking | 3 | [View →](data-sync.md) |
| **Demo Photon** | Comprehensive feature demonstration | 21 | [View →](demo.md) |
| **Discord** | Send messages and manage Discord via webhooks Like n8n's Discord node - notifications, alerts, and automation | 6 | [View →](discord.md) |
| **Docker** | Container management operations | 10 | [View →](docker.md) |
| **Email** | Send and receive emails via SMTP and IMAP | 8 | [View →](email.md) |
| **Filesystem** | File and directory operations | 23 | [View →](filesystem.md) |
| **Git** | Local git repository operations | 15 | [View →](git.md) |
| **GitHub Issues** | Manage GitHub repository issues | 7 | [View →](github-issues.md) |
| **Github Pr Notifier** | GitHub PR Notifier Workflow Monitors GitHub PRs and sends notifications to Slack | 2 | [View →](github-pr-notifier.md) |
| **Google Calendar** | Calendar integration | 9 | [View →](google-calendar.md) |
| **Google TV Remote** | Control Google TV and Android TV devices | 37 | [View →](google-tv.md) |
| **Jira** | Project management and issue tracking | 10 | [View →](jira.md) |
| **Kanban** | Kanban Board Photon | 27 | [View →](kanban.md) |
| **Kitchen Sink** | Kitchen Sink Photon | 25 | [View →](kitchen-sink.md) |
| **Knowledge Graph** | Persistent knowledge graph with entities and relations | 11 | [View →](knowledge-graph.md) |
| **LG Remote** | Control LG WebOS TVs | 27 | [View →](lg-remote.md) |
| **Math Photon MCP** | Advanced math expression evaluator | 8 | [View →](math.md) |
| **MongoDB** | NoSQL database operations | 18 | [View →](mongodb.md) |
| **PostgreSQL** | Database operations for PostgreSQL | 11 | [View →](postgres.md) |
| **Preferences** | Preferences Photon | 7 | [View →](preferences.md) |
| **Redis** | In-memory data store and cache | 23 | [View →](redis.md) |
| **RSS Feed** | Read and parse RSS/Atom feeds Like n8n's RSS Read node - monitor blogs, news, and content feeds | 5 | [View →](rss-feed.md) |
| **Rss To Slack** | RSS to Slack Workflow Monitors RSS feeds and posts new items to Slack | 2 | [View →](rss-to-slack.md) |
| **Slack** | Send messages and manage Slack workspace | 7 | [View →](slack.md) |
| **Social Formatter** | Social Media Formatter | 4 | [View →](social-formatter.md) |
| **SQLite Photon MCP** | SQLite database operations | 15 | [View →](sqlite.md) |
| **Team Dashboard** | Team Dashboard Photon | 18 | [View →](team-dashboard.md) |
| **Telegram** | Send messages via Telegram Bot API Like n8n's Telegram node - notifications and bot automation | 12 | [View →](telegram.md) |
| **Time** | Timezone and time conversion operations | 9 | [View →](time.md) |
| **Tuya Smart Light** | Control Tuya/Wipro/Smart Life WiFi bulbs | 9 | [View →](tuya-smart-light.md) |
| **Uptime Monitor** | Uptime Monitor Workflow Monitors website availability and sends alerts | 3 | [View →](uptime-monitor.md) |
| **Web** | Web Agent Photon (Search + Read) | 5 | [View →](web.md) |


**Total:** 36 photons ready to use

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

**That's it!** Your AI assistant now has 36 focused tools at its fingertips.

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
- 📦 36 production-ready photons available
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
