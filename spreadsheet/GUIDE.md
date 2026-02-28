# Spreadsheet Photon — User Guide

A CSV-backed spreadsheet with formulas, visual charts, markdown cells, and real-time streaming.

## Quick Start

```bash
# Install
photon add spreadsheet

# Open a spreadsheet (creates if not exists)
photon spreadsheet main

# Open a specific file
photon use spreadsheet budget
photon spreadsheet main

# Open any CSV file
photon use spreadsheet /path/to/data.csv
photon spreadsheet main
```

## CSV Format

The spreadsheet uses plain CSV files with an optional **format row** that encodes column metadata. See the [Photon CSV Format Specification](https://github.com/nicepkg/photon/blob/main/docs/reference/CSV-FORMAT.md) for the full spec.

### Format Row

The format row is always **row 0** (first line). Headers follow as row 1.

```csv
:---,:---#:,:---M+w300:,:---$:
Product,Qty,Description,Price
Widget,42,"A **useful** widget",9.99
```

**Alignment:** `:---` left, `---:` right, `:---:` center

**Types:**

| Indicator | Type | UI Rendering |
|-----------|------|-------------|
| *(none)* | text | Plain text |
| `#` | number | Right-aligned numeric |
| `$` | currency | Right-aligned with currency formatting |
| `%` | percent | Percentage display |
| `D` | date | Date picker |
| `?` | bool | Checkbox |
| `=` | select | Dropdown select |
| `~` | formula | Formula indicator |
| `M` | markdown | Inline markdown rendering |
| `T` | longtext | Long text with word wrap |

**Modifiers:** `w200` (width), `+` (wrap), `*` (required), `>` (sort asc), `<` (sort desc)

### Setting Format via API

```bash
# Set column type
photon spreadsheet format --column B --type number --align right

# Enable markdown + wrapping
photon spreadsheet format --column C --type markdown --wrap true

# Set width
photon spreadsheet format --column D --width 200
```

## Formulas

Cells starting with `=` are formulas. Evaluated at runtime, stored as text in CSV.

### Scalar Formulas

| Formula | Example | Result |
|---------|---------|--------|
| `=SUM(range)` | `=SUM(B1:B10)` | Sum of B1 through B10 |
| `=AVG(range)` | `=AVG(B1:B5)` | Average |
| `=MAX(range)` | `=MAX(B1:B5)` | Maximum value |
| `=MIN(range)` | `=MIN(B1:B5)` | Minimum value |
| `=COUNT(range)` | `=COUNT(B1:B10)` | Count of numeric values |
| `=IF(cond, t, f)` | `=IF(A1>50, "pass", "fail")` | Conditional |
| `=LEN(text)` | `=LEN(A1)` | String length |
| `=ABS(num)` | `=ABS(A1)` | Absolute value |
| `=ROUND(num, n)` | `=ROUND(A1, 2)` | Round to N digits |
| `=CONCAT(a, b)` | `=CONCAT(A1, " ", B1)` | Join strings |

Cell references: `A1` (single), `A1:B5` (range), `A:B` (entire columns).

### Visual Formulas

These render as chart overlays in the UI instead of returning a number.

| Formula | Chart Type | Arguments |
|---------|-----------|-----------|
| `=PIE(A1:A5, B1:B5)` | Pie chart | Labels range, values range |
| `=BAR(A1:A5, B1:B5)` | Bar chart | Labels range, values range |
| `=LINE(A1:A10, B1:B10)` | Line chart | X-axis range, Y-axis range |
| `=SPARKLINE(B1:B10)` | Inline sparkline | Values range (renders in-cell) |
| `=GAUGE(B1, 0, 100)` | Gauge meter | Value, min, max |

Chart overlays are:
- **Draggable** — grab the title bar to reposition
- **Resizable** — drag the bottom-right corner
- **Live-updating** — change the data and the chart updates
- **Theme-aware** — follows dark/light mode

In source view (`</>` toggle), visual formulas show as raw text. In standard CSV readers, they appear as regular text values.

## Source View

Click the `</>` button in the toolbar to toggle between:

- **Runtime view** (default): Shows evaluated values, chart overlays visible
- **Source view**: Shows raw formulas in monospace, chart overlays hidden

Source view is read-only. Double-click any cell to switch back to runtime and start editing.

## Markdown in Cells

Columns with type `markdown` (`M` indicator in format row) render inline markdown:

```csv
:---M+:
Notes
"**Important**: Review the `config.json` before [deploying](https://...)"
"_Phase 2_ started\nEstimated completion: **March**"
```

Supported syntax: `**bold**`, `*italic*`, `` `code` ``, `[link](url)`, `\n` for line breaks.

Combine with `+` (wrap modifier) for multi-line content: `:---M+:`

## Text Wrapping

Two ways to enable wrapping:

1. **Column type**: `longtext` (`T`) — auto-wraps at column width
2. **Wrap modifier**: `+` on any column — enables `word-wrap: break-word`

```csv
:---,:---T+w300:
Title,Body
"Release Notes","Fixed authentication bug. Updated dependencies. Added new API endpoint for user profiles."
```

Wrapped cells have a max height of 120px with scrollable overflow.

## Streaming & Real-Time Updates

### File Watching

```bash
# Start watching the CSV file for changes
photon spreadsheet tail

# External process appends data
echo "Alice,30" >> ~/Documents/Spreadsheets/budget.csv

# UI updates automatically — new rows slide in with animation

# Stop watching
photon spreadsheet untail
```

### Programmatic Push

```bash
# Batch-append rows (array format)
photon spreadsheet push --rows '[["Alice","30"],["Bob","25"]]'

# Key-value format
photon spreadsheet push --rows '[{"Name":"Alice","Age":"30"}]'
```

### Cross-Photon Streaming

Other photons can push data via `this.call()`:

```typescript
// From another photon
await this.call('spreadsheet', 'push', {
  rows: [{ Timestamp: new Date().toISOString(), Value: reading }]
});
```

### Auto-Scroll & Change Animation

When new rows arrive from any source (file watcher, push, add, cross-photon):
- The UI auto-scrolls to show new rows
- New rows slide in with a 0.3s animation
- Changed cells glow blue for 2 seconds
- Charts referencing growing ranges update automatically

## UI Features

### Toolbar

| Button | Action |
|--------|--------|
| **+ New** | Create empty spreadsheet |
| **Import CSV** | Import from text or file |
| **Export CSV** | Download as .csv |
| **Add Row / Col** | Extend the grid |
| **Delete Row / Col** | Remove selected |
| **Grid / Gallery / Kanban** | View modes |
| **`</>`** | Toggle source/runtime view |

### Formula Bar

- Shows the raw formula for the selected cell
- Autocomplete for function names (type `=` then start typing)
- Argument hints shown while typing
- Error indicator for invalid formulas

### Context Menu

Right-click any cell for:
- **Clear** — empty the cell
- **Fill** — fill range with a repeating pattern
- **Rename** — rename the column header

### Column Headers

- **Click** — select entire column
- **Double-click** — rename the column header
- **Drag edge** — resize column width

## Settings

```bash
# View settings
photon spreadsheet settings

# Change spreadsheets folder
photon spreadsheet settings --folder ~/my-spreadsheets

# Control format row writing
photon spreadsheet settings --formatting true   # always write
photon spreadsheet settings --formatting false  # never write
photon spreadsheet settings --formatting auto   # write if original had one
```

## File Storage

| Setting | Default |
|---------|---------|
| Folder | `~/Documents/Spreadsheets/` |
| Format | Standard CSV (RFC 4180) |
| Instance mapping | `_use('budget')` → `budget.csv` |
| Absolute paths | `_use('/tmp/data.csv')` → `/tmp/data.csv` |

## Examples

### Budget Tracker

```csv
:---,:---$:,:---$:,:---~:
Category,Budget,Spent,Remaining
Rent,2000,2000,"=B2-C2"
Food,500,423.50,"=B3-C3"
Transport,200,89.00,"=B4-C4"
Total,"=SUM(B2:B4)","=SUM(C2:C4)","=SUM(D2:D4)"
```

### Sensor Dashboard with Charts

```csv
:---D,:---#:,:---#:,:---~:,:---~:
Timestamp,Temperature,Humidity,Temp Chart,Humidity Chart
2024-01-01 09:00,22.5,45,,,
2024-01-01 10:00,23.1,43,,,
2024-01-01 11:00,24.0,41,"=LINE(A2:A4, B2:B4)","=SPARKLINE(C2:C4)"
```

### Project Tracker with Markdown

```csv
:---,:---?,:---M+w300:,:---#:
Task,Done,Notes,Hours
Design,true,"**Wireframes** done\n[Figma link](https://...)",12
Backend,false,"Working on `auth` middleware\n_Blocked by_ API spec",8
Frontend,false,"React components\nNeeds **design review**",0
```
