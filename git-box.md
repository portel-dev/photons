# Git Box

Mailbox-style Git interface, manage repos like an inbox

> **58 tools** · Streaming Photon · v2.0.0 · MIT

**Platform Features:** `generator` `custom-ui` `elicitation`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `configure` ⚡

Configure the Git Box photon. Call this before using repository methods. Three behaviors: 1. **AI with known values**: Pass params directly to skip elicitation 2. **Already configured**: Loads existing config from disk 3. **First-time human**: Prompts user to enter values via elicitation


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectsRoot` | any | Yes | Root folder containing git repositories (e.g., ~/Projects)
   * |




**Example:**

```typescript
// AI knows the values - skip elicitation
await configure({ projectsRoot: '/home/user/Projects' })
```


---


### `main` ⚡

Opens the mailbox interface for managing git repositories. Displays tracked repos with their status, commit history, and working changes.





---


### `repoAdd` ⚡

Add a repository to track — prompts interactively if the folder isn't a git repo


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to git repository |





---


### `repoInit`

Initialize a new git repository


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `folderPath` | string | Yes | Path to folder |
| `force` | boolean | No | Skip safety checks |





---


### `availableRepos`

Scan projects root folder for available git repositories and folders





---


### `projectsRootSet`

Set the projects root folder


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rootPath` | string | Yes | Path to folder containing git repositories |





---


### `repoRemove`

Remove a repository from tracking


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to git repository |





---


### `repos`

List all tracked repositories with status counts





---


### `commits`

Get commit history for a repository (like inbox messages)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `limit` | number | No | Number of commits to fetch |
| `branch` | string | No | Branch to show commits from |





---


### `commitFiles`

Get files changed in a specific commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `hash` | string | Yes | Commit hash |





---


### `status`

Get current working tree status (staged and unstaged changes)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `fileStage`

Stage a file for commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | File to stage (or "." for all) |





---


### `fileUnstage`

Unstage a file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | File to unstage |





---


### `commit`

Create a commit with staged changes


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `message` | string | Yes | Commit message |





---


### `pull`

Pull changes from remote


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `remote` | string | No | Remote name |





---


### `push`

Push changes to remote


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `remote` | string | No | Remote name |





---


### `fetch`

Fetch updates from remote without merging


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `remote` | string | No | Remote name |
| `prune` | boolean | No | Remove remote-tracking references that no longer exist |





---


### `branches`

Get list of branches


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `branchSwitch`

Switch to a different branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `branch` | string | Yes | Branch name to switch to |





---


### `diff`

Get diff for a file with syntax-highlighted output


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | File to diff |
| `staged` | boolean | No | Whether to show staged diff |





---


### `changesDiscard`

Discard changes in a file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | File to discard changes |





---


### `commitDiff`

Get diff for a specific file in a commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `hash` | string | Yes | Commit hash |
| `filePath` | string | Yes | File to get diff for |





---


### `fileContent`

Get file content (current version or from a specific commit)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | File to read |
| `hash` | string | No | Optional commit hash (omit for working tree version) |





---


### `branchCreate`

Create a new branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `branchName` | string | Yes | Name for the new branch |
| `startPoint` | string | No | Optional commit/branch to start from |





---


### `branchCreateSwitch`

Create and switch to a new branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `branchName` | string | Yes | Name for the new branch |
| `startPoint` | string | No | Optional commit/branch to start from |





---


### `branchDelete`

Delete a branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `branchName` | string | Yes | Branch to delete |
| `force` | boolean | No | Force delete even if not merged |





---


### `branchMerge`

Merge a branch into the current branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `branchName` | string | Yes | Branch to merge |
| `noFastForward` | boolean | No | Create merge commit even if fast-forward is possible |





---


### `mergeAbort`

Abort an in-progress merge


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `reflog`

Get reflog - history of all git operations (undo stack)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `limit` | number | No | Number of entries to fetch |





---


### `undoLast`

Undo the last git operation (soft reset to previous HEAD)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `commitReset`

Reset to a specific commit (from reflog or commit history)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `hash` | string | Yes | Commit hash to reset to |
| `mode` | 'soft' | 'mixed' | 'hard' | No | Reset mode: soft (keep changes staged), mixed (keep changes unstaged), hard (discard all) |





---


### `commitRecover`

Recover a "lost" commit using reflog


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `hash` | string | Yes | Commit hash to recover (create a branch pointing to it) |
| `branchName` | string | No | Name for the recovery branch |





---


### `stashes`

List all stashes


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `stashCreate`

Create a new stash


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `message` | string | No | Optional stash message |
| `includeUntracked` | boolean | No | Include untracked files |





---


### `stashApply`

Apply a stash (keep the stash)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `stashRef` | string | No | Stash reference (e.g., "stash@{0}") - defaults to latest |





---


### `stashPop`

Pop a stash (apply and remove)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `stashRef` | string | No | Stash reference - defaults to latest |





---


### `stashDrop`

Drop (delete) a stash


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `stashRef` | string | Yes | Stash reference to drop |





---


### `stashShow`

Show diff of a stash


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `stashRef` | string | No | Stash reference |





---


### `stashesClear`

Clear all stashes (dangerous!)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `confirm` | boolean | Yes | Must be true to proceed |





---


### `commitsSquash`

Squash multiple commits into one


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `baseCommit` | string | Yes | The commit BEFORE the range to squash (commits after this get squashed) |
| `message` | string | Yes | New commit message for the squashed commit |





---


### `commitMessageAmend`

Amend an older commit's message using automated rebase


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `commitHash` | string | Yes | The commit whose message to change |
| `newMessage` | string | Yes | The new commit message |





---


### `fileRemoveFromHistory`

Remove a file from the entire git history (dangerous!)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | File to remove from history |
| `confirm` | boolean | Yes | Must be true to proceed |





---


### `cherryPick`

Cherry-pick one or more commits from another branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `commits` | string[] | Yes | Array of commit hashes to cherry-pick (in order) |
| `noCommit` | boolean | No | If true, stage changes without committing |





---


### `cherryPickAbort`

Abort an in-progress cherry-pick


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `cherryPickContinue`

Continue cherry-pick after resolving conflicts


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `commitRevert`

Revert a specific commit (creates a new commit that undoes it)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `commitHash` | string | Yes | Commit to revert |
| `noCommit` | boolean | No | If true, stage the revert without committing |





---


### `revertAbort`

Abort an in-progress revert


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `commitFixup`

Fixup - amend staged changes into an older commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `targetCommit` | string | Yes | The commit to amend the staged changes into |





---


### `rebasePreview`

Interactive rebase preview - shows what commits would be affected


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `baseCommit` | string | Yes | The commit to rebase onto (commits after this are affected) |





---


### `rebaseScripted`

Perform a scripted rebase with custom actions for each commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `baseCommit` | string | Yes | The commit to rebase onto |
| `actions` | Array<{ hash: string | Yes | Array of actions: { hash, action: 'pick'|'reword'|'squash'|'fixup'|'drop', message? } |





---


### `rebaseContinue`

Continue an in-progress rebase


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `rebaseAbort`

Abort an in-progress rebase


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `conflicts`

Get conflicts in current merge/rebase/cherry-pick


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |





---


### `conflictMarkResolved`

Mark a conflicted file as resolved


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | File to mark as resolved |





---


### `conflictResolve`

Use ours or theirs version for a conflicted file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | Conflicted file |
| `version` | 'ours' | 'theirs' | Yes | Which version to use: 'ours' or 'theirs' |





---


### `blame`

Get blame information for a file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `filePath` | string | Yes | File to blame |
| `startLine` | number | No | Optional start line |
| `endLine` | number | No | Optional end line |





---


### `commitsSearch`

Search for commits by message, author, or content


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `query` | string | Yes | Search query |
| `type` | 'message' | 'author' | 'content' | 'all' | No | Type of search: 'message', 'author', 'content', 'all' |
| `limit` | number | No | Max results |





---


### `changeFind`

Find which commit introduced a specific line or change (pickaxe)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path to repository |
| `searchText` | string | Yes | Text to search for |
| `filePath` | string | No | Optional file to limit search to |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph git_box["📦 Git Box"]
        direction TB
        PHOTON((🎯))
        T0[🌊 configure (stream)]
        PHOTON --> T0
        T1[🌊 main (stream)]
        PHOTON --> T1
        T2[🌊 repoAdd (stream)]
        PHOTON --> T2
        T3[🔧 repoInit]
        PHOTON --> T3
        T4[🔧 availableRepos]
        PHOTON --> T4
        T5[🔧 projectsRootSet]
        PHOTON --> T5
        T6[🔧 repoRemove]
        PHOTON --> T6
        T7[🔧 repos]
        PHOTON --> T7
        T8[🔧 commits]
        PHOTON --> T8
        T9[🔧 commitFiles]
        PHOTON --> T9
        T10[🔧 status]
        PHOTON --> T10
        T11[🔧 fileStage]
        PHOTON --> T11
        T12[🔧 fileUnstage]
        PHOTON --> T12
        T13[🔧 commit]
        PHOTON --> T13
        T14[🔧 pull]
        PHOTON --> T14
        T15[📤 push]
        PHOTON --> T15
        T16[📖 fetch]
        PHOTON --> T16
        T17[🔧 branches]
        PHOTON --> T17
        T18[🔧 branchSwitch]
        PHOTON --> T18
        T19[🔧 diff]
        PHOTON --> T19
        T20[🔧 changesDiscard]
        PHOTON --> T20
        T21[🔧 commitDiff]
        PHOTON --> T21
        T22[🔧 fileContent]
        PHOTON --> T22
        T23[🔧 branchCreate]
        PHOTON --> T23
        T24[🔧 branchCreateSwitch]
        PHOTON --> T24
        T25[🔧 branchDelete]
        PHOTON --> T25
        T26[🔧 branchMerge]
        PHOTON --> T26
        T27[🔧 mergeAbort]
        PHOTON --> T27
        T28[🔧 reflog]
        PHOTON --> T28
        T29[🔧 undoLast]
        PHOTON --> T29
        T30[🔧 commitReset]
        PHOTON --> T30
        T31[🔧 commitRecover]
        PHOTON --> T31
        T32[🔧 stashes]
        PHOTON --> T32
        T33[🔧 stashCreate]
        PHOTON --> T33
        T34[🔧 stashApply]
        PHOTON --> T34
        T35[🔧 stashPop]
        PHOTON --> T35
        T36[🔧 stashDrop]
        PHOTON --> T36
        T37[🔧 stashShow]
        PHOTON --> T37
        T38[🔧 stashesClear]
        PHOTON --> T38
        T39[🔧 commitsSquash]
        PHOTON --> T39
        T40[🔧 commitMessageAmend]
        PHOTON --> T40
        T41[🔧 fileRemoveFromHistory]
        PHOTON --> T41
        T42[🔧 cherryPick]
        PHOTON --> T42
        T43[🔧 cherryPickAbort]
        PHOTON --> T43
        T44[🔧 cherryPickContinue]
        PHOTON --> T44
        T45[🔧 commitRevert]
        PHOTON --> T45
        T46[🔧 revertAbort]
        PHOTON --> T46
        T47[🔧 commitFixup]
        PHOTON --> T47
        T48[🔧 rebasePreview]
        PHOTON --> T48
        T49[🔧 rebaseScripted]
        PHOTON --> T49
        T50[🔧 rebaseContinue]
        PHOTON --> T50
        T51[🔧 rebaseAbort]
        PHOTON --> T51
        T52[🔧 conflicts]
        PHOTON --> T52
        T53[🔧 conflictMarkResolved]
        PHOTON --> T53
        T54[🔧 conflictResolve]
        PHOTON --> T54
        T55[🔧 blame]
        PHOTON --> T55
        T56[🔧 commitsSearch]
        PHOTON --> T56
        T57[🔧 changeFind]
        PHOTON --> T57
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add git-box

# Get MCP config for your client
photon info git-box --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v2.0.0 · Portel
