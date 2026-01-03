/**
 * Content Creator Photon
 *
 * AI-powered content research and publishing workflow.
 * Demonstrates Photon composition - depends on web.photon and social-formatter.photon
 *
 * Workflow:
 * 1. Research: Search web for topics, fetch and summarize content
 * 2. Write: AI generates article/post from research
 * 3. Format: Convert to platform-specific formats
 * 4. Publish: Post to selected social media (manual for now)
 *
 * @dependencies @portel/photon-core@latest, @anthropic-ai/sdk@latest
 * @photon formatter social-formatter
 */

import { PhotonMCP } from '@portel/photon-core';
import Anthropic from '@anthropic-ai/sdk';

// Types
interface ResearchResult {
  query: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  summary: string;
  keyPoints: string[];
  timestamp: string;
}

interface GeneratedContent {
  title: string;
  content: string;
  hashtags: string[];
  targetPlatforms: string[];
}

interface FormattedContent {
  original: string;
  formatted: Record<string, string>;
  threads?: Record<string, string[]>;
}

export default class ContentCreatorPhoton extends PhotonMCP {
  private anthropic?: Anthropic;
  private formatter?: any; // Will be injected via @photon

  constructor(
    private apiKey?: string,
    formatter?: any // @photon formatter social-formatter
  ) {
    super();
    this.formatter = formatter;
  }

  async onInitialize() {
    // Initialize Anthropic client if API key provided
    const key = this.apiKey || process.env.ANTHROPIC_API_KEY;
    if (key) {
      this.anthropic = new Anthropic({ apiKey: key });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RESEARCH PHASE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Research a topic by searching the web and summarizing findings
   *
   * @param topic - Topic to research
   * @param depth - How many sources to analyze (default: 5)
   * @returns Research summary with sources and key points
   */
  async *research(params: {
    topic: string;
    depth?: number;
  }): AsyncGenerator<any, ResearchResult, any> {
    const { topic, depth = 5 } = params;

    yield { emit: 'status', message: `Researching: ${topic}` };

    // Step 1: Search for sources
    yield { emit: 'progress', value: 0.1, message: 'Searching web...' };

    // For now, simulate search results (in production, use web.photon)
    const searchResults = await this.simulateWebSearch(topic, depth);

    yield { emit: 'progress', value: 0.3, message: `Found ${searchResults.length} sources` };

    // Step 2: Fetch and extract content from each source
    const sources: ResearchResult['sources'] = [];
    for (let i = 0; i < searchResults.length; i++) {
      yield {
        emit: 'progress',
        value: 0.3 + (i / searchResults.length) * 0.4,
        message: `Analyzing source ${i + 1}/${searchResults.length}`,
      };

      sources.push({
        title: searchResults[i].title,
        url: searchResults[i].url,
        snippet: searchResults[i].snippet,
      });
    }

    yield { emit: 'progress', value: 0.7, message: 'Generating summary...' };

    // Step 3: Summarize findings with AI
    const { summary, keyPoints } = await this.summarizeResearch(topic, sources);

    yield { emit: 'progress', value: 1.0, message: 'Research complete' };

    return {
      query: topic,
      sources,
      summary,
      keyPoints,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONTENT GENERATION PHASE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Generate content from research results
   *
   * @param research - Research results from research()
   * @param style - Content style: 'professional', 'casual', 'technical'
   * @param length - Target length: 'short' (tweet), 'medium' (linkedin), 'long' (blog)
   */
  async *generate(params: {
    research: ResearchResult;
    style?: 'professional' | 'casual' | 'technical';
    length?: 'short' | 'medium' | 'long';
    platforms?: string[];
  }): AsyncGenerator<any, GeneratedContent, any> {
    const {
      research,
      style = 'professional',
      length = 'medium',
      platforms = ['linkedin', 'twitter'],
    } = params;

    yield { emit: 'status', message: 'Generating content...' };

    // Ask user for any specific angle or focus
    const angle: string = yield {
      ask: 'text',
      id: 'angle',
      message: 'Any specific angle or focus for the content? (optional)',
      required: false,
    };

    yield { emit: 'progress', value: 0.3, message: 'Writing with AI...' };

    const content = await this.generateWithAI(research, style, length, angle);

    yield { emit: 'progress', value: 0.8, message: 'Extracting hashtags...' };

    const hashtags = this.extractHashtags(content, research.query);

    yield { emit: 'progress', value: 1.0, message: 'Content generated' };

    return {
      title: this.extractTitle(content),
      content,
      hashtags,
      targetPlatforms: platforms,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // FORMATTING PHASE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Format generated content for multiple platforms
   */
  async *formatContent(params: {
    content: GeneratedContent;
  }): AsyncGenerator<any, FormattedContent, any> {
    const { content } = params;

    yield { emit: 'status', message: 'Formatting for platforms...' };

    // Use the injected formatter or fall back to basic formatting
    let formatted: Record<string, string>;

    if (this.formatter) {
      formatted = await this.formatter.format({
        content: content.content,
        platforms: content.targetPlatforms,
        includeHashtags: true,
      });
    } else {
      // Basic fallback formatting
      formatted = {};
      for (const platform of content.targetPlatforms) {
        formatted[platform] = this.basicFormat(content.content, platform);
      }
    }

    yield { emit: 'progress', value: 0.5, message: 'Creating threads for long content...' };

    // Create threads for platforms with short limits
    const threads: Record<string, string[]> = {};
    const shortPlatforms = ['twitter', 'threads', 'bluesky'];

    for (const platform of content.targetPlatforms) {
      if (shortPlatforms.includes(platform) && formatted[platform].length > 280) {
        if (this.formatter) {
          threads[platform] = await this.formatter.createThread({
            content: content.content,
            platform,
          });
        }
      }
    }

    yield { emit: 'toast', message: 'Content formatted!', type: 'success' };

    return {
      original: content.content,
      formatted,
      threads: Object.keys(threads).length > 0 ? threads : undefined,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // FULL WORKFLOW
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Complete workflow: Research → Generate → Format
   *
   * Interactive workflow that guides user through content creation
   */
  async *createContent(params: {
    topic: string;
  }): AsyncGenerator<any, FormattedContent, any> {
    const { topic } = params;

    yield { emit: 'status', message: `Starting content creation for: ${topic}` };

    // Step 1: Research
    yield { emit: 'status', message: '📚 Phase 1: Research' };
    const researchGen = this.research({ topic, depth: 5 });
    let research: ResearchResult | undefined;

    for await (const yielded of researchGen) {
      if ('emit' in yielded) {
        yield yielded;
      }
    }
    research = await researchGen.next().then(r => r.value);

    // Show research summary to user
    yield {
      emit: 'log',
      level: 'info',
      message: `Research complete. Found ${research!.sources.length} sources.\nKey points:\n${research!.keyPoints.map(p => `• ${p}`).join('\n')}`,
    };

    // Ask user to confirm or adjust
    const proceed: boolean = yield {
      ask: 'confirm',
      id: 'proceed_to_generate',
      message: 'Proceed to content generation?',
    };

    if (!proceed) {
      throw new Error('Workflow cancelled by user');
    }

    // Step 2: Ask for preferences
    const style: string = yield {
      ask: 'select',
      id: 'style',
      message: 'What style should the content be?',
      options: [
        { value: 'professional', label: 'Professional - formal, authoritative' },
        { value: 'casual', label: 'Casual - friendly, conversational' },
        { value: 'technical', label: 'Technical - detailed, expert-focused' },
      ],
    };

    const platforms: string[] = yield {
      ask: 'select',
      id: 'platforms',
      message: 'Which platforms to target?',
      multiple: true,
      options: [
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'threads', label: 'Threads' },
        { value: 'mastodon', label: 'Mastodon' },
        { value: 'bluesky', label: 'Bluesky' },
      ],
    };

    // Step 3: Generate content
    yield { emit: 'status', message: '✍️ Phase 2: Generate' };
    const generateGen = this.generate({
      research: research!,
      style: style as any,
      platforms: Array.isArray(platforms) ? platforms : [platforms],
    });

    let generated: GeneratedContent | undefined;
    for await (const yielded of generateGen) {
      if ('emit' in yielded || 'ask' in yielded) {
        const result = yield yielded;
        if ('ask' in yielded) {
          generateGen.next(result);
        }
      }
    }
    generated = await generateGen.next().then(r => r.value);

    // Step 4: Format for platforms
    yield { emit: 'status', message: '🎨 Phase 3: Format' };
    const formatGen = this.formatContent({ content: generated! });

    let formatted: FormattedContent | undefined;
    for await (const yielded of formatGen) {
      if ('emit' in yielded) {
        yield yielded;
      }
    }
    formatted = await formatGen.next().then(r => r.value);

    yield { emit: 'toast', message: 'Content ready for publishing!', type: 'success' };

    return formatted!;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════

  private async simulateWebSearch(
    topic: string,
    count: number
  ): Promise<Array<{ title: string; url: string; snippet: string }>> {
    // In production, this would call web.photon
    // For demo, return simulated results
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push({
        title: `${topic} - Resource ${i + 1}`,
        url: `https://example.com/article-${i + 1}`,
        snippet: `Key insights about ${topic}. This source covers important aspects including trends, best practices, and expert opinions.`,
      });
    }
    return results;
  }

  private async summarizeResearch(
    topic: string,
    sources: ResearchResult['sources']
  ): Promise<{ summary: string; keyPoints: string[] }> {
    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Summarize these research findings about "${topic}":\n\n${sources.map(s => `- ${s.title}: ${s.snippet}`).join('\n')}\n\nProvide:\n1. A brief summary (2-3 sentences)\n2. 3-5 key points as bullet points\n\nFormat as JSON: { "summary": "...", "keyPoints": ["...", "..."] }`,
          },
        ],
      });

      try {
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        return JSON.parse(text);
      } catch {
        // Fall through to default
      }
    }

    // Default summary without AI
    return {
      summary: `Research on "${topic}" gathered from ${sources.length} sources covering various perspectives and insights.`,
      keyPoints: [
        `Multiple perspectives on ${topic}`,
        'Current trends and developments',
        'Expert opinions and analysis',
        'Practical applications and examples',
      ],
    };
  }

  private async generateWithAI(
    research: ResearchResult,
    style: string,
    length: string,
    angle?: string
  ): Promise<string> {
    const lengthGuide = {
      short: '50-100 words, perfect for a tweet or quick post',
      medium: '200-400 words, ideal for LinkedIn',
      long: '600-1000 words, suitable for a blog post',
    };

    const prompt = `Write a ${style} ${length} post about "${research.query}".

Research summary: ${research.summary}

Key points to cover:
${research.keyPoints.map(p => `- ${p}`).join('\n')}

${angle ? `Specific angle/focus: ${angle}` : ''}

Length guide: ${lengthGuide[length as keyof typeof lengthGuide]}

Write in markdown format. Make it engaging and shareable.`;

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    }

    // Fallback without AI
    return `# ${research.query}

${research.summary}

## Key Points

${research.keyPoints.map(p => `- ${p}`).join('\n')}

---
*Generated from ${research.sources.length} sources*`;
  }

  private extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Untitled Post';
  }

  private extractHashtags(content: string, topic: string): string[] {
    const words = topic.toLowerCase().split(/\s+/);
    return words
      .filter(w => w.length > 3)
      .slice(0, 3)
      .map(w => `#${w.replace(/[^a-z0-9]/g, '')}`);
  }

  private basicFormat(content: string, platform: string): string {
    const limits: Record<string, number> = {
      twitter: 280,
      linkedin: 3000,
      threads: 500,
      mastodon: 500,
      bluesky: 300,
    };

    let text = content
      .replace(/^#{1,6}\s+(.+)$/gm, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

    const limit = limits[platform] || 1000;
    if (text.length > limit) {
      text = text.slice(0, limit - 3) + '...';
    }

    return text;
  }
}
