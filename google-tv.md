# Google TV Remote

Control Google TV and Android TV devices

## 📋 Overview

**Version:** 1.0.0
**Author:** Photon
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`GOOGLE_T_V_CREDENTIALS_FILE`** [OPTIONAL]
  - Type: string
  - Description: Path to store TV credentials (optional, default: "google-tv-credentials.json")
  





### Setup Instructions

- credentials_file: Path to store TV credentials (optional, default: "google-tv-credentials.json")
Dependencies are auto-installed on first run.


## 🔧 Tools

This photon provides **37** tools:


### `discover`

Discover Google TV / Android TV devices on the network using mDNS


**Parameters:**


- **`timeout`** (any, optional) - Discovery timeout in seconds





---


### `connect`

Connect to a Google TV / Android TV device Uses generator pattern with ask/emit yields: - emit: status updates during connection - ask: pairing code input when needed


**Parameters:**


- **`ip`** (any) - TV IP address (required for first connection)

- **`name`** (any) - Optional friendly name for the TV





---


### `disconnect`

Disconnect from the TV





---


### `status`

Get current connection status





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

Turn TV on (wake from sleep)





---


### `off`

Turn TV off (put to sleep)





---


### `power`

Toggle power





---


### `app`

Launch an app via deep link


**Parameters:**


- **`url`** (any) - App deep link URL (e.g., "https://www.netflix.com", "https://www.youtube.com")





---


### `launch`

Launch popular streaming apps


**Parameters:**


- **`name`** (any) - App name: netflix, youtube, disney, prime, hulu, hbo, spotify





---


### `play`

Play media





---


### `pause`

Pause media





---


### `playPause`

Toggle play/pause





---


### `stop`

Stop media





---


### `next`

Skip to next





---


### `previous`

Skip to previous





---


### `rewind`

Rewind





---


### `forward`

Fast forward





---


### `home`

Go to home screen





---


### `back`

Go back





---


### `select`

Select / Enter / OK





---


### `up`

Navigate up





---


### `down`

Navigate down





---


### `left`

Navigate left





---


### `right`

Navigate right





---


### `menu`

Open menu





---


### `settings`

Open settings





---


### `info`

Show info/details





---


### `channelUp`

Channel up





---


### `channelDown`

Channel down





---


### `input`

Switch TV input source





---


### `button`

Send remote button press or list supported buttons


**Parameters:**


- **`button`** (any) - Button name (omit or use 'all' to list all supported buttons)
   *
   * Navigation: HOME, BACK, MENU, UP, DOWN, LEFT, RIGHT, SELECT, ENTER
   * Media: PLAY, PAUSE, PLAY_PAUSE, STOP, NEXT, PREVIOUS, REWIND, FORWARD
   * Volume: VOLUME_UP, VOLUME_DOWN, MUTE
   * Power: POWER, SLEEP, WAKEUP
   * TV: INPUT, CHANNEL_UP, CHANNEL_DOWN, INFO, GUIDE, SETTINGS
   * Colors: RED, GREEN, YELLOW, BLUE
   * Numbers: NUM_0 through NUM_9





---


### `number`

Send a number (0-9)


**Parameters:**


- **`number`** (any) - The number to send (0-9)





---


### `remoteUI`

Show interactive TV remote control UI





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
photon mcp ./google-tv.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp google-tv.photon.ts ~/.photon/

# Run by name
photon mcp google-tv
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp google-tv --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
androidtv-remote@^1.0.7
```


## 📄 License

MIT • Version 1.0.0
