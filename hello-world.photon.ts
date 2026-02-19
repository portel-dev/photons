/**
 * Hello World - The simplest possible photon
 *
 * A photon is just a TypeScript class where each method becomes an MCP tool.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 👋
 * @tags starter, beginner, tutorial
 */

export default class HelloWorld {
  /**
   * Say hello to someone
   * @param name {@example Alice}
   * @format primitive
   */
  greet(name: string = 'World') {
    return `Hello, ${name}!`;
  }

  /**
   * Get current time and greeting
   * @autorun
   * @format card
   */
  now() {
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return {
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      greeting,
    };
  }

  /**
   * Add two numbers
   * @param a {@example 5}
   * @param b {@example 3}
   * @format primitive
   */
  add({ a, b }: { a: number; b: number }) {
    return a + b;
  }
}
