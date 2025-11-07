# Migration Opportunities from NCP/MicroMCP to Photons

## Code Available for Migration

### ✅ Found in ncp-production-clean

#### 1. **Shell MCP** (`src/internal-mcps/shell.micro.ts`)

**Status**: **Ready to migrate**
**Lines**: 160
**Tools**: 9 tools

**Tools Available**:
- `execute` - Run shell commands with timeout & env vars
- `run` - Simplified command execution
- `which` - Check if command exists
- `getEnv` - Get environment variables
- `ls` - List files (with flags)
- `pwd` - Get current directory
- `cd` - Change directory and execute

**Migration Plan**:
1. Convert to Photon pattern (remove `MicroMCP` base class)
2. Add `@dependencies` if needed
3. Rename to `shell.photon.ts`
4. Add JSDoc for all methods
5. Improve return types to use success/error pattern

**Value**: This overlaps with **Filesystem** photon recommendations. Can extract the core filesystem operations.

---

#### 2. **Intelligence MCP** (`src/internal-mcps/intelligence.micro.ts`)

**Status**: Internal to NCP (not migrable)
**Reason**: Specific to NCP's orchestration layer

---

### ✅ Found in micro-mcp Repository

#### 3. **Workflow MCP** (`workflow.micro.ts`)

**Status**: **Orchestration pattern** (reference only)
**Lines**: 417
**Value**: Shows workflow definition patterns but specific to NCP architecture

**Not a direct migration candidate**, but useful patterns for:
- Template-based workflows
- Step-by-step execution plans
- Context variable substitution

---

#### 4. **Calculator MCP** (`calculator.micro.ts`)

**Status**: **Already exists** in photons examples (`math.photon.ts`)
**Skip**: Already migrated

---

#### 5. **String MCP** (`string.micro.ts`)

**Status**: **Already exists** in photons examples (`text.photon.ts`)
**Skip**: Already migrated

---

## 🎯 Actionable Migration: Shell → Filesystem Photon

The **Shell MCP** contains the core filesystem operations we need. Here's the extraction plan:

### From Shell MCP → Filesystem Photon

**Extract these tools**:

```typescript
// From shell.micro.ts
async ls(params: { path?: string; all?: boolean; long?: boolean })
async pwd()
async cd(params: { path: string })
async execute(params: { command: string }) // For advanced users
```

**Add filesystem-specific tools**:

```typescript
// New additions for complete filesystem coverage
async readFile(params: { path: string })
async writeFile(params: { path: string; content: string })
async deleteFile(params: { path: string })
async copyFile(params: { source: string; destination: string })
async moveFile(params: { source: string; destination: string })
async createDirectory(params: { path: string })
async deleteDirectory(params: { path: string; recursive?: boolean })
async getFileInfo(params: { path: string })
async exists(params: { path: string })
async searchFiles(params: { pattern: string; path?: string })
```

### Migration Steps

1. **Create `filesystem.photon.ts`**
   ```typescript
   /**
    * @dependencies (none needed - uses Node.js fs)
    */
   import * as fs from 'fs/promises';
   import * as path from 'path';
   import { homedir } from 'os';

   export default class Filesystem {
     constructor(
       private workdir: string = path.join(homedir(), 'Documents'),
       private maxFileSize: number = 10485760, // 10MB
       private allowHidden: boolean = false
     ) {}

     // Extract ls, pwd from shell.micro.ts
     // Add new file operations
   }
   ```

2. **Test with Photon**
   ```bash
   photon --working-dir ~/Projects/photons init filesystem
   # Copy implementation
   photon validate filesystem
   photon mcp filesystem --dev
   ```

3. **Add to photons registry**

---

## ❌ Not Found in NCP/MicroMCP

These photons from our recommendations **don't exist** in the codebase and need to be built from scratch:

### High Priority (Build New)

1. **Email** - No implementation found
2. **Git** - No implementation found (only GitHub API wrappers)
3. **Calendar** - No implementation found
4. **Docker** - No implementation found
5. **Google Sheets** - No implementation found
6. **Jira** - No implementation found
7. **AWS S3** - No implementation found
8. **MongoDB** - No implementation found
9. **Redis** - No implementation found

### Already in Photons

1. ✅ **GitHub Issues** - Already exists (`github-issues.photon.ts`)
2. ✅ **Slack** - Already exists (`slack.photon.ts`)
3. ✅ **PostgreSQL** - Already exists (`postgres.photon.ts`)
4. ✅ **SQLite** - Already exists (`sqlite.photon.ts`)
5. ✅ **Memory** - Already exists (`memory.photon.ts`)
6. ✅ **Web Fetch** - Already exists (`web-fetch.photon.ts`)

---

## 📋 Updated Roadmap

### Phase 1: Migrate + Build Essential (Week 1-2)

1. **Migrate Shell → Filesystem Photon** ⚡ (Can extract from shell.micro.ts)
   - Extract: `ls`, `pwd`, `cd`, `execute`
   - Add: `readFile`, `writeFile`, `deleteFile`, etc.
   - **Effort**: 4 hours (migration + additions)

2. **Build Email Photon** (No existing code)
   - Use `nodemailer` + `imap`
   - **Effort**: 6 hours

3. **Build Git Photon** (No existing code)
   - Use `simple-git`
   - **Effort**: 6 hours

### Phase 2: Cloud & Collaboration (Week 3-4)

4. **Build Calendar Photon** (No existing code)
5. **Build Google Sheets Photon** (No existing code)
6. **Build Docker Photon** (No existing code)

### Phase 3: Enterprise (Week 5-6)

7. **Build Jira Photon** (No existing code)
8. **Build AWS S3 Photon** (No existing code)
9. **Build MongoDB Photon** (No existing code)
10. **Build Redis Photon** (No existing code)

---

## 🎯 Immediate Action

**Start with Filesystem Photon** - We have a head start with shell.micro.ts!

**Command**:
```bash
cd ~/Projects/photons
# Create new photon based on shell.micro.ts
```

Would you like me to:
1. **Migrate Shell → Filesystem Photon right now** (extract + enhance)
2. **Build Email Photon from scratch**
3. **Build Git Photon from scratch**

The Filesystem photon is the quickest win since we have 50% of the code already!
