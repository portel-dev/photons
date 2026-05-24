<!-- PHOTON_MARKETPLACE_START -->
# Photon Apps

A small, polished gallery of ready-to-use photons: agent-facing apps, developer tools, and trustworthy utilities you can install directly.

Use these directly from Claude Desktop, ChatGPT connectors, Beam, or the Photon CLI. Each photon is one auditable TypeScript file plus optional UI assets.

## Gallery

### Agent-Ready Apps

Stateful apps with useful UI surfaces and workflows that humans and agents can share.

| Photon | What it gives an agent | Tools | Shape |
|--------|------------------------|-------|-------|
| [**Boards**](boards.md) | Agent and human usable Kanban board with custom UI, state, and live updates. | 19 | Streaming + UI |
| [**Expenses**](expenses.md) | Track expenses, categories, and totals from chat or CLI with persistent state. | 4 | API |
| [**Team Pulse**](team-pulse.md) | Collect async team check-ins and surface status for managers and agents. | 4 | API |
| [**Deploy**](deploy.md) | Coordinate deployment steps with streaming progress and operator-friendly status. | 3 | Streaming |

### Developer Tools

Practical tools for inspecting projects, working with repositories, and reaching the web.

| Photon | What it gives an agent | Tools | Shape |
|--------|------------------------|-------|-------|
| [**Filesystem**](filesystem.md) | Read, write, list, and inspect files through a focused MCP tool surface. | 12 | API |
| [**Git**](git.md) | Inspect status, diffs, logs, branches, and commits from an agent workflow. | 11 | API |
| [**GitHub Issues**](github-issues.md) | Create, list, and update GitHub issues from the same agent control plane. | 7 | API |
| [**Web**](web.md) | Fetch pages and extract text when an agent needs lightweight web context. | 2 | API |

### Small Utilities

Tiny photons that make good first installs and smoke tests.

| Photon | What it gives an agent | Tools | Shape |
|--------|------------------------|-------|-------|
| [**Weather**](weather.md) | A simple current-weather photon that demonstrates clean results and UI rendering. | 2 | API |
| [**Time**](time.md) | Timezone-aware time utilities for scheduling, coordination, and testing. | 3 | API |
| [**SQLite**](sqlite.md) | Query and manage local SQLite databases from agents with a compact API. | 9 | API |
| [**Math**](math.md) | One tiny, dependable calculator photon for first-run confidence checks. | 1 | API |



## Quick Start

```bash
# Install the CLI
bun add -g @portel/photon

# Add a photon from this marketplace
photon add boards

# Get MCP config (paste into your client)
photon info boards --mcp
```

Output:
```json
{
  "mcpServers": {
    "boards": {
      "command": "photon",
      "args": ["mcp", "boards"]
    }
  }
}
```

## Commands

```bash
photon add <name>        # Install a photon
photon list              # List local photons
photon info <name> --mcp # Get MCP config for a photon
photon search <keyword>  # Search available photons
photon upgrade           # Upgrade all photons
```

## Contributing

PRs welcome for focused, well-tested photons. Keep the gallery small: polished apps here, teaching examples in the examples marketplace.

---

[Photon CLI](https://github.com/portel-dev/photon) · [MCP](https://modelcontextprotocol.io/introduction)

<!-- PHOTON_MARKETPLACE_END -->
