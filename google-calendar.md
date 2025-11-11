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


- **`calendarId`** (any, optional) [max: 200] - Calendar ID (e.g., `primary`)

- **`maxResults`** (any, optional) [min: 1, max: 100] - Maximum number of events to return

- **`timeMin`** (any) [format: date-time] - Start time (ISO 8601, default: now) (e.g., `2024-03-15T09:00:00Z`)

- **`timeMax`** (any) [format: date-time] - End time (ISO 8601, optional) (e.g., `2024-03-20T18:00:00Z`)





---


### `get`

Get a specific event


**Parameters:**


- **`eventId`** (any) [min: 1, max: 200] - Event ID (e.g., `abc123def456ghi789`)

- **`calendarId`** (any, optional) [max: 200] - Calendar ID (e.g., `primary`)





---


### `create`

Create a new event


**Parameters:**


- **`summary`** (any) [min: 1, max: 200] - Event title (e.g., `Team Meeting`)

- **`start`** (any) [min: 1, format: date-time] - Start time (ISO 8601) (e.g., `2024-03-15T14:00:00Z`)

- **`end`** (any) [min: 1, format: date-time] - End time (ISO 8601) (e.g., `2024-03-15T15:00:00Z`)

- **`description`** (any, optional) [max: 5000] - Event description (e.g., `Quarterly planning session`)

- **`location`** (any, optional) [max: 500] - Event location (e.g., `Conference Room A`)

- **`attendees`** (any, optional) [min: 1] - Array of attendee email addresses (e.g., `["user@example.com","colleague@company.com"]`)

- **`calendarId`** (any, optional) [max: 200] - Calendar ID (e.g., `primary`)





---


### `update`

Update an existing event


**Parameters:**


- **`eventId`** (any) [min: 1, max: 200] - Event ID (e.g., `abc123def456ghi789`)

- **`updates`** (any) - Object containing fields to update

- **`calendarId`** (any, optional) [max: 200] - Calendar ID (e.g., `primary`)





---


### `remove`

Delete an event


**Parameters:**


- **`eventId`** (any) [min: 1, max: 200] - Event ID (e.g., `abc123def456ghi789`)

- **`calendarId`** (any, optional) [max: 200] - Calendar ID (e.g., `primary`)





---


### `calendars`

List all calendars





---


### `freeBusy`

Check free/busy status


**Parameters:**


- **`emails`** (any) [min: 1] - Array of email addresses to check (e.g., `["user@example.com","colleague@company.com"]`)

- **`timeMin`** (any) [min: 1, format: date-time] - Start time (ISO 8601) (e.g., `2024-03-15T09:00:00Z`)

- **`timeMax`** (any) [min: 1, format: date-time] - End time (ISO 8601) (e.g., `2024-03-15T18:00:00Z`)





---


### `search`

Search for events


**Parameters:**


- **`query`** (any) [min: 1, max: 500] - Search query (e.g., `team meeting`)

- **`calendarId`** (any, optional) [max: 200] - Calendar ID (e.g., `primary`)

- **`maxResults`** (any, optional) [min: 1, max: 100] - Maximum number of results





---


### `upcoming`

Get upcoming events within specified hours


**Parameters:**


- **`hours`** (any, optional) [min: 1, max: 720] - Number of hours from now (e.g., `48`)

- **`calendarId`** (any, optional) [max: 200] - Calendar ID (e.g., `primary`)





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
