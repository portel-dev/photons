/**
 * Fetch - Web content fetching and markdown conversion
 *
 * Enhanced web content fetching with readability extraction and markdown conversion.
 * Extracts main content (like Safari Reader Mode) before converting to markdown.
 * Supports pagination for large pages and raw content retrieval.
 *
 * Common use cases:
 * - Documentation retrieval: "Fetch the Python requests documentation"
 * - Content analysis: "Get the content from this blog post"
 * - Web scraping: "Fetch and summarize this article"
 *
 * Example: fetch({ url: "https://example.com", max_length: 5000, readability: true })
 *
 * Configuration:
 * - user_agent: Custom User-Agent header (optional, default: "Photon-MCP-Fetch/1.0")
 *
 * Dependencies are auto-installed on first run.
 *
 * @dependencies turndown@^7.2.0, @mozilla/readability@^0.5.0, jsdom@^25.0.0
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import TurndownService from 'turndown';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export default class Fetch {
  private turndown: TurndownService;
  private userAgent: string;

  constructor(user_agent?: string) {
    this.userAgent = user_agent || 'Photon-MCP-Fetch/1.0';
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
  }

  async onInitialize() {
    console.error('[fetch] ✅ Initialized');
    console.error(`[fetch] User-Agent: ${this.userAgent}`);
  }

  /**
   * Fetch a URL and convert to markdown
   * @param url {@min 1} {@max 2000} {@format uri} The URL to fetch {@example https://example.com}
   * @param max_length {@min 1} {@max 50000} Maximum length of returned content (default: 5000)
   * @param start_index {@min 0} Start index for pagination (default: 0)
   * @param raw Return raw HTML instead of markdown (default: false)
   * @param readability Extract main content using Readability (default: true)
   */
  async fetch(params: {
    url: string;
    max_length?: number;
    start_index?: number;
    raw?: boolean;
    readability?: boolean;
  }) {
    try {
      // Validate URL
      const url = new URL(params.url);

      // Fetch content
      const response = await fetch(url.href, {
        headers: {
          'User-Agent': this.userAgent,
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const contentType = response.headers.get('content-type') || '';

      // Get content
      let content = await response.text();
      let articleTitle: string | undefined;
      let articleExcerpt: string | undefined;

      // Process HTML content
      if (!params.raw && contentType.includes('text/html')) {
        // Apply readability extraction if enabled (default: true)
        const useReadability = params.readability !== false;

        if (useReadability) {
          try {
            const dom = new JSDOM(content, { url: url.href });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();

            if (article) {
              articleTitle = article.title;
              articleExcerpt = article.excerpt;
              content = article.content; // Use cleaned HTML
            }
          } catch (error) {
            // Fall back to raw HTML if readability fails
            console.error('[fetch] Readability extraction failed, using raw HTML');
          }
        }

        // Convert HTML to markdown
        content = this.turndown.turndown(content);
      }

      // Apply pagination
      const startIndex = params.start_index || 0;
      const maxLength = params.max_length || 5000;

      const totalLength = content.length;
      const endIndex = Math.min(startIndex + maxLength, totalLength);
      const paginatedContent = content.slice(startIndex, endIndex);

      return {
        success: true,
        url: url.href,
        content: paginatedContent,
        ...(articleTitle && { title: articleTitle }),
        ...(articleExcerpt && { excerpt: articleExcerpt }),
        metadata: {
          status: response.status,
          contentType,
          totalLength,
          startIndex,
          endIndex,
          hasMore: endIndex < totalLength,
        },
      };
    } catch (error: any) {
      if (error.code === 'ENOTFOUND') {
        return {
          success: false,
          error: 'Domain not found. Check the URL.',
        };
      }

      if (error.name === 'TypeError' && error.message.includes('Invalid URL')) {
        return {
          success: false,
          error: 'Invalid URL format',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch multiple URLs in parallel
   * @param urls {@min 1} {@max 10} Array of URLs to fetch {@example ["https://example.com","https://example.org"]}
   * @param max_length {@min 1} {@max 50000} Maximum length per URL (default: 5000)
   * @param readability Extract main content using Readability (default: true)
   */
  async batch(params: { urls: string[]; max_length?: number; readability?: boolean }) {
    try {
      const results = await Promise.all(
        params.urls.map((url) =>
          this.fetch({
            url,
            max_length: params.max_length,
            readability: params.readability
          })
        )
      );

      return {
        success: true,
        count: results.length,
        results,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
