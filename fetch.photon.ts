/**
 * Fetch - Web content fetching and markdown conversion
 *
 * Enhanced web content fetching with readability extraction and markdown conversion.
 * Extracts main content (like Safari Reader Mode) before converting to markdown.
 * Supports pagination for large pages and raw content retrieval.
 *
 * Returns a single Markdown string with YAML frontmatter containing metadata.
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
 * @dependencies turndown@^7.2.0, @mozilla/readability@^0.5.0, jsdom@^25.0.0, js-yaml@^4.1.0
 *
 * @version 1.2.0
 * @author Portel
 * @license MIT
 */

import TurndownService from "turndown";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import * as yaml from "js-yaml";

export default class Fetch {
  private turndown: TurndownService;
  private userAgent: string;

  constructor(user_agent?: string) {
    this.userAgent = user_agent || "Photon-MCP-Fetch/1.0";
    this.turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
  }

  async onInitialize() {
    console.error("[fetch] ✅ Initialized");
    console.error(`[fetch] User-Agent: ${this.userAgent}`);
  }

  /**
   * Helper to format response as Markdown with YAML frontmatter
   */
  private formatResponse(
    metadata: Record<string, any>,
    content: string,
  ): string {
    // Ensure clean separation for frontmatter
    const frontMatter = yaml.dump(metadata, { lineWidth: -1 });
    return `---\n${frontMatter}---\n\n${content}`;
  }

  /**
   * Fetch a URL and convert to markdown
   * @param url {@min 1} {@max 2000} {@format uri} The URL to fetch {@example https://example.com}
   * @param max_length {@min 1} {@max 50000} Maximum length of returned content (default: 5000)
   * @param start_index {@min 0} Start index for pagination (default: 0)
   * @param raw Return raw HTML instead of markdown (default: false)
   * @param readability Extract main content using Readability (default: true)
   * @returns string {markdown} Markdown document with YAML metadata header
   */
  async url(params: {
    url: string;
    max_length?: number;
    start_index?: number;
    raw?: boolean;
    readability?: boolean;
  }): Promise<string> {
    try {
      // Validate URL
      const url = new URL(params.url);

      // Fetch content
      const response = await fetch(url.href, {
        headers: {
          "User-Agent": this.userAgent,
        },
        redirect: "follow",
      });

      if (!response.ok) {
        return this.formatResponse(
          {
            success: false,
            url: url.href,
            status: response.status,
            error: response.statusText,
          },
          `# Error: HTTP ${response.status}\n\nCould not fetch content from ${url.href}.`,
        );
      }

      const contentType = response.headers.get("content-type") || "";

      // Get content
      let content = await response.text();
      let articleTitle: string | undefined;
      let articleExcerpt: string | undefined;

      // Process HTML content
      if (!params.raw && contentType.includes("text/html")) {
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
            console.error(
              "[fetch] Readability extraction failed, using raw HTML",
            );
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

      // Construct Metadata Object
      const metadata = {
        success: true,
        url: url.href,
        title: articleTitle || "Untitled",
        excerpt: articleExcerpt || null,
        status: response.status,
        contentType,
        pagination: {
          totalLength,
          startIndex,
          endIndex,
          hasMore: endIndex < totalLength,
        },
      };

      return this.formatResponse(metadata, paginatedContent);
    } catch (error: any) {
      // Error Handling: Return formatted markdown even on crash so AI sees the error context
      let errorMessage = error.message;

      if (error.code === "ENOTFOUND") {
        errorMessage = "Domain not found. Check the URL.";
      } else if (
        error.name === "TypeError" &&
        error.message.includes("Invalid URL")
      ) {
        errorMessage = "Invalid URL format.";
      }

      return this.formatResponse(
        {
          success: false,
          url: params.url,
          error: errorMessage,
        },
        `# Error\n\n${errorMessage}`,
      );
    }
  }

  /**
   * Fetch multiple URLs in parallel and join them
   * @param urls {@min 1} {@max 10} Array of URLs to fetch {@example ["https://example.com","https://example.org"]}
   * @param max_length {@min 1} {@max 50000} Maximum length per URL (default: 5000)
   * @param readability Extract main content using Readability (default: true)
   * @returns string[] {markdown} Array of Markdown documents
   */
  async batch(params: {
    urls: string[];
    max_length?: number;
    readability?: boolean;
  }): Promise<string[]> {
    try {
      const results = await Promise.all(
        params.urls.map((url) =>
          this.url({
            url,
            max_length: params.max_length,
            readability: params.readability,
          }),
        ),
      );
      return results;
    } catch (error: any) {
      // Return the error as a single-element array to satisfy string[] return type
      return [
        this.formatResponse(
          { success: false, error: "Batch processing failed" },
          error.message,
        ),
      ];
    }
  }
}
