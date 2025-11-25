# Tuya Smart Light

Control Tuya/Wipro/Smart Life WiFi bulbs

## 📋 Overview

**Version:** 2.1.0
**Author:** Photon
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`TUYA_SMART_LIGHT_DEVICES_FILE`** [OPTIONAL]
  - Type: string
  - Description: No description available
  






## 🔧 Tools

This photon provides **9** tools:


### `setup`

Setup Tuya Cloud API credentials (one-time configuration)


**Parameters:**


- **`client_id`** (any) - Tuya Cloud Access ID (from iot.tuya.com)

- **`client_secret`** (any) - Tuya Cloud Access Secret (from iot.tuya.com)

- **`region`** (any, optional) - Tuya region: "us", "eu", "cn", or "in"





---


### `list`

List all Tuya devices (auto-synced from cloud and local network)


**Parameters:**


- **`refresh`** (any, optional) - Force refresh from cloud and local network





---


### `on`

Turn light on


**Parameters:**


- **`device_id`** (any) - Device ID (optional if name provided)

- **`name`** (any) - Device name (optional if device_id provided)





---


### `off`

Turn light off


**Parameters:**


- **`device_id`** (any) - Device ID (optional if name provided)

- **`name`** (any) - Device name (optional if device_id provided)





---


### `toggle`

Toggle light on/off


**Parameters:**


- **`device_id`** (any) - Device ID (optional if name provided)

- **`name`** (any) - Device name (optional if device_id provided)





---


### `brightness`

Set brightness level


**Parameters:**


- **`level`** (any) - Brightness level (0-1000)

- **`device_id`** (any) - Device ID (optional if name provided)

- **`name`** (any) - Device name (optional if device_id provided)





---


### `temperature`

Set color temperature (warm to cool white)


**Parameters:**


- **`temp`** (any) - Temperature value (0-1000, where 0 is warm, 1000 is cool)

- **`device_id`** (any) - Device ID (optional if name provided)

- **`name`** (any) - Device name (optional if device_id provided)





---


### `color`

Set color (supports hex RGB or color names)


**Parameters:**


- **`color`** (any) - Color as hex (FF0000, #FF0000) or name (red, blue, green, etc.)

- **`device_id`** (any) - Device ID (optional if name provided)

- **`name`** (any) - Device name (optional if device_id provided)





---


### `status`

Get device status


**Parameters:**


- **`device_id`** (any) - Device ID (optional if name provided)

- **`name`** (any) - Device name (optional if device_id provided)





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
photon mcp ./tuya-smart-light.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp tuya-smart-light.photon.ts ~/.photon/

# Run by name
photon mcp tuya-smart-light
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp tuya-smart-light --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
tuyapi@^7.7.0
```


## 📄 License

MIT • Version 2.1.0
