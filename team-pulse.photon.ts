/**
 * Team Pulse — Async standup with team feed
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 📡
 * @tags standup, team, async, communication
 * @stateful true
 */

import { PhotonMCP, Table } from '@portel/photon-core';

interface Update {
  id: string;
  seq: number;
  name: string;
  update: string;
  blockers: string | null;
  timestamp: string;
  date: string;
}

export default class TeamPulse extends PhotonMCP {
  /**
   * Post a standup update
   * @param name Your name
   * @param update What you worked on / plan to work on
   * @param blockers Any blockers (optional)
   * @icon ➕
   */
  async post(params: { name: string; update: string; blockers?: string }) {
    return this.withLock('pulse:post', async () => {
      const updates = await this.memory.get<Update[]>('updates') ?? [];
      const now = new Date();
      const maxSeq = updates.length > 0 ? Math.max(...updates.map(u => u.seq)) : 0;
      const entry: Update = {
        id: crypto.randomUUID(),
        seq: maxSeq + 1,
        name: params.name,
        update: params.update,
        blockers: params.blockers || null,
        timestamp: now.toISOString(),
        date: now.toISOString().slice(0, 10),
      };
      updates.push(entry);
      await this.memory.set('updates', updates);

      // Broadcast to all sessions
      this.emit('new-update', { name: entry.name, update: entry.update });

      return { posted: entry };
    });
  }

  /**
   * See today's standup updates
   * @format list
   * @autorun
   * @icon 👀
   */
  async today() {
    const updates = await this.memory.get<Update[]>('updates') ?? [];
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayUpdates = updates
      .filter(u => u.date === todayStr)
      .sort((a, b) => b.seq - a.seq);

    if (todayUpdates.length === 0) {
      return { message: 'No updates posted today yet.' };
    }

    return todayUpdates.map(u => ({
      name: u.name,
      update: u.update,
      blockers: u.blockers || 'none',
      time: new Date(u.timestamp).toLocaleTimeString(),
    }));
  }

  /**
   * Past standup history grouped by date
   * @param days Number of days to look back {@default 7} {@min 1} {@max 90}
   * @format dashboard
   * @icon 📅
   */
  async history(params?: { days?: number }) {
    const days = params?.days || 7;
    const updates = await this.memory.get<Update[]>('updates') ?? [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const recent = updates
      .filter(u => u.date >= cutoffStr)
      .sort((a, b) => b.seq - a.seq);

    const groups = recent.reduce((acc, u) => {
      if (!acc[u.date]) acc[u.date] = [];
      acc[u.date].push(u);
      return acc;
    }, {} as Record<string, Update[]>);

    const result: Record<string, any[]> = {};
    for (const [date, items] of Object.entries(groups)) {
      result[date] = items.map(u => ({
        name: u.name,
        update: u.update,
        blockers: u.blockers || 'none',
      }));
    }

    return {
      days,
      totalUpdates: recent.length,
      updates: result,
    };
  }

  /**
   * Search past updates by keyword
   * @param query Search term
   * @format table
   * @icon 🔍
   */
  async search(params: { query: string }) {
    const updates = await this.memory.get<Update[]>('updates') ?? [];
    const q = params.query.toLowerCase();
    const matches = updates
      .filter(u =>
        u.update.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.blockers?.toLowerCase().includes(q) ?? false)
      )
      .sort((a, b) => b.seq - a.seq);

    return new Table(matches)
      .text('name')
      .text('update')
      .badge('blockers')
      .date('date');
  }
}
