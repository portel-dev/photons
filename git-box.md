# @name git-box @icon 📬 @description Mailbox-style Git interface

manage repos like an inbox @version 2.0.0 @author Portel @cli git - https://git-scm.com/downloads

> **57 tools** · Streaming Photon · v2.0.0 · MIT

**Platform Features:** `generator` `custom-ui` `elicitation`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `main`

Opens the mailbox interface for managing git repositories. Displays tracked repos with their status, commit history, and working changes.





---


### `repoAdd` ⚡

Add a repository to track — prompts interactively if the folder isn't a git repo


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to git repository |





---


### `repoInit`

Initialize a new git repository


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `folderPath` | any | Yes | Path to folder |
| `force` | any | Yes | Skip safety checks |





---


### `availableRepos`

Scan projects root folder for available git repositories and folders





---


### `projectsRootSet`

Set the projects root folder


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rootPath` | any | Yes | Path to folder containing git repositories |





---


### `repoRemove`

Remove a repository from tracking


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to git repository |





---


### `repos`

List all tracked repositories with status counts





---


### `commits`

Get commit history for a repository (like inbox messages)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `limit` | any | Yes | Number of commits to fetch |
| `branch` | any | Yes | Branch to show commits from |





---


### `commitFiles`

Get files changed in a specific commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `hash` | any | Yes | Commit hash |





---


### `status`

Get current working tree status (staged and unstaged changes)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `fileStage`

Stage a file for commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | File to stage (or "." for all) |





---


### `fileUnstage`

Unstage a file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | File to unstage |





---


### `commit`

Create a commit with staged changes


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `message` | any | Yes | Commit message |





---


### `pull`

Pull changes from remote


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `remote` | any | No | Remote name |





---


### `push`

Push changes to remote


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `remote` | any | No | Remote name |





---


### `fetch`

Fetch updates from remote without merging


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `remote` | any | No | Remote name |
| `prune` | any | Yes | Remove remote-tracking references that no longer exist |





---


### `branches`

Get list of branches


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `branchSwitch`

Switch to a different branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `branch` | any | Yes | Branch name to switch to |





---


### `diff`

Get diff for a file with syntax-highlighted output


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | File to diff |
| `staged` | any | Yes | Whether to show staged diff |





---


### `changesDiscard`

Discard changes in a file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | File to discard changes |





---


### `commitDiff`

Get diff for a specific file in a commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `hash` | any | Yes | Commit hash |
| `filePath` | any | Yes | File to get diff for |





---


### `fileContent`

Get file content (current version or from a specific commit)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | File to read |
| `hash` | any | Yes | Optional commit hash (omit for working tree version) |





---


### `branchCreate`

Create a new branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `branchName` | any | Yes | Name for the new branch |
| `startPoint` | any | No | Optional commit/branch to start from |





---


### `branchCreateSwitch`

Create and switch to a new branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `branchName` | any | Yes | Name for the new branch |
| `startPoint` | any | Yes | Optional commit/branch to start from |





---


### `branchDelete`

Delete a branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `branchName` | any | Yes | Branch to delete |
| `force` | any | Yes | Force delete even if not merged |





---


### `branchMerge`

Merge a branch into the current branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `branchName` | any | Yes | Branch to merge |
| `noFastForward` | any | Yes | Create merge commit even if fast-forward is possible |





---


### `mergeAbort`

Abort an in-progress merge


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `reflog`

Get reflog - history of all git operations (undo stack)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `limit` | any | Yes | Number of entries to fetch |





---


### `undoLast`

Undo the last git operation (soft reset to previous HEAD)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `commitReset`

Reset to a specific commit (from reflog or commit history)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `hash` | any | Yes | Commit hash to reset to |
| `mode` | any | Yes | Reset mode: soft (keep changes staged), mixed (keep changes unstaged), hard (discard all) |





---


### `commitRecover`

Recover a "lost" commit using reflog


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `hash` | any | Yes | Commit hash to recover (create a branch pointing to it) |
| `branchName` | any | Yes | Name for the recovery branch |





---


### `stashes`

List all stashes


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `stashCreate`

Create a new stash


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `message` | any | Yes | Optional stash message |
| `includeUntracked` | any | Yes | Include untracked files |





---


### `stashApply`

Apply a stash (keep the stash)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `stashRef` | any | Yes | Stash reference (e.g., "stash@{0}") - defaults to latest |





---


### `stashPop`

Pop a stash (apply and remove)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `stashRef` | any | Yes | Stash reference - defaults to latest |





---


### `stashDrop`

Drop (delete) a stash


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `stashRef` | any | Yes | Stash reference to drop |





---


### `stashShow`

Show diff of a stash


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `stashRef` | any | Yes | Stash reference |





---


### `stashesClear`

Clear all stashes (dangerous!)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `confirm` | any | Yes | Must be true to proceed |





---


### `commitsSquash`

Squash multiple commits into one


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `baseCommit` | any | Yes | The commit BEFORE the range to squash (commits after this get squashed) |
| `message` | any | Yes | New commit message for the squashed commit |





---


### `commitMessageAmend`

Amend an older commit's message using automated rebase


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `commitHash` | any | Yes | The commit whose message to change |
| `newMessage` | any | Yes | The new commit message |





---


### `fileRemoveFromHistory`

Remove a file from the entire git history (dangerous!)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | File to remove from history |
| `confirm` | any | Yes | Must be true to proceed |





---


### `cherryPick`

Cherry-pick one or more commits from another branch


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `commits` | any | Yes | Array of commit hashes to cherry-pick (in order) |
| `noCommit` | any | Yes | If true, stage changes without committing |





---


### `cherryPickAbort`

Abort an in-progress cherry-pick


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `cherryPickContinue`

Continue cherry-pick after resolving conflicts


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `commitRevert`

Revert a specific commit (creates a new commit that undoes it)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `commitHash` | any | Yes | Commit to revert |
| `noCommit` | any | Yes | If true, stage the revert without committing |





---


### `revertAbort`

Abort an in-progress revert


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `commitFixup`

Fixup - amend staged changes into an older commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `targetCommit` | any | Yes | The commit to amend the staged changes into |





---


### `rebasePreview`

Interactive rebase preview - shows what commits would be affected


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `baseCommit` | any | Yes | The commit to rebase onto (commits after this are affected) |





---


### `rebaseScripted`

Perform a scripted rebase with custom actions for each commit


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `baseCommit` | any | Yes | The commit to rebase onto |
| `actions` | any | Yes | Array of actions: { hash, action: 'pick'|'reword'|'squash'|'fixup'|'drop', message? } |





---


### `rebaseContinue`

Continue an in-progress rebase


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `rebaseAbort`

Abort an in-progress rebase


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `conflicts`

Get conflicts in current merge/rebase/cherry-pick


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |





---


### `conflictMarkResolved`

Mark a conflicted file as resolved


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | File to mark as resolved |





---


### `conflictResolve`

Use ours or theirs version for a conflicted file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | Conflicted file |
| `version` | any | Yes | Which version to use: 'ours' or 'theirs' |





---


### `blame`

Get blame information for a file


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `filePath` | any | Yes | File to blame |
| `startLine` | any | Yes | Optional start line |
| `endLine` | any | Yes | Optional end line |





---


### `commitsSearch`

Search for commits by message, author, or content


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `query` | any | Yes | Search query |
| `type` | any | Yes | Type of search: 'message', 'author', 'content', 'all' |
| `limit` | any | Yes | Max results |





---


### `changeFind`

Find which commit introduced a specific line or change (pickaxe)


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | any | Yes | Path to repository |
| `searchText` | any | Yes | Text to search for |
| `filePath` | any | Yes | Optional file to limit search to |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph git_box["📦 Git Box"]
        direction TB
        PHOTON((🎯))
        T0[🔧 main]
        PHOTON --> T0
        T1[🌊 repoAdd (stream)]
        PHOTON --> T1
        T2[🔧 repoInit]
        PHOTON --> T2
        T3[🔧 availableRepos]
        PHOTON --> T3
        T4[🔧 projectsRootSet]
        PHOTON --> T4
        T5[🔧 repoRemove]
        PHOTON --> T5
        T6[🔧 repos]
        PHOTON --> T6
        T7[🔧 commits]
        PHOTON --> T7
        T8[🔧 commitFiles]
        PHOTON --> T8
        T9[🔧 status]
        PHOTON --> T9
        T10[🔧 fileStage]
        PHOTON --> T10
        T11[🔧 fileUnstage]
        PHOTON --> T11
        T12[🔧 commit]
        PHOTON --> T12
        T13[🔧 pull]
        PHOTON --> T13
        T14[📤 push]
        PHOTON --> T14
        T15[📖 fetch]
        PHOTON --> T15
        T16[🔧 branches]
        PHOTON --> T16
        T17[🔧 branchSwitch]
        PHOTON --> T17
        T18[🔧 diff]
        PHOTON --> T18
        T19[🔧 changesDiscard]
        PHOTON --> T19
        T20[🔧 commitDiff]
        PHOTON --> T20
        T21[🔧 fileContent]
        PHOTON --> T21
        T22[🔧 branchCreate]
        PHOTON --> T22
        T23[🔧 branchCreateSwitch]
        PHOTON --> T23
        T24[🔧 branchDelete]
        PHOTON --> T24
        T25[🔧 branchMerge]
        PHOTON --> T25
        T26[🔧 mergeAbort]
        PHOTON --> T26
        T27[🔧 reflog]
        PHOTON --> T27
        T28[🔧 undoLast]
        PHOTON --> T28
        T29[🔧 commitReset]
        PHOTON --> T29
        T30[🔧 commitRecover]
        PHOTON --> T30
        T31[🔧 stashes]
        PHOTON --> T31
        T32[🔧 stashCreate]
        PHOTON --> T32
        T33[🔧 stashApply]
        PHOTON --> T33
        T34[🔧 stashPop]
        PHOTON --> T34
        T35[🔧 stashDrop]
        PHOTON --> T35
        T36[🔧 stashShow]
        PHOTON --> T36
        T37[🔧 stashesClear]
        PHOTON --> T37
        T38[🔧 commitsSquash]
        PHOTON --> T38
        T39[🔧 commitMessageAmend]
        PHOTON --> T39
        T40[🔧 fileRemoveFromHistory]
        PHOTON --> T40
        T41[🔧 cherryPick]
        PHOTON --> T41
        T42[🔧 cherryPickAbort]
        PHOTON --> T42
        T43[🔧 cherryPickContinue]
        PHOTON --> T43
        T44[🔧 commitRevert]
        PHOTON --> T44
        T45[🔧 revertAbort]
        PHOTON --> T45
        T46[🔧 commitFixup]
        PHOTON --> T46
        T47[🔧 rebasePreview]
        PHOTON --> T47
        T48[🔧 rebaseScripted]
        PHOTON --> T48
        T49[🔧 rebaseContinue]
        PHOTON --> T49
        T50[🔧 rebaseAbort]
        PHOTON --> T50
        T51[🔧 conflicts]
        PHOTON --> T51
        T52[🔧 conflictMarkResolved]
        PHOTON --> T52
        T53[🔧 conflictResolve]
        PHOTON --> T53
        T54[🔧 blame]
        PHOTON --> T54
        T55[🔧 commitsSearch]
        PHOTON --> T55
        T56[🔧 changeFind]
        PHOTON --> T56
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add git-box

# Get MCP config for your client
photon get git-box --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v2.0.0 · Portel
