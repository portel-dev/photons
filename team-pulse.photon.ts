/**
 * Team Pulse — Async Standup with Memory + Channels + Locking
 *
 * Post daily updates, see what the team posted, search past standups.
 * Updates persist via `this.memory`, broadcast to all sessions via
 * channels, and use distributed locking to prevent duplicate rapid-fire posts.
 *
 * @description Async standup — post updates, see the team feed
 * @tags demo, memory, channels, collection, locking
 * @icon 📡
 */

import { PhotonMCP, Collection, Table } from '@portel/photon-core';

interface Update {
  id: string;
  name: string;
  update: string;
  blockers: string | null;
  timestamp: string;
  date: string;
}

export default class TeamPulse extends PhotonMCP {

  private async loadUpdates(): Promise<Collection<Update>> {
    const items = await this.memory.get<Update[]>('updates') ?? [];
    return Collection.from(items);
  }

  private async saveUpdates(updates: Collection<Update>): Promise<void> {
    await this.memory.set('updates', Array.from(updates));
  }

  /**
   * Post a standup update
   *
   * Persists to memory, broadcasts to all open sessions, and uses
   * a distributed lock to prevent duplicate rapid-fire submissions.
   *
   * @param name Your name
   * @param update What you worked on / plan to work on
   * @param blockers Any blockers (optional)
   */
  async post(params: { name: string; update: string; blockers?: string }) {
    return this.withLock('pulse:post', async () => {
      const updates = await this.loadUpdates();
      const now = new Date();
      const entry: Update = {
        id: crypto.randomUUID(),
        name: params.name,
        update: params.update,
        blockers: params.blockers || null,
        timestamp: now.toISOString(),
        date: now.toISOString().slice(0, 10),
      };
      updates.push(entry);
      await this.saveUpdates(updates);

      // Broadcast to all sessions
      this.emit({
        channel: 'pulse',
        event: 'new-update',
        data: { name: entry.name, update: entry.update },
      });
      this.emit({ emit: 'toast', message: `Update posted by ${entry.name}`, type: 'success' });

      return { posted: entry };
    });
  }

  /**
   * See today's standup updates
   * @format list {@title update, @subtitle name, @badge blockers}
   */
  async today() {
    const updates = await this.loadUpdates();
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayUpdates = updates
      .where('date', todayStr)
      .sortBy('timestamp', 'desc');

    if (todayUpdates.isEmpty()) {
      return { message: 'No updates posted today yet.' };
    }

    return Array.from(todayUpdates).map(u => ({
      name: u.name,
      update: u.update,
      blockers: u.blockers || 'none',
      time: new Date(u.timestamp).toLocaleTimeString(),
    }));
  }

  /**
   * Past standup history grouped by date
   * @param days Number of days to look back {@default 7} {@min 1} {@max 90}
   */
  async history(params?: { days?: number }) {
    const days = params?.days || 7;
    const updates = await this.loadUpdates();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const recent = updates
      .query(u => u.date >= cutoffStr)
      .sortBy('timestamp', 'desc');

    const groups = recent.groupBy('date');
    const result: Record<string, any[]> = {};
    for (const [date, items] of Object.entries(groups)) {
      result[date] = Array.from(items).map(u => ({
        name: u.name,
        update: u.update,
        blockers: u.blockers || 'none',
      }));
    }

    return {
      days,
      totalUpdates: recent.count(),
      updates: result,
    };
  }

  /**
   * Search past updates by keyword
   * @param query Search term
   */
  async search(params: { query: string }) {
    const updates = await this.loadUpdates();
    const q = params.query.toLowerCase();
    const matches = updates.query(u =>
      u.update.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      (u.blockers?.toLowerCase().includes(q) ?? false)
    ).sortBy('timestamp', 'desc');

    return new Table(Array.from(matches))
      .text('name')
      .text('update')
      .badge('blockers')
      .date('date');
  }
}
