/**
 * Email - Send and receive emails via SMTP and IMAP
 *
 * Provides email operations for sending, receiving, and managing emails.
 * Supports SMTP for sending and IMAP for receiving/managing messages.
 *
 * Common use cases:
 * - Send notifications: "Email me the daily report"
 * - Check inbox: "Show me my unread emails"
 * - Send with attachments: "Email this file to the team"
 * - Search emails: "Find emails from john@example.com"
 *
 * Example: sendEmail({ to: "user@example.com", subject: "Report", body: "..." })
 *
 * Configuration:
 * - smtpHost: SMTP server hostname (e.g., smtp.gmail.com)
 * - smtpPort: SMTP server port (default: 587 for TLS, 465 for SSL)
 * - smtpUser: SMTP username/email
 * - smtpPassword: SMTP password or app-specific password
 * - smtpSecure: Use SSL (default: false, uses STARTTLS)
 * - imapHost: IMAP server hostname (optional, for receiving)
 * - imapPort: IMAP server port (optional, default: 993)
 * - imapUser: IMAP username (optional, defaults to smtpUser)
 * - imapPassword: IMAP password (optional, defaults to smtpPassword)
 *
 * Gmail Setup:
 * 1. Enable 2FA in Google Account
 * 2. Generate App Password: https://myaccount.google.com/apppasswords
 * 3. Use: smtpHost=smtp.gmail.com, smtpUser=your@gmail.com, smtpPassword=app_password
 *
 * @dependencies nodemailer@^6.9.0, imap@^0.8.19, mailparser@^3.6.0
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import nodemailer from 'nodemailer';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

interface EmailAddress {
  address: string;
  name?: string;
}

interface EmailAttachment {
  filename: string;
  content: string;
  encoding?: string;
}

export default class Email {
  private transporter: nodemailer.Transporter;
  private imapConfig?: Imap.Config;

  constructor(
    private smtpHost: string,
    private smtpPort: number = 587,
    private smtpUser: string,
    private smtpPassword: string,
    private smtpSecure: boolean = false,
    private imapHost?: string,
    private imapPort: number = 993,
    private imapUser?: string,
    private imapPassword?: string
  ) {
    if (!smtpHost || !smtpUser || !smtpPassword) {
      throw new Error('SMTP host, user, and password are required');
    }

    // Create SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Setup IMAP config if provided
    if (imapHost) {
      this.imapConfig = {
        user: imapUser || smtpUser,
        password: imapPassword || smtpPassword,
        host: imapHost,
        port: imapPort,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      };
    }
  }

  async onInitialize() {
    try {
      // Verify SMTP connection
      await this.transporter.verify();
      console.error('[email] ✅ SMTP connection verified');
      console.error(`[email] SMTP: ${this.smtpUser}@${this.smtpHost}:${this.smtpPort}`);

      if (this.imapConfig) {
        console.error(`[email] IMAP: ${this.imapConfig.user}@${this.imapConfig.host}:${this.imapConfig.port}`);
      } else {
        console.error('[email] IMAP: Not configured (send-only mode)');
      }
    } catch (error: any) {
      console.error(`[email] ⚠️  SMTP verification failed: ${error.message}`);
      throw new Error(`Email initialization failed: ${error.message}`);
    }
  }

  /**
   * Send an email
   * @param to {@min 1} {@pattern ^[^@]+@[^@]+\.[^@]+$} Recipient email address or comma-separated addresses {@example user@example.com}
   * @param subject {@min 1} Email subject {@example Daily Report}
   * @param body {@min 1} Email body (plain text or HTML)
   * @param html Set to true if body contains HTML (default: false)
   * @param cc CC recipients (optional, comma-separated)
   * @param bcc BCC recipients (optional, comma-separated)
   * @param from Sender email (optional, defaults to smtpUser)
   */
  async send(params: {
    to: string;
    subject: string;
    body: string;
    html?: boolean;
    cc?: string;
    bcc?: string;
    from?: string;
  }) {
    try {
      const mailOptions: any = {
        from: params.from || this.smtpUser,
        to: params.to,
        subject: params.subject,
        cc: params.cc,
        bcc: params.bcc,
      };

      if (params.html) {
        mailOptions.html = params.body;
      } else {
        mailOptions.text = params.body;
      }

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send an email with attachments
   * @param to {@min 1} {@pattern ^[^@]+@[^@]+\.[^@]+$} Recipient email address {@example user@example.com}
   * @param subject {@min 1} Email subject
   * @param body {@min 1} Email body
   * @param attachments {@min 1} Array of attachments with filename and content {@example [{"filename":"report.pdf","content":"..."}]}
   * @param html Set to true if body contains HTML (default: false)
   */
  async sendAttachment(params: {
    to: string;
    subject: string;
    body: string;
    attachments: Array<{ filename: string; content: string; encoding?: string }>;
    html?: boolean;
  }) {
    try {
      const mailOptions: any = {
        from: this.smtpUser,
        to: params.to,
        subject: params.subject,
        attachments: params.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          encoding: att.encoding || 'utf-8',
        })),
      };

      if (params.html) {
        mailOptions.html = params.body;
      } else {
        mailOptions.text = params.body;
      }

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        attachmentCount: params.attachments.length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List emails from inbox
   * @param limit {@min 1} {@max 100} Maximum number of emails to return (default: 10)
   * @param unreadOnly Only return unread emails (default: false)
   * @param mailbox Mailbox to check {@example INBOX}
   */
  async inbox(params?: { limit?: number; unreadOnly?: boolean; mailbox?: string }) {
    if (!this.imapConfig) {
      return {
        success: false,
        error: 'IMAP not configured. Provide imapHost to enable email receiving.',
      };
    }

    return new Promise((resolve) => {
      const imap = new Imap(this.imapConfig!);
      const emails: any[] = [];

      imap.once('ready', () => {
        imap.openBox(params?.mailbox || 'INBOX', true, (err, box) => {
          if (err) {
            imap.end();
            return resolve({ success: false, error: err.message });
          }

          const criteria = params?.unreadOnly ? ['UNSEEN'] : ['ALL'];
          const limit = params?.limit || 10;

          imap.search(criteria, (err, results) => {
            if (err) {
              imap.end();
              return resolve({ success: false, error: err.message });
            }

            if (results.length === 0) {
              imap.end();
              return resolve({
                success: true,
                count: 0,
                emails: [],
                totalMessages: box.messages.total,
              });
            }

            // Fetch latest emails (limit)
            const fetch = imap.fetch(results.slice(-limit), {
              bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
              struct: true,
            });

            fetch.on('message', (msg, seqno) => {
              const email: any = { uid: seqno };

              msg.on('body', (stream) => {
                simpleParser(stream, (err, parsed) => {
                  if (!err && parsed) {
                    email.from = parsed.from?.text;
                    email.to = parsed.to?.text;
                    email.subject = parsed.subject;
                    email.date = parsed.date;
                  }
                });
              });

              msg.once('attributes', (attrs) => {
                email.flags = attrs.flags;
                email.unread = !attrs.flags.includes('\\Seen');
              });

              msg.once('end', () => {
                emails.push(email);
              });
            });

            fetch.once('error', (err) => {
              imap.end();
              resolve({ success: false, error: err.message });
            });

            fetch.once('end', () => {
              imap.end();
              resolve({
                success: true,
                count: emails.length,
                emails: emails.reverse(), // Newest first
                totalMessages: box.messages.total,
                unreadCount: box.messages.unseen,
              });
            });
          });
        });
      });

      imap.once('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      imap.connect();
    });
  }

  /**
   * Get a specific email by sequence number
   * @param uid {@min 1} Email sequence number (from listInbox)
   * @param mailbox Mailbox to check {@example INBOX}
   */
  async get(params: { uid: number; mailbox?: string }) {
    if (!this.imapConfig) {
      return {
        success: false,
        error: 'IMAP not configured. Provide imapHost to enable email receiving.',
      };
    }

    return new Promise((resolve) => {
      const imap = new Imap(this.imapConfig!);

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', true, (err) => {
          if (err) {
            imap.end();
            return resolve({ success: false, error: err.message });
          }

          const fetch = imap.fetch([params.uid], { bodies: '' });

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, parsed) => {
                imap.end();

                if (err) {
                  return resolve({ success: false, error: err.message });
                }

                resolve({
                  success: true,
                  email: {
                    from: parsed.from?.text,
                    to: parsed.to?.text,
                    subject: parsed.subject,
                    date: parsed.date,
                    textBody: parsed.text,
                    htmlBody: parsed.html,
                    attachments: parsed.attachments?.map(att => ({
                      filename: att.filename,
                      contentType: att.contentType,
                      size: att.size,
                    })),
                  },
                });
              });
            });
          });

          fetch.once('error', (err) => {
            imap.end();
            resolve({ success: false, error: err.message });
          });
        });
      });

      imap.once('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      imap.connect();
    });
  }

  /**
   * Search emails by criteria
   * @param query {@min 1} Search query (from, subject, or body text) {@example meeting}
   * @param searchIn Where to search {@example subject}
   * @param limit {@min 1} {@max 100} Maximum results (default: 10)
   * @param mailbox Mailbox to search {@example INBOX}
   */
  async search(params: {
    query: string;
    searchIn?: 'from' | 'subject' | 'body';
    limit?: number;
    mailbox?: string;
  }) {
    if (!this.imapConfig) {
      return {
        success: false,
        error: 'IMAP not configured. Provide imapHost to enable email receiving.',
      };
    }

    return new Promise((resolve) => {
      const imap = new Imap(this.imapConfig!);
      const emails: any[] = [];

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', true, (err) => {
          if (err) {
            imap.end();
            return resolve({ success: false, error: err.message });
          }

          // Build search criteria
          let criteria: any[];
          const searchIn = params.searchIn || 'subject';

          if (searchIn === 'from') {
            criteria = [['FROM', params.query]];
          } else if (searchIn === 'subject') {
            criteria = [['SUBJECT', params.query]];
          } else {
            criteria = [['BODY', params.query]];
          }

          imap.search(criteria, (err, results) => {
            if (err) {
              imap.end();
              return resolve({ success: false, error: err.message });
            }

            if (results.length === 0) {
              imap.end();
              return resolve({
                success: true,
                count: 0,
                emails: [],
                query: params.query,
              });
            }

            const limit = params.limit || 10;
            const fetch = imap.fetch(results.slice(-limit), {
              bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
              struct: true,
            });

            fetch.on('message', (msg, seqno) => {
              const email: any = { uid: seqno };

              msg.on('body', (stream) => {
                simpleParser(stream, (err, parsed) => {
                  if (!err && parsed) {
                    email.from = parsed.from?.text;
                    email.to = parsed.to?.text;
                    email.subject = parsed.subject;
                    email.date = parsed.date;
                  }
                });
              });

              msg.once('end', () => {
                emails.push(email);
              });
            });

            fetch.once('error', (err) => {
              imap.end();
              resolve({ success: false, error: err.message });
            });

            fetch.once('end', () => {
              imap.end();
              resolve({
                success: true,
                count: emails.length,
                emails: emails.reverse(),
                query: params.query,
              });
            });
          });
        });
      });

      imap.once('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      imap.connect();
    });
  }

  /**
   * Mark an email as read
   * @param uid {@min 1} Email sequence number
   * @param mailbox Mailbox name {@example INBOX}
   */
  async markRead(params: { uid: number; mailbox?: string }) {
    if (!this.imapConfig) {
      return {
        success: false,
        error: 'IMAP not configured. Provide imapHost to enable email management.',
      };
    }

    return new Promise((resolve) => {
      const imap = new Imap(this.imapConfig!);

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', false, (err) => {
          if (err) {
            imap.end();
            return resolve({ success: false, error: err.message });
          }

          imap.addFlags([params.uid], ['\\Seen'], (err) => {
            imap.end();

            if (err) {
              return resolve({ success: false, error: err.message });
            }

            resolve({
              success: true,
              uid: params.uid,
              message: 'Email marked as read',
            });
          });
        });
      });

      imap.once('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      imap.connect();
    });
  }

  /**
   * Delete an email
   * @param uid {@min 1} Email sequence number
   * @param mailbox Mailbox name {@example INBOX}
   */
  async remove(params: { uid: number; mailbox?: string }) {
    if (!this.imapConfig) {
      return {
        success: false,
        error: 'IMAP not configured. Provide imapHost to enable email management.',
      };
    }

    return new Promise((resolve) => {
      const imap = new Imap(this.imapConfig!);

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', false, (err) => {
          if (err) {
            imap.end();
            return resolve({ success: false, error: err.message });
          }

          imap.addFlags([params.uid], ['\\Deleted'], (err) => {
            if (err) {
              imap.end();
              return resolve({ success: false, error: err.message });
            }

            imap.expunge((err) => {
              imap.end();

              if (err) {
                return resolve({ success: false, error: err.message });
              }

              resolve({
                success: true,
                uid: params.uid,
                message: 'Email deleted',
              });
            });
          });
        });
      });

      imap.once('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      imap.connect();
    });
  }

  /**
   * Move email to another mailbox (archive)
   * @param uid {@min 1} Email sequence number
   * @param targetMailbox {@min 1} Target mailbox name {@example Archive}
   * @param sourceMailbox Source mailbox {@example INBOX}
   */
  async move(params: { uid: number; targetMailbox: string; sourceMailbox?: string }) {
    if (!this.imapConfig) {
      return {
        success: false,
        error: 'IMAP not configured. Provide imapHost to enable email management.',
      };
    }

    return new Promise((resolve) => {
      const imap = new Imap(this.imapConfig!);

      imap.once('ready', () => {
        imap.openBox(params.sourceMailbox || 'INBOX', false, (err) => {
          if (err) {
            imap.end();
            return resolve({ success: false, error: err.message });
          }

          imap.move([params.uid], params.targetMailbox, (err) => {
            imap.end();

            if (err) {
              return resolve({ success: false, error: err.message });
            }

            resolve({
              success: true,
              uid: params.uid,
              message: `Email moved to ${params.targetMailbox}`,
            });
          });
        });
      });

      imap.once('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      imap.connect();
    });
  }

  async onShutdown() {
    console.error('[email] ✅ Email connection closed');
  }
}
