# Kanban Board Photon Multi-tenant task management for humans and AI. Each project/conversation can have its own board. Perfect for:

Project planning and task tracking - AI working memory across sessions - Human-AI collaboration on shared tasks ## Quick Reference **Boards:** - `boards()` - List all boards - `board()` - Get board details - `boardCreate()` - Create new board - `boardDelete()` - Delete a board - `projectLink()` - Link board to project folder - `projects()` - List available project folders **Tasks:** - `tasks()` - List tasks (with filters) - `task()` - Get single task with comments - `myTasks()` - Get tasks assigned to AI - `taskCreate()` - Create new task - `taskMove()` - Move task to column - `taskUpdate()` - Update task details - `taskDelete()` - Delete a task - `taskReorder()` - Reorder within column - `search()` - Search tasks by keyword **Comments & Dependencies:** - `commentAdd()` - Add comment to task - `comments()` - Get task comments - `dependencySet()` - Set/remove task dependencies **Columns & Stats:** - `columnAdd()` - Add new column - `columnRemove()` - Remove column - `stats()` - Get board statistics - `completedClear()` - Archive completed tasks **Batch & Utility:** - `main()` - Entry point (shows board UI) - `active()` - Get most recently updated board - `batchMove()` - Move multiple tasks at once

> **33 tools** · Streaming Photon · v2.1.0 · MIT

**Platform Features:** `generator` `custom-ui` `elicitation` `stateful` `channels`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `configure` ⚡

Configure the Kanban photon  Call this before using any board methods. Three behaviors: 1. **AI with known values**: Pass params directly to skip elicitation 2. **Already configured**: Loads existing config from disk 3. **First-time human**: Prompts user to enter values via elicitation


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectsRoot` | any | Yes | Root folder containing project directories (e.g., ~/Projects) |
| `wipLimit` | number | No | Maximum cards allowed in "In Progress" column
   * |




**Example:**

```typescript
// AI knows the values - skip elicitation
await configure({ projectsRoot: '/home/user/Projects', wipLimit: 5 })
```


---


### `installHooks`

Install Claude Code hooks in a project folder  Installs stop hook (blocks stopping with incomplete tasks) and user-prompt-submit hook (logs user messages for reference).  Only installs if the folder appears to be a Claude Code project (has .claude folder or CLAUDE.md).





---


### `projects`

List available project folders  Shows folders in the configured projects root that can be linked to boards. Use this when creating a new board to see available projects.





---


### `boards`

List all boards  See all available boards with task counts. Use this to find existing project boards or check if a board exists.





---


### `boardCreate`

Create a new board  Create a board linked to a project folder. If no folder specified, use projects() to see available options.  When a folder is provided: - Board name = folder name - Claude Code hooks are auto-installed in the project - Board is linked to the project for task tracking




**Example:**

```typescript
boardCreate({ folder: 'my-project' })
```


---


### `projectLink`

Link an existing board to a project folder  Use this to link a board that was created without a folder, or to regenerate hooks for an existing project.





---


### `boardDelete`

Delete a board  Permanently remove a board and all its tasks. Use with caution!





---


### `main` ⚡

Open the Kanban board  Visual drag-and-drop board for managing tasks. Both humans and AI can interact with this board - humans through the UI, AI through MCP methods.  ## AI Workflow (IMPORTANT)  When working on tasks as an AI assistant:  1. **Check assigned tasks**: Use `myTasks` to find tasks assigned to you 2. **Work in "In Progress"**: Tasks you're actively working on should be here 3. **Move to "Review" when done**: Do NOT move directly to "Done"! - "Review" means: AI finished, waiting for human verification - Only humans should move tasks from "Review" to "Done" 4. **Add comments**: Document what you did for the reviewer  This keeps humans in the loop and ensures quality control.





---


### `tasks`

Get all tasks, optionally filtered  Use this to understand the current state of the project, find tasks assigned to you, or check what needs attention.




**Example:**

```typescript
tasks({ board: 'my-project', assignee: 'ai' })
```


---


### `myTasks`

Get tasks assigned to AI  Quickly see what tasks are waiting for AI to work on. Call this at the start of a session to check your workload.  **Workflow reminder**: - Work on tasks in "In Progress" - When finished, move to "Review" (not "Done") - Add a comment explaining what you did - Humans will review and move to "Done"





---


### `taskCreate`

Create a new task  Add a task to the board. By default, tasks go to 'Backlog' column. Use 'context' to store AI reasoning or notes for memory. Use 'blockedBy' to specify dependencies (task IDs that must complete first). Use 'autoPullThreshold' to auto-pull when In Progress < N. Use 'autoReleaseMinutes' to auto-release after N minutes.




**Example:**

```typescript
taskCreate({ board: 'my-project', title: 'Fix bug', priority: 'high' })
```


---


### `taskMove`

Move a task to a different column  Update the status of a task by moving it between columns. Common flow: Backlog → Todo → In Progress → Review → Done  **AI WORKFLOW**: When you complete a task, move it to "Review" - NOT "Done"! The "Review" column is for human verification. Only humans move tasks to "Done".  **Dependencies**: Tasks with unresolved `blockedBy` cannot move to Review or Done.




**Example:**

```typescript
taskMove({ board: 'my-project', id: 'abc123', column: 'In Progress' })
```


---


### `taskReorder`

Reorder a task within or across columns  Move a task to a specific position. Use `beforeId` to place before another task, or omit to place at the end of the column. Array order = display order.




**Example:**

```typescript
reorderTask({ id: 'abc', column: 'Todo', beforeId: 'xyz' }) // Place before xyz
```


---


### `taskUpdate`

Update a task's details  Modify task title, description, priority, assignee, labels, context, dependencies, or automation settings.





---


### `taskDelete`

Delete a task  Also removes this task from any other task's blockedBy list.





---


### `search`

Search tasks across all boards or within a specific board  Find tasks by keyword in title, description, or context.





---


### `commentAdd`

Add a comment to a task  Use comments for instructions, updates, questions, and conversation. Both humans and AI can add comments to track progress and communicate.




**Example:**

```typescript
commentAdd({ id: 'abc123', content: 'Please use JWT for auth', author: 'human' })
```


---


### `comments`

Get comments for a task  Retrieve all comments/conversation for a specific task.





---


### `task`

Get a task with all its details including comments  Returns the full task object with comments for context.





---


### `board`

Get the current board state  Returns all columns and tasks. Useful for AI to understand the full context.





---


### `active`

Get the most recently active board  Returns the board that was most recently updated (by AI or humans). Useful for AI to know which project currently needs attention, and for the UI "Auto" mode to follow activity across boards.





---


### `columnAdd`

Add a new column to the board





---


### `columnRemove`

Remove a column (moves tasks to Backlog)





---


### `completedClear`

Clear completed tasks (archive them)





---


### `stats`

Get board statistics  Includes WIP status showing current vs limit for In Progress column.





---


### `dependencySet`

Set task dependencies  Convenience method to add or remove dependencies between tasks.




**Example:**

```typescript
dependencySet({ id: 'task2', blockedBy: 'task1' }) // task2 waits for task1
```


---


### `reportError`

Report a JavaScript error from the UI  Used by the kanban UI to report runtime errors back to developers/AI. Errors are logged to a file for debugging and can trigger notifications.





---


### `scheduledArchiveOldTasks`

Archive old completed tasks  Runs daily at midnight to move completed tasks older than 7 days to an archive file, keeping the board clean.





---


### `scheduledMorningPull`

Morning standup prep  Runs every weekday at 8am to pull tasks from Backlog → Todo. Helps teams prepare for the day with fresh tasks ready to work on.





---


### `scheduledAutoRelease`

Time-based auto-release for cards with autoReleaseMinutes set  Checks every 5 minutes for Backlog cards that have an auto-release interval configured. If the interval has passed since lastReleaseAttempt, the card is moved to In Progress (respecting WIP limit).





---


### `scheduledStaleTaskCheck`

Stale task cleanup  Runs weekly on Sunday to move stale tasks (no updates in N days) back to Backlog for re-prioritization.





---


### `handleGithubIssue`

Handle GitHub webhook for issue events  Creates or updates tasks when GitHub issues are opened/closed. Configure GitHub webhook URL: POST /webhook/handleGithubIssue  Auto-detected as webhook from 'handle' prefix.





---


### `batchMove`

Batch move tasks with exclusive lock  Move multiple tasks atomically. Uses distributed lock to prevent concurrent modifications from corrupting the board.  Option 1: Use @locked tag (entire method locked)





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph kanban["📦 Kanban"]
        direction TB
        PHOTON((🎯))
        T0[🌊 configure (stream)]
        PHOTON --> T0
        T1[🔧 installHooks]
        PHOTON --> T1
        T2[🔧 projects]
        PHOTON --> T2
        T3[🔧 boards]
        PHOTON --> T3
        T4[🔧 boardCreate]
        PHOTON --> T4
        T5[🔧 projectLink]
        PHOTON --> T5
        T6[🔧 boardDelete]
        PHOTON --> T6
        T7[🌊 main (stream)]
        PHOTON --> T7
        T8[🔧 tasks]
        PHOTON --> T8
        T9[🔧 myTasks]
        PHOTON --> T9
        T10[🔧 taskCreate]
        PHOTON --> T10
        T11[🔧 taskMove]
        PHOTON --> T11
        T12[🔧 taskReorder]
        PHOTON --> T12
        T13[🔧 taskUpdate]
        PHOTON --> T13
        T14[🔧 taskDelete]
        PHOTON --> T14
        T15[📖 search]
        PHOTON --> T15
        T16[🔧 commentAdd]
        PHOTON --> T16
        T17[🔧 comments]
        PHOTON --> T17
        T18[🔧 task]
        PHOTON --> T18
        T19[🔧 board]
        PHOTON --> T19
        T20[🔧 active]
        PHOTON --> T20
        T21[🔧 columnAdd]
        PHOTON --> T21
        T22[🔧 columnRemove]
        PHOTON --> T22
        T23[🔧 completedClear]
        PHOTON --> T23
        T24[🔧 stats]
        PHOTON --> T24
        T25[🔧 dependencySet]
        PHOTON --> T25
        T26[🔧 reportError]
        PHOTON --> T26
        T27[🔧 scheduledArchiveOldTasks]
        PHOTON --> T27
        T28[🔧 scheduledMorningPull]
        PHOTON --> T28
        T29[🔧 scheduledAutoRelease]
        PHOTON --> T29
        T30[🔧 scheduledStaleTaskCheck]
        PHOTON --> T30
        T31[🔧 handleGithubIssue]
        PHOTON --> T31
        T32[🔧 batchMove]
        PHOTON --> T32
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add kanban

# Get MCP config for your client
photon info kanban --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v2.1.0 · Portel
