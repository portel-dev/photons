/**
 * Hello World - The simplest possible photon
 *
 * Start here. A photon is just a TypeScript class where each method
 * becomes an MCP tool. That's it.
 *
 * @version 1.0.0
 * @license MIT
 * @author Portel
 * @icon 👋
 * @tags starter, beginner, tutorial
 */

export default class HelloWorld {
  /**
   * Say hello
   * @param name Who to greet
   */
  greet(name: string = 'World') {
    return `Hello, ${name}!`;
  }

  /**
   * Get current time in a friendly format
   */
  now() {
    return {
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      greeting: new Date().getHours() < 12 ? 'Good morning' :
                new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening',
    };
  }

  /**
   * Add two numbers
   */
  add(a: number, b: number) {
    return { result: a + b, expression: `${a} + ${b} = ${a + b}` };
  }
}
