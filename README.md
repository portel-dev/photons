<!-- PHOTON_MARKETPLACE_START -->
# photons

> **Singular focus. Precise target.**

Production-ready photons for instant use. Zero configuration, auto-dependencies, single command installation.

## 🏛️ Official Marketplace

This is the **official Photon marketplace** maintained by Portel. It comes pre-configured with the Photon CLI - no manual setup needed.

**Already available to you:**
- ✅ Pre-installed with Photon CLI
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

## ⚛️ What Are Photons?

**Photons** are laser-focused modules - each does ONE thing exceptionally well:
- 📁 **Filesystem** - File operations
- 🐙 **Git** - Repository management
- ☁️ **AWS S3** - Cloud storage
- 📅 **Google Calendar** - Calendar integration
- 🕐 **Time** - Timezone operations
- ... and more

Each photon delivers **singular focus** to a **precise target**.

## ✨ Why This Matters

**Zero Configuration**
```bash
photon add filesystem  # That's it. No setup, no config files.
```

**Instant Value**
- 🎯 Each photon does one thing perfectly
- 📦 16 production-ready photons available
- ⚡ Auto-installs dependencies
- 🔧 Works out of the box

## 🚀 Quick Start

### 1. Install Photon CLI

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

Add the output to your MCP client's configuration. **Consult your client's documentation** for setup instructions.

**That's it!** Your AI assistant now has 16 focused tools at its fingertips.

## 📦 Available Photons

| Photon | Focus | Tools | Details |
|--------|-------|-------|---------|
| **AWS S3** | Cloud object storage operations | 11 | [View →](aws-s3.md) |
| **Docker** | Container management operations | 10 | [View →](docker.md) |
| **Email** | Send and receive emails via SMTP and IMAP | 8 | [View →](email.md) |
| **Fetch** | Web content fetching and markdown conversion | 2 | [View →](fetch.md) |
| **Filesystem** | File and directory operations | 13 | [View →](filesystem.md) |
| **Git** | Local git repository operations | 11 | [View →](git.md) |
| **GitHub Issues** | Manage GitHub repository issues | 7 | [View →](github-issues.md) |
| **Google Calendar** | Calendar integration | 9 | [View →](google-calendar.md) |
| **Jira** | Project management and issue tracking | 10 | [View →](jira.md) |
| **Memory** | Knowledge graph-based persistent memory | 10 | [View →](memory.md) |
| **MongoDB** | NoSQL database operations | 13 | [View →](mongodb.md) |
| **PostgreSQL** | Database operations for PostgreSQL | 7 | [View →](postgres.md) |
| **Redis** | In-memory data store and cache | 18 | [View →](redis.md) |
| **Slack** | Send messages and manage Slack workspace | 7 | [View →](slack.md) |
| **SQLite Photon MCP** | SQLite database operations | 9 | [View →](sqlite.md) |
| **Time** | Timezone and time conversion operations | 3 | [View →](time.md) |


**Total:** 16 photons ready to use

## 🎯 The Value Proposition

### Before Photon
```bash
# For each MCP:
pip install mcp-server-X
# Configure manually
# Repeat for every tool
# Different package managers
# Different configurations
```

### With Photon
```bash
photon add filesystem  # One command
photon mcp filesystem  # Works immediately
```

**Difference:**
- ✅ One CLI, one command
- ✅ Zero configuration
- ✅ Instant installation
- ✅ Auto-dependencies
- ✅ Consistent experience

## 💡 Use Cases

**For AI Assistant Users:**
```bash
photon add filesystem git github-issues
photon get --mcp  # Get config for all three
```
Add to your MCP client → Now your AI assistant can read files, manage repos, create issues

**For Teams:**
```bash
photon add postgres mongodb redis
photon get --mcp
```
Give your AI assistant access to your data infrastructure

**For Developers:**
```bash
photon add docker git slack
photon get --mcp
```
Automate your workflow through AI

## 🔍 Browse & Search

```bash
# List all photons
photon list

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
photon sync marketplace

# 3. Share with team
git push origin main

# Team members use:
photon marketplace add company/photons
photon add your-internal-tool
```

## 🔮 Future

Photon is designed to support additional deployment targets beyond MCP servers, such as CLI tools and more. These are planned for future versions.

---

**Built with singular focus. Deployed with precise targeting.**

Made with ⚛️ by [Portel](https://github.com/portel-dev)

<!-- PHOTON_MARKETPLACE_END -->
