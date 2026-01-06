/**
 * Kitchen Sink Photon
 *
 * Demonstrates every feature of the Photon runtime with meaningfully named functions.
 * Use this as a reference for building your own photons.
 *
 * @version 1.0.0
 * @dependencies @portel/photon-core@latest
 */

import { PhotonMCP } from '@portel/photon-core';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ════════════════════════════════════════════════════════════════════════════════

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// PHOTON CLASS
// ════════════════════════════════════════════════════════════════════════════════

export default class KitchenSinkPhoton extends PhotonMCP {
  private users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'guest' },
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  // CONSTRUCTOR PARAMETERS (Environment Variables)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Constructor parameters become environment variables in MCP config.
   * They're injected when the photon is instantiated.
   *
   * @param apiKey - Your API key (required) - becomes KITCHEN_SINK_API_KEY env var
   * @param baseUrl - API base URL (optional with default) - becomes KITCHEN_SINK_BASE_URL
   * @param debug - Enable debug mode (optional) - becomes KITCHEN_SINK_DEBUG
   */
  constructor(
    private apiKey: string = '<your-api-key>',
    private baseUrl: string = 'https://api.example.com',
    private debug: boolean = false
  ) {
    super();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // BASIC TOOLS - Different Return Types
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Returns a simple string
   *
   * Demonstrates the simplest tool - no parameters, returns a string.
   */
  async basicStringReturn(): Promise<string> {
    return 'Hello from Kitchen Sink Photon!';
  }

  /**
   * Returns a number
   *
   * Tools can return any JSON-serializable type.
   */
  async basicNumberReturn(): Promise<number> {
    return 42;
  }

  /**
   * Returns a boolean
   */
  async basicBooleanReturn(): Promise<boolean> {
    return true;
  }

  /**
   * Returns an object
   *
   * Complex objects are automatically serialized to JSON.
   */
  async basicObjectReturn(): Promise<{ message: string; timestamp: string; nested: { value: number } }> {
    return {
      message: 'Object response',
      timestamp: new Date().toISOString(),
      nested: { value: 123 }
    };
  }

  /**
   * Returns an array
   */
  async basicArrayReturn(): Promise<string[]> {
    return ['apple', 'banana', 'cherry'];
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PARAMETER TYPES - All Supported Input Types
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Demonstrates string parameter
   *
   * @param message The message to echo back
   */
  async paramString(params: { message: string }): Promise<string> {
    return `You said: ${params.message}`;
  }

  /**
   * Demonstrates number parameter
   *
   * @param value A numeric value to double
   */
  async paramNumber(params: { value: number }): Promise<number> {
    return params.value * 2;
  }

  /**
   * Demonstrates boolean parameter
   *
   * @param enabled Whether the feature is enabled
   */
  async paramBoolean(params: { enabled: boolean }): Promise<string> {
    return params.enabled ? 'Feature is ON' : 'Feature is OFF';
  }

  /**
   * Demonstrates enum parameter (string literals)
   *
   * @param level Log level to use
   */
  async paramEnum(params: { level: 'debug' | 'info' | 'warn' | 'error' }): Promise<string> {
    return `Logging at ${params.level.toUpperCase()} level`;
  }

  /**
   * Demonstrates optional parameter with default
   *
   * @param name Name to greet (optional, defaults to "World")
   * @param excited Add exclamation marks
   */
  async paramOptional(params: { name?: string; excited?: boolean }): Promise<string> {
    const name = params.name || 'World';
    const punctuation = params.excited ? '!!!' : '.';
    return `Hello, ${name}${punctuation}`;
  }

  /**
   * Demonstrates array parameter
   *
   * @param items List of items to process
   */
  async paramArray(params: { items: string[] }): Promise<string> {
    return `Received ${params.items.length} items: ${params.items.join(', ')}`;
  }

  /**
   * Demonstrates object parameter
   *
   * @param user User object with name and age
   */
  async paramObject(params: { user: { name: string; age: number } }): Promise<string> {
    return `User ${params.user.name} is ${params.user.age} years old`;
  }

  /**
   * Demonstrates multiple required parameters
   *
   * @param firstName First name (required)
   * @param lastName Last name (required)
   * @param age Age (required)
   */
  async paramMultipleRequired(params: {
    firstName: string;
    lastName: string;
    age: number;
  }): Promise<string> {
    return `${params.firstName} ${params.lastName}, age ${params.age}`;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // STREAMING - Async Generators
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Streams text word by word
   *
   * Async generators enable streaming responses. Each yield sends a chunk to the client.
   */
  async *streamingText(): AsyncGenerator<string> {
    const words = ['This', 'is', 'a', 'streaming', 'response', 'from', 'Photon!'];
    for (const word of words) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  /**
   * Streams numbered items
   *
   * @param count Number of items to stream
   */
  async *streamingNumbers(params: { count: number }): AsyncGenerator<string> {
    for (let i = 1; i <= params.count; i++) {
      yield `Item ${i} of ${params.count}\n`;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Streams JSON objects
   *
   * You can stream structured data too - each yield is a complete chunk.
   */
  async *streamingObjects(): AsyncGenerator<string> {
    const events = [
      { type: 'start', timestamp: Date.now() },
      { type: 'processing', progress: 50 },
      { type: 'complete', result: 'success' },
    ];

    for (const event of events) {
      yield JSON.stringify(event) + '\n';
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // IN-MEMORY STATE (Instance Level)
  // ══════════════════════════════════════════════════════════════════════════════

  private counter = 0;
  private todoList: string[] = [];

  /**
   * Simple counter with in-memory state
   *
   * State persists during the server session but resets on restart.
   *
   * @param action What to do with the counter
   */
  async memoryCounter(params: { action: 'increment' | 'decrement' | 'reset' | 'get' }): Promise<{ count: number; action: string }> {
    switch (params.action) {
      case 'increment':
        this.counter++;
        break;
      case 'decrement':
        this.counter--;
        break;
      case 'reset':
        this.counter = 0;
        break;
      case 'get':
        break;
    }
    return { count: this.counter, action: params.action };
  }

  /**
   * In-memory todo list
   *
   * @param action What to do
   * @param item Item to add or remove
   */
  async memoryTodoList(params: { action: 'add' | 'remove' | 'list' | 'clear'; item?: string }): Promise<{ todos: string[]; message: string }> {
    let message = '';

    switch (params.action) {
      case 'add':
        if (params.item) {
          this.todoList.push(params.item);
          message = `Added: ${params.item}`;
        }
        break;
      case 'remove':
        if (params.item) {
          const index = this.todoList.indexOf(params.item);
          if (index > -1) {
            this.todoList.splice(index, 1);
            message = `Removed: ${params.item}`;
          }
        }
        break;
      case 'list':
        message = `${this.todoList.length} items`;
        break;
      case 'clear':
        this.todoList = [];
        message = 'List cleared';
        break;
    }

    return { todos: [...this.todoList], message };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // UI TEMPLATES - Linked Visual Outputs
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Get all users with visual card display
   *
   * Returns data for the users UI template.
   *
   * @ui users
   */
  async uiGetUsers(): Promise<User[]> {
    return this.users;
  }

  /**
   * Get dashboard metrics
   *
   * Returns data for the dashboard UI template.
   *
   * @ui dashboard
   */
  async uiGetDashboard(): Promise<{
    totalUsers: number;
    byRole: Record<string, number>;
    recentActivity: string[];
  }> {
    const byRole: Record<string, number> = {};
    for (const user of this.users) {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
    }

    return {
      totalUsers: this.users.length,
      byRole,
      recentActivity: [
        'User Alice logged in',
        'User Bob updated profile',
        'New user Charlie registered'
      ]
    };
  }

  /**
   * Search results with rich display
   *
   * @ui search-results
   * @param query Search query string
   */
  async uiSearch(params: { query: string }): Promise<SearchResult[]> {
    // Simulated search results
    return [
      {
        title: `Result 1 for "${params.query}"`,
        url: 'https://example.com/1',
        snippet: 'This is the first search result snippet...'
      },
      {
        title: `Result 2 for "${params.query}"`,
        url: 'https://example.com/2',
        snippet: 'This is the second search result snippet...'
      },
      {
        title: `Result 3 for "${params.query}"`,
        url: 'https://example.com/3',
        snippet: 'This is the third search result snippet...'
      }
    ];
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Demonstrates proper error handling
   *
   * Thrown errors are caught and returned as MCP error responses.
   *
   * @param shouldFail Whether to simulate a failure
   */
  async errorHandlingDemo(params: { shouldFail: boolean }): Promise<string> {
    if (params.shouldFail) {
      throw new Error('Intentional error for demonstration purposes');
    }
    return 'Operation completed successfully!';
  }

  /**
   * Demonstrates validation errors
   *
   * @param value Must be between 1 and 100
   */
  async errorValidation(params: { value: number }): Promise<string> {
    if (params.value < 1 || params.value > 100) {
      throw new Error('Value must be between 1 and 100');
    }
    return `Valid value: ${params.value}`;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ENVIRONMENT & CONFIG ACCESS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Shows current configuration
   *
   * Demonstrates accessing constructor parameters (env vars).
   */
  async showConfig(): Promise<{ apiKeySet: boolean; baseUrl: string; debug: boolean }> {
    return {
      apiKeySet: this.apiKey !== '<your-api-key>',
      baseUrl: this.baseUrl,
      debug: this.debug
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS (NOT EXPOSED AS TOOLS)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Private helper method
   *
   * Methods starting with _ are NOT exposed as MCP tools.
   */
  private _helperMethod(): string {
    return 'This is a private helper';
  }

  /**
   * Another private method using underscore convention
   */
  _anotherPrivateMethod(): void {
    // Not exposed as a tool
  }
}
