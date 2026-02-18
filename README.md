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
| [**AWS S3**](aws-s3.md) | Cloud object storage operations Provides AWS S3 operations using the AWS SDK v3. Supports object upload/download, bucket management, and presigned URLs. Common use cases: - Object storage: "Upload file to bucket", "Download object from S3" - File management: "List all files in bucket", "Delete old backups" - Sharing: "Generate presigned URL for private object" Example: uploadObject({ bucket: "my-bucket", key: "file.txt", content: "Hello" }) Configuration: - accessKeyId: AWS access key ID (required) - secretAccessKey: AWS secret access key (required) - region: AWS region (default: us-east-1) | 11 | - |
| [**Generate a Mermaid diagram from a file Visualize any code as flowcharts, API surfaces, dependency graphs, or call graphs. Works on raw code strings or files**](code-diagram.md) | no AI required, pure static analysis. | 3 | 🔌📦 |
| [**Connect Four**](connect-four.md) | Play against AI with distributed locks Classic Connect Four game where you drop discs into columns trying to get four in a row. The AI opponent uses minimax with alpha-beta pruning to play strategically. Distributed locks ensure no two moves happen simultaneously - critical when multiple clients connect to the same game. ## Quick Reference - `start` - Start a new game - `drop` - Drop your disc into a column (1-7) - `board` - View current board state - `games` - List your games - `stats` - Win/loss statistics | 8 | 🎨📡 |
| [**Daemon Features**](daemon-features.md) | Scheduled Jobs, Webhooks, Locks, Pub/Sub Demonstrates daemon-specific Photon features. These features require the photon daemon to be running for full functionality, but test methods verify the logic works in direct execution mode. Features covered: - @scheduled methods (cron-based execution) - @webhook methods (HTTP endpoint handlers) - @locked methods (auto distributed lock) - this.withLock() manual locking - this.emit() with channels for pub/sub - State file persistence for scheduled proof | 6 | 📡 |
| [**Dashboard**](dashboard.md) | Dashboard Photon A sleek dashboard demonstrating MCP Apps with UI templates. Each tool returns data that can be rendered in its linked UI. Data is persisted to ~/.photon/dashboard/data.json | 6 | 🎨🎨 |
| [**Data Sync Workflow Synchronizes data between different sources with progress tracking This workflow demonstrates:**](data-sync.md) | Database MCP integration - Batch processing with progress - Error handling and retry logic | 3 | ⚡⚡ |
| [**Demo Photon**](demo.md) | Comprehensive feature demonstration Demonstrates all Photon runtime features with Node.js compatible syntax. This version avoids TypeScript parameter properties for compatibility. | 21 | ⚡ |
| [**Deploy**](deploy.md) | Deploy Pipeline — Stateful Workflows + Elicitation + Progress Multi-step deployment pipeline that can crash and resume from the last checkpoint, with human approval gates via elicitation. Steps are simulated — the point is the pattern: checkpoint after side effects, ask before dangerous operations, emit progress throughout. | 3 | ⚡📡 |
| [**Docker**](docker.md) | Container management operations Provides Docker container and image operations using Dockerode. Supports container lifecycle, logs, stats, and image management. Common use cases: - Container management: "List running containers", "Start the database container" - Monitoring: "Show container logs", "Get container stats" - Image management: "Pull nginx image", "List all images" Example: listContainers({ all: true }) Configuration: - socketPath: Docker socket path (default: /var/run/docker.sock) | 10 | - |
| [**Email**](email.md) | Send and receive emails via SMTP and IMAP Provides email operations for sending, receiving, and managing emails. Supports SMTP for sending and IMAP for receiving/managing messages. Common use cases: - Send notifications: "Email me the daily report" - Check inbox: "Show me my unread emails" - Send with attachments: "Email this file to the team" - Search emails: "Find emails from john@example.com" Example: sendEmail({ to: "user@example.com", subject: "Report", body: "..." }) Configuration: - smtpHost: SMTP server hostname (e.g., smtp.gmail.com) - smtpPort: SMTP server port (default: 587 for TLS, 465 for SSL) - smtpUser: SMTP username/email - smtpPassword: SMTP password or app-specific password - smtpSecure: Use SSL (default: false, uses STARTTLS) - imapHost: IMAP server hostname (optional, for receiving) - imapPort: IMAP server port (optional, default: 993) - imapUser: IMAP username (optional, defaults to smtpUser) - imapPassword: IMAP password (optional, defaults to smtpPassword) Gmail Setup: 1. Enable 2FA in Google Account 2. Generate App Password: https://myaccount.google.com/apppasswords 3. Use: smtpHost=smtp.gmail.com, smtpUser=your@gmail.com, smtpPassword=app_password | 8 | - |
| [**Expenses**](expenses.md) | Expense Tracker — Memory + Collection + Typed Fields Track personal expenses with category breakdowns and budget alerts. Uses `this.memory` for zero-boilerplate persistence, `Collection` for rich querying (groupBy, sum, where), and `Table` with typed fields for polished rendering (currency, badges, dates). Use named instances (`_use`) to keep personal vs work expenses separate. | 4 | - |
| [**Feature Showcase**](feature-showcase.md) | Core Runtime Feature Demos Demonstrates every major Photon runtime feature with test methods to prove each one works. Run `photon test feature-showcase` to verify. Features covered: - Lifecycle hooks (onInitialize, onShutdown) - configure() / getConfig() convention - All io.emit types (status, progress, stream, log, toast, thinking, artifact) - All io.ask types (text, password, confirm, select, number, file, date, form) - @Template methods (MCP prompts) - @format annotations (primitive, json, table, markdown) - Private _helper methods (hidden from tools) - Instance state across calls - this.emit() for pub/sub | 12 | ⚡📡 |
| [**Filesystem**](filesystem.md) | File and directory operations Provides safe, cross-platform file system operations using Node.js native APIs. All paths are validated and restricted to the working directory for security. Common use cases: - Reading files: "Read my project README.md" - Writing files: "Save this data to report.json" - Directory operations: "List all files in my Downloads folder" - File management: "Copy config.json to config.backup.json" Example: read({ path: "README.md" }) Configuration: - workdir: Working directory base path (default: ~/Documents) - maxFileSize: Maximum file size in bytes (default: 10MB) - allowHidden: Allow access to hidden files/directories (default: false) | 13 | - |
| [**Form Inbox**](form-inbox.md) | Webhook-powered form submission collector Create forms, receive submissions via webhooks, and manage responses. Perfect for contact forms, feedback collection, surveys, and event RSVPs. ## Webhook URLs POST /webhook/form-inbox/handleSubmission?form=<formId> POST /webhook/form-inbox/handleBulkImport?form=<formId> ## Quick Reference - `forms` — List all forms - `formCreate` — Create a new form with fields - `submissions` — View submissions for a form - `export` — Export submissions as CSV/JSON | 12 | 📡 |
| [**Format Showcase**](format-showcase.md) | Auto-UI Format Demos Demonstrates every auto-UI format type with sample data so developers can see how each visualization looks and choose appropriately. Run any method in Beam to see the visual output. | 27 | 📡 |
| [**Git Box**](git-box.md) | Mailbox-style Git interface, manage repos like an inbox ## Quick Reference ### Repository Management | Method | Description | |--------|-------------| | `repos` | List all tracked repositories | | `repoAdd` | Add a repository to track | | `repoRemove` | Remove a repository from tracking | | `repoInit` | Initialize a new git repository | | `availableRepos` | Scan projects folder for repos | | `projectsRootSet` | Set the projects root folder | ### Working Tree | Method | Description | |--------|-------------| | `status` | Get staged/unstaged/untracked files | | `fileStage` | Stage a file for commit | | `fileUnstage` | Unstage a file | | `changesDiscard` | Discard changes in a file | | `diff` | Get diff for a file | | `fileContent` | Get file content | ### Commits | Method | Description | |--------|-------------| | `commits` | Get commit history | | `commitFiles` | Get files changed in a commit | | `commitDiff` | Get diff for a file in a commit | | `commit` | Create a commit | | `commitRevert` | Revert a commit | | `commitReset` | Reset to a commit | | `commitRecover` | Recover a lost commit | | `commitFixup` | Amend staged changes into older commit | | `commitMessageAmend` | Amend an older commit's message | | `commitsSquash` | Squash multiple commits | | `commitsSearch` | Search commits | ### Branches | Method | Description | |--------|-------------| | `branches` | List all branches | | `branchCreate` | Create a new branch | | `branchCreateSwitch` | Create and switch to branch | | `branchSwitch` | Switch to a branch | | `branchDelete` | Delete a branch | | `branchMerge` | Merge a branch | | `mergeAbort` | Abort an in-progress merge | ### Remote Operations | Method | Description | |--------|-------------| | `pull` | Pull changes from remote | | `push` | Push changes to remote | | `fetch` | Fetch updates from remote | ### Stash | Method | Description | |--------|-------------| | `stashes` | List all stashes | | `stashCreate` | Create a stash | | `stashApply` | Apply a stash (keep it) | | `stashPop` | Apply and remove a stash | | `stashDrop` | Delete a stash | | `stashShow` | Show stash diff | | `stashesClear` | Clear all stashes | ### History & Undo | Method | Description | |--------|-------------| | `reflog` | Get git operation history | | `undoLast` | Undo last git operation | | `blame` | Get blame info for file | | `changeFind` | Find commit that introduced change | ### Rebase & Cherry-pick | Method | Description | |--------|-------------| | `rebasePreview` | Preview commits to rebase | | `rebaseScripted` | Perform scripted rebase | | `rebaseContinue` | Continue rebase | | `rebaseAbort` | Abort rebase | | `cherryPick` | Cherry-pick commits | | `cherryPickContinue` | Continue cherry-pick | | `cherryPickAbort` | Abort cherry-pick | | `revertAbort` | Abort revert | ### Conflicts | Method | Description | |--------|-------------| | `conflicts` | Get current conflicts | | `conflictResolve` | Resolve with ours/theirs | | `conflictMarkResolved` | Mark file as resolved | ### Advanced | Method | Description | |--------|-------------| | `fileRemoveFromHistory` | Remove file from all history | | 58 | ⚡🎨💬 |
| [**Git**](git.md) | Local git repository operations Provides git version control operations for local repositories using simple-git. Supports branch management, commits, staging, and remote operations. Common use cases: - Version control: "Show git status", "Commit these changes" - Branch management: "Create a feature branch", "Switch to main" - History: "Show recent commits", "Show diff of changes" - Remote operations: "Push to origin", "Pull latest changes" Example: status({ path: "/path/to/repo" }) Configuration: - repoPath: Default repository path (default: current directory) | 11 | - |
| [**GitHub Issues**](github-issues.md) | Manage GitHub repository issues Provides tools to list, create, update, and comment on GitHub issues. Requires a GitHub personal access token with repo scope. Common use cases: - Issue tracking: "List all open issues in my repo" - Bug reporting: "Create a new bug issue with details" - Issue management: "Close issue #123 and add a comment" Example: listIssues({ owner: "user", repo: "project", state: "open" }) Configuration: - token: GitHub personal access token (required) - baseUrl: GitHub API base URL (default: https://api.github.com) Dependencies are auto-installed on first run. | 7 | - |
| [**Google Calendar**](google-calendar.md) | Calendar integration Provides calendar operations using Google Calendar API (OAuth2). Supports event management, calendar listing, and free/busy queries. Common use cases: - Event management: "Schedule a meeting tomorrow at 2pm", "What's on my calendar today?" - Availability: "Check when John is free this week" - Search: "Find all meetings with Sarah" Example: list({ maxResults: 10 }) Configuration: - clientId: OAuth2 client ID from Google Cloud Console - clientSecret: OAuth2 client secret - refreshToken: OAuth2 refresh token (obtain via OAuth flow) | 9 | - |
| [**Hello World**](hello-world.md) | The simplest possible photon Start here. A photon is just a TypeScript class where each method becomes an MCP tool. That's it. | 0 | - |
| [**Integration Demo — Dependencies, Assets, Stateful Workflows Demonstrates dependency management, asset discovery, stateful workflows with checkpoint/resume, and resource methods. Features covered:**](integration-demo.md) | Runtime version constraint (>=1.0.0) - CLI dependency check (node) - Stateful class annotation for resumable workflows - Checkpoint yields for workflow resumption - UI asset linking - Asset folder discovery (integration-demo/ui/) - @resource method (MCP resource) - @format annotations | 5 | ⚡🎨 |
| [**Jira**](jira.md) | Project management and issue tracking Provides Jira operations using the official Jira REST API v3. Supports issue management, projects, transitions, and comments. Common use cases: - Issue tracking: "Create bug report", "Update issue status to In Progress" - Project management: "List all projects", "Get project details" - Collaboration: "Add comment to issue", "Assign issue to developer" Example: createIssue({ project: "PROJ", summary: "Bug in login", issueType: "Bug" }) Configuration: - host: Jira instance URL (e.g., "your-domain.atlassian.net") - email: User email for authentication - apiToken: API token from Jira (required) | 10 | - |
| [**Kanban Board Photon Task management for humans and AI. Use named instances (`_use('project-name')`) for per-project boards. Perfect for:**](kanban.md) | Project planning and task tracking - AI working memory across sessions - Human-AI collaboration on shared tasks ## Quick Reference **Tasks:** - `add()` - Create new task - `list()` - List tasks (with filters) - `show()` - Get single task with comments - `mine()` - Get tasks assigned to AI - `edit()` - Update task details - `move()` - Move task to column - `drop()` - Delete a task - `reorder()` - Reorder within column - `search()` - Search tasks by keyword - `sweep()` - Move multiple tasks at once **Comments & Dependencies:** - `comment()` - Add comment to task - `comments()` - Get task comments - `block()` - Set/remove task dependencies **Board Management:** - `board()` - Get full board state - `column()` - Add or remove a column - `stats()` - Get board statistics - `clear()` - Archive completed tasks - `hooks()` - Install Claude Code hooks - `configure()` - Configure settings | 26 | ⚡🎨📡 |
| [**Kitchen Sink**](kitchen-sink.md) | Kitchen Sink Photon Demonstrates every feature of the Photon runtime with meaningfully named functions. Use this as a reference for building your own photons. | 25 | ⚡🎨 |
| [**Math Photon MCP**](math.md) | Advanced math expression evaluator Exposes a single, robust `calculate` method for AI/agent use. Supports arithmetic, power, sqrt, log, trig, min, max, sum, mean, median, std, abs, floor, ceil, round, random, and constants (PI, E). Example: calculate({ expression: "mean([1,2,3,4]) + max(5, 10) - abs(-7)" }) Run with: npx @portel/photon math --dev or install globally with: npm install -g @portel/photon photon math --dev | 1 | - |
| [**MCP Orchestrator Photon Demonstrates how to consume multiple MCPs (written in any language) as dependencies and orchestrate workflows that combine their capabilities. This photon shows how to: 1. Use this.mcp('name') to access external MCPs 2. Call tools on MCPs written in Python, Rust, Node.js, etc. 3. Combine data from multiple sources into unified workflows 4. Handle errors gracefully when MCPs are unavailable ## MCP Dependencies This photon can work with any MCPs configured in NCP:**](mcp-orchestrator.md) | `tavily` - Search API (Node.js MCP) - `browser` - Web automation (Node.js MCP) - `whatsapp` - Messaging (Python MCP via uv) - `sequential-thinking` - Reasoning (Node.js MCP) - Any other MCP configured in your NCP profile ## How it Works The `this.mcp('name')` method returns a proxy that: - Calls tools directly: `await this.mcp('tavily').search({ query: '...' })` - Lists tools: `await this.mcp('tavily').list()` - Finds tools: `await this.mcp('tavily').find('search')` | 10 | 🔌 |
| [**MongoDB**](mongodb.md) | NoSQL database operations Provides MongoDB database operations using the official MongoDB driver. Supports document CRUD, aggregation pipelines, and collection management. Common use cases: - Document operations: "Find users where age > 25", "Insert new product" - Aggregation: "Group orders by customer and sum totals" - Collection management: "List all collections", "Create index on email field" Example: find({ collection: "users", filter: { age: { $gt: 25 } } }) Configuration: - uri: MongoDB connection URI (required) - database: Default database name (required) | 13 | - |
| [**PostgreSQL**](postgres.md) | Database operations for PostgreSQL Provides tools to query, insert, update, and manage PostgreSQL databases. Supports parameterized queries, transactions, and schema introspection. Common use cases: - Data analysis: "Query user statistics from the database" - Data management: "Insert a new user record" - Schema exploration: "List all tables in the database" Example: query({ sql: "SELECT * FROM users WHERE active = $1", params: [true] }) Configuration: - host: Database host (default: localhost) - port: Database port (default: 5432) - database: Database name (required) - user: Database user (required) - password: Database password (required) - ssl: Enable SSL connection (default: false) Dependencies are auto-installed on first run. | 7 | - |
| [**Preferences Photon Demonstrates MCP Apps with UI assets, prompts, and resources. Assets are auto-discovered from the preferences/ folder by convention. Asset folder structure (auto-served): preferences/ ui/ settings.html    **](preferences.md) | Main settings form theme-preview.html - Theme preview component prompts/ welcome.md        - Welcome message template resources/ defaults.json     - Default configuration | 7 | ⚡🎨💬⚡ |
| [**Progressive Rendering**](progressive-rendering.md) | Progressive Rendering — Same Data, Better Display Six methods return the same team data, each progressively enhanced. Run them side-by-side in Beam to see how Photon features improve rendering. | 6 | - |
| [**Redis**](redis.md) | In-memory data store and cache Provides Redis operations using the official Redis client. Supports key-value operations, lists, hashes, sets, and pub/sub patterns. Common use cases: - Caching: "Cache user session for 1 hour", "Get cached API response" - Counters: "Increment page view counter", "Get current visitor count" - Lists/Queues: "Add job to queue", "Get next job from queue" - Pub/Sub: "Publish message to channel", "Subscribe to events" Example: set({ key: "user:123", value: "John", ttl: 3600 }) Configuration: - url: Redis connection URL (default: redis://localhost:6379) - password: Redis password (optional) - database: Database number (default: 0) | 18 | - |
| [**Slack**](slack.md) | Send messages and manage Slack workspace Provides tools to send messages, list channels, and interact with Slack workspace. Requires a Slack Bot Token with appropriate scopes. Common use cases: - Notifications: "Send a deployment notification to #engineering" - Team updates: "Post the daily standup summary to #team" - Channel management: "List all public channels" Example: postMessage({ channel: "#general", text: "Hello team!" }) Configuration: - token: Slack Bot Token (required, starts with xoxb-) Dependencies are auto-installed on first run. | 7 | - |
| [**SQLite Photon MCP**](sqlite.md) | SQLite database operations Provides SQLite database utilities: query, execute, insert, update, delete, and schema operations. Supports both in-memory and file-based databases. Example: query({ sql: "SELECT * FROM users WHERE id = ?", params: [1] }) Dependencies are auto-installed on first run. | 9 | - |
| [**Tasks Basic**](tasks-basic.md) | Basic Task List — stateless, in-memory A simple todo list that works during a session but loses state on restart. Compare with tasks-live to see what @stateful adds. | 4 | - |
| [**Tasks Live**](tasks-live.md) | Live Task List — stateful, reactive, persistent Same functionality as tasks-basic, but tasks survive restarts and the UI updates in real-time via emit(). Uses `this.memory` for zero-boilerplate persistence — compare with tasks-basic to see the difference (no fs/path/os imports needed). | 4 | - |
| [**Team Dashboard**](team-dashboard.md) | Team Dashboard Photon A TV/monitor-optimized dashboard that aggregates data from multiple photons to give the whole team visibility into project progress. Perfect for office displays, war rooms, or remote team syncs. | 20 | 🎨🎨 |
| [**Team Pulse**](team-pulse.md) | Team Pulse — Async Standup with Memory + Channels + Locking Post daily updates, see what the team posted, search past standups. Updates persist via `this.memory`, broadcast to all sessions via channels, and use distributed locking to prevent duplicate rapid-fire posts. | 4 | 📡 |
| [**Time**](time.md) | Timezone and time conversion operations Provides timezone-aware time operations using native Node.js Intl API. Zero dependencies, uses JavaScript's built-in timezone support. Common use cases: - Current time queries: "What time is it in Tokyo?" - Time conversion: "Convert 2pm EST to PST" - Meeting scheduling: "What's 9am in New York in London time?" Example: getCurrentTime({ timezone: "America/New_York" }) Configuration: - local_timezone: Override system timezone (optional, IANA timezone name) | 3 | - |
| [**Todo List**](todo.md) | Reactive collections in action This photon demonstrates Photon's killer feature: reactive arrays. Just use normal array methods (push, splice, filter) and the runtime automatically emits events so connected UIs update in real-time. | 0 | - |
| [**Weather**](weather.md) | Wrap any API in 20 lines Shows how a photon turns an external API into MCP tools with zero boilerplate. Uses the free Open-Meteo API (no API key needed). | 2 | - |
| [**Web**](web.md) | Web Agent Photon (Search + Read) A complete web research toolkit. 1. Search: Scrapes Brave Search for web results (no API key required). 2. Read: Uses Mozilla Readability to extract main article content. Note: Previously used DuckDuckGo, but they now block automated requests with CAPTCHA challenges. Brave Search works without such restrictions. | 2 | ⚡ |


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
