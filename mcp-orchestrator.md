# Mcp Orchestrator

MCP Orchestrator Photon

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **10** tools:


### `discoverMCPs`

List all available MCPs and their tools  Discovers which MCPs are configured and accessible, showing their available tools.


**Parameters:**


- **`mcpNames`** (any, optional) - Comma-separated list of MCP names to check





---


### `checkMCP`

Check if a specific MCP is available


**Parameters:**


- **`mcpName`** (any) - Name of the MCP to check





---


### `callTool`

Call a tool on any MCP  Generic method to call any tool on any configured MCP. This demonstrates the polyglot nature - the MCP can be written in any language (Python, Rust, Go, etc.)


**Parameters:**


- **`mcpName`** (any) - Name of the MCP server

- **`toolName`** (any) - Name of the tool to call

- **`params`** (any) - JSON parameters for the tool





---


### `researchWorkflow`

Research Workflow - Combine search and browser MCPs  Demonstrates orchestrating multiple MCPs: 1. Search for information using tavily (Node.js MCP) 2. Optionally fetch page content using browser MCP


**Parameters:**


- **`query`** (any) - Search query

- **`fetchContent`** (any) - Whether to fetch full page content for top result

- **`maxResults`** (any) - Maximum number of search results





---


### `reasoningWorkflow`

Multi-Step Reasoning Workflow  Uses sequential-thinking MCP (if available) to break down a complex problem into steps, demonstrating how to use specialized reasoning MCPs.


**Parameters:**


- **`problem`** (any) - The problem to analyze

- **`steps`** (any) - Number of reasoning steps





---


### `shellWorkflow`

Shell Command Workflow  Demonstrates using the Shell MCP to execute system commands. This MCP might be written in any language that can spawn processes.


**Parameters:**


- **`command`** (any) - Shell command to execute

- **`workingDir`** (any, optional) - Working directory





---


### `parallelExecution`

Parallel MCP Execution  Demonstrates calling multiple MCPs in parallel and combining results. Each MCP can be written in a different language.


**Parameters:**


- **`mcpCalls`** (any) - JSON array of MCP calls: [{mcp: "name", tool: "tool", params: {...}}]





---


### `chainedWorkflow`

Chained MCP Workflow  Demonstrates chaining MCP calls where output from one becomes input to another. Perfect for pipelines that span multiple services/languages.


**Parameters:**


- **`steps`** (any) - JSON array of steps: [{mcp: "name", tool: "tool", params: {...}, outputKey: "key"}]





---


### `inspectMCP`

Get detailed info about a specific MCP's tools


**Parameters:**


- **`mcpName`** (any) - Name of the MCP to inspect





---


### `findToolsAcrossMCPs`

Find tools across multiple MCPs  Search for tools by keyword across all configured MCPs.


**Parameters:**


- **`query`** (any) - Search keyword

- **`mcpNames`** (any, optional) - Comma-separated list of MCPs to search





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
photon mcp ./mcp-orchestrator.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp mcp-orchestrator.photon.ts ~/.photon/

# Run by name
photon mcp mcp-orchestrator
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp mcp-orchestrator --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.0.0
