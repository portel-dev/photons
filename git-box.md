# @name git-box @icon 📬 @description Mailbox-style Git interface

manage repos like an inbox /
export class GitBoxPhoton extends PhotonMCP {
  private configPath = path.join(os.homedir(), '.photon', 'git-box.json');

  /

## 📋 Overview

**Version:** 1.4.1
**Author:** Unknown
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **57** tools:


### `main`

Opens the mailbox interface for managing git repositories. Displays tracked repos with their status, commit history, and working changes.





---


### `addRepo`

Add a repository to track (auto-initializes if not a repo)


**Parameters:**


- **`repoPath`** (any) - Path to git repository

- **`autoInit`** (any, optional) - Whether to auto-initialize if not a repo





---


### `initRepo`

Initialize a new git repository


**Parameters:**


- **`folderPath`** (any) - Path to folder

- **`force`** (any) - Skip safety checks





---


### `scanAvailableRepos`

Scan projects root folder for available git repositories and folders





---


### `setProjectsRoot`

Set the projects root folder


**Parameters:**


- **`rootPath`** (any) - Path to folder containing git repositories





---


### `removeRepo`

Remove a repository from tracking


**Parameters:**


- **`repoPath`** (any) - Path to git repository





---


### `listRepos`

List all tracked repositories with status counts





---


### `getCommits`

Get commit history for a repository (like inbox messages)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`limit`** (any) - Number of commits to fetch

- **`branch`** (any) - Branch to show commits from





---


### `getCommitFiles`

Get files changed in a specific commit


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`hash`** (any) - Commit hash





---


### `getStatus`

Get current working tree status (staged and unstaged changes)


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `stageFile`

Stage a file for commit


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - File to stage (or "." for all)





---


### `unstageFile`

Unstage a file


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - File to unstage





---


### `commit`

Create a commit with staged changes


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`message`** (any) - Commit message





---


### `pull`

Pull changes from remote


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`remote`** (any, optional) - Remote name





---


### `push`

Push changes to remote


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`remote`** (any, optional) - Remote name





---


### `fetch`

Fetch updates from remote without merging


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`remote`** (any, optional) - Remote name

- **`prune`** (any) - Remove remote-tracking references that no longer exist





---


### `getBranches`

Get list of branches


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `switchBranch`

Switch to a different branch


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`branch`** (any) - Branch name to switch to





---


### `getDiff`

Get diff for a file with syntax-highlighted output


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - File to diff

- **`staged`** (any) - Whether to show staged diff





---


### `discardChanges`

Discard changes in a file


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - File to discard changes





---


### `getCommitDiff`

Get diff for a specific file in a commit


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`hash`** (any) - Commit hash

- **`filePath`** (any) - File to get diff for





---


### `getFileContent`

Get file content (current version or from a specific commit)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - File to read

- **`hash`** (any) - Optional commit hash (omit for working tree version)





---


### `createBranch`

Create a new branch


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`branchName`** (any) - Name for the new branch

- **`startPoint`** (any, optional) - Optional commit/branch to start from





---


### `createAndSwitchBranch`

Create and switch to a new branch


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`branchName`** (any) - Name for the new branch

- **`startPoint`** (any) - Optional commit/branch to start from





---


### `deleteBranch`

Delete a branch


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`branchName`** (any) - Branch to delete

- **`force`** (any) - Force delete even if not merged





---


### `mergeBranch`

Merge a branch into the current branch


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`branchName`** (any) - Branch to merge

- **`noFastForward`** (any) - Create merge commit even if fast-forward is possible





---


### `abortMerge`

Abort an in-progress merge


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `getReflog`

Get reflog - history of all git operations (undo stack)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`limit`** (any) - Number of entries to fetch





---


### `undoLast`

Undo the last git operation (soft reset to previous HEAD)


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `resetToCommit`

Reset to a specific commit (from reflog or commit history)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`hash`** (any) - Commit hash to reset to

- **`mode`** (any) - Reset mode: soft (keep changes staged), mixed (keep changes unstaged), hard (discard all)





---


### `recoverCommit`

Recover a "lost" commit using reflog


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`hash`** (any) - Commit hash to recover (create a branch pointing to it)

- **`branchName`** (any) - Name for the recovery branch





---


### `listStashes`

List all stashes


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `createStash`

Create a new stash


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`message`** (any) - Optional stash message

- **`includeUntracked`** (any) - Include untracked files





---


### `applyStash`

Apply a stash (keep the stash)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`stashRef`** (any) - Stash reference (e.g., "stash@{0}") - defaults to latest





---


### `popStash`

Pop a stash (apply and remove)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`stashRef`** (any) - Stash reference - defaults to latest





---


### `dropStash`

Drop (delete) a stash


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`stashRef`** (any) - Stash reference to drop





---


### `showStash`

Show diff of a stash


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`stashRef`** (any) - Stash reference





---


### `clearStashes`

Clear all stashes (dangerous!)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`confirm`** (any) - Must be true to proceed





---


### `squashCommits`

Squash multiple commits into one


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`baseCommit`** (any) - The commit BEFORE the range to squash (commits after this get squashed)

- **`message`** (any) - New commit message for the squashed commit





---


### `amendCommitMessage`

Amend an older commit's message using automated rebase


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`commitHash`** (any) - The commit whose message to change

- **`newMessage`** (any) - The new commit message





---


### `removeFileFromHistory`

Remove a file from the entire git history (dangerous!)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - File to remove from history

- **`confirm`** (any) - Must be true to proceed





---


### `cherryPick`

Cherry-pick one or more commits from another branch


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`commits`** (any) - Array of commit hashes to cherry-pick (in order)

- **`noCommit`** (any) - If true, stage changes without committing





---


### `abortCherryPick`

Abort an in-progress cherry-pick


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `continueCherryPick`

Continue cherry-pick after resolving conflicts


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `revertCommit`

Revert a specific commit (creates a new commit that undoes it)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`commitHash`** (any) - Commit to revert

- **`noCommit`** (any) - If true, stage the revert without committing





---


### `abortRevert`

Abort an in-progress revert


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `fixupCommit`

Fixup - amend staged changes into an older commit


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`targetCommit`** (any) - The commit to amend the staged changes into





---


### `getRebasePreview`

Interactive rebase preview - shows what commits would be affected


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`baseCommit`** (any) - The commit to rebase onto (commits after this are affected)





---


### `scriptedRebase`

Perform a scripted rebase with custom actions for each commit


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`baseCommit`** (any) - The commit to rebase onto

- **`actions`** (any) - Array of actions: { hash, action: 'pick'|'reword'|'squash'|'fixup'|'drop', message? }





---


### `continueRebase`

Continue an in-progress rebase


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `abortRebase`

Abort an in-progress rebase


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `getConflicts`

Get conflicts in current merge/rebase/cherry-pick


**Parameters:**


- **`repoPath`** (any) - Path to repository





---


### `markResolved`

Mark a conflicted file as resolved


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - File to mark as resolved





---


### `resolveConflict`

Use ours or theirs version for a conflicted file


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - Conflicted file

- **`version`** (any) - Which version to use: 'ours' or 'theirs'





---


### `getBlame`

Get blame information for a file


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`filePath`** (any) - File to blame

- **`startLine`** (any) - Optional start line

- **`endLine`** (any) - Optional end line





---


### `searchCommits`

Search for commits by message, author, or content


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`query`** (any) - Search query

- **`type`** (any) - Type of search: 'message', 'author', 'content', 'all'

- **`limit`** (any) - Max results





---


### `findChange`

Find which commit introduced a specific line or change (pickaxe)


**Parameters:**


- **`repoPath`** (any) - Path to repository

- **`searchText`** (any) - Text to search for

- **`filePath`** (any) - Optional file to limit search to





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
photon mcp ./git-box.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp git-box.photon.ts ~/.photon/

# Run by name
photon mcp git-box
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp git-box --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.4.1
