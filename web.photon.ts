/**
 * Web - Search and read webpages
 *
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @dependencies axios@^1.6.0, cheerio@^1.0.0, turndown@^7.1.2, @mozilla/readability@^0.5.0, jsdom@^23.0.0, js-yaml@^4.1.0
 * @icon 🌐
 * @tags web, search, scraping, readability
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import * as yaml from 'js-yaml';
import { io } from '@portel/photon-core';

export default class Web {
    private turndown: TurndownService;
    private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';

    constructor() {
        this.turndown = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            hr: '---'
        });
        this.turndown.remove(['script', 'style', 'iframe', 'nav', 'footer']);
    }

    /**
     * Search the web
     * @param query Search query
     * @param limit Number of results {@default 10} {@min 1} {@max 50}
     * @format markdown
     */
    async *search(params: { query: string; limit?: number }): AsyncGenerator<any, string[]> {
        const url = `https://search.brave.com/search?q=${encodeURIComponent(params.query)}`;

        try {
            yield io.emit.status('Searching Brave...');

            const { data } = await axios.get(url, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000
            });

            yield io.emit.status('Parsing results...');

            const $ = cheerio.load(data);
            const results: string[] = [];

            // Brave Search uses data-type="web" for search results
            $('[data-type="web"]').each((i, element) => {
                // Get title and link from the first anchor
                const titleEl = $(element).find('a').first();
                const rawTitle = titleEl.text().trim();
                const link = titleEl.attr('href');

                // Clean up title: remove URL breadcrumbs that appear before the actual title
                // Format is usually: "Site domain › path   Actual Title"
                const titleParts = rawTitle.split(/\s{2,}/);
                const title = titleParts.length > 1 ? titleParts[titleParts.length - 1] : rawTitle;

                // Get snippet text - try multiple approaches
                let snippet = $(element).find('.snippet-description').text().trim();
                if (!snippet) {
                    snippet = $(element).find('[class*="snippet-content"]').text().trim();
                }
                if (!snippet) {
                    // Fallback: get all text and remove title portion
                    const allText = $(element).text().trim();
                    snippet = allText.replace(rawTitle, '').trim().substring(0, 200);
                }

                if (title && link && link.startsWith('http')) {
                    const cleanSnippet = snippet.replace(/\s+/g, ' ').substring(0, 250);
                    results.push(`**[${title}](${link})**\n> ${cleanSnippet}`);
                }
            });

            const limited = params.limit ? results.slice(0, params.limit) : results;
            return limited.length > 0 ? limited : ["*No results found.*"];
        } catch (error: any) {
            return [`**Search Error:** ${error.message}`];
        }
    }

    /**
     * Read webpage content
     * @param url URL to read {@example https://example.com}
     * @format markdown
     */
    async *read(params: { url: string }): AsyncGenerator<any, string> {
        try {
            yield io.emit.status(`Fetching ${params.url}...`);

            // 1. Fetch the raw HTML
            const { data: html } = await axios.get(params.url, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000 // 10s timeout
            });

            yield io.emit.status('Extracting content...');

            // 2. Parse HTML with JSDOM
            const dom = new JSDOM(html, { url: params.url });

            // 3. Extract main content with Readability
            const reader = new Readability(dom.window.document);
            const article = reader.parse();

            if (!article) {
                return `**Error:** Could not parse content from ${params.url}. The page might be empty or Javascript-heavy.`;
            }

            yield io.emit.status('Converting to Markdown...');

            // 4. Convert HTML to Markdown
            const markdownBody = this.turndown.turndown(article.content);

            // 5. Create Metadata Header
            const metadata = {
                title: article.title,
                url: params.url,
                siteName: article.siteName,
                byline: article.byline,
                length: markdownBody.length
            };

            // 6. Return combined result
            const frontMatter = yaml.dump(metadata, { lineWidth: -1 });
            return `---\n${frontMatter}---\n\n${markdownBody}`;

        } catch (error: any) {
            return `**Read Error:** ${error.message}`;
        }
    }

}
