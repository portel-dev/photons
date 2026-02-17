# Web

Web Agent Photon (Search + Read) A complete web research toolkit. 1. Search: Scrapes DuckDuckGo for results. 2. Read: Uses Mozilla Readability to extract main article content.

> **2 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator`

## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `search` ⚡

Search the web using DuckDuckGo.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `limit` | number | No | Maximum number of results to return {@default 10} [min: 1, max: 50] |





---


### `read` ⚡

Read a webpage and extract its main content as Markdown. Uses Mozilla Readability to remove ads/navbars.





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph web["📦 Web"]
        direction TB
        PHOTON((🎯))
        T0[🌊 search (stream)]
        PHOTON --> T0
        T1[🌊 read (stream)]
        PHOTON --> T1
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add web

# Get MCP config for your client
photon info web --mcp
```

## 📦 Dependencies


```
axios@^1.6.0, cheerio@^1.0.0, turndown@^7.1.2, @mozilla/readability@^0.5.0, jsdom@^23.0.0, js-yaml@^4.1.0
```

---

MIT · v1.0.0 · Portel
