/**
 * Web - Search and read webpages
 *
 * @version 2.0.0
 * @author Portel
 * @license MIT
 * @dependencies cheerio@^1.0.0, @mozilla/readability@^0.5.0, jsdom@^23.0.0
 * @icon 🌐
 * @tags web, search, scraping, readability
 */

import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const HEADERS: Record<string, string> = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
};

export default class Web {

    /**
     * Search the web
     * @param query Search query
     * @param limit Number of results {@default 10} {@min 1} {@max 50}
     * @format markdown
     */
    async search(params: { query: string; limit?: number }): Promise<string[]> {
        const url = `https://search.brave.com/search?q=${encodeURIComponent(params.query)}`;

        this.emit({ emit: 'status', message: 'Searching Brave...' });

        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) throw new Error(`Brave returned ${res.status}`);
        const html = await res.text();

        this.emit({ emit: 'status', message: 'Parsing results...' });

        const $ = cheerio.load(html);
        const results: string[] = [];

        $('[data-type="web"]').each((_i, el) => {
            const titleEl = $(el).find('a').first();
            const rawTitle = titleEl.text().trim();
            const link = titleEl.attr('href');

            // Clean title: remove URL breadcrumbs before actual title
            const parts = rawTitle.split(/\s{2,}/);
            const title = parts.length > 1 ? parts[parts.length - 1] : rawTitle;

            let snippet = $(el).find('.snippet-description').text().trim()
                || $(el).find('[class*="snippet"]').text().trim()
                || $(el).text().replace(rawTitle, '').trim().substring(0, 400);

            // Clean snippet: collapse whitespace, strip breadcrumbs + title echo
            snippet = snippet.replace(/\s+/g, ' ').trim();
            const dateMatch = snippet.match(/\d{1,2}\s+(?:hours?|days?|weeks?|months?)\s+ago\s*[-–—]\s*/);
            if (dateMatch) {
                snippet = snippet.slice(snippet.indexOf(dateMatch[0]) + dateMatch[0].length);
            } else {
                const titleIdx = snippet.indexOf(title);
                if (titleIdx >= 0 && titleIdx < 80) {
                    snippet = snippet.slice(titleIdx + title.length).replace(/^[\s\-–—:]+/, '');
                }
            }
            snippet = snippet.substring(0, 300).trim();

            if (title && link?.startsWith('http')) {
                const domain = new URL(link).hostname.replace('www.', '');
                results.push(`### ${title}\n\n${snippet}\n\n*${domain}* — [Open](${link})`);
            }
        });

        const limited = params.limit ? results.slice(0, params.limit) : results;
        return limited.length > 0 ? limited : ['*No results found.*'];
    }

    /**
     * Read webpage content
     * @param url URL to read {@example https://example.com}
     * @format markdown
     */
    async read(params: { url: string }): Promise<string> {
        this.emit({ emit: 'status', message: `Fetching ${params.url}...` });

        const res = await fetch(params.url, {
            headers: { ...HEADERS, 'Referer': 'https://www.google.com/' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const html = await res.text();

        this.emit({ emit: 'status', message: 'Extracting content...' });

        const dom = new JSDOM(html, { url: params.url });
        const article = new Readability(dom.window.document).parse();

        if (!article) {
            throw new Error(`Could not parse content from ${params.url}. The page might be empty or JavaScript-heavy.`);
        }

        this.emit({ emit: 'status', message: 'Converting to Markdown...' });

        // Convert HTML to readable text
        const text = this.htmlToMarkdown(article.content);

        const header = [
            article.title && `# ${article.title}`,
            article.byline && `*${article.byline}*`,
            article.siteName && `Source: ${article.siteName}`,
            `URL: ${params.url}`,
        ].filter(Boolean).join('\n');

        return `${header}\n\n---\n\n${text}`;
    }

    /** Convert simple HTML to markdown without turndown dependency */
    private htmlToMarkdown(html: string): string {
        const $ = cheerio.load(html);

        $('script, style, iframe, nav, footer').remove();

        $('h1, h2, h3, h4, h5, h6').each((_i, el) => {
            const level = parseInt(el.tagName[1]);
            const prefix = '#'.repeat(level);
            $(el).replaceWith(`\n\n${prefix} ${$(el).text().trim()}\n\n`);
        });

        $('a').each((_i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && text) {
                $(el).replaceWith(`[${text}](${href})`);
            }
        });

        $('strong, b').each((_i, el) => $(el).replaceWith(`**${$(el).text()}**`));
        $('em, i').each((_i, el) => $(el).replaceWith(`*${$(el).text()}*`));

        $('pre').each((_i, el) => $(el).replaceWith(`\n\`\`\`\n${$(el).text()}\n\`\`\`\n`));
        $('code').each((_i, el) => $(el).replaceWith(`\`${$(el).text()}\``));

        $('li').each((_i, el) => $(el).replaceWith(`\n- ${$(el).text().trim()}`));

        $('p').each((_i, el) => $(el).replaceWith(`\n\n${$(el).text().trim()}\n\n`));

        $('blockquote').each((_i, el) => {
            const lines = $(el).text().trim().split('\n').map(l => `> ${l}`).join('\n');
            $(el).replaceWith(`\n\n${lines}\n\n`);
        });

        $('hr').each((_i, el) => $(el).replaceWith('\n\n---\n\n'));

        return $.root().text()
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
}
