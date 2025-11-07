# Google Calendar

Calendar integration

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`GOOGLE_CALENDAR_CLIENTID`** [REQUIRED]
  - Type: string
  - Description: OAuth2 client ID from Google Cloud Console
  

- **`GOOGLE_CALENDAR_CLIENTSECRET`** [REQUIRED]
  - Type: string
  - Description: OAuth2 client secret
  

- **`GOOGLE_CALENDAR_REFRESHTOKEN`** [REQUIRED]
  - Type: string
  - Description: OAuth2 refresh token (obtain via OAuth flow)
  





### Setup Instructions

- clientId: OAuth2 client ID from Google Cloud Console
- clientSecret: OAuth2 client secret
- refreshToken: OAuth2 refresh token (obtain via OAuth flow)


## 🔧 Tools

This photon provides **9** tools:


### `list`

List upcoming events


**Parameters:**


- **`calendarId`** (any, optional) - Calendar ID

- **`maxResults`** (any, optional) - Maximum number of events to return

- **`timeMin`** (any) - Start time (ISO 8601, default: now)

- **`timeMax`** (any) - End time (ISO 8601, optional)





---


### `get`

Get a specific event


**Parameters:**


- **`eventId`** (any) - Event ID

- **`calendarId`** (any, optional) - Calendar ID





---


### `create`

Create a new event


**Parameters:**


- **`summary`** (any) - Event title

- **`start`** (any) - Start time (ISO 8601)

- **`end`** (any) - End time (ISO 8601)

- **`description`** (any, optional) - Event description

- **`location`** (any, optional) - Event location

- **`attendees`** (any, optional) - Array of attendee email addresses

- **`calendarId`** (any, optional) - Calendar ID





---


### `update`

Update an existing event


**Parameters:**


- **`eventId`** (any) - Event ID

- **`updates`** (any) - Object containing fields to update

- **`calendarId`** (any, optional) - Calendar ID





---


### `remove`

Delete an event


**Parameters:**


- **`eventId`** (any) - Event ID

- **`calendarId`** (any, optional) - Calendar ID





---


### `calendars`

List all calendars





---


### `freeBusy`

Check free/busy status


**Parameters:**


- **`emails`** (any) - Array of email addresses to check

- **`timeMin`** (any) - Start time (ISO 8601)

- **`timeMax`** (any) - End time (ISO 8601)





---


### `search`

Search for events


**Parameters:**


- **`query`** (any) - Search query

- **`calendarId`** (any, optional) - Calendar ID

- **`maxResults`** (any, optional) - Maximum number of results





---


### `upcoming`

Get upcoming events within specified hours


**Parameters:**


- **`hours`** (any, optional) - Number of hours from now

- **`calendarId`** (any, optional) - Calendar ID





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
photon mcp ./google-calendar.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp google-calendar.photon.ts ~/.photon/

# Run by name
photon mcp google-calendar
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp google-calendar --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
googleapis@^128.0.0
```


## 📄 License

MIT • Version 1.0.0
