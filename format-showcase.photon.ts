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

import { PhotonMCP } from '@portel/photon-core';

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
   * iOS-style list with title, subtitle, and badge
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
   * Single object displayed as a card
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
   * Array of objects displayed as a sortable table
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
   * Bar chart showing monthly revenue
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
   * Pie chart showing budget breakdown
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
   * Single KPI metric with delta
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
   * Circular gauge showing CPU usage
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
   * Vertical timeline of project milestones
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
   * Composite dashboard with mixed data types
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
   * Shopping cart with items and totals
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
   * CSS grid of titled panels rendering inner content as cards
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
   * Tab bar switching between categorized lists
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
   * Collapsible FAQ sections
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
   * Vertical stack of KPI metrics
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
   * Side-by-side pie charts comparing plans
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
}
