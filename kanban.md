# Kanban

Kanban Board Photon

## 📋 Overview

**Version:** 2.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **20** tools:


### `listBoards`

List all boards  See all available boards with task counts. Use this to find existing project boards or check if a board exists.





---


### `createBoard`

Create a new board  Create a board for a new project or conversation. Board names should be descriptive (e.g., "photon-project", "auth-feature", "session-abc123").




**Example:**

```typescript
createBoard({ name: 'my-project' })
```


---


### `deleteBoard`

Delete a board  Permanently remove a board and all its tasks. Use with caution!





---


### `main`

Open the Kanban board  Visual drag-and-drop board for managing tasks. Both humans and AI can interact with this board - humans through the UI, AI through MCP methods.





---


### `getTasks`

Get all tasks, optionally filtered  Use this to understand the current state of the project, find tasks assigned to you, or check what needs attention.




**Example:**

```typescript
getTasks({ board: 'my-project', assignee: 'ai' })
```


---


### `getMyTasks`

Get tasks assigned to AI  Quickly see what tasks are waiting for AI to work on.





---


### `createTask`

Create a new task  Add a task to the board. By default, tasks go to 'Backlog' column. Use 'context' to store AI reasoning or notes for memory.




**Example:**

```typescript
createTask({ board: 'my-project', title: 'Fix bug', priority: 'high' })
```


---


### `moveTask`

Move a task to a different column  Update the status of a task by moving it between columns. Common flow: Backlog → Todo → In Progress → Review → Done





---


### `updateTask`

Update a task's details  Modify task title, description, priority, assignee, labels, or context.





---


### `deleteTask`

Delete a task





---


### `searchTasks`

Search tasks across all boards or within a specific board  Find tasks by keyword in title, description, or context.





---


### `addComment`

Add a comment to a task  Use comments for instructions, updates, questions, and conversation. Both humans and AI can add comments to track progress and communicate.




**Example:**

```typescript
addComment({ id: 'abc123', content: 'Please use JWT for auth', author: 'human' })
```


---


### `getComments`

Get comments for a task  Retrieve all comments/conversation for a specific task.





---


### `getTask`

Get a task with all its details including comments  Returns the full task object with comments for context.





---


### `getBoard`

Get the current board state  Returns all columns and tasks. Useful for AI to understand the full context.





---


### `getActiveBoard`

Get the most recently active board  Returns the board that was most recently updated (by AI or humans). Useful for AI to know which project currently needs attention, and for the UI "Auto" mode to follow activity across boards.





---


### `addColumn`

Add a new column to the board





---


### `removeColumn`

Remove a column (moves tasks to Backlog)





---


### `clearCompleted`

Clear completed tasks (archive them)





---


### `getStats`

Get board statistics





---





## 📥 Usage

### Install Photon CLI

```bash
npm install -g @portel/photon
```

### Run This Photon

**Option 1: Run directly from file**

```bash
# Clone/download the photon file
photon mcp ./kanban.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp kanban.photon.ts ~/.photon/

# Run by name
photon mcp kanban
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp kanban --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest
```


## 📄 License

MIT • Version 2.0.0
