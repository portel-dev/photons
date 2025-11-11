# Email

Send and receive emails via SMTP and IMAP

## 📋 Overview

**Version:** 1.0.0
**Author:** Portel
**License:** MIT

## ⚙️ Configuration

### Environment Variables


- **`EMAIL_SMTPHOST`** [REQUIRED]
  - Type: string
  - Description: SMTP server hostname (e.g., smtp.gmail.com)
  

- **`EMAIL_SMTPPORT`** [OPTIONAL]
  - Type: number
  - Description: SMTP server port (default: 587 for TLS, 465 for SSL)
  - Default: `587`

- **`EMAIL_SMTPUSER`** [REQUIRED]
  - Type: string
  - Description: SMTP username/email
  

- **`EMAIL_SMTPPASSWORD`** [REQUIRED]
  - Type: string
  - Description: SMTP password or app-specific password
  

- **`EMAIL_SMTPSECURE`** [OPTIONAL]
  - Type: boolean
  - Description: Use SSL (default: false, uses STARTTLS)
  

- **`EMAIL_IMAPHOST`** [OPTIONAL]
  - Type: string
  - Description: IMAP server hostname (optional, for receiving)
  

- **`EMAIL_IMAPPORT`** [OPTIONAL]
  - Type: number
  - Description: IMAP server port (optional, default: 993)
  - Default: `993`

- **`EMAIL_IMAPUSER`** [OPTIONAL]
  - Type: string
  - Description: IMAP username (optional, defaults to smtpUser)
  

- **`EMAIL_IMAPPASSWORD`** [OPTIONAL]
  - Type: string
  - Description: IMAP password (optional, defaults to smtpPassword)
  





### Setup Instructions

- smtpHost: SMTP server hostname (e.g., smtp.gmail.com)
- smtpPort: SMTP server port (default: 587 for TLS, 465 for SSL)
- smtpUser: SMTP username/email
- smtpPassword: SMTP password or app-specific password
- smtpSecure: Use SSL (default: false, uses STARTTLS)
- imapHost: IMAP server hostname (optional, for receiving)
- imapPort: IMAP server port (optional, default: 993)
- imapUser: IMAP username (optional, defaults to smtpUser)
- imapPassword: IMAP password (optional, defaults to smtpPassword)
Gmail Setup:
1. Enable 2FA in Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use: smtpHost=smtp.gmail.com, smtpUser=your@gmail.com, smtpPassword=app_password


## 🔧 Tools

This photon provides **8** tools:


### `send`

Send an email


**Parameters:**


- **`to`** (any) - {@min 1} {@pattern ^[^@]+@[^@]+\.[^@]+$} Recipient email address or comma-separated addresses {@example user@example.com}

- **`subject`** (any) - {@min 1} Email subject {@example Daily Report}

- **`body`** (any) - {@min 1} Email body (plain text or HTML)

- **`html`** (any, optional) - Set to true if body contains HTML

- **`cc`** (any) - CC recipients (optional, comma-separated)

- **`bcc`** (any) - BCC recipients (optional, comma-separated)

- **`from`** (any) - Sender email (optional, defaults to smtpUser)




**Example:**

```typescript
user@example.com}
```


---


### `sendAttachment`

Send an email with attachments


**Parameters:**


- **`to`** (any) - {@min 1} {@pattern ^[^@]+@[^@]+\.[^@]+$} Recipient email address {@example user@example.com}

- **`subject`** (any) - {@min 1} Email subject

- **`body`** (any) - {@min 1} Email body

- **`attachments`** (any) - {@min 1} Array of attachments with filename and content {@example [{"filename":"report.pdf","content":"..."}]}

- **`html`** (any, optional) - Set to true if body contains HTML




**Example:**

```typescript
user@example.com}
```


---


### `inbox`

List emails from inbox


**Parameters:**


- **`limit`** (any, optional) - {@min 1} {@max 100} Maximum number of emails to return

- **`unreadOnly`** (any, optional) - Only return unread emails

- **`mailbox`** (any) - Mailbox to check {@example INBOX}





---


### `get`

Get a specific email by sequence number


**Parameters:**


- **`uid`** (any) - {@min 1} Email sequence number (from listInbox)

- **`mailbox`** (any) - Mailbox to check {@example INBOX}





---


### `search`

Search emails by criteria


**Parameters:**


- **`query`** (any) - {@min 1} Search query (from, subject, or body text) {@example meeting}

- **`searchIn`** (any) - Where to search {@example subject}

- **`limit`** (any, optional) - {@min 1} {@max 100} Maximum results

- **`mailbox`** (any) - Mailbox to search {@example INBOX}




**Example:**

```typescript
meeting}
```


---


### `markRead`

Mark an email as read


**Parameters:**


- **`uid`** (any) - {@min 1} Email sequence number

- **`mailbox`** (any) - Mailbox name {@example INBOX}





---


### `remove`

Delete an email


**Parameters:**


- **`uid`** (any) - {@min 1} Email sequence number

- **`mailbox`** (any) - Mailbox name {@example INBOX}





---


### `move`

Move email to another mailbox (archive)


**Parameters:**


- **`uid`** (any) - {@min 1} Email sequence number

- **`targetMailbox`** (any) - {@min 1} Target mailbox name {@example Archive}

- **`sourceMailbox`** (any) - Source mailbox {@example INBOX}




**Example:**

```typescript
Archive}
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
photon mcp ./email.photon.ts
```

**Option 2: Install to ~/.photon/ (recommended)**

```bash
# Copy to photon directory
cp email.photon.ts ~/.photon/

# Run by name
photon mcp email
```

**Option 3: Use with Claude Desktop**

```bash
# Generate MCP configuration
photon mcp email --config

# Add the output to ~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📦 Dependencies


This photon automatically installs the following dependencies:

```
nodemailer@^6.9.0, imap@^0.8.19, mailparser@^3.6.0
```


## 📄 License

MIT • Version 1.0.0
