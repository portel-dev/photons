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

This photon provides **26** tools:


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


- **`pin`** (any) - The 6-digit PIN shown on TV (required for new pairing)

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


### `volume`

Get/set volume level


**Parameters:**


- **`level`** (any) - Volume level (0-100), "+N" to increase by N, "-N" to decrease by N, or omit to get current





---


### `mute`

Toggle mute


**Parameters:**


- **`mute`** (any) - True to mute, false to unmute (optional - omit to toggle)





---


### `on`

Turn TV on using Wake-on-LAN


**Parameters:**


- **`mac`** (any) - TV's MAC address (optional if already saved)

- **`ip`** (any) - TV's IP address (optional if already saved)





---


### `off`

Turn TV off





---


### `notify`

Show a notification toast on TV


**Parameters:**


- **`message`** (any) - Notification message





---


### `app`

Get current app or launch an app


**Parameters:**


- **`id`** (any) - App ID to launch (e.g., "netflix", "youtube.leanback.v4"), or omit to get current





---


### `apps`

List all installed apps





---


### `channel`

Get current channel or switch to a channel


**Parameters:**


- **`number`** (any) - Channel number to switch to, "+1" for next, "-1" for previous, or omit to get current





---


### `channels`

List all available channels





---


### `input`

Switch to an input


**Parameters:**


- **`id`** (any) - Input ID to switch to (e.g., "HDMI_1", "HDMI_2")





---


### `inputs`

List all available inputs





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


### `forward`

Fast forward media





---


### `button`

Send remote button press or list supported buttons


**Parameters:**


- **`button`** (any) - Button name (omit or use 'all' to list all supported buttons)
   *
   * Navigation: HOME, BACK, EXIT, UP, DOWN, LEFT, RIGHT, ENTER, CLICK
   * Colors: RED, GREEN, YELLOW, BLUE
   * Channel: CHANNEL_UP, CHANNEL_DOWN
   * Volume: VOLUME_UP, VOLUME_DOWN
   * Media: PLAY, PAUSE, STOP, REWIND, FAST_FORWARD
   * Other: ASTERISK





---


### `systemInfo`

Get TV system information (model, firmware, etc.)





---


### `softwareInfo`

Get current software/firmware information





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
ws@^8.18.0, wake_on_lan@^1.0.0
```


## 📄 License

MIT • Version 1.0.0
