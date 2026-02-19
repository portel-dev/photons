/**
 * Demo - Feature showcase
 *
 * Comprehensive demonstration of Photon runtime features: return types, parameters,
 * progress indicators, user input (elicitation), state management, and UI formats.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 🎪
 * @tags demo, features, examples
 */

import { io } from '@portel/photon-core';

interface User {
  id: string;
  name: string;
  email: string;
}

export default class Demo {
  private counter: number = 0;
  private todos: string[] = [];

  constructor(private apiKey: string = 'demo-key') {}

  /**
   * Echo a message
   * @param message {@example Hello, Photon!}
   * @format primitive
   */
  async echo(params: { message: string }) {
    return `Echo: ${params.message}`;
  }

  /**
   * Add two numbers
   * @param a {@example 5}
   * @param b {@example 3}
   * @format primitive
   */
  async add(params: { a: number; b: number }) {
    return params.a + params.b;
  }

  /**
   * Greet someone
   * @param name {@example Alice}
   * @format primitive
   */
  async greet(params: { name?: string }) {
    return `Hello, ${params.name || 'World'}!`;
  }

  /**
   * Show progress with steps
   * @param steps {@example 5}
   * @format primitive
   */
  async *showProgress(params: { steps?: number }) {
    const steps = params.steps || 5;
    yield io.emit.status('Starting...');
    await new Promise(r => setTimeout(r, 500));

    for (let i = 1; i <= steps; i++) {
      yield io.emit.progress(i / steps, `Step ${i}/${steps}`);
      await new Promise(r => setTimeout(r, 300));
    }

    return `Completed ${steps} steps!`;
  }

  /**
   * Interactive name prompt
   * @format primitive
   */
  async *askName() {
    const name = yield io.ask.text('What is your name?', { default: 'Anonymous' });
    const age = yield io.ask.text('How old are you?');
    return `Hello ${name}, you are ${age} years old!`;
  }

  /**
   * Confirmation prompt
   * @format primitive
   */
  async *confirmAction() {
    const confirmed = yield io.ask.confirm('Continue?', { default: false });
    return confirmed ? 'Action executed!' : 'Cancelled.';
  }

  /**
   * Selection from options
   * @format primitive
   */
  async *selectOption() {
    const choice = yield io.ask.select('Pick a color:', ['Red', 'Green', 'Blue', 'Yellow']);
    return `You selected: ${choice}`;
  }

  /**
   * Multi-step registration form
   * @format card
   */
  async *multiStepForm() {
    yield io.emit.status('Starting registration...');
    const username = yield io.ask.text('Username:');
    yield io.emit.progress(0.33, 'Step 1/3');

    const email = yield io.ask.text('Email:');
    yield io.emit.progress(0.66, 'Step 2/3');

    const confirmed = yield io.ask.confirm(`Create account for ${username}?`);
    yield io.emit.progress(1, 'Complete!');

    return {
      success: confirmed,
      message: confirmed ? 'Account created!' : 'Cancelled',
      username,
      email,
    };
  }

  /**
   * Counter state management
   * @param action {@choice increment,decrement,reset,get}
   * @format json
   */
  async counter(params: { action: 'increment' | 'decrement' | 'reset' | 'get' }) {
    switch (params.action) {
      case 'increment': this.counter++; break;
      case 'decrement': this.counter--; break;
      case 'reset': this.counter = 0; break;
    }
    return { count: this.counter, action: params.action };
  }

  /**
   * Todo management
   * @param action {@choice add,remove,list,clear}
   * @param item Optional item text
   * @format json
   */
  async todos(params: { action: 'add' | 'remove' | 'list' | 'clear'; item?: string }) {
    switch (params.action) {
      case 'add':
        if (!params.item) throw new Error('Item required');
        this.todos.push(params.item);
        return { todos: this.todos, message: `Added: ${params.item}` };

      case 'remove':
        if (!params.item) throw new Error('Item required');
        const idx = this.todos.indexOf(params.item);
        if (idx === -1) throw new Error('Item not found');
        this.todos.splice(idx, 1);
        return { todos: this.todos, message: `Removed: ${params.item}` };

      case 'clear':
        const count = this.todos.length;
        this.todos = [];
        return { todos: [], message: `Cleared ${count} items` };

      case 'list':
        return { todos: this.todos, message: `${this.todos.length} items` };
    }
  }

  /**
   * Sample users table
   * @autorun
   * @format table
   */
  async users() {
    return [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
      { id: '3', name: 'Charlie', email: 'charlie@example.com' },
    ];
  }

  /**
   * Documentation in markdown
   * @autorun
   * @format markdown
   */
  async docs() {
    return `# Demo Photon

## Features

- **Return types**: Strings, numbers, objects, arrays
- **Parameters**: Required, optional, enums
- **Progress**: Spinners and progress bars
- **Elicitation**: Interactive user input
- **State**: Persistent data across calls
- **UI formats**: Tables, markdown, JSON

## Quick Start

\`\`\`bash
photon cli demo echo --message "Hello"
photon cli demo add --a 5 --b 3
photon cli demo showProgress --steps 10
\`\`\`

## Try These

- \`askName\` - Interactive input
- \`confirmAction\` - User confirmation
- \`selectOption\` - Pick from list
- \`multiStepForm\` - Multi-step workflow
`;
  }

  /**
   * Sample tree structure
   * @autorun
   * @format tree
   */
  async tree() {
    return {
      name: 'Project',
      children: [
        {
          name: 'src',
          children: [
            { name: 'index.ts', size: 1024 },
            { name: 'utils.ts', size: 512 },
          ],
        },
        {
          name: 'tests',
          children: [
            { name: 'demo.test.ts', size: 2048 },
          ],
        },
        { name: 'package.json', size: 256 },
      ],
    };
  }

  /**
   * Get current config
   * @autorun
   * @format json
   */
  async config() {
    return {
      apiKeySet: this.apiKey !== 'demo-key',
      apiKeyLength: this.apiKey.length,
    };
  }

  async _privateMethod() {
    return 'Hidden from tools';
  }
}
