/**
 * Social Media Formatter
 *
 * Takes markdown content and formats it optimally for different social media platforms.
 * Each platform has different constraints (character limits, formatting support, etc.)
 *
 * @dependencies @portel/photon-core@latest
 *
 * @example
 * ```typescript
 * const formatted = await formatter.format({
 *   content: "# My Article\n\nThis is **bold** and this is a [link](https://example.com)",
 *   platforms: ['linkedin', 'twitter', 'threads']
 * });
 * // Returns { linkedin: "...", twitter: "...", threads: "..." }
 * ```
 */

import { PhotonMCP } from '@portel/photon-core';

interface PlatformConfig {
  maxLength: number;
  supportsMarkdown: boolean;
  supportsLinks: boolean;
  supportsHashtags: boolean;
  linkCountsAsChars: number; // Twitter counts links as 23 chars
}

const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    maxLength: 280,
    supportsMarkdown: false,
    supportsLinks: true,
    supportsHashtags: true,
    linkCountsAsChars: 23,
  },
  linkedin: {
    maxLength: 3000,
    supportsMarkdown: false, // LinkedIn uses its own formatting
    supportsLinks: true,
    supportsHashtags: true,
    linkCountsAsChars: 0, // Full URL
  },
  threads: {
    maxLength: 500,
    supportsMarkdown: false,
    supportsLinks: true,
    supportsHashtags: true,
    linkCountsAsChars: 0,
  },
  mastodon: {
    maxLength: 500,
    supportsMarkdown: true,
    supportsLinks: true,
    supportsHashtags: true,
    linkCountsAsChars: 23,
  },
  bluesky: {
    maxLength: 300,
    supportsMarkdown: false,
    supportsLinks: true,
    supportsHashtags: true,
    linkCountsAsChars: 0,
  },
};

export default class SocialFormatterPhoton extends PhotonMCP {
  /**
   * Format markdown content for multiple social media platforms
   *
   * @param content - Markdown content to format
   * @param platforms - Target platforms (default: all)
   * @param includeHashtags - Auto-extract hashtags from content
   */
  async format(params: {
    content: string;
    platforms?: string[];
    includeHashtags?: boolean;
  }): Promise<Record<string, string>> {
    const { content, platforms = Object.keys(PLATFORMS), includeHashtags = true } = params;

    const results: Record<string, string> = {};

    for (const platform of platforms) {
      const config = PLATFORMS[platform];
      if (!config) {
        results[platform] = `Unknown platform: ${platform}`;
        continue;
      }

      results[platform] = this.formatForPlatform(content, platform, config, includeHashtags);
    }

    return results;
  }

  /**
   * Format content for a single platform
   */
  async formatSingle(params: {
    content: string;
    platform: string;
    includeHashtags?: boolean;
  }): Promise<string> {
    const { content, platform, includeHashtags = true } = params;
    const config = PLATFORMS[platform];

    if (!config) {
      throw new Error(`Unknown platform: ${platform}. Supported: ${Object.keys(PLATFORMS).join(', ')}`);
    }

    return this.formatForPlatform(content, platform, config, includeHashtags);
  }

  /**
   * Get platform constraints
   */
  async getPlatforms(): Promise<Record<string, PlatformConfig>> {
    return PLATFORMS;
  }

  /**
   * Create a thread from long content (for Twitter, Threads, etc.)
   */
  async createThread(params: {
    content: string;
    platform: string;
  }): Promise<string[]> {
    const { content, platform } = params;
    const config = PLATFORMS[platform];

    if (!config) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const formatted = this.markdownToPlain(content);
    return this.splitIntoThread(formatted, config.maxLength);
  }

  // ─────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────

  private formatForPlatform(
    content: string,
    platform: string,
    config: PlatformConfig,
    includeHashtags: boolean
  ): string {
    let formatted = content;

    // Convert markdown to platform-specific format
    if (!config.supportsMarkdown) {
      formatted = this.markdownToPlain(formatted);
    }

    // Extract and append hashtags if requested
    if (includeHashtags && config.supportsHashtags) {
      const hashtags = this.extractHashtags(content);
      if (hashtags.length > 0) {
        formatted += '\n\n' + hashtags.join(' ');
      }
    }

    // Truncate if needed
    if (formatted.length > config.maxLength) {
      formatted = this.smartTruncate(formatted, config.maxLength);
    }

    return formatted.trim();
  }

  private markdownToPlain(markdown: string): string {
    let text = markdown;

    // Remove headers, keep text
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');

    // Bold: **text** or __text__ → text (or CAPS for emphasis)
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/__(.+?)__/g, '$1');

    // Italic: *text* or _text_ → text
    text = text.replace(/\*(.+?)\*/g, '$1');
    text = text.replace(/_(.+?)_/g, '$1');

    // Links: [text](url) → text (url) or just text
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

    // Code blocks: ```code``` → code
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').trim();
    });

    // Inline code: `code` → code
    text = text.replace(/`([^`]+)`/g, '$1');

    // Bullet points: - item → • item
    text = text.replace(/^[-*]\s+/gm, '• ');

    // Numbered lists: keep as is

    // Blockquotes: > text → "text"
    text = text.replace(/^>\s+(.+)$/gm, '"$1"');

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  }

  private extractHashtags(content: string): string[] {
    // Extract existing hashtags
    const existing = content.match(/#\w+/g) || [];

    // Extract potential keywords from headers and bold text
    const headers = content.match(/^#{1,6}\s+(.+)$/gm) || [];
    const bold = content.match(/\*\*(.+?)\*\*/g) || [];

    const keywords = [
      ...headers.map(h => h.replace(/^#{1,6}\s+/, '')),
      ...bold.map(b => b.replace(/\*\*/g, '')),
    ];

    // Convert keywords to hashtags (simple heuristic)
    const generatedHashtags = keywords
      .map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(k => k.length > 3 && k.length < 20)
      .slice(0, 3)
      .map(k => `#${k}`);

    // Combine and dedupe
    const allHashtags = [...new Set([...existing, ...generatedHashtags])];
    return allHashtags.slice(0, 5); // Max 5 hashtags
  }

  private smartTruncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    // Leave room for "..."
    const targetLength = maxLength - 3;

    // Try to break at sentence boundary
    const truncated = text.slice(0, targetLength);
    const lastSentence = truncated.lastIndexOf('. ');

    if (lastSentence > targetLength * 0.7) {
      return truncated.slice(0, lastSentence + 1) + '...';
    }

    // Try to break at word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > targetLength * 0.8) {
      return truncated.slice(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  private splitIntoThread(text: string, maxLength: number): string[] {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const thread: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      const potential = current ? `${current} ${sentence}` : sentence;

      if (potential.length <= maxLength - 10) { // Leave room for "1/n"
        current = potential;
      } else {
        if (current) thread.push(current);
        current = sentence;
      }
    }

    if (current) thread.push(current);

    // Add thread numbering
    if (thread.length > 1) {
      return thread.map((t, i) => `${t}\n\n${i + 1}/${thread.length}`);
    }

    return thread;
  }
}
