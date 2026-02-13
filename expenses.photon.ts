/**
 * Expense Tracker — Memory + Collection + Typed Fields
 *
 * Track personal expenses with category breakdowns and budget alerts.
 * Uses `this.memory` for zero-boilerplate persistence, `Collection` for
 * rich querying (groupBy, sum, where), and `Table` with typed fields
 * for polished rendering (currency, badges, dates).
 *
 * Use named instances (`_use`) to keep personal vs work expenses separate.
 *
 * @description Track expenses with budgets and category breakdowns
 * @tags demo, memory, collection, table, named-instances
 * @icon 💰
 */

import { PhotonMCP, Table, Collection } from '@portel/photon-core';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface BudgetConfig {
  limit: number;
}

export default class Expenses extends PhotonMCP {

  private async loadExpenses(): Promise<Collection<Expense>> {
    const items = await this.memory.get<Expense[]>('expenses') ?? [];
    return Collection.from(items);
  }

  private async saveExpenses(expenses: Collection<Expense>): Promise<void> {
    await this.memory.set('expenses', Array.from(expenses));
  }

  /**
   * Add an expense
   * @param amount Amount spent {@min 0.01}
   * @param category Category (food, transport, utilities, entertainment, other)
   * @param description What the expense was for
   * @param date Date of expense (YYYY-MM-DD) {@default today}
   */
  async add(params: { amount: number; category: string; description: string; date?: string }) {
    const expenses = await this.loadExpenses();
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: Math.round(params.amount * 100) / 100,
      category: params.category.toLowerCase(),
      description: params.description,
      date: params.date || new Date().toISOString().slice(0, 10),
    };
    expenses.push(expense);
    await this.saveExpenses(expenses);
    this.emit({ emit: 'toast', message: `Added $${expense.amount} for ${expense.description}`, type: 'success' });

    // Check budget
    const budget = await this.memory.get<BudgetConfig>('budget');
    if (budget) {
      const month = expense.date.slice(0, 7);
      const monthTotal = expenses
        .query(e => e.date.startsWith(month))
        .sum('amount');
      if (monthTotal > budget.limit) {
        this.emit({ emit: 'toast', message: `⚠️ Over budget! $${monthTotal.toFixed(2)} / $${budget.limit}`, type: 'warning' });
      }
    }

    return { added: expense, total: expenses.count() };
  }

  /**
   * List all expenses
   * @param category Filter by category
   * @param month Filter by month (YYYY-MM)
   */
  async list(params?: { category?: string; month?: string }) {
    let expenses = await this.loadExpenses();

    if (params?.category) {
      expenses = expenses.where('category', params.category.toLowerCase());
    }
    if (params?.month) {
      expenses = expenses.query(e => e.date.startsWith(params.month!));
    }

    return new Table(Array.from(expenses.sortBy('date', 'desc')))
      .currency('amount', { currency: 'USD' })
      .badge('category', {
        colors: {
          food: 'green', transport: 'blue', utilities: 'orange',
          entertainment: 'purple', other: 'gray',
        },
      })
      .date('date');
  }

  /**
   * Category spending summary
   * @param month Filter by month (YYYY-MM) {@default current month}
   */
  async summary(params?: { month?: string }) {
    const expenses = await this.loadExpenses();
    const month = params?.month || new Date().toISOString().slice(0, 7);
    const monthExpenses = expenses.query(e => e.date.startsWith(month));
    const groups = monthExpenses.groupBy('category');

    const rows = Object.entries(groups).map(([category, items]) => ({
      category,
      count: items.count(),
      total: Math.round(items.sum('amount') * 100) / 100,
      average: Math.round(items.avg('amount') * 100) / 100,
    })).sort((a, b) => b.total - a.total);

    const grandTotal = monthExpenses.sum('amount');

    return {
      month,
      grandTotal: Math.round(grandTotal * 100) / 100,
      breakdown: new Table(rows)
        .badge('category', {
          colors: {
            food: 'green', transport: 'blue', utilities: 'orange',
            entertainment: 'purple', other: 'gray',
          },
        })
        .currency('total', { currency: 'USD' })
        .currency('average', { currency: 'USD' }),
    };
  }

  /**
   * Set or check monthly budget
   * @param limit Monthly spending limit in dollars (omit to check current)
   */
  async budget(params?: { limit?: number }) {
    if (params?.limit !== undefined) {
      await this.memory.set('budget', { limit: params.limit });
      this.emit({ emit: 'toast', message: `Budget set to $${params.limit}/month`, type: 'success' });
      return { budget: params.limit, status: 'set' };
    }

    const budget = await this.memory.get<BudgetConfig>('budget');
    if (!budget) return { status: 'no budget set — use budget(limit) to set one' };

    const expenses = await this.loadExpenses();
    const month = new Date().toISOString().slice(0, 7);
    const spent = expenses.query(e => e.date.startsWith(month)).sum('amount');
    const remaining = budget.limit - spent;

    return {
      budget: budget.limit,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      status: remaining < 0 ? 'over budget' : remaining < budget.limit * 0.1 ? 'almost at limit' : 'on track',
    };
  }
}
