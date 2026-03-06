/**
 * List — Simple reactive list for testing state sync
 *
 * A minimal task list using @stateful with constructor-injected state.
 * Perfect for testing end-to-end synchronization across clients.
 *
 * @version 1.0.0
 * @author Test
 * @license MIT
 * @icon 📋
 * @tags test, stateful, reactive
 * @stateful
 */

/**
 * @stateful
 */
export default class List {
  items: string[];

  constructor(items: string[] = []) {
    this.items = items;
  }

  /**
   * Add a new item
   * @param item Item description
   */
  add(item: string): string {
    this.remove(item);
    this.items.push(item);
    return item;
  }

  /**
   * Remove an item
   * @param item Item to remove
   */
  remove(item: string): boolean {
    const index = this.items.findIndex((i) => i === item);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get paginated items from the list
   * @param from Start index (default: 0)
   * @param to End index (exclusive) (default: 20)
   * @format list
   */
  get(from: number = 0, to: number = 20): string[] {
    return this.items.slice(from, to);
  }
}
