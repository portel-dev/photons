/**
 * Email - SMTP and IMAP email operations
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @icon 📧
 * @tags email, smtp, imap, messaging
 * @dependencies nodemailer@^6.9.0, imap@^0.8.19, mailparser@^3.6.0
 */

import nodemailer from 'nodemailer';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

interface Email {
  from?: string;
  to?: string;
  subject?: string;
  date?: Date;
  textBody?: string;
  htmlBody?: string;
  attachments?: Array<{ filename?: string; contentType?: string; size?: number }>;
  uid?: number;
  flags?: string[];
  unread?: boolean;
}

export default class EmailPhoton {
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

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPassword },
    });

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

  /**
   * Send an email
   * @param to Recipient address {@format email}
   * @param subject Subject line
   * @param body Email body {@field textarea}
   * @param html HTML content (default: false) {@choice true,false}
   * @param cc CC addresses (optional) {@format email}
   * @param bcc BCC addresses (optional) {@format email}
   * @icon 📤
   * @timeout 30s
   * @retryable 2 3s
   */
  async send(params: {
    to: string;
    subject: string;
    body: string;
    html?: boolean;
    cc?: string;
    bcc?: string;
  }) {
    const info = await this.transporter.sendMail({
      from: this.smtpUser,
      to: params.to,
      subject: params.subject,
      [params.html ? 'html' : 'text']: params.body,
      cc: params.cc,
      bcc: params.bcc,
    });

    return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
  }

  /**
   * Send email with attachments
   * @param to Recipient address {@format email}
   * @param subject Subject line
   * @param body Email body {@field textarea}
   * @param attachments File attachments (JSON array)
   * @param html HTML content (default: false) {@choice true,false}
   * @icon 📎
   * @timeout 60s
   * @retryable 2 3s
   */
  async attach(params: {
    to: string;
    subject: string;
    body: string;
    attachments: Array<{ filename: string; content: string; encoding?: string }>;
    html?: boolean;
  }) {
    const info = await this.transporter.sendMail({
      from: this.smtpUser,
      to: params.to,
      subject: params.subject,
      [params.html ? 'html' : 'text']: params.body,
      attachments: params.attachments.map(a => ({
        filename: a.filename,
        content: a.content,
        encoding: a.encoding || 'utf-8',
      })),
    });

    return { messageId: info.messageId, attachmentCount: params.attachments.length };
  }

  /**
   * List emails from mailbox
   * @param mailbox Mailbox name (default: INBOX)
   * @param unread Unread only (default: false)
   * @param limit Max results (default: 10) {@min 1} {@max 100}
   * @format list {@title subject, @subtitle from, @badge unread}
   * @autorun
   * @icon 📬
   * @timeout 30s
   * @retryable 2 3s
   */
  async inbox(params?: { mailbox?: string; unread?: boolean; limit?: number }) {
    if (!this.imapConfig) {
      throw new Error('IMAP not configured. Provide imapHost to enable email receiving.');
    }

    return new Promise<{ count: number; emails: Email[]; total: number; unreadCount?: number }>(
      resolve => {
        const imap = new Imap(this.imapConfig!);
        const emails: Email[] = [];

        imap.once('ready', () => {
          imap.openBox(params?.mailbox || 'INBOX', true, (err, box) => {
            if (err) {
              imap.end();
              throw err;
            }

            const criteria = params?.unread ? ['UNSEEN'] : ['ALL'];
            const limit = params?.limit || 10;

            imap.search(criteria, (err, results) => {
              if (err) {
                imap.end();
                throw err;
              }

              if (!results.length) {
                imap.end();
                return resolve({
                  count: 0,
                  emails: [],
                  total: box.messages.total,
                  unreadCount: box.messages.unseen,
                });
              }

              const fetch = imap.fetch(results.slice(-limit), {
                bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                struct: true,
              });

              fetch.on('message', msg => {
                const email: Email = {};

                msg.on('body', stream => {
                  simpleParser(stream, (err, parsed) => {
                    if (!err && parsed) {
                      email.from = parsed.from?.text;
                      email.to = parsed.to?.text;
                      email.subject = parsed.subject;
                      email.date = parsed.date;
                    }
                  });
                });

                msg.once('attributes', attrs => {
                  email.flags = attrs.flags;
                  email.unread = !attrs.flags.includes('\\Seen');
                });

                msg.once('end', () => emails.push(email));
              });

              fetch.once('error', err => {
                imap.end();
                throw err;
              });

              fetch.once('end', () => {
                imap.end();
                resolve({
                  count: emails.length,
                  emails: emails.reverse(),
                  total: box.messages.total,
                  unreadCount: box.messages.unseen,
                });
              });
            });
          });
        });

        imap.once('error', err => {
          throw err;
        });

        imap.connect();
      }
    );
  }

  /**
   * Get email by UID
   * @param uid Email UID
   * @param mailbox Mailbox name (default: INBOX)
   * @format card
   * @icon 📖
   * @timeout 30s
   */
  async get(params: { uid: number; mailbox?: string }) {
    if (!this.imapConfig) {
      throw new Error('IMAP not configured. Provide imapHost to enable email receiving.');
    }

    return new Promise<{ email: Email }>(resolve => {
      const imap = new Imap(this.imapConfig!);

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', true, err => {
          if (err) {
            imap.end();
            throw err;
          }

          const fetch = imap.fetch([params.uid], { bodies: '' });

          fetch.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, (err, parsed) => {
                imap.end();

                if (err) throw err;

                resolve({
                  email: {
                    from: parsed.from?.text,
                    to: parsed.to?.text,
                    subject: parsed.subject,
                    date: parsed.date,
                    textBody: parsed.text,
                    htmlBody: parsed.html,
                    attachments: parsed.attachments?.map(a => ({
                      filename: a.filename,
                      contentType: a.contentType,
                      size: a.size,
                    })),
                  },
                });
              });
            });
          });

          fetch.once('error', err => {
            imap.end();
            throw err;
          });
        });
      });

      imap.once('error', err => {
        throw err;
      });

      imap.connect();
    });
  }

  /**
   * Search emails
   * @param query Search terms
   * @param searchIn Search field {@choice from,subject,body} {@default subject}
   * @param limit Max results (default: 10) {@min 1} {@max 100}
   * @param mailbox Mailbox name (default: INBOX)
   * @format list {@title subject, @subtitle from}
   * @icon 🔍
   * @timeout 30s
   */
  async search(params: {
    query: string;
    searchIn?: 'from' | 'subject' | 'body';
    limit?: number;
    mailbox?: string;
  }) {
    if (!this.imapConfig) {
      throw new Error('IMAP not configured. Provide imapHost to enable email receiving.');
    }

    return new Promise<{ count: number; emails: Email[] }>(resolve => {
      const imap = new Imap(this.imapConfig!);
      const emails: Email[] = [];

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', true, err => {
          if (err) {
            imap.end();
            throw err;
          }

          const searchIn = params.searchIn || 'subject';
          const criteria = {
            from: [['FROM', params.query]],
            subject: [['SUBJECT', params.query]],
            body: [['BODY', params.query]],
          }[searchIn];

          imap.search(criteria as any, (err, results) => {
            if (err) {
              imap.end();
              throw err;
            }

            if (!results.length) {
              imap.end();
              return resolve({ count: 0, emails: [] });
            }

            const limit = params.limit || 10;
            const fetch = imap.fetch(results.slice(-limit), {
              bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
              struct: true,
            });

            fetch.on('message', msg => {
              const email: Email = {};

              msg.on('body', stream => {
                simpleParser(stream, (err, parsed) => {
                  if (!err && parsed) {
                    email.from = parsed.from?.text;
                    email.to = parsed.to?.text;
                    email.subject = parsed.subject;
                    email.date = parsed.date;
                  }
                });
              });

              msg.once('end', () => emails.push(email));
            });

            fetch.once('error', err => {
              imap.end();
              throw err;
            });

            fetch.once('end', () => {
              imap.end();
              resolve({ count: emails.length, emails: emails.reverse() });
            });
          });
        });
      });

      imap.once('error', err => {
        throw err;
      });

      imap.connect();
    });
  }

  /**
   * Mark email as read
   * @param uid Email UID
   * @param mailbox Mailbox name (default: INBOX)
   * @icon ✓
   * @timeout 15s
   */
  async read(params: { uid: number; mailbox?: string }) {
    if (!this.imapConfig) {
      throw new Error('IMAP not configured. Provide imapHost to enable email management.');
    }

    return new Promise<{ uid: number }>(resolve => {
      const imap = new Imap(this.imapConfig!);

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', false, err => {
          if (err) {
            imap.end();
            throw err;
          }

          imap.addFlags([params.uid], ['\\Seen'], err => {
            imap.end();
            if (err) throw err;
            resolve({ uid: params.uid });
          });
        });
      });

      imap.once('error', err => {
        throw err;
      });

      imap.connect();
    });
  }

  /**
   * Delete email
   * @param uid Email UID
   * @param mailbox Mailbox name (default: INBOX)
   * @icon 🗑
   * @timeout 15s
   */
  async remove(params: { uid: number; mailbox?: string }) {
    if (!this.imapConfig) {
      throw new Error('IMAP not configured. Provide imapHost to enable email management.');
    }

    return new Promise<{ uid: number }>(resolve => {
      const imap = new Imap(this.imapConfig!);

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', false, err => {
          if (err) {
            imap.end();
            throw err;
          }

          imap.addFlags([params.uid], ['\\Deleted'], err => {
            if (err) {
              imap.end();
              throw err;
            }

            imap.expunge(err => {
              imap.end();
              if (err) throw err;
              resolve({ uid: params.uid });
            });
          });
        });
      });

      imap.once('error', err => {
        throw err;
      });

      imap.connect();
    });
  }

  /**
   * Move email to mailbox
   * @param uid Email UID
   * @param target Target mailbox name
   * @param mailbox Source mailbox (default: INBOX)
   * @icon 📬
   * @timeout 15s
   */
  async move(params: { uid: number; target: string; mailbox?: string }) {
    if (!this.imapConfig) {
      throw new Error('IMAP not configured. Provide imapHost to enable email management.');
    }

    return new Promise<{ uid: number; target: string }>(resolve => {
      const imap = new Imap(this.imapConfig!);

      imap.once('ready', () => {
        imap.openBox(params.mailbox || 'INBOX', false, err => {
          if (err) {
            imap.end();
            throw err;
          }

          imap.move([params.uid], params.target, err => {
            imap.end();
            if (err) throw err;
            resolve({ uid: params.uid, target: params.target });
          });
        });
      });

      imap.once('error', err => {
        throw err;
      });

      imap.connect();
    });
  }
}
