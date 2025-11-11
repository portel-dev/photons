# Time

Timezone and time conversion operations

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`TIME_LOCAL_TIMEZONE`** [OPTIONAL]
  - Type: string
  - Description: Override system timezone (optional, IANA timezone name)
  





### Setup Instructions

- local_timezone: Override system timezone (optional, IANA timezone name)


## 🔧 Tools

This photon provides **3** tools:


### `getCurrentTime`

Get current time in a specific timezone


**Parameters:**


- **`timezone`** (any) - IANA timezone name {@example America/New_York}





---


### `convertTime`

Convert time from one timezone to another


**Parameters:**


- **`source_timezone`** (any) - {@min 1} Source IANA timezone {@example America/New_York}

- **`time`** (any) - {@min 1} {@pattern ^\d{1,2}:\d{2}$} Time in 24-hour format (HH:MM) {@example 14:30}

- **`target_timezone`** (any) - {@min 1} Target IANA timezone {@example Europe/London}

- **`date`** (any) - {@pattern ^\d{4}-\d{2}-\d{2}$} Date in YYYY-MM-DD format (optional, default: today) {@example 2024-03-15}




**Example:**

```typescript
America/New_York}
```


---


### `listTimezones`

List common IANA timezones by region


**Parameters:**


- **`region`** (any) - Filter by region {@example America}





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
photon mcp ./time.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp time.photon.ts ~/.photon/

# Run by name
photon mcp time
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp time --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


No external dependencies required.


## 📄 License

MIT • Version 1.0.0
