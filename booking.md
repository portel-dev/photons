# Booking System

Time slot reservation with distributed locks

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **12** tools:


### `resources`

List all bookable resources





---


### `resourceCreate`

Create a bookable resource with availability settings




**Example:**

```typescript
resourceCreate({ name: "Conference Room A", type: "room", slotDurationMinutes: 60, availableHours: { start: "09:00", end: "17:00" }, availableDays: [1,2,3,4,5] })
```


---


### `resourceUpdate`

Update a resource's details





---


### `resourceDelete`

Delete a resource and all its bookings





---


### `availability`

Check available time slots for a resource on a date  Returns all slots with their status (available/booked).





---


### `book`

Book a time slot  Uses distributed lock on the resource to prevent double-booking. The lock ensures that only one booking attempt per resource can proceed at a time.





---


### `cancel`

Cancel a booking  Uses distributed lock to prevent race conditions.





---


### `bookings`

List bookings for a resource and/or date




**Example:**

```typescript
bookings({ resource: "Conference Room A", date: "2025-02-01" })
```


---


### `myBookings`

List bookings by a specific user





---


### `stats`

Booking statistics  Shows utilization rates, popular times, and booking counts.





---


### `scheduledReminders`

Upcoming booking reminders  Checks for bookings starting in the next hour and emits reminders.





---


### `scheduledCleanup`

Cleanup old cancelled bookings  Removes cancelled bookings older than 30 days.





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
photon mcp ./booking.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp booking.photon.ts ~/.photon/

# Run by name
photon mcp booking
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp booking --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest
```


## 📄 License

MIT • Version 1.0.0
