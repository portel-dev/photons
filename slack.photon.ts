/**
 * Slack - Send and manage messages
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 💬
 * @tags slack, messaging, notifications
 * @dependencies @slack/web-api@^7.0.0
 */

import { WebClient } from '@slack/web-api';

interface Channel {
  id: string;
  name: string;
  is_private?: boolean;
  is_archived?: boolean;
  num_members?: number;
  topic?: string;
  purpose?: string;
}

interface Message {
  ts: string;
  user?: string;
  text: string;
  type?: string;
  thread_ts?: string;
}

export default class SlackPhoton {
  private client: WebClient;

  constructor(private token: string) {
    if (!token?.trim() || (!token.startsWith('xoxb-') && !token.startsWith('xoxp-'))) {
      throw new Error('Invalid Slack token (must start with xoxb- or xoxp-)');
    }
    this.client = new WebClient(token);
  }

  /**
   * Post a message
   * @param channel Channel name or ID
   * @param text Message text {@field textarea}
   * @param thread_ts Thread timestamp (optional)
   * @param blocks Rich blocks (JSON string, optional)
   * @icon 📤
   * @timeout 15s
   * @retryable 2 2s
   */
  async post(params: {
    channel: string;
    text: string;
    thread_ts?: string;
    blocks?: string;
  }) {
    const channel = params.channel.startsWith('#')
      ? await this._resolveChannel(params.channel.slice(1))
      : params.channel;

    const response = await this.client.chat.postMessage({
      channel,
      text: params.text,
      thread_ts: params.thread_ts,
      blocks: params.blocks ? JSON.parse(params.blocks) : undefined,
    });

    return { ts: response.ts, channel: response.channel };
  }

  /**
   * List channels
   * @param types Channel types {@choice public_channel,private_channel} {@default public_channel}
   * @param limit Results limit (default: 100) {@min 1} {@max 1000}
   * @format list {@title name, @subtitle id, @badge is_private}
   * @autorun
   * @icon 📋
   * @timeout 15s
   * @cached 5m
   */
  async channels(params?: { types?: 'public_channel' | 'private_channel'; limit?: number }) {
    const response = await this.client.conversations.list({
      types: params?.types || 'public_channel',
      limit: params?.limit || 100,
    });

    return {
      count: response.channels?.length || 0,
      channels: response.channels?.map((ch: any) => ({
        id: ch.id,
        name: ch.name,
        is_private: ch.is_private,
        is_archived: ch.is_archived,
        num_members: ch.num_members,
        topic: ch.topic?.value,
        purpose: ch.purpose?.value,
      })) || [],
    };
  }

  /**
   * Get channel info
   * @param channel Channel name or ID
   * @format card
   * @icon 📖
   * @timeout 10s
   * @cached 5m
   */
  async channel(params: { channel: string }) {
    const channel = params.channel.startsWith('#')
      ? await this._resolveChannel(params.channel.slice(1))
      : params.channel;

    const response = await this.client.conversations.info({ channel });
    const ch = response.channel;

    return {
      id: ch?.id,
      name: ch?.name,
      is_private: ch?.is_private,
      is_archived: ch?.is_archived,
      num_members: ch?.num_members,
      topic: ch?.topic?.value,
      purpose: ch?.purpose?.value,
      created: ch?.created,
    };
  }

  /**
   * Get message history
   * @param channel Channel name or ID
   * @param limit Results (default: 10) {@min 1} {@max 100}
   * @param oldest Start timestamp (optional)
   * @param latest End timestamp (optional)
   * @format list {@title text, @subtitle user, @badge ts}
   * @icon 📜
   * @timeout 15s
   */
  async history(params: {
    channel: string;
    limit?: number;
    oldest?: string;
    latest?: string;
  }) {
    const channel = params.channel.startsWith('#')
      ? await this._resolveChannel(params.channel.slice(1))
      : params.channel;

    const response = await this.client.conversations.history({
      channel,
      limit: params.limit || 10,
      oldest: params.oldest,
      latest: params.latest,
    });

    return {
      count: response.messages?.length || 0,
      messages: response.messages?.map((msg: any) => ({
        ts: msg.ts,
        user: msg.user,
        text: msg.text,
        type: msg.type,
        thread_ts: msg.thread_ts,
      })) || [],
    };
  }

  /**
   * Add reaction to message
   * @param channel Channel name or ID
   * @param timestamp Message timestamp
   * @param name Emoji name (without colons)
   * @icon 😀
   * @timeout 10s
   * @retryable 2 2s
   */
  async react(params: { channel: string; timestamp: string; name: string }) {
    const channel = params.channel.startsWith('#')
      ? await this._resolveChannel(params.channel.slice(1))
      : params.channel;

    await this.client.reactions.add({
      channel,
      timestamp: params.timestamp,
      name: params.name,
    });

    return { message: `Added reaction :${params.name}:` };
  }

  /**
   * Upload file
   * @param channel Channel name or ID
   * @param content File content
   * @param filename File name
   * @param title File title (optional)
   * @param comment Comment (optional)
   * @icon 📎
   * @timeout 30s
   * @retryable 2 3s
   */
  async upload(params: {
    channel: string;
    content: string;
    filename: string;
    title?: string;
    comment?: string;
  }) {
    const channel = params.channel.startsWith('#')
      ? await this._resolveChannel(params.channel.slice(1))
      : params.channel;

    const response = await this.client.files.uploadV2({
      channel_id: channel,
      content: params.content,
      filename: params.filename,
      title: params.title || params.filename,
      initial_comment: params.comment,
    });

    return {
      id: response.file?.id,
      name: response.file?.name,
      url: response.file?.permalink,
    };
  }

  /**
   * Search messages
   * @param query Search query
   * @param count Results (default: 20) {@min 1} {@max 100}
   * @param sort Sort order {@choice score,timestamp} {@default score}
   * @format list {@title text, @subtitle channel, @badge user}
   * @icon 🔍
   * @timeout 15s
   */
  async search(params: { query: string; count?: number; sort?: 'score' | 'timestamp' }) {
    const response = await this.client.search.messages({
      query: params.query,
      count: params.count || 20,
      sort: params.sort || 'score',
    });

    return {
      total: response.messages?.total,
      count: response.messages?.matches?.length || 0,
      messages: response.messages?.matches?.map((msg: any) => ({
        ts: msg.ts,
        user: msg.user,
        username: msg.username,
        text: msg.text,
        channel: msg.channel?.name,
        permalink: msg.permalink,
      })) || [],
    };
  }

  private async _resolveChannel(name: string): Promise<string> {
    const response = await this.client.conversations.list({
      types: 'public_channel,private_channel',
      limit: 1000,
    });

    const channel = response.channels?.find(ch => ch.name === name);
    if (!channel) throw new Error(`Channel #${name} not found`);
    return channel.id!;
  }
}
