/**
 * Code Diagram - Generate Mermaid diagrams from TypeScript/JavaScript code
 *
 * Visualize any code as flowcharts, API surfaces, dependency graphs, or call graphs.
 * Works on raw code strings or files - no AI required, pure static analysis.
 *
 * @name code-diagram
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import * as fs from 'fs/promises';

type DiagramType = 'auto' | 'workflow' | 'api' | 'deps' | 'calls';

interface YieldStatement {
  type: 'ask' | 'emit';
  subtype: string;
  message?: string;
  variable?: string;
}

interface MethodInfo {
  name: string;
  isGenerator: boolean;
  isAsync: boolean;
  params: string[];
}

interface ImportInfo {
  source: string;
  imports: string[];
  isDefault: boolean;
}

interface CallInfo {
  caller: string;
  callee: string;
  method?: string;
}

export default class CodeDiagram {
  /**
   * Generate a Mermaid diagram from code string
   *
   * @param code The TypeScript/JavaScript code to analyze
   * @param type Diagram type: 'auto' | 'workflow' | 'api' | 'deps' | 'calls' (default: 'auto')
   * @param name Optional name for the diagram (default: 'Code')
   */
  async generate(params: {
    code: string;
    type?: DiagramType;
    name?: string;
  }): Promise<{ diagram: string; detectedType: string }> {
    const { code, type = 'auto', name = 'Code' } = params;

    const detectedType = type === 'auto' ? this.detectType(code) : type;

    let diagram: string;
    switch (detectedType) {
      case 'workflow':
        diagram = this.generateWorkflowDiagram(code, name);
        break;
      case 'deps':
        diagram = this.generateDepsDiagram(code, name);
        break;
      case 'calls':
        diagram = this.generateCallsDiagram(code, name);
        break;
      case 'api':
      default:
        diagram = this.generateApiDiagram(code, name);
        break;
    }

    return { diagram, detectedType };
  }

  /**
   * Generate a Mermaid diagram from a file
   *
   * @param path Path to the TypeScript/JavaScript file
   * @param type Diagram type: 'auto' | 'workflow' | 'api' | 'deps' | 'calls' (default: 'auto')
   */
  async fromFile(params: {
    path: string;
    type?: DiagramType;
  }): Promise<{ diagram: string; detectedType: string; name: string }> {
    const { path, type = 'auto' } = params;

    const code = await fs.readFile(path, 'utf-8');
    const name = this.extractName(path, code);

    const result = await this.generate({ code, type, name });
    return { ...result, name };
  }

  /**
   * List available diagram types with descriptions
   */
  async types(): Promise<{ types: Array<{ name: string; description: string; bestFor: string }> }> {
    return {
      types: [
        {
          name: 'auto',
          description: 'Automatically detect the best diagram type',
          bestFor: 'When you\'re not sure which type to use',
        },
        {
          name: 'workflow',
          description: 'Flowchart showing execution flow with decision points',
          bestFor: 'Async generators, state machines, multi-step processes',
        },
        {
          name: 'api',
          description: 'API surface diagram showing available methods',
          bestFor: 'Classes, modules, service interfaces',
        },
        {
          name: 'deps',
          description: 'Dependency graph showing imports and modules',
          bestFor: 'Understanding module dependencies, refactoring',
        },
        {
          name: 'calls',
          description: 'Call graph showing function relationships',
          bestFor: 'Understanding code flow, finding dead code',
        },
      ],
    };
  }

  // ============================================
  // TYPE DETECTION
  // ============================================

  private detectType(code: string): DiagramType {
    // Check for workflow patterns (ask/emit yields)
    if (/yield\s*\{\s*(ask|emit)\s*:/.test(code)) {
      return 'workflow';
    }

    // Check for async generators
    if (/async\s+\*\s*\w+/.test(code)) {
      return 'workflow';
    }

    // Check if it's mostly imports (dependency-focused)
    const importCount = (code.match(/^import\s+/gm) || []).length;
    const totalLines = code.split('\n').filter(l => l.trim()).length;
    if (importCount > totalLines * 0.3) {
      return 'deps';
    }

    // Check for class with methods (API surface)
    if (/class\s+\w+/.test(code) && /async\s+\w+\s*\(/.test(code)) {
      return 'api';
    }

    // Check for multiple function definitions (call graph)
    const functionCount = (code.match(/(?:async\s+)?function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(/g) || []).length;
    if (functionCount >= 3) {
      return 'calls';
    }

    // Default to API
    return 'api';
  }

  // ============================================
  // DIAGRAM GENERATORS
  // ============================================

  private generateWorkflowDiagram(code: string, name: string): string {
    const yields = this.extractYields(code);
    const externalCalls = this.extractExternalCalls(code);
    const lines: string[] = ['flowchart TD'];

    lines.push(`    subgraph ${this.sanitizeId(name)}["📦 ${this.titleCase(name)}"]`);
    lines.push('        START([▶ Start])');

    let prevNode = 'START';
    let nodeCounter = 0;

    // Process yields
    for (const y of yields) {
      const nodeId = `N${nodeCounter++}`;

      if (y.type === 'emit') {
        const emoji = this.getEmitEmoji(y.subtype);
        const msg = y.message ? this.truncate(y.message, 30) : y.subtype;
        lines.push(`        ${nodeId}[${emoji} ${msg}]`);
        lines.push(`        ${prevNode} --> ${nodeId}`);
        prevNode = nodeId;
      } else if (y.type === 'ask') {
        const emoji = this.getAskEmoji(y.subtype);
        const msg = y.message ? this.truncate(y.message, 25) : y.subtype;
        lines.push(`        ${nodeId}{${emoji} ${msg}}`);
        lines.push(`        ${prevNode} --> ${nodeId}`);

        if (y.subtype === 'confirm') {
          const cancelId = `N${nodeCounter++}`;
          const continueId = `N${nodeCounter++}`;
          lines.push(`        ${cancelId}([❌ Cancelled])`);
          lines.push(`        ${nodeId} -->|No| ${cancelId}`);
          lines.push(`        ${nodeId} -->|Yes| ${continueId}`);
          lines.push(`        ${continueId}[Continue]`);
          prevNode = continueId;
        } else {
          prevNode = nodeId;
        }
      }
    }

    // Add external calls
    for (const call of externalCalls) {
      const nodeId = `N${nodeCounter++}`;
      const emoji = call.type === 'mcp' ? '🔌' : '📦';
      lines.push(`        ${nodeId}[${emoji} ${call.name}.${call.method}]`);
      lines.push(`        ${prevNode} --> ${nodeId}`);
      prevNode = nodeId;
    }

    // End node
    lines.push(`        SUCCESS([✅ Success])`);
    lines.push(`        ${prevNode} --> SUCCESS`);
    lines.push('    end');

    return lines.join('\n');
  }

  private generateApiDiagram(code: string, name: string): string {
    const methods = this.extractMethods(code);
    const lines: string[] = ['flowchart LR'];

    lines.push(`    subgraph ${this.sanitizeId(name)}["📦 ${this.titleCase(name)}"]`);
    lines.push('        direction TB');
    lines.push('        CORE((🎯))');

    methods.forEach((method, i) => {
      const emoji = method.isGenerator ? '🌊' : this.inferEmoji(method.name);
      const suffix = method.isGenerator ? ' (stream)' : '';
      const id = `M${i}`;
      lines.push(`        ${id}[${emoji} ${method.name}${suffix}]`);
      lines.push(`        CORE --> ${id}`);
    });

    lines.push('    end');

    // Add imports as dependencies
    const imports = this.extractImports(code);
    const externalImports = imports.filter(i => !i.source.startsWith('.'));

    if (externalImports.length > 0) {
      lines.push('');
      lines.push('    subgraph deps["Dependencies"]');
      lines.push('        direction TB');
      externalImports.forEach((imp, i) => {
        const pkg = imp.source.replace(/^@/, '').split('/')[0];
        lines.push(`        DEP${i}[📚 ${pkg}]`);
      });
      lines.push('    end');
    }

    return lines.join('\n');
  }

  private generateDepsDiagram(code: string, name: string): string {
    const imports = this.extractImports(code);
    const lines: string[] = ['flowchart TD'];

    lines.push(`    MAIN[📦 ${this.titleCase(name)}]`);
    lines.push('');

    // Group imports by type
    const nodeModules = imports.filter(i => !i.source.startsWith('.'));
    const localModules = imports.filter(i => i.source.startsWith('.'));

    if (nodeModules.length > 0) {
      lines.push('    subgraph npm["📚 NPM Packages"]');
      nodeModules.forEach((imp, i) => {
        const pkg = imp.source.replace(/['"]/g, '');
        lines.push(`        NPM${i}[${pkg}]`);
      });
      lines.push('    end');
      lines.push('');
      nodeModules.forEach((_, i) => {
        lines.push(`    MAIN --> NPM${i}`);
      });
    }

    if (localModules.length > 0) {
      lines.push('');
      lines.push('    subgraph local["📁 Local Modules"]');
      localModules.forEach((imp, i) => {
        const modName = imp.source.replace(/^\.\//, '').replace(/\.[jt]sx?$/, '');
        lines.push(`        LOCAL${i}[${modName}]`);
      });
      lines.push('    end');
      lines.push('');
      localModules.forEach((_, i) => {
        lines.push(`    MAIN --> LOCAL${i}`);
      });
    }

    return lines.join('\n');
  }

  private generateCallsDiagram(code: string, name: string): string {
    const calls = this.extractCalls(code);
    const methods = this.extractMethods(code);
    const lines: string[] = ['flowchart TD'];

    lines.push(`    subgraph ${this.sanitizeId(name)}["📦 ${this.titleCase(name)}"]`);

    // Add all methods as nodes
    const methodSet = new Set<string>();
    methods.forEach(m => methodSet.add(m.name));

    methods.forEach((method) => {
      const emoji = this.inferEmoji(method.name);
      lines.push(`        ${this.sanitizeId(method.name)}[${emoji} ${method.name}]`);
    });

    lines.push('    end');

    // Add call relationships
    lines.push('');
    for (const call of calls) {
      if (methodSet.has(call.caller) && methodSet.has(call.callee)) {
        lines.push(`    ${this.sanitizeId(call.caller)} --> ${this.sanitizeId(call.callee)}`);
      }
    }

    return lines.join('\n');
  }

  // ============================================
  // EXTRACTORS
  // ============================================

  private extractYields(code: string): YieldStatement[] {
    const yields: YieldStatement[] = [];
    const yieldRegex = /(?:const\s+(\w+)\s*(?::\s*\w+)?\s*=\s*)?yield\s*\{\s*(ask|emit)\s*:\s*['"](\w+)['"]\s*(?:,\s*message\s*:\s*[`'"]([^`'"]*)[`'"])?/g;

    let match;
    while ((match = yieldRegex.exec(code)) !== null) {
      yields.push({
        variable: match[1],
        type: match[2] as 'ask' | 'emit',
        subtype: match[3],
        message: match[4],
      });
    }

    return yields;
  }

  private extractExternalCalls(code: string): Array<{ type: 'mcp' | 'photon'; name: string; method: string }> {
    const calls: Array<{ type: 'mcp' | 'photon'; name: string; method: string }> = [];

    // MCP calls
    const mcpRegex = /this\.mcp\(['"](\w+)['"]\)\.(\w+)/g;
    let match;
    while ((match = mcpRegex.exec(code)) !== null) {
      calls.push({ type: 'mcp', name: match[1], method: match[2] });
    }

    // Photon calls
    const photonRegex = /this\.photon\(['"](\w+)['"]\)\.(\w+)/g;
    while ((match = photonRegex.exec(code)) !== null) {
      calls.push({ type: 'photon', name: match[1], method: match[2] });
    }

    return calls;
  }

  private extractMethods(code: string): MethodInfo[] {
    const methods: MethodInfo[] = [];

    // Reserved words that look like function calls but aren't methods
    const reserved = new Set([
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'try', 'catch',
      'finally', 'throw', 'return', 'break', 'continue', 'new', 'typeof',
      'instanceof', 'in', 'of', 'with', 'function', 'class', 'extends',
      'import', 'export', 'default', 'await', 'yield', 'async', 'static',
      'get', 'set', 'let', 'const', 'var', 'this', 'super', 'delete', 'void',
    ]);

    // Match class methods: async methodName(...) or async *methodName(...)
    // Must be preceded by whitespace/newline (not part of another word)
    const methodRegex = /(?:^|[\s\n])(?:(async)\s+)?(\*?)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{/gm;

    let match;
    while ((match = methodRegex.exec(code)) !== null) {
      const name = match[3];

      // Skip reserved words, constructors, private methods, and lifecycle methods
      if (reserved.has(name) ||
          name === 'constructor' ||
          name.startsWith('_') ||
          name === 'onInitialize' ||
          name === 'onShutdown') {
        continue;
      }

      methods.push({
        name,
        isAsync: !!match[1],
        isGenerator: match[2] === '*',
        params: match[4].split(',').map(p => p.trim()).filter(Boolean),
      });
    }

    // Deduplicate by name (keep first occurrence)
    const seen = new Set<string>();
    return methods.filter(m => {
      if (seen.has(m.name)) return false;
      seen.add(m.name);
      return true;
    });
  }

  private extractImports(code: string): ImportInfo[] {
    const imports: ImportInfo[] = [];

    // ES6 imports
    const importRegex = /import\s+(?:(\w+)|(?:\{([^}]+)\})|(?:(\w+)\s*,\s*\{([^}]+)\}))\s+from\s+['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const source = match[5];
      const defaultImport = match[1] || match[3];
      const namedImports = (match[2] || match[4] || '').split(',').map(s => s.trim()).filter(Boolean);

      imports.push({
        source,
        imports: defaultImport ? [defaultImport, ...namedImports] : namedImports,
        isDefault: !!defaultImport,
      });
    }

    // require() calls
    const requireRegex = /(?:const|let|var)\s+(?:(\w+)|(?:\{([^}]+)\}))\s*=\s*require\s*\(['"]([^'"]+)['"]\)/g;
    while ((match = requireRegex.exec(code)) !== null) {
      imports.push({
        source: match[3],
        imports: match[1] ? [match[1]] : match[2].split(',').map(s => s.trim()),
        isDefault: !!match[1],
      });
    }

    return imports;
  }

  private extractCalls(code: string): CallInfo[] {
    const calls: CallInfo[] = [];
    const methods = this.extractMethods(code);
    const methodNames = new Set(methods.map(m => m.name));

    // For each method, find calls to other methods
    for (const method of methods) {
      // Find the method body
      const methodPattern = new RegExp(
        `(?:async\\s+)?\\*?\\s*${method.name}\\s*\\([^)]*\\)[^{]*\\{`,
        'g'
      );

      const methodMatch = methodPattern.exec(code);
      if (!methodMatch) continue;

      const startIndex = methodMatch.index + methodMatch[0].length;
      let depth = 1;
      let endIndex = startIndex;

      // Find matching closing brace
      for (let i = startIndex; i < code.length && depth > 0; i++) {
        if (code[i] === '{') depth++;
        else if (code[i] === '}') depth--;
        endIndex = i;
      }

      const methodBody = code.slice(startIndex, endIndex);

      // Find calls to other methods
      for (const otherMethod of methodNames) {
        if (otherMethod !== method.name) {
          const callPattern = new RegExp(`\\b${otherMethod}\\s*\\(`, 'g');
          if (callPattern.test(methodBody)) {
            calls.push({
              caller: method.name,
              callee: otherMethod,
            });
          }
        }
      }
    }

    return calls;
  }

  // ============================================
  // HELPERS
  // ============================================

  private extractName(path: string, code: string): string {
    // Try to get name from @name tag
    const nameMatch = code.match(/@name\s+(\S+)/);
    if (nameMatch) return nameMatch[1];

    // Fall back to filename
    return path.split(/[\/\\]/).pop()?.replace(/\.(photon\.)?[jt]sx?$/, '') || 'Code';
  }

  private inferEmoji(name: string): string {
    const lower = name.toLowerCase();
    if (/^(read|get|fetch|load|find|query|search|list)/.test(lower)) return '📖';
    if (/^(write|create|save|put|add|insert|set)/.test(lower)) return '✏️';
    if (/^(delete|remove|drop|clear)/.test(lower)) return '🗑️';
    if (/^(send|post|push|publish|notify)/.test(lower)) return '📤';
    if (/^(update|modify|patch|edit)/.test(lower)) return '🔄';
    if (/^(validate|check|verify|test)/.test(lower)) return '✅';
    if (/^(config|setup|init)/.test(lower)) return '⚙️';
    if (/^(run|execute|start|begin)/.test(lower)) return '▶️';
    if (/^(stop|cancel|abort|end)/.test(lower)) return '⏹️';
    if (/^(connect|login|auth)/.test(lower)) return '🔌';
    if (/^(download|export)/.test(lower)) return '📥';
    if (/^(upload|import)/.test(lower)) return '📤';
    if (/^(generate|build|compile)/.test(lower)) return '🏗️';
    if (/^(parse|analyze|extract)/.test(lower)) return '🔍';
    if (/^(format|transform|convert)/.test(lower)) return '🔄';
    return '🔧';
  }

  private getAskEmoji(subtype: string): string {
    switch (subtype) {
      case 'confirm': return '🙋';
      case 'select': return '📋';
      case 'text': return '✏️';
      case 'number': return '🔢';
      case 'password': return '🔒';
      case 'date': return '📅';
      case 'file': return '📁';
      default: return '❓';
    }
  }

  private getEmitEmoji(subtype: string): string {
    switch (subtype) {
      case 'status': return '📢';
      case 'progress': return '⏳';
      case 'log': return '📝';
      case 'toast': return '🎉';
      case 'thinking': return '🧠';
      case 'artifact': return '📊';
      case 'stream': return '💬';
      default: return '📣';
    }
  }

  private sanitizeId(str: string): string {
    return str.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private titleCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 3) + '...';
  }
}
