/**
 * RSS Feed - Read and parse RSS/Atom feeds
 * Like n8n's RSS Read node - monitor blogs, news, and content feeds
 *
 * Perfect for:
 * - Content aggregation
 * - News monitoring
 * - Blog post notifications
 * - Podcast feed parsing
 */
export default class RssFeed {
  /**
   * Read and parse an RSS/Atom feed
   * @param url Feed URL to parse
   * @param limit Maximum number of items to return (default: 10)
   */
  async read(params: {
    url: string;
    limit?: number;
  }) {
    const response = await fetch(params.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }

    const xml = await response.text();
    const items = this._parseFeed(xml);
    const limit = params.limit || 10;

    return {
      feed: this._extractFeedInfo(xml),
      items: items.slice(0, limit),
      total: items.length,
    };
  }

  /**
   * Get new items since a specific date
   * @param url Feed URL
   * @param since ISO date string - only return items newer than this
   */
  async getNew(params: {
    url: string;
    since: string;
  }) {
    const response = await fetch(params.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }

    const xml = await response.text();
    const items = this._parseFeed(xml);
    const sinceDate = new Date(params.since);

    const newItems = items.filter(item => {
      const itemDate = item.pubDate ? new Date(item.pubDate) : new Date(0);
      return itemDate > sinceDate;
    });

    return {
      newItems,
      count: newItems.length,
      since: params.since,
      latestDate: newItems.length > 0 ? newItems[0].pubDate : null,
    };
  }

  /**
   * Search feed items by keyword
   * @param url Feed URL
   * @param query Search query (searches title and description)
   * @param limit Maximum results
   */
  async search(params: {
    url: string;
    query: string;
    limit?: number;
  }) {
    const response = await fetch(params.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }

    const xml = await response.text();
    const items = this._parseFeed(xml);
    const query = params.query.toLowerCase();
    const limit = params.limit || 10;

    const matches = items.filter(item => {
      const title = (item.title || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      return title.includes(query) || description.includes(query);
    });

    return {
      matches: matches.slice(0, limit),
      count: matches.length,
      query: params.query,
    };
  }

  /**
   * Monitor multiple feeds at once
   * @param urls Array of feed URLs
   * @param limit Items per feed
   */
  async readMultiple(params: {
    urls: string[];
    limit?: number;
  }) {
    const limit = params.limit || 5;
    const results = await Promise.allSettled(
      params.urls.map(async url => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const xml = await response.text();
        return {
          url,
          feed: this._extractFeedInfo(xml),
          items: this._parseFeed(xml).slice(0, limit),
        };
      })
    );

    return {
      feeds: results.map((r, i) => ({
        url: params.urls[i],
        success: r.status === 'fulfilled',
        ...(r.status === 'fulfilled' ? r.value : { error: (r as PromiseRejectedResult).reason.message }),
      })),
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    };
  }

  /**
   * Get feed metadata without items
   * @param url Feed URL
   */
  async info(params: { url: string }) {
    const response = await fetch(params.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }

    const xml = await response.text();
    const items = this._parseFeed(xml);

    return {
      ...this._extractFeedInfo(xml),
      itemCount: items.length,
      latestItem: items[0]?.pubDate || null,
      oldestItem: items[items.length - 1]?.pubDate || null,
    };
  }

  private _parseFeed(xml: string): Array<{
    title?: string;
    link?: string;
    description?: string;
    pubDate?: string;
    author?: string;
    guid?: string;
    categories?: string[];
  }> {
    const items: any[] = [];

    // Try RSS 2.0 format
    const rssItemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = rssItemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      items.push({
        title: this._extractTag(itemXml, 'title'),
        link: this._extractTag(itemXml, 'link'),
        description: this._stripHtml(this._extractTag(itemXml, 'description') || ''),
        pubDate: this._extractTag(itemXml, 'pubDate'),
        author: this._extractTag(itemXml, 'author') || this._extractTag(itemXml, 'dc:creator'),
        guid: this._extractTag(itemXml, 'guid'),
        categories: this._extractTags(itemXml, 'category'),
      });
    }

    // Try Atom format if no RSS items found
    if (items.length === 0) {
      const atomEntryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
      while ((match = atomEntryRegex.exec(xml)) !== null) {
        const entryXml = match[1];
        items.push({
          title: this._extractTag(entryXml, 'title'),
          link: this._extractAtomLink(entryXml),
          description: this._stripHtml(
            this._extractTag(entryXml, 'summary') ||
            this._extractTag(entryXml, 'content') || ''
          ),
          pubDate: this._extractTag(entryXml, 'published') || this._extractTag(entryXml, 'updated'),
          author: this._extractTag(entryXml, 'name'),
          guid: this._extractTag(entryXml, 'id'),
          categories: this._extractTags(entryXml, 'category'),
        });
      }
    }

    // Sort by date (newest first)
    return items.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });
  }

  private _extractFeedInfo(xml: string) {
    // RSS 2.0
    const channelMatch = xml.match(/<channel[^>]*>([\s\S]*?)(?:<item|$)/i);
    if (channelMatch) {
      return {
        title: this._extractTag(channelMatch[1], 'title'),
        description: this._extractTag(channelMatch[1], 'description'),
        link: this._extractTag(channelMatch[1], 'link'),
        language: this._extractTag(channelMatch[1], 'language'),
        lastBuildDate: this._extractTag(channelMatch[1], 'lastBuildDate'),
        format: 'rss',
      };
    }

    // Atom
    const feedMatch = xml.match(/<feed[^>]*>([\s\S]*?)(?:<entry|$)/i);
    if (feedMatch) {
      return {
        title: this._extractTag(feedMatch[1], 'title'),
        description: this._extractTag(feedMatch[1], 'subtitle'),
        link: this._extractAtomLink(feedMatch[1]),
        language: null,
        lastBuildDate: this._extractTag(feedMatch[1], 'updated'),
        format: 'atom',
      };
    }

    return { format: 'unknown' };
  }

  private _extractTag(xml: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    if (match) {
      return (match[1] || match[2] || '').trim();
    }
    return null;
  }

  private _extractTags(xml: string, tag: string): string[] {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  }

  private _extractAtomLink(xml: string): string | null {
    const linkMatch = xml.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
    return linkMatch ? linkMatch[1] : null;
  }

  private _stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}
