# Math Photon MCP

Advanced math expression evaluator Exposes a single, robust `calculate` method for AI/agent use. Supports arithmetic, power, sqrt, log, trig, min, max, sum, mean, median, std, abs, floor, ceil, round, random, and constants (PI, E). Example: calculate({ expression: "mean([1,2,3,4]) + max(5, 10) - abs(-7)" }) Run with: npx @portel/photon math --dev or install globally with: npm install -g @portel/photon photon math --dev

> **1 tools** · API Photon · v1.1.0 · MIT


## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `calculate`

Calculate a math expression string. Supports +, -, *, /, ^, parentheses, sqrt, log, sin, cos, tan, pow, min, max, sum, mean, median, std, abs, floor, ceil, round, random, PI, E. Example: { expression: "mean([1,2,3,4]) + max(5, 10) - abs(-7)" }


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `expression` | string | Yes | The math expression to calculate |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph math["📦 Math"]
        direction TB
        PHOTON((🎯))
        T0[🔧 calculate]
        PHOTON --> T0
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add math

# Get MCP config for your client
photon info math --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.1.0 · Portel
