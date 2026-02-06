/**
 * Web Agent Photon (Search + Read)
 *
 * A complete web research toolkit.
 * 1. Search: Scrapes DuckDuckGo for results.
 * 2. Read: Uses Mozilla Readability to extract main article content.
 *
 * @dependencies axios@^1.6.0, cheerio@^1.0.0, turndown@^7.1.2, @mozilla/readability@^0.5.0, jsdom@^23.0.0, js-yaml@^4.1.0
 * @version 1.0.0
 * @author Portel
 * @license MIT
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
        
        // Remove scripts, styles, and other noise from conversion
        this.turndown.remove(['script', 'style', 'iframe', 'nav', 'footer']);
    }

    async onInitialize() {
        // Silent initialization - ready to use
    }

    /**
     * Search the web using DuckDuckGo.
     */
    async *search(params: { query: string }): AsyncGenerator<any, string[]> {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(params.query)}`;

        try {
            yield io.emit.status('Searching DuckDuckGo...');

            const { data } = await axios.get(url, {
                headers: { 'User-Agent': this.userAgent }
            });

            yield io.emit.status('Parsing results...');

            const $ = cheerio.load(data);
            const results: string[] = [];

            $('.result').each((i, element) => {
                const title = $(element).find('.result__title .result__a').text().trim();
                const link = $(element).find('.result__title .result__a').attr('href');
                const snippet = $(element).find('.result__snippet').text().trim();

                if (title && link) {
                    const cleanSnippet = snippet.replace(/\s+/g, ' ');
                    results.push(`**[${title}](${link})**\n> ${cleanSnippet}`);
                }
            });

            return results.length > 0 ? results : ["*No results found.*"];
        } catch (error: any) {
            return [`**Search Error:** ${error.message}`];
        }
    }

    /**
     * Read a webpage and extract its main content as Markdown.
     * Uses Mozilla Readability to remove ads/navbars.
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

    // ========== TESTS ==========

    /** Helper to consume async generator */
    private async consumeGenerator<T>(gen: AsyncGenerator<any, T>): Promise<T> {
        let result;
        while (true) {
            const { value, done } = await gen.next();
            if (done) {
                result = value;
                break;
            }
        }
        return result;
    }

    /** Test search functionality */
    async testSearch() {
        const gen = this.search({ query: 'typescript' });
        const results = await this.consumeGenerator(gen);
        if (!Array.isArray(results)) throw new Error('Expected array');
        if (results.length === 0) throw new Error('No results');
        if (results[0] === '*No results found.*') throw new Error('Search failed');
        return { passed: true };
    }

    /** Test read functionality */
    async testRead() {
        const gen = this.read({ url: 'https://example.com' });
        const result = await this.consumeGenerator(gen);
        if (typeof result !== 'string') throw new Error('Expected string');
        if (result.includes('**Error:**')) throw new Error(result);
        if (!result.includes('Example Domain')) throw new Error('Missing expected content');
        return { passed: true };
    }

    /** Test read with invalid URL */
    async testReadInvalidUrl() {
        const gen = this.read({ url: 'https://this-domain-does-not-exist-12345.com' });
        const result = await this.consumeGenerator(gen);
        if (!result.includes('**Read Error:**')) throw new Error('Should have failed');
        return { passed: true };
    }
}