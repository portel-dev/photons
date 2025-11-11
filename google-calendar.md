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


- **`calendarId`** (any, optional) - {@max 200} Calendar ID  {@example primary}

- **`maxResults`** (any, optional) - {@min 1} {@max 100} Maximum number of events to return

- **`timeMin`** (any) - {@format date-time} Start time (ISO 8601, default: now) {@example 2024-03-15T09:00:00Z}

- **`timeMax`** (any) - {@format date-time} End time (ISO 8601, optional) {@example 2024-03-20T18:00:00Z}




**Example:**

```typescript
primary}
```


---


### `get`

Get a specific event


**Parameters:**


- **`eventId`** (any) - {@min 1} {@max 200} Event ID {@example abc123def456ghi789}

- **`calendarId`** (any, optional) - {@max 200} Calendar ID  {@example primary}




**Example:**

```typescript
abc123def456ghi789}
```


---


### `create`

Create a new event


**Parameters:**


- **`summary`** (any) - {@min 1} {@max 200} Event title {@example Team Meeting}

- **`start`** (any) - {@min 1} {@format date-time} Start time (ISO 8601) {@example 2024-03-15T14:00:00Z}

- **`end`** (any) - {@min 1} {@format date-time} End time (ISO 8601) {@example 2024-03-15T15:00:00Z}

- **`description`** (any, optional) - {@max 5000} Event description  {@example Quarterly planning session}

- **`location`** (any, optional) - {@max 500} Event location  {@example Conference Room A}

- **`attendees`** (any, optional) - {@min 1} Array of attendee email addresses  {@example ["user@example.com","colleague@company.com"]}

- **`calendarId`** (any, optional) - {@max 200} Calendar ID  {@example primary}




**Example:**

```typescript
Team Meeting}
```


---


### `update`

Update an existing event


**Parameters:**


- **`eventId`** (any) - {@min 1} {@max 200} Event ID {@example abc123def456ghi789}

- **`updates`** (any) - Object containing fields to update

- **`calendarId`** (any, optional) - {@max 200} Calendar ID  {@example primary}




**Example:**

```typescript
abc123def456ghi789}
```


---


### `remove`

Delete an event


**Parameters:**


- **`eventId`** (any) - {@min 1} {@max 200} Event ID {@example abc123def456ghi789}

- **`calendarId`** (any, optional) - {@max 200} Calendar ID  {@example primary}




**Example:**

```typescript
abc123def456ghi789}
```


---


### `calendars`

List all calendars





---


### `freeBusy`

Check free/busy status


**Parameters:**


- **`emails`** (any) - {@min 1} Array of email addresses to check {@example ["user@example.com","colleague@company.com"]}

- **`timeMin`** (any) - {@min 1} {@format date-time} Start time (ISO 8601) {@example 2024-03-15T09:00:00Z}

- **`timeMax`** (any) - {@min 1} {@format date-time} End time (ISO 8601) {@example 2024-03-15T18:00:00Z}




**Example:**

```typescript
["user@example.com","colleague@company.com"]}
```


---


### `search`

Search for events


**Parameters:**


- **`query`** (any) - {@min 1} {@max 500} Search query {@example team meeting}

- **`calendarId`** (any, optional) - {@max 200} Calendar ID  {@example primary}

- **`maxResults`** (any, optional) - {@min 1} {@max 100} Maximum number of results




**Example:**

```typescript
team meeting}
```


---


### `upcoming`

Get upcoming events within specified hours


**Parameters:**


- **`hours`** (any, optional) - {@min 1} {@max 720} Number of hours from now  {@example 48}

- **`calendarId`** (any, optional) - {@max 200} Calendar ID  {@example primary}




**Example:**

```typescript
48}
```


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
