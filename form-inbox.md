# Form Inbox

Webhook-powered form submission collector

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables




No configuration required.




## 🔧 Tools

This photon provides **12** tools:


### `forms`

List all forms with submission counts





---


### `formCreate`

Create a new form with field definitions




**Example:**

```typescript
formCreate({ name: "Contact Form", fields: [{ name: "email", type: "email", required: true }, { name: "message", type: "textarea", required: true }] })
```


---


### `formDelete`

Delete a form and all its submissions





---


### `submissions`

List submissions for a form with pagination




**Example:**

```typescript
submissions({ formId: "abc123" })
```


---


### `submission`

Get a single submission detail





---


### `submissionDelete`

Delete a submission





---


### `export`

Export submissions as JSON or CSV




**Example:**

```typescript
export({ formId: "abc123", format: "csv" })
```


---


### `stats`

Submission statistics across all forms  Shows total submissions, per-form counts, and submissions per day for the last 7 days.





---


### `handleSubmission`

Receive form submission via webhook  POST /webhook/form-inbox/handleSubmission?form=<formId> Body: JSON matching form field names





---


### `handleBulkImport`

Receive bulk CSV import via webhook  POST /webhook/form-inbox/handleBulkImport?form=<formId> Body: { csv: "header1,header2\nval1,val2\n..." }





---


### `scheduledDigest`

Daily submission digest  Sends summary of yesterday's submissions across all forms.





---


### `scheduledCleanup`

Cleanup old submissions  Removes submissions older than 90 days to keep data manageable.





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
photon mcp ./form-inbox.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp form-inbox.photon.ts ~/.photon/

# Run by name
photon mcp form-inbox
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp form-inbox --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
@portel/photon-core@latest
```


## 📄 License

MIT • Version 1.0.0
