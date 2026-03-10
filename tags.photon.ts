/**
 * Test fixture: MCP Spec Tags
 *
 * Exercises ALL MCP standard annotations, content annotations,
 * structured output, and icon image features.
 * Used by tests/mcp-spec-tags.test.ts in the photon runtime.
 *
 * @icon 🏷️
 */

/** Structured output type with JSDoc descriptions on properties */
interface TaskResult {
  /** Unique task identifier */
  id: string;
  /** Task title */
  title: string;
  /** Whether the task is complete */
  done: boolean;
  /** Priority level 1-5 */
  priority: number;
}

export default class TagsTest {
  // ═══════════════════════════════════════════════════════════════
  // Phase 1: Tool Annotations
  // ═══════════════════════════════════════════════════════════════

  /**
   * A read-only query that has no side effects
   * @readOnly
   * @title List All Items
   */
  async listItems() {
    return [
      { id: '1', name: 'Alpha' },
      { id: '2', name: 'Beta' },
    ];
  }

  /**
   * Permanently removes data — requires confirmation
   * @destructive
   * @title Delete Everything
   */
  async nuke() {
    return { deleted: true, count: 42 };
  }

  /**
   * Safe to retry — calling twice has same effect
   * @idempotent
   * @title Upsert Record
   */
  async upsert(params: { id: string; value: string }) {
    return { id: params.id, value: params.value, updated: true };
  }

  /**
   * Calls an external API
   * @openWorld
   * @title Fetch Weather
   */
  async weather(params: { city: string }) {
    return { city: params.city, temp: 22, unit: 'C' };
  }

  /**
   * Operates only on local data
   * @closedWorld
   */
  async localOnly() {
    return { local: true };
  }

  /**
   * Combines multiple annotations
   * @readOnly
   * @idempotent
   * @closedWorld
   * @title Safe Local Query
   */
  async safeQuery() {
    return { safe: true };
  }

  // ═══════════════════════════════════════════════════════════════
  // Phase 4: Content Annotations
  // ═══════════════════════════════════════════════════════════════

  /**
   * Results shown only to the human user
   * @audience user
   * @priority 0.9
   */
  async userOnly() {
    return { message: 'For your eyes only' };
  }

  /**
   * Results only for the AI assistant
   * @audience assistant
   * @priority 0.3
   */
  async assistantOnly() {
    return { data: 'internal context' };
  }

  /**
   * Results for both user and assistant
   * @audience user assistant
   */
  async bothAudience() {
    return { shared: true };
  }

  // ═══════════════════════════════════════════════════════════════
  // Phase 5: Structured Output
  // ═══════════════════════════════════════════════════════════════

  /**
   * Structured output — auto-inferred from TypeScript return type, zero tags
   * @title Create Task
   */
  async createTask(params: { title: string }): Promise<{ id: string; title: string; done: boolean; priority: number }> {
    return {
      id: 'task-001',
      title: params.title,
      done: false,
      priority: 3,
    };
  }

  /**
   * Structured output — descriptions come from interface JSDoc, not tags
   * @title Described Task
   */
  async describedTask(params: { title: string }): Promise<TaskResult> {
    return {
      id: 'task-002',
      title: params.title,
      done: false,
      priority: 2,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Disambiguation: method-level @readOnly vs param-level {@readOnly}
  // ═══════════════════════════════════════════════════════════════

  /**
   * Method-level @readOnly with param-level {@readOnly} — both should work
   * @readOnly
   * @param id User ID {@readOnly}
   * @param name Display name
   */
  async lookup(params: { id: string; name: string }) {
    return { id: params.id, name: params.name };
  }
}
