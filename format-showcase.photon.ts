/**
 * Format Showcase - Auto-UI Format Demos
 *
 * Demonstrates every auto-UI format type with sample data so developers
 * can see how each visualization looks and choose appropriately.
 *
 * Run any method in Beam to see the visual output.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags demo, formats, auto-ui, visualization
 * @icon 🎨
 */

import { PhotonMCP, Table, Chart, Stats, Cards, Progress } from '@portel/photon-core';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface TeamMember {
  name: string;
  role: string;
  status: 'active' | 'away' | 'offline';
  avatar: string;
  email: string;
}

interface ServerMetric {
  host: string;
  cpu: number;
  memory: number;
  disk: number;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
}

interface RevenueEntry {
  month: string;
  revenue: number;
}

interface BudgetEntry {
  category: string;
  amount: number;
}

interface Milestone {
  date: string;
  title: string;
  description: string;
}

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// PHOTON CLASS
// ════════════════════════════════════════════════════════════════════════════════

export default class FormatShowcasePhoton extends PhotonMCP {

  // ══════════════════════════════════════════════════════════════════════════════
  // STRUCTURAL FORMATS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Uses **`@format list`** — the declarative approach.
   *
   * Maps fields to roles via `@title`, `@subtitle`, `@icon`, `@badge`.
   * The auto-UI renders an iOS-style list with no code overhead.
   *
   * Compare with `rich_cards()` for the programmatic approach.
   * @autorun
   * @format list {@title name, @subtitle role, @icon avatar, @badge status}
   */
  async list(): Promise<TeamMember[]> {
    return [
      { name: 'Alice Chen', role: 'Engineering Lead', status: 'active', avatar: 'https://i.pravatar.cc/40?u=alice', email: 'alice@example.com' },
      { name: 'Bob Kumar', role: 'Senior Designer', status: 'active', avatar: 'https://i.pravatar.cc/40?u=bob', email: 'bob@example.com' },
      { name: 'Carol Wang', role: 'Product Manager', status: 'away', avatar: 'https://i.pravatar.cc/40?u=carol', email: 'carol@example.com' },
      { name: 'Dan Osei', role: 'Backend Engineer', status: 'active', avatar: 'https://i.pravatar.cc/40?u=dan', email: 'dan@example.com' },
      { name: 'Eve Martinez', role: 'QA Engineer', status: 'offline', avatar: 'https://i.pravatar.cc/40?u=eve', email: 'eve@example.com' },
    ];
  }

  /**
   * Uses **`@format card`** — renders a single object as a detail card.
   *
   * Each key becomes a labeled field. No column definitions needed.
   * Best for profile pages, detail views, or single-record displays.
   * @autorun
   * @format card
   */
  async card(): Promise<{
    name: string;
    title: string;
    email: string;
    department: string;
    location: string;
    joinedAt: string;
  }> {
    return {
      name: 'Alice Chen',
      title: 'Engineering Lead',
      email: 'alice@example.com',
      department: 'Platform',
      location: 'San Francisco, CA',
      joinedAt: '2022-03-15',
    };
  }

  /**
   * Uses **`@format table`** — the declarative approach.
   *
   * Returns raw data; auto-UI infers column types from the data shape.
   * Best when your data is simple and needs zero code overhead.
   *
   * Compare with `rich_table()` for the programmatic approach with typed columns.
   * @autorun
   * @format table
   */
  async table(): Promise<ServerMetric[]> {
    return [
      { host: 'web-01', cpu: 42, memory: 68, disk: 55, status: 'healthy', uptime: '45d 12h' },
      { host: 'web-02', cpu: 78, memory: 82, disk: 61, status: 'warning', uptime: '12d 3h' },
      { host: 'db-01', cpu: 35, memory: 91, disk: 72, status: 'warning', uptime: '90d 7h' },
      { host: 'db-02', cpu: 22, memory: 45, disk: 38, status: 'healthy', uptime: '90d 7h' },
      { host: 'cache-01', cpu: 95, memory: 88, disk: 15, status: 'critical', uptime: '2d 1h' },
    ];
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CHART FORMATS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Uses **`@format chart:bar`** — the declarative approach.
   *
   * Maps `@label` and `@value` to axis roles. Single-series only.
   * Best for quick visualizations of simple label→value data.
   *
   * Compare with `rich_chart()` for multi-series and axis control.
   * @autorun
   * @format chart:bar {@label month, @value revenue}
   */
  async bars(): Promise<RevenueEntry[]> {
    return [
      { month: 'Jan', revenue: 42000 },
      { month: 'Feb', revenue: 38000 },
      { month: 'Mar', revenue: 55000 },
      { month: 'Apr', revenue: 47000 },
      { month: 'May', revenue: 62000 },
      { month: 'Jun', revenue: 58000 },
    ];
  }

  /**
   * Uses **`@format chart:pie`** — declarative pie chart.
   *
   * Maps `@label` and `@value` for slice names and sizes.
   * Great for proportional breakdowns with minimal code.
   * @autorun
   * @format chart:pie {@label category, @value amount}
   */
  async pie(): Promise<BudgetEntry[]> {
    return [
      { category: 'Engineering', amount: 450000 },
      { category: 'Marketing', amount: 180000 },
      { category: 'Sales', amount: 220000 },
      { category: 'Operations', amount: 120000 },
      { category: 'R&D', amount: 300000 },
    ];
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // METRIC & GAUGE FORMATS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Uses **`@format metric`** — a single KPI with trend indicator.
   *
   * Returns `label`, `value`, `unit`, and `delta` fields.
   * The auto-UI renders a prominent number with up/down trend arrow.
   * @autorun
   * @format metric
   */
  async metric(): Promise<{
    label: string;
    value: number;
    unit: string;
    delta: number;
    deltaLabel: string;
  }> {
    return {
      label: 'Monthly Revenue',
      value: 58000,
      unit: '$',
      delta: 12.5,
      deltaLabel: 'vs last month',
    };
  }

  /**
   * Uses **`@format gauge`** — a circular gauge with min/max bounds.
   *
   * Renders a radial progress indicator. Use `@min` and `@max` to set the range.
   * Best for single values within a known range (CPU, battery, score).
   * @autorun
   * @format gauge {@min 0, @max 100}
   */
  async gauge(): Promise<{
    value: number;
    max: number;
    label: string;
    unit: string;
  }> {
    return {
      value: 73,
      max: 100,
      label: 'CPU Usage',
      unit: '%',
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TIMELINE FORMAT
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Uses **`@format timeline`** — a vertical event sequence.
   *
   * Maps `@date`, `@title`, and `@description` to timeline nodes.
   * Ideal for project milestones, changelogs, or activity feeds.
   * @autorun
   * @format timeline {@date date, @title title, @description description}
   */
  async timeline(): Promise<Milestone[]> {
    return [
      { date: '2026-01-15', title: 'Project Kickoff', description: 'Initial planning session and team assembly' },
      { date: '2026-02-01', title: 'Design Complete', description: 'UI/UX mockups approved by stakeholders' },
      { date: '2026-02-15', title: 'Alpha Release', description: 'Internal testing with core features' },
      { date: '2026-03-01', title: 'Beta Launch', description: 'Public beta with early access users' },
      { date: '2026-03-15', title: 'GA Release', description: 'General availability with full feature set' },
    ];
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DASHBOARD FORMAT
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Uses **`@format dashboard`** — a composite layout for mixed data.
   *
   * Returns an object with metrics, gauges, tables, and charts as fields.
   * The auto-UI detects each sub-shape and renders the appropriate widget.
   * One annotation, multiple visualizations.
   * @autorun
   * @format dashboard
   */
  async dashboard(): Promise<{
    revenue: { label: string; value: number; unit: string; delta: number };
    users: { label: string; value: number; delta: number };
    conversion: { value: number; max: number; label: string };
    topProducts: { name: string; sales: number }[];
    recentOrders: { id: string; customer: string; amount: number; status: string }[];
  }> {
    return {
      revenue: { label: 'Revenue', value: 284000, unit: '$', delta: 8.3 },
      users: { label: 'Active Users', value: 12450, delta: -2.1 },
      conversion: { value: 3.7, max: 10, label: 'Conversion Rate' },
      topProducts: [
        { name: 'Pro Plan', sales: 1240 },
        { name: 'Team Plan', sales: 890 },
        { name: 'Enterprise', sales: 340 },
      ],
      recentOrders: [
        { id: 'ORD-001', customer: 'Acme Corp', amount: 2400, status: 'completed' },
        { id: 'ORD-002', customer: 'TechStart', amount: 890, status: 'pending' },
        { id: 'ORD-003', customer: 'GlobalCo', amount: 5600, status: 'completed' },
      ],
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CART FORMAT
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Uses **`@format cart`** — a shopping cart with line items and totals.
   *
   * Expects `items[]` with `name`, `price`, `quantity`, and optional `image`.
   * Auto-renders item list, subtotal, tax, and total with formatting.
   * @autorun
   * @format cart
   */
  async cart(): Promise<{
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  }> {
    return {
      items: [
        { name: 'Wireless Keyboard', price: 79.99, quantity: 1, image: 'https://i.pravatar.cc/40?u=kb' },
        { name: 'USB-C Hub', price: 49.99, quantity: 2, image: 'https://i.pravatar.cc/40?u=hub' },
        { name: 'Monitor Stand', price: 34.99, quantity: 1, image: 'https://i.pravatar.cc/40?u=stand' },
      ],
      subtotal: 214.96,
      tax: 17.20,
      shipping: 0,
      total: 232.16,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CONTAINER FORMATS (Composable)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Uses **`@format panels`** — a CSS grid of titled panels.
   *
   * Each top-level key becomes a panel title; the value renders via `@inner`.
   * Here `@inner card` renders each department as a detail card.
   * Use `@columns` to control the grid.
   * @autorun
   * @format panels {@inner card, @columns 3}
   */
  async panels(): Promise<{
    Engineering: { lead: string; headcount: number; budget: string; focus: string };
    Design: { lead: string; headcount: number; budget: string; focus: string };
    Product: { lead: string; headcount: number; budget: string; focus: string };
  }> {
    return {
      Engineering: { lead: 'Alice Chen', headcount: 24, budget: '$1.2M', focus: 'Platform reliability' },
      Design: { lead: 'Bob Kumar', headcount: 8, budget: '$400K', focus: 'Design system v3' },
      Product: { lead: 'Carol Wang', headcount: 6, budget: '$300K', focus: 'Q2 roadmap' },
    };
  }

  /**
   * Uses **`@format tabs`** — a tab bar switching between groups.
   *
   * Each top-level key becomes a tab; `@inner list` renders the tab content.
   * Great for categorized data where each category has similar structure.
   * @autorun
   * @format tabs {@inner list}
   */
  async tabs(): Promise<{
    Frontend: { name: string; type: string }[];
    Backend: { name: string; type: string }[];
    DevOps: { name: string; type: string }[];
  }> {
    return {
      Frontend: [
        { name: 'React', type: 'framework' },
        { name: 'TypeScript', type: 'language' },
        { name: 'Vite', type: 'bundler' },
      ],
      Backend: [
        { name: 'Node.js', type: 'runtime' },
        { name: 'PostgreSQL', type: 'database' },
        { name: 'Redis', type: 'cache' },
      ],
      DevOps: [
        { name: 'Docker', type: 'container' },
        { name: 'Kubernetes', type: 'orchestrator' },
        { name: 'Terraform', type: 'IaC' },
      ],
    };
  }

  /**
   * Uses **`@format accordion`** — collapsible sections.
   *
   * Each top-level key becomes a section header; `@inner kv` renders key-value pairs inside.
   * Perfect for FAQs, settings groups, or categorized reference data.
   * @autorun
   * @format accordion {@inner kv}
   */
  async accordion(): Promise<{
    Billing: { [key: string]: string };
    Shipping: { [key: string]: string };
    Returns: { [key: string]: string };
  }> {
    return {
      Billing: {
        'Payment methods': 'Visa, Mastercard, PayPal, Apple Pay',
        'Billing cycle': 'Monthly or annual (20% discount)',
        'Refund policy': 'Full refund within 30 days',
      },
      Shipping: {
        'Delivery time': '3-5 business days (standard)',
        'Express shipping': 'Next-day delivery for $9.99',
        'International': 'Available to 40+ countries',
      },
      Returns: {
        'Return window': '30 days from delivery',
        'Condition': 'Unused, original packaging',
        'Process': 'Initiate via account dashboard',
      },
    };
  }

  /**
   * Uses **`@format stack`** — vertical stack of metrics.
   *
   * Each key becomes a stacked widget rendered via `@inner metric`.
   * Use for KPI dashboards where metrics should read top-to-bottom.
   * @autorun
   * @format stack {@inner metric}
   */
  async stack(): Promise<{
    Revenue: { label: string; value: number; unit: string; delta: number };
    Users: { label: string; value: number; delta: number };
    NPS: { label: string; value: number; delta: number };
  }> {
    return {
      Revenue: { label: 'Monthly Revenue', value: 58000, unit: '$', delta: 12.5 },
      Users: { label: 'Active Users', value: 12450, delta: 3.2 },
      NPS: { label: 'Net Promoter Score', value: 72, delta: 5.0 },
    };
  }

  /**
   * Uses **`@format columns`** — side-by-side layout.
   *
   * Each key becomes a column; `@inner chart:pie` renders pie charts.
   * Use `@columns` to control how many fit per row.
   * @autorun
   * @format columns {@inner chart:pie, @columns 2}
   */
  async columns(): Promise<{
    'Plan A': { feature: string; hours: number }[];
    'Plan B': { feature: string; hours: number }[];
  }> {
    return {
      'Plan A': [
        { feature: 'Development', hours: 120 },
        { feature: 'Testing', hours: 40 },
        { feature: 'Design', hours: 30 },
        { feature: 'Planning', hours: 10 },
      ],
      'Plan B': [
        { feature: 'Development', hours: 80 },
        { feature: 'Testing', hours: 60 },
        { feature: 'Design', hours: 40 },
        { feature: 'Planning', hours: 20 },
      ],
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PURPOSE-DRIVEN UI TYPES (no @format — driven by _photonType)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Uses the **`Table`** class — the programmatic approach.
   *
   * Explicit column types (`number`, `badge`, `currency`), custom headers, and a title.
   * Note the `currency` column on budget — something `@format table` can't express.
   *
   * Compare with `table()` for the declarative `@format` approach.
   * @autorun
   */
  async rich_table(): Promise<Table> {
    return new Table()
      .column('host', 'Host')
      .column('cpu', 'CPU %', 'number')
      .column('memory', 'Memory %', 'number')
      .column('disk', 'Disk %', 'number')
      .column('status', 'Status', 'badge')
      .column('uptime', 'Uptime')
      .column('budget', 'Monthly Cost', 'currency')
      .title('Server Metrics')
      .rows([
        { host: 'web-01', cpu: 42, memory: 68, disk: 55, status: 'healthy', uptime: '45d 12h', budget: 1200 },
        { host: 'web-02', cpu: 78, memory: 82, disk: 61, status: 'warning', uptime: '12d 3h', budget: 1200 },
        { host: 'db-01', cpu: 35, memory: 91, disk: 72, status: 'warning', uptime: '90d 7h', budget: 3500 },
        { host: 'db-02', cpu: 22, memory: 45, disk: 38, status: 'healthy', uptime: '90d 7h', budget: 3500 },
        { host: 'cache-01', cpu: 95, memory: 88, disk: 15, status: 'critical', uptime: '2d 1h', budget: 800 },
      ]);
  }

  /**
   * Uses the **`Chart`** class — the programmatic approach.
   *
   * Supports **multiple series** (revenue vs cost), axis labels, and titles.
   * The `@format chart:bar` annotation is single-series only.
   *
   * Compare with `bars()` for the declarative `@format` approach.
   * @autorun
   */
  async rich_chart(): Promise<Chart> {
    return new Chart('bar')
      .title('Revenue vs Cost')
      .labels(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'])
      .series('Revenue', [42000, 38000, 55000, 47000, 62000, 58000])
      .series('Cost', [28000, 31000, 33000, 29000, 35000, 32000])
      .yAxis('USD');
  }

  /**
   * Uses the **`Stats`** class — the programmatic approach.
   *
   * Typed formatters: `.currency()`, `.count()`, `.percent()` auto-format values.
   * Each stat gets trend indicators and labels — no manual formatting needed.
   *
   * Compare with `metric()` for the declarative single-KPI `@format` approach.
   * @autorun
   */
  async rich_stats(): Promise<Stats> {
    return new Stats()
      .title('Key Metrics')
      .currency('Revenue', 58000, { trend: '+12.5%', trendUp: true })
      .count('Users', 12450, { trend: '+3.2%', trendUp: true })
      .stat('NPS', 72, { trend: '+5.0', trendUp: true })
      .percent('Conversion', 3.7, { trend: '-0.2%', trendUp: false });
  }

  /**
   * Uses the **`Cards`** class — the programmatic approach.
   *
   * Explicit field roles: `.heading()`, `.subtitle()`, `.badge()`, `.image()`.
   * Gives you control over which fields render and how — without annotations.
   *
   * Compare with `list()` for the declarative `@format list` approach.
   * @autorun
   */
  async rich_cards(): Promise<Cards> {
    return new Cards()
      .heading('name')
      .subtitle('role')
      .badge('status')
      .image('avatar')
      .items([
        { name: 'Alice Chen', role: 'Engineering Lead', status: 'active', avatar: 'https://i.pravatar.cc/40?u=alice', email: 'alice@example.com' },
        { name: 'Bob Kumar', role: 'Senior Designer', status: 'active', avatar: 'https://i.pravatar.cc/40?u=bob', email: 'bob@example.com' },
        { name: 'Carol Wang', role: 'Product Manager', status: 'away', avatar: 'https://i.pravatar.cc/40?u=carol', email: 'carol@example.com' },
        { name: 'Dan Osei', role: 'Backend Engineer', status: 'active', avatar: 'https://i.pravatar.cc/40?u=dan', email: 'dan@example.com' },
        { name: 'Eve Martinez', role: 'QA Engineer', status: 'offline', avatar: 'https://i.pravatar.cc/40?u=eve', email: 'eve@example.com' },
      ]);
  }

  /**
   * Uses the **`Progress`** class — multi-bar progress display.
   *
   * Each `.bar()` gets a label, percentage, and color.
   * Use for project phases, skill levels, or any multi-track progress.
   * @autorun
   */
  async rich_progress(): Promise<Progress> {
    return new Progress()
      .bar('Design', 100, { color: 'green' })
      .bar('Development', 65, { color: 'blue' })
      .bar('Testing', 20, { color: 'yellow' })
      .bar('Deployment', 0, { color: 'gray' });
  }

  /**
   * Uses the **`Progress`** class in `steps` mode — a step indicator.
   *
   * Each `.step()` has a status: `completed`, `current`, or `pending`.
   * Perfect for checkout flows, onboarding wizards, or multi-stage processes.
   * @autorun
   */
  async rich_steps(): Promise<Progress> {
    return new Progress('steps')
      .step('Cart', 'completed', { description: 'Items selected' })
      .step('Shipping', 'completed', { description: 'Address confirmed' })
      .step('Payment', 'current', { description: 'Enter payment details' })
      .step('Confirm', 'pending', { description: 'Review and place order' });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MERMAID DIAGRAMS (inline rendering in cards and as top-level results)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Returns a **mermaid flowchart** as a plain string.
   *
   * The auto-UI detects mermaid syntax and renders the diagram visually.
   * No `@format` needed — detection is automatic from the string content.
   * @autorun
   */
  async mermaid(): Promise<string> {
    return `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix the code]
    E --> B`;
  }

  /**
   * Returns an object with a **mermaid diagram embedded** in a field.
   *
   * When the auto-UI renders this as a card, the `diagram` field is detected
   * as mermaid and rendered visually — other fields render normally.
   * @autorun
   */
  async mermaid_card(): Promise<{
    title: string;
    description: string;
    diagram: string;
    type: string;
  }> {
    return {
      title: 'User Authentication Flow',
      description: 'Login sequence with OAuth and fallback',
      diagram: `sequenceDiagram
    participant U as User
    participant A as App
    participant O as OAuth Provider
    U->>A: Click Login
    A->>O: Redirect to OAuth
    O->>U: Show consent screen
    U->>O: Grant access
    O->>A: Authorization code
    A->>O: Exchange for token
    O->>A: Access token
    A->>U: Logged in`,
      type: 'sequence',
    };
  }

  /**
   * Returns **markdown with YAML frontmatter** — the metadata block between
   * `---` fences is extracted and rendered as a table above the body.
   *
   * This mirrors how static-site generators (Jekyll, Hugo) handle frontmatter.
   * The auto-UI detects the `---` opener and converts key-value pairs to a table.
   * @autorun
   */
  async markdown_frontmatter(): Promise<string> {
    return `---
title: Photon Architecture Overview
author: Arul
version: 2.5.4
status: Draft
---

## Overview

Photon is a **reactive MCP framework** that turns TypeScript classes into
full-featured tools with auto-generated UIs.

### Key Concepts

- \`PhotonMCP\` — base class that provides \`emit()\`, lifecycle hooks, and tool registration
- \`@format\` — declarative annotation for output rendering (table, chart, gauge, etc.)
- **Rich classes** — \`Table\`, \`Chart\`, \`Card\` for programmatic control

### Getting Started

\`\`\`typescript
import { PhotonMCP } from '@portel/photon-core';

export default class Hello extends PhotonMCP {
  async greet(name: string) {
    return \`Hello, \${name}!\`;
  }
}
\`\`\`
`;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // LIVE STREAMING DEMO
  // ══════════════════════════════════════════════════════════════════════════════

  private _liveTimer: ReturnType<typeof setInterval> | null = null;
  private _diagramTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * **Live streaming** — gauge updates every second via `this.emit()`.
   *
   * Combines `@format gauge` with real-time channel events.
   * The initial return renders immediately; subsequent `emit()` calls update the value.
   * @format gauge {@min 0, @max 100}
   */
  async live(): Promise<{ value: number; max: number; label: string; unit: string }> {
    // Stop any previous timer
    if (this._liveTimer) clearInterval(this._liveTimer);

    let value = 45 + Math.random() * 30;

    // Pump new values every second via collection events
    this._liveTimer = setInterval(() => {
      // Random walk: drift ±5, clamped to 10-95
      value += (Math.random() - 0.5) * 10;
      value = Math.max(10, Math.min(95, value));

      this.emit({
        channel: 'format-showcase',
        event: 'live:changed',
        data: {
          value: Math.round(value),
          max: 100,
          label: 'CPU Usage',
          unit: '%',
        },
      });
    }, 1000);

    return {
      value: Math.round(value),
      max: 100,
      label: 'CPU Usage',
      unit: '%',
    };
  }

  /**
   * **Animated diagram** — a flowchart that builds itself step by step.
   *
   * Emits progressively larger mermaid strings via `this.emit()`.
   * Each update adds a new node or connection, so you see the diagram grow in real time.
   * Demonstrates streaming mermaid rendering with smooth SVG transitions.
   */
  async live_diagram(): Promise<string> {
    if (this._diagramTimer) clearInterval(this._diagramTimer);

    const h = 'flowchart TD';
    const steps = [
      // Phase 1: Main trunk
      `${h}\n  A[User Request]`,
      `${h}\n  A[User Request] --> B[API Gateway]`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}`,
      // Phase 2: Auth branch
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A`,
      // Phase 3: Valid path continues
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]`,
      // Phase 4: Fan out to services
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]`,
      // Phase 5: Build on Service branches — each hits its own store
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]\n  E --> H[(Redis Cache)]`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]\n  E --> H[(Redis Cache)]\n  F --> I[(PostgreSQL)]`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]\n  E --> H[(Redis Cache)]\n  F --> I[(PostgreSQL)]\n  G --> J[(S3 Bucket)]`,
      // Phase 6: Converge back
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]\n  E --> H[(Redis Cache)]\n  F --> I[(PostgreSQL)]\n  G --> J[(S3 Bucket)]\n  H --> K[Aggregator]`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]\n  E --> H[(Redis Cache)]\n  F --> I[(PostgreSQL)]\n  G --> J[(S3 Bucket)]\n  H --> K[Aggregator]\n  I --> K`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]\n  E --> H[(Redis Cache)]\n  F --> I[(PostgreSQL)]\n  G --> J[(S3 Bucket)]\n  H --> K[Aggregator]\n  I --> K\n  J --> K`,
      // Phase 7: Response path back to user
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]\n  E --> H[(Redis Cache)]\n  F --> I[(PostgreSQL)]\n  G --> J[(S3 Bucket)]\n  H --> K[Aggregator]\n  I --> K\n  J --> K\n  K --> L[Response Builder]`,
      `${h}\n  A[User Request] --> B[API Gateway]\n  B --> C{Auth Check}\n  C -->|Invalid| X[401 Unauthorized]\n  X -->|Retry| A\n  C -->|Valid| D[Load Balancer]\n  D --> E[Auth Service]\n  D --> F[User Service]\n  D --> G[Data Service]\n  E --> H[(Redis Cache)]\n  F --> I[(PostgreSQL)]\n  G --> J[(S3 Bucket)]\n  H --> K[Aggregator]\n  I --> K\n  J --> K\n  K --> L[Response Builder]\n  L --> A`,
    ];

    // Build the full sequence: forward → pause at peak → reverse → pause at start
    const forward = steps.slice(1); // skip 0, it's the initial return
    const peakPause = [steps[steps.length - 1], steps[steps.length - 1]]; // hold 2 ticks
    const reverse = steps.slice(0, -1).reverse(); // unwind back to single node
    const startPause = [steps[0]]; // hold 1 tick before restarting
    const sequence = [...forward, ...peakPause, ...reverse, ...startPause];

    let step = 0;

    this._diagramTimer = setInterval(() => {
      this.emit({
        channel: 'format-showcase',
        event: 'live_diagram:changed',
        data: sequence[step],
      });
      step = (step + 1) % sequence.length;
    }, 1500);

    return steps[0];
  }

  /**
   * Stops the live gauge stream started by `live()` or the diagram animation
   * started by `live_diagram()`.
   */
  async stop(): Promise<{ stopped: boolean }> {
    let stopped = false;
    if (this._liveTimer) {
      clearInterval(this._liveTimer);
      this._liveTimer = null;
      stopped = true;
    }
    if (this._diagramTimer) {
      clearInterval(this._diagramTimer);
      this._diagramTimer = null;
      stopped = true;
    }
    return { stopped };
  }
}
