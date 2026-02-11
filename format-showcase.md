# month, @value revenue}

Auto-UI Format Demos

> **15 tools** · API Photon · v1.0.0 · MIT


## ⚙️ Configuration

No configuration required.



## 🔧 Tools


### `list`

iOS-style list with title, subtitle, and badge





---


### `card`

Single object displayed as a card





---


### `table`

Array of objects displayed as a sortable table





---


### `bars`

Bar chart showing monthly revenue





---


### `pie`

Pie chart showing budget breakdown





---


### `metric`

Single KPI metric with delta





---


### `gauge`

Circular gauge showing CPU usage





---


### `timeline`

Vertical timeline of project milestones





---


### `dashboard`

Composite dashboard with mixed data types





---


### `cart`

Shopping cart with items and totals





---


### `panels`

CSS grid of titled panels rendering inner content as cards





---


### `tabs`

Tab bar switching between categorized lists





---


### `accordion`

Collapsible FAQ sections





---


### `stack`

Vertical stack of KPI metrics





---


### `columns`

Side-by-side pie charts comparing plans





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph format_showcase["📦 Format Showcase"]
        direction TB
        PHOTON((🎯))
        T0[📖 list]
        PHOTON --> T0
        T1[🔧 card]
        PHOTON --> T1
        T2[🔧 table]
        PHOTON --> T2
        T3[🔧 bars]
        PHOTON --> T3
        T4[🔧 pie]
        PHOTON --> T4
        T5[🔧 metric]
        PHOTON --> T5
        T6[🔧 gauge]
        PHOTON --> T6
        T7[🔧 timeline]
        PHOTON --> T7
        T8[🔧 dashboard]
        PHOTON --> T8
        T9[🔧 cart]
        PHOTON --> T9
        T10[🔧 panels]
        PHOTON --> T10
        T11[🔧 tabs]
        PHOTON --> T11
        T12[🔧 accordion]
        PHOTON --> T12
        T13[🔧 stack]
        PHOTON --> T13
        T14[🔧 columns]
        PHOTON --> T14
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add format-showcase

# Get MCP config for your client
photon info format-showcase --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Portel
