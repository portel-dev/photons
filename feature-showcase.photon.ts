/**
 * Feature Showcase - Core Runtime Feature Demos
 *
 * Demonstrates every major Photon runtime feature with test methods
 * to prove each one works. Run `photon test feature-showcase` to verify.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags demo, testing, features, showcase
 * @icon 🎯
 */

import { PhotonMCP, io } from '@portel/photon-core';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface SampleRecord {
  id: number;
  name: string;
  score: number;
  active: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// PHOTON CLASS
// ════════════════════════════════════════════════════════════════════════════════

export default class FeatureShowcasePhoton extends PhotonMCP {
  // ── Instance State ──
  private counter = 0;
  private initializeRan = false;
  private shutdownRan = false;
  private emitLog: string[] = [];

  /**
   * @property theme UI theme preference
   * @property maxItems Maximum items to display (1-100)
   * @property verbose Enable verbose logging
   */
  protected settings = {
    theme: 'auto' as 'light' | 'dark' | 'auto',
    maxItems: 10,
    verbose: false,
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // LIFECYCLE HOOKS
  // ══════════════════════════════════════════════════════════════════════════════

  async onInitialize(): Promise<void> {
    this.initializeRan = true;
    this.emitLog.push('onInitialize');
  }

  async onShutdown(): Promise<void> {
    this.shutdownRan = true;
    this.emitLog.push('onShutdown');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // EMIT TYPES - Generator yielding all io.emit variants
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Demonstrates all io.emit types in a single generator
   *
   * Yields status, progress, stream, log, toast, thinking, and artifact
   * emissions to prove each type works.
   */
  async *emits(): AsyncGenerator<any, string> {
    yield io.emit.status('Starting emit showcase...');
    yield io.emit.log('Emit showcase started', 'info');
    yield io.emit.thinking(true);

    yield io.emit.progress(0.2, 'Step 1: status + log done');
    yield io.emit.toast('Showcase in progress', 'info', 3000);

    yield io.emit.progress(0.4, 'Step 2: toast sent');
    yield io.emit.stream('Streaming chunk 1... ', false);
    yield io.emit.stream('Streaming chunk 2... ', false);
    yield io.emit.stream('done.', true, 'text/plain');

    yield io.emit.progress(0.6, 'Step 3: stream complete');
    yield io.emit.log('About to emit artifact', 'debug', { phase: 'artifact' });

    yield io.emit.artifact('json', {
      title: 'Sample Artifact',
      data: { key: 'value', items: [1, 2, 3] },
    });

    yield io.emit.progress(0.8, 'Step 4: artifact emitted');
    yield io.emit.thinking(false);

    yield io.emit.progress(1.0, 'All emit types demonstrated');
    yield io.emit.status('Emit showcase complete!');

    return 'All 7 emit types demonstrated: status, progress, stream, log, toast, thinking, artifact';
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ASK TYPES - Generator yielding all io.ask variants
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Demonstrates all io.ask types interactively
   *
   * Each ask type prompts the user for input, then returns a summary.
   */
  async *asks(): AsyncGenerator<any, Record<string, any>> {
    yield io.emit.status('Starting ask showcase...');

    const name = yield io.ask.text('Enter your name:', {
      default: 'Demo User',
      placeholder: 'Your name',
    });

    const secret = yield io.ask.password('Enter a secret:', {
      id: 'showcase-password',
    });

    const confirmed = yield io.ask.confirm('Do you like Photon?', {
      default: true,
    });

    const color = yield io.ask.select('Pick a color:', [
      'Red', 'Green', 'Blue', 'Yellow',
    ], { default: 'Blue' });

    const quantity = yield io.ask.number('How many?', {
      default: 5,
      min: 1,
      max: 100,
    });

    const file = yield io.ask.file('Select a file:', {
      accept: '*.txt,*.md',
    });

    const date = yield io.ask.date('Pick a date:', {
      includeTime: false,
    });

    const formData = yield io.ask.form('Fill out details:', {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email address' },
        age: { type: 'number', description: 'Your age' },
      },
    });

    yield io.emit.status('All ask types collected!');

    return {
      name,
      secretLength: typeof secret === 'string' ? secret.length : 0,
      confirmed,
      color,
      quantity,
      file: file || 'none',
      date: date || 'none',
      formData: formData || {},
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TEMPLATE (MCP Prompt)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * A code review prompt template
   *
   * Returns a structured prompt for code review assistance.
   *
   * @Template
   * @param language Programming language
   * @param code Code snippet to review
   */
  async review(params: {
    language: string;
    code: string;
  }): Promise<{ messages: Array<{ role: string; content: string }> }> {
    return {
      messages: [
        {
          role: 'user',
          content: `Please review this ${params.language} code:\n\n\`\`\`${params.language}\n${params.code}\n\`\`\`\n\nProvide feedback on style, correctness, and potential improvements.`,
        },
      ],
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // FORMAT ANNOTATIONS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Returns a plain string
   * @format primitive
   */
  async formatPrimitive(): Promise<string> {
    return 'This is a primitive-formatted string result.';
  }

  /**
   * Returns structured JSON data
   * @format json
   */
  async formatJson(): Promise<{ status: string; items: number[]; nested: { ok: boolean } }> {
    return {
      status: 'success',
      items: [1, 2, 3, 4, 5],
      nested: { ok: true },
    };
  }

  /**
   * Returns tabular data
   * @format table
   */
  async formatTable(): Promise<SampleRecord[]> {
    return [
      { id: 1, name: 'Alice', score: 95, active: true },
      { id: 2, name: 'Bob', score: 82, active: true },
      { id: 3, name: 'Charlie', score: 71, active: false },
    ];
  }

  /**
   * Returns markdown content
   * @format markdown
   */
  async formatMarkdown(): Promise<string> {
    return `# Feature Showcase Report

## Summary
All features are operational.

| Feature | Status |
|---------|--------|
| Lifecycle | OK |
| Emits | OK |
| Asks | OK |
| Templates | OK |

> This markdown is rendered by the \`@format markdown\` annotation.
`;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // INSTANCE STATE
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Increment the counter and return current value
   *
   * Proves instance state persists across tool calls.
   */
  async increment(): Promise<{ counter: number }> {
    this.counter++;
    return { counter: this.counter };
  }

  /**
   * Get the current counter value
   */
  async count(): Promise<{ counter: number }> {
    return { counter: this.counter };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PUB/SUB via this.emit()
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Broadcast an event on a named channel
   *
   * @param channel Channel name
   * @param message Message to broadcast
   */
  async broadcast(params: { channel: string; message: string }): Promise<{ sent: boolean; channel: string }> {
    this.emit({
      channel: `feature-showcase:${params.channel}`,
      event: 'broadcast',
      data: { message: params.message, timestamp: new Date().toISOString() },
    });
    return { sent: true, channel: `feature-showcase:${params.channel}` };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS (NOT exposed as tools)
  // ══════════════════════════════════════════════════════════════════════════════

  private _formatResult(label: string, value: any): string {
    return `[${label}] ${JSON.stringify(value)}`;
  }

  _internalHelper(): string {
    return 'not a tool';
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST METHODS - run with: photon test feature-showcase
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Verify onInitialize lifecycle hook ran
   * @internal
   */
  async testLifecycleHooksRan(): Promise<{ passed: boolean; message: string }> {
    if (!this.initializeRan) {
      return { passed: false, message: 'onInitialize did not run — initializeRan is false' };
    }
    if (!this.emitLog.includes('onInitialize')) {
      return { passed: false, message: 'onInitialize not recorded in emitLog' };
    }
    return { passed: true, message: 'onInitialize ran and set flag + logged' };
  }

  /**
   * Verify settings property reads work
   * @internal
   */
  async testSettingsRead(): Promise<{ passed: boolean; message: string }> {
    if (this.settings.theme !== 'auto') {
      return { passed: false, message: `Expected default theme=auto, got ${this.settings.theme}` };
    }
    if (this.settings.maxItems !== 10) {
      return { passed: false, message: `Expected default maxItems=10, got ${this.settings.maxItems}` };
    }
    if (this.settings.verbose !== false) {
      return { passed: false, message: `Expected default verbose=false, got ${this.settings.verbose}` };
    }
    return { passed: true, message: 'settings property reads work with defaults' };
  }

  /**
   * Verify all emit types work in the generator
   * @internal
   */
  async testEmitTypes(): Promise<{ passed: boolean; message: string }> {
    const gen = this.emits();
    const yields: any[] = [];

    let result = await gen.next();
    while (!result.done) {
      yields.push(result.value);
      result = await gen.next();
    }

    const emitTypes = yields
      .filter(y => y && typeof y === 'object' && y.emit)
      .map(y => y.emit);

    const expected = ['status', 'log', 'thinking', 'progress', 'toast', 'progress', 'stream', 'stream', 'stream', 'progress', 'log', 'artifact', 'progress', 'thinking', 'progress', 'status'];

    // Check we got all unique emit types
    const uniqueTypes = new Set(emitTypes);
    const requiredTypes = ['status', 'progress', 'stream', 'log', 'toast', 'thinking', 'artifact'];
    const missing = requiredTypes.filter(t => !uniqueTypes.has(t));

    if (missing.length > 0) {
      return { passed: false, message: `Missing emit types: ${missing.join(', ')}. Got: ${[...uniqueTypes].join(', ')}` };
    }

    if (typeof result.value !== 'string') {
      return { passed: false, message: `Generator return should be string, got ${typeof result.value}` };
    }

    return { passed: true, message: `All 7 emit types present: ${requiredTypes.join(', ')}` };
  }

  /**
   * Verify private methods are not in getToolMethods()
   * @internal
   */
  async testPrivateMethodHidden(): Promise<{ passed: boolean; message: string }> {
    const methods = FeatureShowcasePhoton.getToolMethods();

    if (methods.includes('_formatResult')) {
      return { passed: false, message: '_formatResult should not be in tool methods' };
    }
    if (methods.includes('_internalHelper')) {
      return { passed: false, message: '_internalHelper should not be in tool methods' };
    }
    if (methods.includes('onInitialize')) {
      return { passed: false, message: 'onInitialize should not be in tool methods' };
    }
    if (methods.includes('onShutdown')) {
      return { passed: false, message: 'onShutdown should not be in tool methods' };
    }
    // Note: configure/getConfig exclusion depends on the runtime's schema extractor
    // which filters them during tool listing. getToolMethods() on a dynamically
    // loaded class may include them depending on prototype chain resolution.

    // Positive check: public methods should be present
    if (!methods.includes('increment')) {
      return { passed: false, message: 'increment should be in tool methods' };
    }
    if (!methods.includes('formatTable')) {
      return { passed: false, message: 'formatTable should be in tool methods' };
    }

    return { passed: true, message: 'Private and lifecycle methods hidden; public methods visible' };
  }

  /**
   * Verify instance state persists across calls
   * @internal
   */
  async testInstanceState(): Promise<{ passed: boolean; message: string }> {
    // Reset
    this.counter = 0;

    const r1 = await this.increment();
    const r2 = await this.increment();

    if (r1.counter !== 1) {
      return { passed: false, message: `First increment should be 1, got ${r1.counter}` };
    }
    if (r2.counter !== 2) {
      return { passed: false, message: `Second increment should be 2, got ${r2.counter}` };
    }

    const r3 = await this.count();
    if (r3.counter !== 2) {
      return { passed: false, message: `count() should return 2, got ${r3.counter}` };
    }

    // Reset
    this.counter = 0;
    return { passed: true, message: 'Counter increments persist: 0 -> 1 -> 2' };
  }

  /**
   * Verify format annotation methods return correct types
   * @internal
   */
  async testFormatAnnotations(): Promise<{ passed: boolean; message: string }> {
    const primitive = await this.formatPrimitive();
    if (typeof primitive !== 'string') {
      return { passed: false, message: `formatPrimitive should return string, got ${typeof primitive}` };
    }

    const json = await this.formatJson();
    if (!json.status || !Array.isArray(json.items)) {
      return { passed: false, message: 'formatJson should return object with status and items array' };
    }

    const table = await this.formatTable();
    if (!Array.isArray(table) || table.length !== 3) {
      return { passed: false, message: `formatTable should return array of 3, got ${table.length}` };
    }

    const md = await this.formatMarkdown();
    if (!md.includes('# Feature Showcase')) {
      return { passed: false, message: 'formatMarkdown should return markdown with heading' };
    }

    return { passed: true, message: 'All format types return correct data shapes' };
  }

  /**
   * Verify template method returns prompt structure
   * @internal
   */
  async testTemplateMethod(): Promise<{ passed: boolean; message: string }> {
    const result = await this.review({ language: 'typescript', code: 'const x = 1;' });

    if (!result.messages || !Array.isArray(result.messages)) {
      return { passed: false, message: 'Template should return { messages: [...] }' };
    }
    if (result.messages.length !== 1) {
      return { passed: false, message: `Expected 1 message, got ${result.messages.length}` };
    }
    if (!result.messages[0].content.includes('typescript')) {
      return { passed: false, message: 'Template message should contain language name' };
    }

    return { passed: true, message: 'Template returns structured prompt with messages array' };
  }

  /**
   * Verify broadcast sends to channel
   * @internal
   */
  async testBroadcast(): Promise<{ passed: boolean; message: string }> {
    const result = await this.broadcast({ channel: 'test', message: 'hello' });

    if (!result.sent) {
      return { passed: false, message: 'broadcast should return sent=true' };
    }
    if (result.channel !== 'feature-showcase:test') {
      return { passed: false, message: `Expected channel feature-showcase:test, got ${result.channel}` };
    }

    return { passed: true, message: 'Broadcast returns confirmation with namespaced channel' };
  }
}
