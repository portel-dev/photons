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

### 4. Calendar

Google Calendar integration for event management and scheduling.

**File:** `calendar.photon.ts`

**Configuration:**
```bash
export CALENDAR_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export CALENDAR_CLIENT_SECRET="your-client-secret"
export CALENDAR_REFRESH_TOKEN="your-refresh-token"
photon calendar
```

**Tools:** 9 tools
- `listEvents` - List upcoming events with filtering
- `getEvent` - Get specific event details
- `createEvent` - Create new event with attendees
- `updateEvent` - Update existing event
- `deleteEvent` - Delete event (sends cancellation emails)
- `listCalendars` - List all accessible calendars
- `getFreeBusy` - Check availability for multiple people
- `searchEvents` - Search events by query
- `getUpcomingEvents` - Get events within specified hours

**Dependencies:** Auto-installs `googleapis@^128.0.0`

**Features:**
- Full event CRUD operations
- Multi-calendar support
- Attendee management with email notifications
- Free/busy availability checking
- Event search and filtering
- Timezone-aware scheduling

**OAuth2 Setup:**
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Calendar API
3. Create OAuth2 credentials (Web application)
4. Use OAuth2 Playground or your app to get refresh token
5. Set environment variables with credentials

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/calendar.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/calendar.photon.ts

# Run with OAuth credentials
export CALENDAR_CLIENT_ID="123456789.apps.googleusercontent.com"
export CALENDAR_CLIENT_SECRET="your_secret"
export CALENDAR_REFRESH_TOKEN="your_refresh_token"
photon calendar
```

---

### 5. Docker

Container and image management using Docker API.

**File:** `docker.photon.ts`

**Configuration:**
```bash
export DOCKER_SOCKET_PATH="/var/run/docker.sock"  # Optional, default: /var/run/docker.sock
photon docker
```

**Tools:** 10 tools
- `listContainers` - List containers (running or all)
- `startContainer` - Start stopped container
- `stopContainer` - Stop running container (with timeout)
- `restartContainer` - Restart container (with timeout)
- `removeContainer` - Remove container (with force option)
- `getLogs` - Get container logs (with tail limit)
- `listImages` - List all Docker images
- `pullImage` - Pull image from registry
- `removeImage` - Remove image (with force option)
- `getStats` - Get real-time container stats (CPU, memory, network)

**Dependencies:** Auto-installs `dockerode@^4.0.0`

**Features:**
- Full container lifecycle management
- Image management (pull, list, remove)
- Real-time logs with configurable tail
- Container stats (CPU, memory, network usage)
- Force operations for cleanup
- Automatic Docker connection validation

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/docker.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/docker.photon.ts

# Run with default socket
photon docker

# Or specify custom socket (e.g., Colima on macOS)
export DOCKER_SOCKET_PATH="$HOME/.colima/docker.sock"
photon docker
```

---

### 6. MongoDB

NoSQL database operations with the official MongoDB driver.

**File:** `mongodb.photon.ts`

**Configuration:**
```bash
export MONGO_D_B_URI="mongodb://localhost:27017"  # Or MongoDB Atlas URI
export MONGO_D_B_DATABASE="myapp"
photon mongodb
```

**Tools:** 14 tools
- `find` - Find documents with filtering, sorting, and limits
- `findOne` - Find single document by filter
- `insertOne` - Insert single document
- `insertMany` - Insert multiple documents
- `updateOne` - Update single document (with upsert option)
- `updateMany` - Update multiple documents
- `deleteOne` - Delete single document
- `deleteMany` - Delete multiple documents
- `aggregate` - Run aggregation pipelines
- `countDocuments` - Count documents matching filter
- `listCollections` - List all collections in database
- `createIndex` - Create indexes (with unique option)
- `distinct` - Get distinct values for a field

**Dependencies:** Auto-installs `mongodb@^6.3.0`

**Features:**
- Full CRUD operations
- Aggregation pipeline support
- Index management
- Upsert operations
- Automatic ObjectId serialization
- Connection pooling built-in

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/mongodb.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/mongodb.photon.ts

# Run with local MongoDB
export MONGO_D_B_URI="mongodb://localhost:27017"
export MONGO_D_B_DATABASE="myapp"
photon mongodb

# Or with MongoDB Atlas
export MONGO_D_B_URI="mongodb+srv://user:pass@cluster.mongodb.net"
export MONGO_D_B_DATABASE="production"
photon mongodb
```

---

### 7. Redis

In-memory data store for caching and real-time operations.

**File:** `redis.photon.ts`

**Configuration:**
```bash
export REDIS_URL="redis://localhost:6379"  # Optional, default: redis://localhost:6379
export REDIS_PASSWORD="your_password"  # Optional
export REDIS_DATABASE="0"  # Optional, default: 0
photon redis
```

**Tools:** 19 tools
- `get` - Get value by key
- `set` - Set key-value with optional TTL
- `del` - Delete one or more keys
- `exists` - Check if key exists
- `keys` - Get all keys matching pattern
- `incr` - Increment numeric value
- `decr` - Decrement numeric value
- `expire` - Set expiration time on key
- `ttl` - Get time to live for key
- `lpush` - Push to list (left)
- `rpush` - Push to list (right)
- `lpop` - Pop from list (left)
- `rpop` - Pop from list (right)
- `llen` - Get list length
- `hget` - Get hash field value
- `hset` - Set hash field value
- `hgetall` - Get all hash fields
- `flushdb` - Clear current database

**Dependencies:** Auto-installs `redis@^4.6.0`

**Features:**
- Key-value caching with TTL
- List operations for queues
- Hash operations for objects
- Atomic increment/decrement
- Pattern matching for keys
- Connection pooling built-in

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/redis.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/redis.photon.ts

# Run with local Redis
photon redis

# Or with Redis Cloud
export REDIS_URL="redis://user:pass@redis-cloud.com:6379"
photon redis
```

---

### 8. AWS S3

Cloud object storage with the AWS SDK.

**File:** `aws-s3.photon.ts`

**Configuration:**
```bash
export AWS_S3_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_S3_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
export AWS_S3_REGION="us-east-1"  # Optional, default: us-east-1
photon aws-s3
```

**Tools:** 11 tools
- `uploadObject` - Upload file to bucket (with base64 support)
- `downloadObject` - Download file from bucket
- `listObjects` - List objects in bucket (with prefix filter)
- `deleteObject` - Delete single object
- `deleteObjects` - Delete multiple objects
- `getObjectMetadata` - Get object metadata (size, type, etc.)
- `copyObject` - Copy object within S3
- `getPresignedUrl` - Generate presigned URL for temporary access
- `listBuckets` - List all buckets
- `createBucket` - Create new bucket
- `deleteBucket` - Delete bucket (must be empty)

**Dependencies:** Auto-installs `@aws-sdk/client-s3@^3.511.0, @aws-sdk/s3-request-presigner@^3.511.0`

**Features:**
- Binary file support (base64 encoding)
- Presigned URLs for secure sharing
- Batch delete operations
- Object metadata management
- Cross-bucket copying
- Regional bucket support

**Example:**
```bash
# Install to ~/.photon/
curl -o ~/.photon/aws-s3.photon.ts https://raw.githubusercontent.com/portel-dev/photons/main/aws-s3.photon.ts

# Run with AWS credentials
export AWS_S3_ACCESS_KEY_ID="your_access_key"
export AWS_S3_SECRET_ACCESS_KEY="your_secret_key"
export AWS_S3_REGION="us-west-2"
photon aws-s3
```

---

### 9. GitHub Issues

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

### 10. Slack

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

### 11. PostgreSQL

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

### 12. SQLite

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

### 13. Web Fetch

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

### 14. Memory

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
