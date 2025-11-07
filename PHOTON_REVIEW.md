# Photons Repository Review & Recommendations

**Review Date**: November 7, 2025
**Reviewer**: Expert MCP Developer

---

## Executive Summary

The photons repository contains **6 high-quality MCPs** with excellent documentation and consistent patterns. All photons follow Photon conventions well and provide solid implementations. This review identifies opportunities for improvements and suggests 15 new photons to expand the ecosystem.

---

## Current Photons Analysis

### ✅ Strengths Across All Photons

1. **Consistent structure** - All follow Photon conventions
2. **Good error handling** - Success/error response patterns
3. **Well-documented** - JSDoc comments for all tools
4. **Auto-dependencies** - Properly tagged with @dependencies
5. **Lifecycle hooks** - Good use of onInitialize/onShutdown
6. **Constructor validation** - Proper error messages for missing config

### 📊 Statistics

| Photon | Lines | Tools | Dependencies | Status |
|--------|-------|-------|--------------|--------|
| github-issues | 355 | 7 | @octokit/rest | ✅ Excellent |
| slack | 345 | 7 | @slack/web-api | ✅ Excellent |
| postgres | 380 | 9 | pg | ✅ Excellent |
| sqlite | 276 | 9 | better-sqlite3 | ✅ Excellent |
| memory | 417 | 10 | None | ✅ Excellent |
| web-fetch | 157 | 2 | turndown | ✅ Excellent |

---

## Improvement Recommendations

### 1. GitHub Issues Photon

**Current**: 7 tools (list, get, create, update, comment)

**Improvements**:
```typescript
// Add Pull Request support
async listPullRequests(params: { owner: string; repo: string; state?: string }) {}
async mergePullRequest(params: { owner: string; repo: string; pull_number: number }) {}

// Add repository management
async getRepositoryInfo(params: { owner: string; repo: string }) {}
async listRepositories(params: { org: string }) {}

// Add label management
async listLabels(params: { owner: string; repo: string }) {}
async createLabel(params: { owner: string; repo: string; name: string; color: string }) {}

// Add milestone support
async listMilestones(params: { owner: string; repo: string }) {}
async createMilestone(params: { owner: string; repo: string; title: string; due_on?: string }) {}
```

**Why**: Pull requests are critical for GitHub workflows. Repository browsing helps with discovery.

### 2. Slack Photon

**Current**: 7 tools (message, channels, history, reactions, files, search)

**Improvements**:
```typescript
// Add user operations
async getUserInfo(params: { user: string }) {}
async listUsers(params: { limit?: number }) {}

// Add scheduled messages
async scheduleMessage(params: { channel: string; text: string; post_at: number }) {}

// Add message updates
async updateMessage(params: { channel: string; ts: string; text: string }) {}
async deleteMessage(params: { channel: string; ts: string }) {}

// Add workspace stats
async getWorkspaceInfo(params: {}) {}
```

**Why**: User operations are common. Message management (edit/delete) is essential.

### 3. PostgreSQL Photon

**Current**: 9 tools (query, transaction, schema operations)

**Improvements**:
```typescript
// Add query builder helpers
async select(params: { table: string; where?: object; limit?: number }) {}
async update(params: { table: string; where: object; data: object }) {}
async delete(params: { table: string; where: object }) {}

// Add connection health
async healthCheck(params: {}) {}

// Add table management
async createTable(params: { name: string; columns: Array<{name: string, type: string}> }) {}
async dropTable(params: { name: string }) {}
```

**Why**: Query builders reduce SQL errors. Health checks are useful for monitoring.

### 4. SQLite Photon

**Current**: 9 tools (open, query, execute, transaction, schema)

**Improvements**:
```typescript
// Add query builder (same as Postgres)
async select(params: { table: string; where?: object; limit?: number }) {}
async update(params: { table: string; where: object; data: object }) {}
async delete(params: { table: string; where: object }) {}

// Add database info
async getDatabaseInfo(params: {}) {}

// Add import/export
async exportToCSV(params: { table: string; destination: string }) {}
async importFromCSV(params: { table: string; source: string }) {}
```

**Why**: CSV import/export is common. Database info helps with debugging.

### 5. Memory Photon

**Current**: 10 tools (entities, relations, observations, search)

**Improvements**:
```typescript
// Add graph visualization
async exportGraph(params: { format: 'json' | 'dot' | 'cypher' }) {}

// Add bulk operations
async bulkCreateEntities(params: { entities: Array<Entity> }) {}

// Add advanced search
async searchWithFilters(params: { query: string; entityType?: string; limit?: number }) {}

// Add graph analytics
async getEntityConnections(params: { entity: string; depth?: number }) {}
async findShortestPath(params: { from: string; to: string }) {}
```

**Why**: Visualization helps understanding. Analytics provide insights into relationships.

### 6. Web Fetch Photon

**Current**: 2 tools (fetch, fetchBatch)

**Improvements**:
```typescript
// Add caching
async fetchCached(params: { url: string; ttl?: number }) {}

// Add more extraction options
async fetchLinks(params: { url: string; selector?: string }) {}
async fetchImages(params: { url: string }) {}
async fetchText(params: { url: string; selector?: string }) {}

// Add sitemap support
async fetchSitemap(params: { url: string }) {}

// Add robots.txt check
async checkRobots(params: { url: string; userAgent?: string }) {}
```

**Why**: Caching reduces redundant fetches. Link/image extraction is common for web scraping.

---

## New Photon Recommendations

### 🔥 High Priority (Must-Have)

#### 1. **Filesystem Photon**

**Why**: Most common operation - reading/writing files

**Tools** (12 tools):
```typescript
class Filesystem {
  constructor(
    private workdir: string = join(homedir(), 'Documents'),
    private maxFileSize: number = 10485760, // 10MB
    private allowHidden: boolean = false
  ) {}

  // Core operations
  async readFile(params: { path: string }) {}
  async writeFile(params: { path: string; content: string }) {}
  async appendFile(params: { path: string; content: string }) {}
  async deleteFile(params: { path: string }) {}

  // Directory operations
  async listFiles(params: { path: string; recursive?: boolean }) {}
  async createDirectory(params: { path: string }) {}
  async deleteDirectory(params: { path: string; recursive?: boolean }) {}

  // File info
  async getFileInfo(params: { path: string }) {}
  async exists(params: { path: string }) {}

  // Search
  async searchFiles(params: { pattern: string; path?: string }) {}

  // Bulk operations
  async copyFile(params: { source: string; destination: string }) {}
  async moveFile(params: { source: string; destination: string }) {}
}
```

**Use cases**: "Read my project README", "Save this data to a file", "List files in Downloads"

---

#### 2. **Email Photon**

**Why**: Email is universal - sending notifications, reading inbox

**Tools** (8 tools):
```typescript
/**
 * @dependencies nodemailer@^6.9.0, imap@^0.8.19
 */
class Email {
  constructor(
    private smtpHost: string,
    private smtpPort: number,
    private smtpUser: string,
    private smtpPassword: string,
    private imapHost?: string,
    private imapPort?: number
  ) {}

  // Send operations
  async sendEmail(params: { to: string; subject: string; body: string; html?: boolean }) {}
  async sendWithAttachment(params: { to: string; subject: string; body: string; attachments: string[] }) {}

  // Receive operations
  async listInbox(params: { limit?: number; unreadOnly?: boolean }) {}
  async getEmail(params: { messageId: string }) {}
  async searchEmails(params: { query: string; limit?: number }) {}

  // Management
  async markAsRead(params: { messageId: string }) {}
  async deleteEmail(params: { messageId: string }) {}
  async archiveEmail(params: { messageId: string }) {}
}
```

**Use cases**: "Email me the report", "Check my unread emails", "Send invoice to client"

---

#### 3. **Calendar Photon**

**Why**: Scheduling, meeting management, reminders

**Tools** (9 tools):
```typescript
/**
 * @dependencies googleapis@^128.0.0
 */
class Calendar {
  constructor(
    private clientId: string,
    private clientSecret: string,
    private refreshToken: string
  ) {}

  // Event operations
  async listEvents(params: { calendarId?: string; startDate?: string; endDate?: string }) {}
  async getEvent(params: { eventId: string; calendarId?: string }) {}
  async createEvent(params: { title: string; start: string; end: string; attendees?: string[] }) {}
  async updateEvent(params: { eventId: string; updates: object }) {}
  async deleteEvent(params: { eventId: string }) {}

  // Calendar management
  async listCalendars(params: {}) {}
  async getFreeBusy(params: { emails: string[]; startDate: string; endDate: string }) {}

  // Search
  async searchEvents(params: { query: string; maxResults?: number }) {}
  async getUpcomingEvents(params: { hours?: number }) {}
}
```

**Use cases**: "Schedule a meeting tomorrow at 2pm", "What's on my calendar today?"

---

#### 4. **Git Photon**

**Why**: Version control operations beyond GitHub (local repos)

**Tools** (11 tools):
```typescript
/**
 * @dependencies simple-git@^3.21.0
 */
class Git {
  constructor(private repoPath?: string) {}

  // Basic operations
  async status(params: { path?: string }) {}
  async log(params: { path?: string; maxCount?: number }) {}
  async diff(params: { path?: string; staged?: boolean }) {}

  // Branch operations
  async listBranches(params: { path?: string }) {}
  async createBranch(params: { name: string; path?: string }) {}
  async checkoutBranch(params: { name: string; path?: string }) {}
  async deleteBranch(params: { name: string; path?: string }) {}

  // Changes
  async add(params: { files: string[]; path?: string }) {}
  async commit(params: { message: string; path?: string }) {}
  async push(params: { remote?: string; branch?: string; path?: string }) {}
  async pull(params: { remote?: string; branch?: string; path?: string }) {}
}
```

**Use cases**: "Show git status", "Create a feature branch", "Commit these changes"

---

#### 5. **Docker Photon**

**Why**: Container management is essential for modern development

**Tools** (10 tools):
```typescript
/**
 * @dependencies dockerode@^4.0.0
 */
class Docker {
  constructor(private socketPath: string = '/var/run/docker.sock') {}

  // Container operations
  async listContainers(params: { all?: boolean }) {}
  async startContainer(params: { id: string }) {}
  async stopContainer(params: { id: string }) {}
  async restartContainer(params: { id: string }) {}
  async removeContainer(params: { id: string; force?: boolean }) {}
  async getLogs(params: { id: string; tail?: number }) {}

  // Image operations
  async listImages(params: {}) {}
  async pullImage(params: { name: string; tag?: string }) {}
  async removeImage(params: { id: string }) {}

  // System
  async getStats(params: { id: string }) {}
}
```

**Use cases**: "List running containers", "Start the database container", "Check container logs"

---

### 🎯 Medium Priority (High Value)

#### 6. **Google Sheets Photon**

**Tools** (8 tools): read, write, append, update cells, create sheet, list sheets, format cells, export

**Why**: Spreadsheet operations are common for data analysis and reporting

---

#### 7. **Jira Photon**

**Tools** (9 tools): list issues, create issue, update issue, transition issue, add comment, search, get project, list projects, create project

**Why**: Popular project management tool, especially in enterprises

---

#### 8. **AWS S3 Photon**

**Tools** (9 tools): upload, download, list objects, delete, get metadata, presigned URL, create bucket, list buckets, delete bucket

**Why**: Cloud storage is ubiquitous, S3 is industry standard

---

#### 9. **MongoDB Photon**

**Tools** (10 tools): find, findOne, insert, update, delete, aggregate, createIndex, listCollections, count, distinct

**Why**: NoSQL database operations complement PostgreSQL/SQLite

---

#### 10. **Redis Photon**

**Tools** (11 tools): get, set, delete, exists, keys, increment, expire, lpush, lpop, hget, hset

**Why**: Caching and pub/sub patterns are extremely common

---

### 📈 Lower Priority (Nice to Have)

#### 11. **RSS Feed Photon**

**Tools**: subscribe, list feeds, get items, unsubscribe, refresh

**Why**: Content aggregation, news monitoring

---

#### 12. **Stripe Photon**

**Tools**: create customer, create payment intent, list charges, refund, list products, create product

**Why**: Payment processing for e-commerce

---

#### 13. **Notion Photon**

**Tools**: create page, update page, query database, create database, add blocks

**Why**: Popular workspace tool

---

#### 14. **Linear Photon**

**Tools**: list issues, create issue, update issue, list projects, create comment

**Why**: Modern project management, gaining popularity

---

#### 15. **Twitter/X Photon**

**Tools**: post tweet, get timeline, search, get user, follow, unfollow

**Why**: Social media automation

---

## Implementation Priority Roadmap

### Phase 1: Essential Foundation (Week 1-2)
1. ✅ **Filesystem** - Most common operation
2. ✅ **Email** - Universal communication
3. ✅ **Git** - Local version control

### Phase 2: Cloud & Collaboration (Week 3-4)
4. ✅ **Calendar** - Scheduling operations
5. ✅ **Google Sheets** - Data operations
6. ✅ **Docker** - Container management

### Phase 3: Enterprise Integration (Week 5-6)
7. ✅ **Jira** - Project management
8. ✅ **AWS S3** - Cloud storage
9. ✅ **MongoDB** - NoSQL database

### Phase 4: Advanced Features (Week 7-8)
10. ✅ **Redis** - Caching layer
11. ✅ Improve existing photons (PRs, query builders, etc.)

### Phase 5: Nice to Have (Future)
12. ✅ RSS, Stripe, Notion, Linear, Twitter

---

## Quality Guidelines for New Photons

### ✅ Must Have

1. **JSDoc documentation** for every tool
2. **Success/error response pattern**
3. **Constructor parameter validation**
4. **onInitialize() connection testing**
5. **onShutdown() cleanup**
6. **@version, @author, @license tags**
7. **Comprehensive error messages**
8. **@dependencies tags**

### ✅ Best Practices

1. **Default values** for optional parameters
2. **Resource pooling** for databases/connections
3. **Pagination support** for list operations
4. **Rate limiting** awareness for APIs
5. **Example usage** in JSDoc header
6. **Private helper methods** (with _ prefix)

### ✅ Testing Requirements

1. Works with `photon mcp <name> --dev`
2. Validates successfully with `photon validate <name>`
3. Generates proper config with `photon get <name> --mcp`
4. All tools show up in tool list
5. Error handling works as expected

---

## Conclusion

The current photon collection is **excellent quality** with room for strategic expansion.

**Immediate Actions**:
1. Implement **Filesystem**, **Email**, and **Git** photons (Phase 1)
2. Add **PR support** to GitHub Issues
3. Add **query builders** to database photons

**Long-term**:
- Build out enterprise integrations (Jira, AWS, MongoDB)
- Add visualization tools for Memory photon
- Create comprehensive photon templates for contributors

**Metrics**:
- Current: 6 photons, 44 total tools
- Target (Phase 1-4): 15 photons, ~140 total tools
- This would create a **comprehensive production-ready MCP ecosystem**

---

**Next Steps**: Should we start with Phase 1 and build the top 3 photons?
