# Git Box

Mailbox-style Git interface, manage repos like an inbox

> **56 tools** · Streaming Photon · v2.0.0 · MIT

**Platform Features:** `generator` `custom-ui` `elicitation`

## ⚙️ Configuration

No configuration required.



## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `main` ⚡ | Opens the mailbox interface for managing git repositories. |
| `repoAdd` ⚡ | Add a repository to track — prompts interactively if the folder isn't a git repo |
| `repoInit` | Initialize a new git repository |
| `availableRepos` | Scan projects root folder for available git repositories and folders |
| `repoRemove` | Remove a repository from tracking |
| `repos` | List all tracked repositories with status counts |
| `commits` | Get commit history for a repository (like inbox messages) |
| `commitFiles` | Get files changed in a specific commit |
| `status` | Get current working tree status (staged and unstaged changes) |
| `fileStage` | Stage a file for commit |
| `fileUnstage` | Unstage a file |
| `commit` | Create a commit with staged changes |
| `pull` | Pull changes from remote |
| `push` | Push changes to remote |
| `fetch` | Fetch updates from remote without merging |
| `branches` | Get list of branches |
| `branchSwitch` | Switch to a different branch |
| `diff` | Get diff for a file with syntax-highlighted output |
| `changesDiscard` | Discard changes in a file |
| `commitDiff` | Get diff for a specific file in a commit |
| `fileContent` | Get file content (current version or from a specific commit) |
| `branchCreate` | Create a new branch |
| `branchCreateSwitch` | Create and switch to a new branch |
| `branchDelete` | Delete a branch |
| `branchMerge` | Merge a branch into the current branch |
| `mergeAbort` | Abort an in-progress merge |
| `reflog` | Get reflog - history of all git operations (undo stack) |
| `undoLast` | Undo the last git operation (soft reset to previous HEAD) |
| `commitReset` | Reset to a specific commit (from reflog or commit history) |
| `commitRecover` | Recover a "lost" commit using reflog |
| `stashes` | List all stashes |
| `stashCreate` | Create a new stash |
| `stashApply` | Apply a stash (keep the stash) |
| `stashPop` | Pop a stash (apply and remove) |
| `stashDrop` | Drop (delete) a stash |
| `stashShow` | Show diff of a stash |
| `stashesClear` | Clear all stashes (dangerous!) |
| `commitsSquash` | Squash multiple commits into one |
| `commitMessageAmend` | Amend an older commit's message using automated rebase |
| `fileRemoveFromHistory` | Remove a file from the entire git history (dangerous!) |
| `cherryPick` | Cherry-pick one or more commits from another branch |
| `cherryPickAbort` | Abort an in-progress cherry-pick |
| `cherryPickContinue` | Continue cherry-pick after resolving conflicts |
| `commitRevert` | Revert a specific commit (creates a new commit that undoes it) |
| `revertAbort` | Abort an in-progress revert |
| `commitFixup` | Fixup - amend staged changes into an older commit |
| `rebasePreview` | Interactive rebase preview - shows what commits would be affected |
| `rebaseScripted` | Perform a scripted rebase with custom actions for each commit |
| `rebaseContinue` | Continue an in-progress rebase |
| `rebaseAbort` | Abort an in-progress rebase |
| `conflicts` | Get conflicts in current merge/rebase/cherry-pick |
| `conflictMarkResolved` | Mark a conflicted file as resolved |
| `conflictResolve` | Use ours or theirs version for a conflicted file |
| `blame` | Get blame information for a file |
| `commitsSearch` | Search for commits by message, author, or content |
| `changeFind` | Find which commit introduced a specific line or change (pickaxe) |


## 🔧 Tools


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
        T0[🌊 main (stream)]
        PHOTON --> T0
        T1[🌊 repoAdd (stream)]
        PHOTON --> T1
        T2[🔧 repoInit]
        PHOTON --> T2
        T3[🔧 availableRepos]
        PHOTON --> T3
        T4[🔧 repoRemove]
        PHOTON --> T4
        T5[🔧 repos]
        PHOTON --> T5
        T6[🔧 commits]
        PHOTON --> T6
        T7[🔧 commitFiles]
        PHOTON --> T7
        T8[🔧 status]
        PHOTON --> T8
        T9[🔧 fileStage]
        PHOTON --> T9
        T10[🔧 fileUnstage]
        PHOTON --> T10
        T11[🔧 commit]
        PHOTON --> T11
        T12[🔧 pull]
        PHOTON --> T12
        T13[📤 push]
        PHOTON --> T13
        T14[📖 fetch]
        PHOTON --> T14
        T15[🔧 branches]
        PHOTON --> T15
        T16[🔧 branchSwitch]
        PHOTON --> T16
        T17[🔧 diff]
        PHOTON --> T17
        T18[🔧 changesDiscard]
        PHOTON --> T18
        T19[🔧 commitDiff]
        PHOTON --> T19
        T20[🔧 fileContent]
        PHOTON --> T20
        T21[🔧 branchCreate]
        PHOTON --> T21
        T22[🔧 branchCreateSwitch]
        PHOTON --> T22
        T23[🔧 branchDelete]
        PHOTON --> T23
        T24[🔧 branchMerge]
        PHOTON --> T24
        T25[🔧 mergeAbort]
        PHOTON --> T25
        T26[🔧 reflog]
        PHOTON --> T26
        T27[🔧 undoLast]
        PHOTON --> T27
        T28[🔧 commitReset]
        PHOTON --> T28
        T29[🔧 commitRecover]
        PHOTON --> T29
        T30[🔧 stashes]
        PHOTON --> T30
        T31[🔧 stashCreate]
        PHOTON --> T31
        T32[🔧 stashApply]
        PHOTON --> T32
        T33[🔧 stashPop]
        PHOTON --> T33
        T34[🔧 stashDrop]
        PHOTON --> T34
        T35[🔧 stashShow]
        PHOTON --> T35
        T36[🔧 stashesClear]
        PHOTON --> T36
        T37[🔧 commitsSquash]
        PHOTON --> T37
        T38[🔧 commitMessageAmend]
        PHOTON --> T38
        T39[🔧 fileRemoveFromHistory]
        PHOTON --> T39
        T40[🔧 cherryPick]
        PHOTON --> T40
        T41[🔧 cherryPickAbort]
        PHOTON --> T41
        T42[🔧 cherryPickContinue]
        PHOTON --> T42
        T43[🔧 commitRevert]
        PHOTON --> T43
        T44[🔧 revertAbort]
        PHOTON --> T44
        T45[🔧 commitFixup]
        PHOTON --> T45
        T46[🔧 rebasePreview]
        PHOTON --> T46
        T47[🔧 rebaseScripted]
        PHOTON --> T47
        T48[🔧 rebaseContinue]
        PHOTON --> T48
        T49[🔧 rebaseAbort]
        PHOTON --> T49
        T50[🔧 conflicts]
        PHOTON --> T50
        T51[🔧 conflictMarkResolved]
        PHOTON --> T51
        T52[🔧 conflictResolve]
        PHOTON --> T52
        T53[🔧 blame]
        PHOTON --> T53
        T54[🔧 commitsSearch]
        PHOTON --> T54
        T55[🔧 changeFind]
        PHOTON --> T55
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
