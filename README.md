# Photons - Official Photon MCP Registry

Production-ready MCPs for the [Photon](https://github.com/portel-dev/photon) framework. Single-file, zero-config, auto-dependency MCPs that work out of the box.

## 🚀 Quick Start

### Prerequisites

```bash
npm install -g @portel/photon
```

### Usage

**Option 1: Install to ~/.photon/ (Recommended)**

```bash
# Download MCP to ~/.photon/
curl -o ~/.photon/github-issues.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/github-issues.photon.ts

# Run it (by name)
export GITHUB_TOKEN="your_token_here"
photon github-issues
```

**Option 2: Run from local path**

```bash
# Clone this repo
git clone https://github.com/portel-dev/photons.git
cd photons

# Run directly
export GITHUB_TOKEN="your_token_here"
photon /path/to/photons/github-issues.photon.ts
```

**Option 3: Use with Claude Desktop**

```bash
# Generate config
photon github-issues --config

# Add to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Available MCPs

### 1. Filesystem

File and directory operations using native Node.js APIs.

**File:** `filesystem.photon.ts`

**Configuration:**
```bash
export FILESYSTEM_WORKDIR="/path/to/working/directory"  # Optional, default: ~/Documents
export FILESYSTEM_MAX_FILE_SIZE="10485760"  # Optional, default: 10MB
export FILESYSTEM_ALLOW_HIDDEN="false"  # Optional, default: false

photon filesystem
```

**Tools:** 13 tools
- `readFile` - Read file contents with encoding support
- `writeFile` - Write content to file
- `appendFile` - Append to existing file
- `deleteFile` - Remove file safely
- `copyFile` - Copy file to destination
- `moveFile` - Move/rename file
- `listFiles` - List directory contents (recursive option)
- `createDirectory` - Create directories (recursive option)
- `deleteDirectory` - Remove directories (recursive option)
- `getFileInfo` - Get file/directory metadata
- `exists` - Check if path exists
- `searchFiles` - Search by glob pattern (*.txt, **/*.js)
- `getWorkdir` - Get configured working directory

**Security Features:**
- Path validation prevents traversal attacks
- Configurable max file size limit
- Optional hidden file access control
- All operations restricted to working directory

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/filesystem.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/filesystem.photon.ts

# Run with default config (workdir: ~/Documents)
photon filesystem

# Or with custom workdir
export FILESYSTEM_WORKDIR="$HOME/Projects"
photon filesystem
```

---

### 2. Email

Send and receive emails via SMTP and IMAP protocols.

**File:** `email.photon.ts`

**Configuration:**
```bash
export EMAIL_SMTP_HOST="smtp.gmail.com"
export EMAIL_SMTP_PORT="587"  # Optional, default: 587
export EMAIL_SMTP_USER="your@gmail.com"
export EMAIL_SMTP_PASSWORD="your_app_password"
export EMAIL_SMTP_SECURE="false"  # Optional, default: false (use TLS)

# Optional: IMAP for receiving emails
export EMAIL_IMAP_HOST="imap.gmail.com"  # Optional
export EMAIL_IMAP_PORT="993"  # Optional, default: 993
export EMAIL_IMAP_USER="your@gmail.com"  # Optional, defaults to SMTP user
export EMAIL_IMAP_PASSWORD="your_app_password"  # Optional, defaults to SMTP password

photon email
```

**Tools:** 8 tools
- `sendEmail` - Send email with plain text or HTML body
- `sendWithAttachment` - Send email with file attachments
- `listInbox` - List inbox messages (with filters)
- `getEmail` - Get specific email by UID
- `searchEmails` - Search emails by from/subject/body
- `markAsRead` - Mark email as read
- `deleteEmail` - Delete email permanently
- `moveEmail` - Move email to another mailbox (archive)

**Dependencies:** Auto-installs `nodemailer@^6.9.0, imap@^0.8.19, mailparser@^3.6.0`

**Features:**
- SMTP sending with TLS/SSL support
- IMAP receiving with search capabilities
- Attachment support (send and receive)
- HTML and plain text emails
- Mailbox management (read, delete, move)
- Works in send-only mode if IMAP not configured

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/email.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/email.photon.ts

# Run with Gmail (use App Password, not regular password)
export EMAIL_SMTP_HOST="smtp.gmail.com"
export EMAIL_SMTP_USER="your@gmail.com"
export EMAIL_SMTP_PASSWORD="your_app_password"
export EMAIL_IMAP_HOST="imap.gmail.com"
photon email

# Send-only mode (no IMAP)
export EMAIL_SMTP_HOST="smtp.sendgrid.net"
export EMAIL_SMTP_USER="apikey"
export EMAIL_SMTP_PASSWORD="your_sendgrid_api_key"
photon email
```

---

### 3. Git

Local git repository version control operations.

**File:** `git.photon.ts`

**Configuration:**
```bash
export GIT_REPO_PATH="/path/to/your/repo"  # Optional, default: current directory
photon git
```

**Tools:** 11 tools
- `status` - Get repository status (staged, modified, branch info)
- `log` - View commit history with author details
- `diff` - Show differences (staged or unstaged)
- `listBranches` - List all branches with current indicator
- `createBranch` - Create new branch (with optional checkout)
- `checkoutBranch` - Switch to different branch
- `deleteBranch` - Delete branch (with force option)
- `add` - Stage files for commit
- `commit` - Create commit with message
- `push` - Push commits to remote
- `pull` - Pull changes from remote

**Dependencies:** Auto-installs `simple-git@^3.21.0`

**Features:**
- Full branch management
- Commit history with filtering
- Staged and unstaged diff viewing
- Remote operations (push/pull)
- Author override support
- Force operations when needed
- Automatic .git directory validation

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/git.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/git.photon.ts

# Run with default config (current directory)
photon git

# Or specify repository path
export GIT_REPO_PATH="$HOME/Projects/my-app"
photon git
```

---

### 4. GitHub Issues

Manage GitHub repository issues with full CRUD operations.

**File:** `github-issues.photon.ts`

**Configuration:**
```bash
export GITHUB_TOKEN="ghp_your_token_here"
photon github-issues
```

**Tools:** 7 tools
- `listIssues` - List issues from a repository
- `getIssue` - Get a single issue by number
- `createIssue` - Create a new issue
- `updateIssue` - Update an existing issue
- `addComment` - Add a comment to an issue
- `listComments` - List comments on an issue
- `searchIssues` - Search issues across repositories

**Example:**
```bash
# Generate Claude Desktop config
photon github-issues --config

# Config output:
{
  "github-issues": {
    "command": "npx",
    "args": ["@portel/photon", "github-issues"],
    "env": {
      "GITHUB_ISSUES_TOKEN": "ghp_your_token"
    }
  }
}
```

---

### 5. Slack

Send messages and manage Slack workspace.

**File:** `slack.photon.ts`

**Configuration:**
```bash
export SLACK_TOKEN="xoxb-your-token-here"
photon slack
```

**Tools:** 7 tools
- `postMessage` - Post a message to a channel
- `listChannels` - List all channels
- `getChannelInfo` - Get channel information
- `getHistory` - Get conversation history
- `addReaction` - Add emoji reaction
- `uploadFile` - Upload file to channel
- `searchMessages` - Search messages in workspace

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/slack.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/slack.photon.ts

# Run
export SLACK_TOKEN="xoxb-..."
photon slack
```

---

### 6. PostgreSQL

Database operations for PostgreSQL with connection pooling.

**File:** `postgres.photon.ts`

**Configuration:**
```bash
export POSTGRE_S_Q_L_DATABASE="mydb"
export POSTGRE_S_Q_L_USER="postgres"
export POSTGRE_S_Q_L_PASSWORD="secret"
export POSTGRE_S_Q_L_HOST="localhost"
export POSTGRE_S_Q_L_PORT="5432"

photon postgres
```

**Tools:** 9 tools
- `query` - Execute SELECT query
- `transaction` - Execute multiple statements in transaction
- `listTables` - List all tables
- `describeTable` - Get table schema
- `listIndexes` - List indexes on table
- `insert` - Insert data into table
- `getDatabaseStats` - Get database statistics

**Dependencies:** Auto-installs `pg@^8.11.0`

**Example:**
```bash
# Generate config
photon postgres --config

# Shows environment variables needed:
# POSTGRE_S_Q_L_DATABASE, POSTGRE_S_Q_L_USER, etc.
```

---

### 7. SQLite

Local SQLite database operations.

**File:** `sqlite.photon.ts`

**Configuration:**
```bash
export S_Q_LITE_PATH="/path/to/database.db"
photon sqlite
```

**Tools:** 9 tools
- `open` - Open a database
- `query` - Execute SELECT query
- `queryOne` - Get single row
- `execute` - Execute INSERT/UPDATE/DELETE
- `transaction` - Execute in transaction
- `listTables` - List all tables
- `schema` - Get table schema
- `close` - Close database
- `backup` - Backup database

**Dependencies:** Auto-installs `better-sqlite3@^11.0.0`

**Example:**
```bash
# Run with in-memory database
photon sqlite --dev

# Or with file
export S_Q_LITE_PATH="./my-app.db"
photon sqlite
```

---

### 8. Web Fetch

Web content fetching and markdown conversion (official Fetch MCP replica).

**File:** `web-fetch.photon.ts`

**Configuration:**
```bash
export WEB_FETCH_USER_AGENT="MyBot/1.0"  # Optional
photon web-fetch
```

**Tools:** 2 tools
- `fetch` - Fetch URL and convert to markdown
- `fetchBatch` - Fetch multiple URLs in parallel

**Dependencies:** Auto-installs `turndown@^7.2.0`

**Features:**
- HTML to Markdown conversion
- Pagination support (`max_length`, `start_index`)
- Raw HTML mode
- Custom User-Agent

**Example:**
```bash
# Install
curl -o ~/.photon/web-fetch.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/web-fetch.photon.ts

# Run
photon web-fetch --dev
```

---

### 9. Memory

Knowledge graph-based persistent memory (official Memory MCP replica).

**File:** `memory.photon.ts`

**Configuration:**
```bash
export MEMORY_STORAGE_PATH="~/.photon/memory.json"  # Optional
photon memory
```

**Tools:** 10 tools
- `createEntities` - Create new entities with observations
- `createRelations` - Create relations between entities
- `addObservations` - Add observations to entity
- `deleteEntities` - Delete entities (cascading)
- `deleteObservations` - Delete specific observations
- `deleteRelations` - Delete relations
- `readGraph` - Read entire knowledge graph
- `searchNodes` - Search for entities
- `openNodes` - Get specific entities with relations
- `clearGraph` - Clear entire graph

**Features:**
- Structured knowledge storage
- Entity-relation modeling
- JSON-based persistence
- Cross-conversation memory

**Example:**
```bash
# Run with default storage
photon memory

# Or specify custom storage
export MEMORY_STORAGE_PATH="/path/to/memory.json"
photon memory
```

---

## 🎯 Usage Patterns

### 1. Local Development (Hot Reload)

```bash
# Clone repo
git clone https://github.com/portel-dev/photons.git
cd photons

# Run with hot reload
photon github-issues.photon.ts --dev
```

**Hot reload watches for file changes and automatically reloads.**

### 2. Production (Installed to ~/.photon/)

```bash
# Install once
curl -o ~/.photon/slack.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/slack.photon.ts

# Run by name (no path needed)
export SLACK_TOKEN="xoxb-..."
photon slack
```

### 3. Claude Desktop Integration

```bash
# Step 1: Install MCP to ~/.photon/
curl -o ~/.photon/github-issues.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/github-issues.photon.ts

# Step 2: Generate config
photon github-issues --config

# Step 3: Add to claude_desktop_config.json
# Copy the JSON output to:
# ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
# %APPDATA%\Claude\claude_desktop_config.json (Windows)

# Step 4: Restart Claude Desktop
```

**Example config:**
```json
{
  "mcpServers": {
    "github-issues": {
      "command": "npx",
      "args": ["@portel/photon", "github-issues"],
      "env": {
        "GITHUB_ISSUES_TOKEN": "ghp_your_token_here"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["@portel/photon", "slack"],
      "env": {
        "SLACK_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

## 🔧 Environment Variable Naming

Photon auto-detects configuration from constructor parameters using convention:

**Pattern:** `{MCP_NAME}_{PARAM_NAME}`

**Examples:**
- Constructor: `new GitHubIssues(token: string)`
  - Env var: `GITHUB_ISSUES_TOKEN`
- Constructor: `new PostgreSQL(database: string, user: string, password: string)`
  - Env vars: `POSTGRE_S_Q_L_DATABASE`, `POSTGRE_S_Q_L_USER`, `POSTGRE_S_Q_L_PASSWORD`

**Note:** Class names are converted to kebab-case, then to SCREAMING_SNAKE_CASE:
- `GitHubIssues` → `github-issues` → `GITHUB_ISSUES_*`
- `PostgreSQL` → `postgre-s-q-l` → `POSTGRE_S_Q_L_*`

Use `--config` to see exact variable names for each MCP.

## 🔄 Keeping MCPs Updated

All MCPs in this registry include version information in their doc comments:

```typescript
/**
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */
```

### Check for Updates

```bash
# Check if updates are available
photon upgrade --check

# Example output:
# [Photon] Checking all MCPs in ~/.photon...
#
#   🔄 github-issues: 1.0.0 → 1.1.0 (update available)
#   ✅ slack: 1.0.0 (up to date)
#   ✅ postgres: 1.0.0 (up to date)
```

### Upgrade MCPs

```bash
# Upgrade all MCPs
photon upgrade

# Upgrade specific MCP
photon upgrade github-issues

# Example output:
# [Photon] Checking github-issues for updates...
# [Photon] 🔄 Upgrading github-issues: 1.0.0 → 1.1.0
# [Photon] ✅ Successfully upgraded github-issues to 1.1.0
```

### How It Works

1. **Version extraction**: Photon reads the `@version` tag from the local MCP file
2. **Registry check**: Fetches the latest version from this GitHub repository
3. **Semver comparison**: Compares versions (major.minor.patch)
4. **Auto-download**: Downloads and replaces the file if update available

**No manual version management needed!** Just run `photon upgrade`.

## 📝 Creating Your Own MCPs

1. **Use the skill:**
```bash
# Install the photon-mcp skill in Claude Code
/plugin add https://github.com/portel-dev/photon-skill
```

2. **Or reference examples:**
```bash
# Clone this repo
git clone https://github.com/portel-dev/photons.git

# Use as templates
cp github-issues.photon.ts my-mcp.photon.ts
# Edit and customize
```

3. **Submit to registry:**
```bash
# Fork this repo
# Add your MCP
# Submit PR
```

## 🧪 Testing

All MCPs include JSDoc documentation for auto-schema extraction. Test using:

```bash
# Run in dev mode (shows verbose logs)
photon your-mcp --dev

# Use MCP Inspector
npx @modelcontextprotocol/inspector npx @portel/photon your-mcp
```

## 📊 Comparison with Official MCPs

These MCPs replicate official [@modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) implementations:

| MCP | Lines of Code | Official LOC | Reduction |
|-----|--------------|--------------|-----------|
| Web Fetch | 154 | ~300 | 48% |
| Memory | 355 | ~400 | 11% |

**Key advantages:**
- ✅ Single file vs multiple files
- ✅ Zero boilerplate
- ✅ Auto-dependency installation
- ✅ Auto-schema extraction
- ✅ Convention-based configuration

See [COMPARISON.md](https://github.com/portel-dev/photon/blob/main/COMPARISON.md) in the main Photon repo.

## 📚 Resources

- **Framework:** [portel-dev/photon](https://github.com/portel-dev/photon)
- **Skill:** [portel-dev/photon-skill](https://github.com/portel-dev/photon-skill)
- **Comparison:** [COMPARISON.md](https://github.com/portel-dev/photon/blob/main/COMPARISON.md)
- **MCP Docs:** [modelcontextprotocol.io](https://modelcontextprotocol.io)

## 📄 License

MIT - See LICENSE file for details

## 🤝 Contributing

1. Fork this repository
2. Add your `.photon.ts` file
3. Update this README with usage instructions
4. Submit a Pull Request

**Requirements for new MCPs:**
- Single `.photon.ts` file
- Complete JSDoc documentation
- `@dependencies` tags for npm packages
- Constructor parameters for configuration
- Error handling with `success`/`error` responses
- Tested and working
