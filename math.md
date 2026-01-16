# Math Photon MCP

Advanced math expression evaluator

## 📋 Overview

**Version:** 1.1.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **8** tools:


### `calculate`

Calculate a math expression string. Supports +, -, *, /, ^, parentheses, sqrt, log, sin, cos, tan, pow, min, max, sum, mean, median, std, abs, floor, ceil, round, random, PI, E. Example: { expression: "mean([1,2,3,4]) + max(5, 10) - abs(-7)" }


**Parameters:**


- **`expression`** (any) - The math expression to calculate





---


### `testBasicArithmetic`

No description available





---


### `testSqrt`

No description available





---


### `testPower`

No description available





---


### `testAbs`

No description available





---


### `testMean`

No description available





---


### `testComplexExpression`

No description available





---


### `testExternalService`

No description available





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
photon mcp ./math.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp math.photon.ts ~/.photon/

# Run by name
photon mcp math
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp math --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.1.0
