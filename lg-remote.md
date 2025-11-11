# LG Remote

Control LG WebOS TVs

## 📋 Overview

**Version:** 1.0.0
**Author:** Photon (based on pokemote by mithileshchellappan)
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`L_G_REMOTE_CREDENTIALS_FILE`** [OPTIONAL]
  - Type: string
  - Description: Path to store TV credentials (optional, default: "lg-tv-credentials.json")
  





### Setup Instructions

- credentials_file: Path to store TV credentials (optional, default: "lg-tv-credentials.json")
Dependencies are auto-installed on first run.


## 🔧 Tools

This photon provides **30** tools:


### `discover`

Discover LG TVs on the network using SSDP


**Parameters:**


- **`timeout`** (any, optional) - Discovery timeout in seconds





---


### `connect`

Connect to an LG TV


**Parameters:**


- **`ip`** (any) - TV IP address (optional, uses auto-discovered default TV if not specified)

- **`secure`** (any, optional) - Use secure WebSocket (wss://)





---


### `pair`

Complete pairing after TV prompt


**Parameters:**


- **`name`** (any) - Optional name for the TV





---


### `disconnect`

Disconnect from the current TV





---


### `list`

List discovered and saved TVs


**Parameters:**


- **`refresh`** (any, optional) - If true, re-discover TVs on network





---


### `forget`

Delete saved credentials for a TV


**Parameters:**


- **`ip`** (any) - TV IP address





---


### `status`

Get current connection status





---


### `setVolume`

Set volume level


**Parameters:**


- **`level`** (any) - Volume level (0-100)





---


### `getVolume`

Get current volume





---


### `volumeUp`

Increase volume by 1





---


### `volumeDown`

Decrease volume by 1





---


### `mute`

Toggle mute


**Parameters:**


- **`mute`** (any) - True to mute, false to unmute





---


### `powerOff`

Turn TV off





---


### `notify`

Show a notification toast on TV


**Parameters:**


- **`message`** (any) - Notification message





---


### `listApps`

List all installed apps





---


### `launchApp`

Launch an app by ID


**Parameters:**


- **`id`** (any) - App ID (e.g., "netflix", "youtube.leanback.v4")





---


### `getCurrentApp`

Get currently running app





---


### `listChannels`

List available TV channels





---


### `getCurrentChannel`

Get current channel





---


### `setChannel`

Set channel by number


**Parameters:**


- **`channel`** (any) - Channel number





---


### `channelUp`

Channel up





---


### `channelDown`

Channel down





---


### `listInputs`

List external inputs





---


### `setInput`

Switch to an input


**Parameters:**


- **`id`** (any) - Input ID





---


### `play`

Play media





---


### `pause`

Pause media





---


### `stop`

Stop media





---


### `rewind`

Rewind media





---


### `fastForward`

Fast forward media





---


### `button`

Send remote button press


**Parameters:**


- **`button`** (any) - Button name (HOME, BACK, UP, DOWN, LEFT, RIGHT, ENTER, etc.)





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
photon mcp ./lg-remote.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp lg-remote.photon.ts ~/.photon/

# Run by name
photon mcp lg-remote
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp lg-remote --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
ws@^8.18.0
```


## 📄 License

MIT • Version 1.0.0
