/**
 * Telegram - Send messages via Telegram Bot API
 * Like n8n's Telegram node - notifications and bot automation
 *
 * Perfect for:
 * - Personal notifications
 * - Alert systems
 * - Bot automation
 * - Group notifications
 */
export default class Telegram {
  private token: string;
  private baseUrl: string;

  constructor(botToken: string) {
    this.token = botToken;
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  /**
   * Send a text message
   * @param chatId Chat ID or @username
   * @param text Message text (supports Markdown or HTML)
   * @param parseMode Parse mode: Markdown, MarkdownV2, or HTML
   * @param disableNotification Send silently
   * @param replyToMessageId Message ID to reply to
   */
  async send(params: {
    chatId: string | number;
    text: string;
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
    disableNotification?: boolean;
    replyToMessageId?: number;
  }) {
    const payload: any = {
      chat_id: params.chatId,
      text: params.text,
    };

    if (params.parseMode) payload.parse_mode = params.parseMode;
    if (params.disableNotification) payload.disable_notification = true;
    if (params.replyToMessageId) payload.reply_to_message_id = params.replyToMessageId;

    return this._request('sendMessage', payload);
  }

  /**
   * Send a photo
   * @param chatId Chat ID or @username
   * @param photo Photo URL or file_id
   * @param caption Photo caption
   * @param parseMode Parse mode for caption
   */
  async sendPhoto(params: {
    chatId: string | number;
    photo: string;
    caption?: string;
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  }) {
    const payload: any = {
      chat_id: params.chatId,
      photo: params.photo,
    };

    if (params.caption) payload.caption = params.caption;
    if (params.parseMode) payload.parse_mode = params.parseMode;

    return this._request('sendPhoto', payload);
  }

  /**
   * Send a document/file
   * @param chatId Chat ID or @username
   * @param document Document URL or file_id
   * @param caption Document caption
   */
  async sendDocument(params: {
    chatId: string | number;
    document: string;
    caption?: string;
  }) {
    const payload: any = {
      chat_id: params.chatId,
      document: params.document,
    };

    if (params.caption) payload.caption = params.caption;

    return this._request('sendDocument', payload);
  }

  /**
   * Send a location
   * @param chatId Chat ID or @username
   * @param latitude Latitude
   * @param longitude Longitude
   */
  async sendLocation(params: {
    chatId: string | number;
    latitude: number;
    longitude: number;
  }) {
    return this._request('sendLocation', {
      chat_id: params.chatId,
      latitude: params.latitude,
      longitude: params.longitude,
    });
  }

  /**
   * Send a poll
   * @param chatId Chat ID or @username
   * @param question Poll question
   * @param options Poll options (2-10 options)
   * @param isAnonymous Is the poll anonymous
   * @param type Poll type: regular or quiz
   */
  async sendPoll(params: {
    chatId: string | number;
    question: string;
    options: string[];
    isAnonymous?: boolean;
    type?: 'regular' | 'quiz';
    correctOptionId?: number;
  }) {
    const payload: any = {
      chat_id: params.chatId,
      question: params.question,
      options: JSON.stringify(params.options),
    };

    if (params.isAnonymous !== undefined) payload.is_anonymous = params.isAnonymous;
    if (params.type) payload.type = params.type;
    if (params.correctOptionId !== undefined) payload.correct_option_id = params.correctOptionId;

    return this._request('sendPoll', payload);
  }

  /**
   * Send a formatted alert message
   * @param chatId Chat ID
   * @param level Alert level
   * @param title Alert title
   * @param message Alert message
   * @param details Additional details
   */
  async alert(params: {
    chatId: string | number;
    level: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    details?: string;
  }) {
    const emojis = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '🚨',
    };

    let text = `${emojis[params.level]} *${params.title}*\n\n${params.message}`;
    if (params.details) {
      text += `\n\n\`\`\`\n${params.details}\n\`\`\``;
    }

    return this.send({
      chatId: params.chatId,
      text,
      parseMode: 'Markdown',
    });
  }

  /**
   * Send a deployment notification
   * @param chatId Chat ID
   * @param app Application name
   * @param version Version
   * @param environment Environment
   * @param status Deployment status
   * @param url Deployment URL
   */
  async deployment(params: {
    chatId: string | number;
    app: string;
    version: string;
    environment: string;
    status: 'started' | 'success' | 'failed';
    url?: string;
  }) {
    const emojis = {
      started: '🚀',
      success: '✅',
      failed: '❌',
    };

    let text = `${emojis[params.status]} *Deployment ${params.status}*\n\n`;
    text += `📦 *App:* ${params.app}\n`;
    text += `🏷️ *Version:* ${params.version}\n`;
    text += `🌍 *Environment:* ${params.environment}`;

    if (params.url) {
      text += `\n\n[View Deployment](${params.url})`;
    }

    return this.send({
      chatId: params.chatId,
      text,
      parseMode: 'Markdown',
    });
  }

  /**
   * Get bot information
   */
  async getMe() {
    return this._request('getMe', {});
  }

  /**
   * Get chat information
   * @param chatId Chat ID or @username
   */
  async getChat(params: { chatId: string | number }) {
    return this._request('getChat', { chat_id: params.chatId });
  }

  /**
   * Get recent updates (incoming messages)
   * @param offset Update offset
   * @param limit Maximum updates to return
   * @param timeout Long polling timeout in seconds
   */
  async getUpdates(params?: {
    offset?: number;
    limit?: number;
    timeout?: number;
  }) {
    const payload: any = {};
    if (params?.offset) payload.offset = params.offset;
    if (params?.limit) payload.limit = params.limit;
    if (params?.timeout) payload.timeout = params.timeout;

    return this._request('getUpdates', payload);
  }

  /**
   * Delete a message
   * @param chatId Chat ID
   * @param messageId Message ID to delete
   */
  async deleteMessage(params: {
    chatId: string | number;
    messageId: number;
  }) {
    return this._request('deleteMessage', {
      chat_id: params.chatId,
      message_id: params.messageId,
    });
  }

  /**
   * Pin a message
   * @param chatId Chat ID
   * @param messageId Message ID to pin
   * @param disableNotification Don't notify members
   */
  async pinMessage(params: {
    chatId: string | number;
    messageId: number;
    disableNotification?: boolean;
  }) {
    return this._request('pinChatMessage', {
      chat_id: params.chatId,
      message_id: params.messageId,
      disable_notification: params.disableNotification || false,
    });
  }

  private async _request(method: string, payload: any) {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.result;
  }
}
