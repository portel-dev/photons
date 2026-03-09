// Tests for feature-showcase.photon.ts

export async function testLifecycleHooksRan(photon: any) {
  if (!(photon as any).initializeRan) {
    throw new Error('onInitialize did not run — initializeRan is false');
  }
  if (!(photon as any).emitLog.includes('onInitialize')) {
    throw new Error('onInitialize not recorded in emitLog');
  }
}

export async function testSettingsRead(photon: any) {
  const settings = (photon as any).settings;
  if (settings.theme !== 'auto') {
    throw new Error(`Expected default theme=auto, got ${settings.theme}`);
  }
  if (settings.maxItems !== 10) {
    throw new Error(`Expected default maxItems=10, got ${settings.maxItems}`);
  }
  if (settings.verbose !== false) {
    throw new Error(`Expected default verbose=false, got ${settings.verbose}`);
  }
}

export async function testEmitTypes(photon: any) {
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

  const uniqueTypes = new Set(emitTypes);
  const requiredTypes = ['status', 'progress', 'stream', 'log', 'toast', 'thinking', 'artifact'];
  const missing = requiredTypes.filter(t => !uniqueTypes.has(t));

  if (missing.length > 0) {
    throw new Error(`Missing emit types: ${missing.join(', ')}. Got: ${[...uniqueTypes].join(', ')}`);
  }

  if (typeof result.value !== 'string') {
    throw new Error(`Generator return should be string, got ${typeof result.value}`);
  }
}

export async function testPrivateMethodHidden(photon: any) {
  const methods = photon.constructor.getToolMethods();

  if (methods.includes('_formatResult')) {
    throw new Error('_formatResult should not be in tool methods');
  }
  if (methods.includes('_internalHelper')) {
    throw new Error('_internalHelper should not be in tool methods');
  }
  if (methods.includes('onInitialize')) {
    throw new Error('onInitialize should not be in tool methods');
  }
  if (methods.includes('onShutdown')) {
    throw new Error('onShutdown should not be in tool methods');
  }

  if (!methods.includes('increment')) {
    throw new Error('increment should be in tool methods');
  }
  if (!methods.includes('formatTable')) {
    throw new Error('formatTable should be in tool methods');
  }
}

export async function testInstanceState(photon: any) {
  (photon as any).counter = 0;

  const r1 = await photon.increment();
  const r2 = await photon.increment();

  if (r1.counter !== 1) {
    throw new Error(`First increment should be 1, got ${r1.counter}`);
  }
  if (r2.counter !== 2) {
    throw new Error(`Second increment should be 2, got ${r2.counter}`);
  }

  const r3 = await photon.count();
  if (r3.counter !== 2) {
    throw new Error(`count() should return 2, got ${r3.counter}`);
  }

  (photon as any).counter = 0;
}

export async function testFormatAnnotations(photon: any) {
  const primitive = await photon.formatPrimitive();
  if (typeof primitive !== 'string') {
    throw new Error(`formatPrimitive should return string, got ${typeof primitive}`);
  }

  const json = await photon.formatJson();
  if (!json.status || !Array.isArray(json.items)) {
    throw new Error('formatJson should return object with status and items array');
  }

  const table = await photon.formatTable();
  if (!Array.isArray(table) || table.length !== 3) {
    throw new Error(`formatTable should return array of 3, got ${table.length}`);
  }

  const md = await photon.formatMarkdown();
  if (!md.includes('# Feature Showcase')) {
    throw new Error('formatMarkdown should return markdown with heading');
  }
}

export async function testTemplateMethod(photon: any) {
  const result = await photon.review({ language: 'typescript', code: 'const x = 1;' });

  if (!result.messages || !Array.isArray(result.messages)) {
    throw new Error('Template should return { messages: [...] }');
  }
  if (result.messages.length !== 1) {
    throw new Error(`Expected 1 message, got ${result.messages.length}`);
  }
  if (!result.messages[0].content.includes('typescript')) {
    throw new Error('Template message should contain language name');
  }
}

export async function testBroadcast(photon: any) {
  const result = await photon.broadcast({ channel: 'test', message: 'hello' });

  if (!result.sent) {
    throw new Error('broadcast should return sent=true');
  }
  if (result.channel !== 'feature-showcase:test') {
    throw new Error(`Expected channel feature-showcase:test, got ${result.channel}`);
  }
}
