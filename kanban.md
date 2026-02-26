# Kanban

Kanban Board Photon Task management for humans and AI. Use named instances (`_use('project-name')`) for per-project boards. Perfect for project planning, AI working memory across sessions, and human-AI collaboration on shared tasks.

> **19 tools** · Streaming Photon · v4.0.3 · MIT

**Platform Features:** `generator` `custom-ui` `stateful` `channels`

## ⚙️ Configuration


| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `KANBAN_PHOTON_BOARDDATA` | No | Board | No description available (default: `createEmptyBoard('default')`) |




## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `hooks` | Install Claude Code hooks in a project folder. |
| `main` ⚡ | Open the Kanban board. |
| `list` | Get all tasks, optionally filtered. |
| `mine` | Get tasks assigned to AI. |
| `add` | Create a new task. |
| `move` | Move a task to a different column. |
| `reorder` | Reorder a task within or across columns. |
| `edit` | Update a task's details. |
| `drop` | Delete a task. |
| `search` | Search tasks on the current board. |
| `comment` | Add a comment to a task. |
| `comments` | Get comments for a task. |
| `show` | Get a task with all its details including comments. |
| `board` | Get the current board state. |
| `column` | Add or remove a column. |
| `clear` | Clear completed tasks (archive them) |
| `stats` | Get board statistics. |
| `block` | Set task dependencies. |
| `sweep` | Batch move tasks with exclusive lock. |


## 🔧 Tools


### `hooks`

Install Claude Code hooks in a project folder. Installs stop hook (blocks stopping with incomplete tasks) and user-prompt-submit hook (logs user messages for reference). Only installs if the folder appears to be a Claude Code project (has .claude folder or CLAUDE.md).





---


### `main` ⚡

Open the Kanban board. Visual drag-and-drop board for managing tasks. Both humans and AI can interact with this board - humans through the UI, AI through MCP methods. ## AI Workflow (IMPORTANT). When working on tasks as an AI assistant: 1. **Check assigned tasks**: Use `mine` to find tasks assigned to you 2. **Work in "In Progress"**: Tasks you're actively working on should be here 3. **Move to "Review" when done**: Do NOT move directly to "Done"! - "Review" means: AI finished, waiting for human verification - Only humans should move tasks from "Review" to "Done" 4. **Add comments**: Document what you did for the reviewer. This keeps humans in the loop and ensures quality control.





---


### `list`

Get all tasks, optionally filtered. Use this to understand the current state of the project, find tasks assigned to you, or check what needs attention.




**Example:**

```typescript
list({ assignee: 'ai' })
```


---


### `mine`

Get tasks assigned to AI. Quickly see what tasks are waiting for AI to work on. Call this at the start of a session to check your workload. **Workflow reminder**: - Work on tasks in "In Progress" - When finished, move to "Review" (not "Done") - Add a comment explaining what you did - Humans will review and move to "Done"





---


### `add`

Create a new task. Add a task to the board. By default, tasks go to 'Backlog' column. Use 'context' to store AI reasoning or notes for memory. Use 'blockedBy' to specify dependencies (task IDs that must complete first). Use 'autoPullThreshold' to auto-pull when In Progress < N. Use 'autoReleaseMinutes' to auto-release after N minutes.




**Example:**

```typescript
add({ title: 'Fix bug', priority: 'high' })
```


---


### `move`

Move a task to a different column. Update the status of a task by moving it between columns. Common flow: Backlog → Todo → In Progress → Review → Done. **AI WORKFLOW**: When you complete a task, move it to "Review" - NOT "Done"! The "Review" column is for human verification. Only humans move tasks to "Done". **Dependencies**: Tasks with unresolved `blockedBy` cannot move to Review or Done.




**Example:**

```typescript
move({ id: 'abc123', column: 'In Progress' })
```


---


### `reorder`

Reorder a task within or across columns. Move a task to a specific position. Use `beforeId` to place before another task, or omit to place at the end of the column. Array order = display order.




**Example:**

```typescript
reorder({ id: 'abc', column: 'Todo', beforeId: 'xyz' })
```


---


### `edit`

Update a task's details. Modify task title, description, priority, assignee, labels, context, dependencies, or automation settings.





---


### `drop`

Delete a task. Also removes this task from any other task's blockedBy list.





---


### `search`

Search tasks on the current board. Find tasks by keyword in title, description, or context.





---


### `comment`

Add a comment to a task. Use comments for instructions, updates, questions, and conversation. Both humans and AI can add comments to track progress and communicate.




**Example:**

```typescript
comment({ id: 'abc123', content: 'Please use JWT for auth', author: 'human' })
```


---


### `comments`

Get comments for a task. Retrieve all comments/conversation for a specific task.





---


### `show`

Get a task with all its details including comments. Returns the full task object with comments for context.





---


### `board`

Get the current board state. Returns all columns and tasks. Useful for AI to understand the full context.





---


### `column`

Add or remove a column. By default adds a new column. Set `remove: true` to remove instead. Removed columns move their tasks to Backlog. Cannot remove Backlog or Done.




**Example:**

```typescript
column({ name: 'QA' }) // Add before Done
```


---


### `clear`

Clear completed tasks (archive them)





---


### `stats`

Get board statistics. Includes WIP status showing current vs limit for In Progress column.





---


### `block`

Set task dependencies. Convenience method to add or remove dependencies between tasks.




**Example:**

```typescript
block({ id: 'task2', blockedBy: 'task1' }) // task2 waits for task1
```


---


### `sweep`

Batch move tasks with exclusive lock. Move multiple tasks atomically. Uses distributed lock to prevent concurrent modifications from corrupting the board.





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph kanban["📦 Kanban"]
        direction TB
        PHOTON((🎯))
        T0[🔧 hooks]
        PHOTON --> T0
        T1[🌊 main (stream)]
        PHOTON --> T1
        T2[📖 list]
        PHOTON --> T2
        T3[🔧 mine]
        PHOTON --> T3
        T4[✏️ add]
        PHOTON --> T4
        T5[🔧 move]
        PHOTON --> T5
        T6[🔧 reorder]
        PHOTON --> T6
        T7[🔄 edit]
        PHOTON --> T7
        T8[🗑️ drop]
        PHOTON --> T8
        T9[📖 search]
        PHOTON --> T9
        T10[🔧 comment]
        PHOTON --> T10
        T11[🔧 comments]
        PHOTON --> T11
        T12[🔧 show]
        PHOTON --> T12
        T13[🔧 board]
        PHOTON --> T13
        T14[🔧 column]
        PHOTON --> T14
        T15[🗑️ clear]
        PHOTON --> T15
        T16[🔧 stats]
        PHOTON --> T16
        T17[🔧 block]
        PHOTON --> T17
        T18[🔧 sweep]
        PHOTON --> T18
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

MIT · v4.0.3 · Portel
