/**
 * External tests for feature-showcase.photon.ts
 *
 * Run with: photon test feature-showcase
 */

export async function testLifecycleHooksRan(photon: any): Promise<{ passed: boolean; message: string }> {
  if (!photon.initializeRan) {
    return { passed: false, message: 'onInitialize did not run — initializeRan is false' };
  }
  if (!photon.emitLog.includes('onInitialize')) {
    return { passed: false, message: 'onInitialize not recorded in emitLog' };
  }
  return { passed: true, message: 'onInitialize ran and set flag + logged' };
}

export async function testSettingsRead(photon: any): Promise<{ passed: boolean; message: string }> {
  if (photon.settings.theme !== 'auto') {
    return { passed: false, message: `Expected default theme=auto, got ${photon.settings.theme}` };
  }
  if (photon.settings.maxItems !== 10) {
    return { passed: false, message: `Expected default maxItems=10, got ${photon.settings.maxItems}` };
  }
  if (photon.settings.verbose !== false) {
    return { passed: false, message: `Expected default verbose=false, got ${photon.settings.verbose}` };
  }
  return { passed: true, message: 'settings property reads work with defaults' };
}

export async function testEmitTypes(photon: any): Promise<{ passed: boolean; message: string }> {
  const gen = photon.emits();
  const yields: any[] = [];

  let result = await gen.next();
  while (!result.done) {
    yields.push(result.value);
    result = await gen.next();
  }

  const emitTypes = yields
    .filter((y: any) => y && typeof y === 'object' && y.emit)
    .map((y: any) => y.emit);

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

export async function testPrivateMethodHidden(photon: any): Promise<{ passed: boolean; message: string }> {
  const methods = photon.constructor.getToolMethods();

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

  // Positive check: public methods should be present
  if (!methods.includes('increment')) {
    return { passed: false, message: 'increment should be in tool methods' };
  }
  if (!methods.includes('formatTable')) {
    return { passed: false, message: 'formatTable should be in tool methods' };
  }

  return { passed: true, message: 'Private and lifecycle methods hidden; public methods visible' };
}

export async function testInstanceState(photon: any): Promise<{ passed: boolean; message: string }> {
  // Reset
  (photon as any).counter = 0;

  const r1 = await photon.increment();
  const r2 = await photon.increment();

  if (r1.counter !== 1) {
    return { passed: false, message: `First increment should be 1, got ${r1.counter}` };
  }
  if (r2.counter !== 2) {
    return { passed: false, message: `Second increment should be 2, got ${r2.counter}` };
  }

  const r3 = await photon.count();
  if (r3.counter !== 2) {
    return { passed: false, message: `count() should return 2, got ${r3.counter}` };
  }

  // Reset
  (photon as any).counter = 0;
  return { passed: true, message: 'Counter increments persist: 0 -> 1 -> 2' };
}

export async function testFormatAnnotations(photon: any): Promise<{ passed: boolean; message: string }> {
  const primitive = await photon.formatPrimitive();
  if (typeof primitive !== 'string') {
    return { passed: false, message: `formatPrimitive should return string, got ${typeof primitive}` };
  }

  const json = await photon.formatJson();
  if (!json.status || !Array.isArray(json.items)) {
    return { passed: false, message: 'formatJson should return object with status and items array' };
  }

  const table = await photon.formatTable();
  if (!Array.isArray(table) || table.length !== 3) {
    return { passed: false, message: `formatTable should return array of 3, got ${table.length}` };
  }

  const md = await photon.formatMarkdown();
  if (!md.includes('# Feature Showcase')) {
    return { passed: false, message: 'formatMarkdown should return markdown with heading' };
  }

  return { passed: true, message: 'All format types return correct data shapes' };
}

export async function testTemplateMethod(photon: any): Promise<{ passed: boolean; message: string }> {
  const result = await photon.review({ language: 'typescript', code: 'const x = 1;' });

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

export async function testBroadcast(photon: any): Promise<{ passed: boolean; message: string }> {
  const result = await photon.broadcast({ channel: 'test', message: 'hello' });

  if (!result.sent) {
    return { passed: false, message: 'broadcast should return sent=true' };
  }
  if (result.channel !== 'feature-showcase:test') {
    return { passed: false, message: `Expected channel feature-showcase:test, got ${result.channel}` };
  }

  return { passed: true, message: 'Broadcast returns confirmation with namespaced channel' };
}
