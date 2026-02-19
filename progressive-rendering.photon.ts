/**
 * Progressive Rendering - Same Data, Better Display
 *
 * Six methods return the same team data, each progressively enhanced.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags tutorial, rendering, ui-types, format
 * @icon 🎨
 */

import { PhotonMCP, Table, Cards } from '@portel/photon-core';

export default class ProgressiveRendering extends PhotonMCP {
  private team = [
    { name: 'Alice Chen', role: 'Engineering Lead', status: 'active', avatar: 'https://i.pravatar.cc/40?u=alice', email: 'alice@example.com' },
    { name: 'Bob Kumar', role: 'Senior Designer', status: 'active', avatar: 'https://i.pravatar.cc/40?u=bob', email: 'bob@example.com' },
    { name: 'Carol Wang', role: 'Product Manager', status: 'away', avatar: 'https://i.pravatar.cc/40?u=carol', email: 'carol@example.com' },
    { name: 'Dan Osei', role: 'Backend Engineer', status: 'active', avatar: 'https://i.pravatar.cc/40?u=dan', email: 'dan@example.com' },
    { name: 'Eve Martinez', role: 'QA Engineer', status: 'offline', avatar: 'https://i.pravatar.cc/40?u=eve', email: 'eve@example.com' },
  ];

  /**
   * Level 1: Raw return — auto-UI guesses the layout
   * @autorun
   */
  async v1_raw() {
    return this.team;
  }

  /**
   * Level 2: Rich description — method card gets context, rendering still auto-detected
   *
   * Team members with roles and availability status.
   * Returns the full engineering team roster.
   * @autorun
   */
  async v2_described() {
    return this.team;
  }

  /**
   * Level 3: Format hint — Beam renders as a table instead of guessing
   * @autorun
   * @format table
   */
  async v3_format_basic() {
    return this.team;
  }

  /**
   * Level 4: Rich format — field mappings produce a polished list with avatars and badges
   * @autorun
   * @format list {@title name, @subtitle role, @icon avatar, @badge status}
   */
  async v4_format_rich() {
    return this.team;
  }

  /**
   * Level 5: UI type class — programmatic control over card layout
   * @autorun
   */
  async v5_ui_type() {
    return new Cards()
      .heading('name')
      .subtitle('role')
      .badge('status')
      .image('avatar')
      .items(this.team);
  }

  /**
   * Level 6: Table with typed Fields — maximum control over columns and formatting
   * @autorun
   */
  async v6_table_fields() {
    return new Table()
      .avatar('avatar', { label: '' })
      .text('name', { label: 'Name' })
      .text('role', { label: 'Role' })
      .badge('status', { label: 'Status', colors: { active: 'green', away: 'yellow', offline: 'gray' } })
      .email('email', { label: 'Email' })
      .rows(this.team);
  }
}
