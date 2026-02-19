/**
 * Expenses — Track spending with budgets and summaries
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 💰
 * @tags expenses, finance, budget
 * @stateful true
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
  /**
   * Add an expense
   * @param amount Amount spent {@min 0.01}
   * @param category Category {@choice food,transport,utilities,entertainment,other}
   * @param description What the expense was for
   * @param date Date of expense (YYYY-MM-DD) {@default today}
   * @icon ➕
   */
  async add(params: { amount: number; category: string; description: string; date?: string }) {
    const expenses = await this.memory.get<Expense[]>('expenses') ?? [];
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: Math.round(params.amount * 100) / 100,
      category: params.category.toLowerCase(),
      description: params.description,
      date: params.date || new Date().toISOString().slice(0, 10),
    };
    expenses.push(expense);
    await this.memory.set('expenses', expenses);
    this.emit('added', { id: expense.id, amount: expense.amount, description: expense.description });

    // Check budget
    const budget = await this.memory.get<BudgetConfig>('budget');
    if (budget) {
      const month = expense.date.slice(0, 7);
      const monthTotal = expenses
        .filter(e => e.date.startsWith(month))
        .reduce((sum, e) => sum + e.amount, 0);
      if (monthTotal > budget.limit) {
        this.emit('budget-warning', { spent: monthTotal, limit: budget.limit });
      }
    }

    return { added: expense, total: expenses.length };
  }

  /**
   * List all expenses
   * @param category Filter by category {@choice food,transport,utilities,entertainment,other}
   * @param month Filter by month (YYYY-MM)
   * @format table
   * @autorun
   * @icon 📋
   */
  async list(params?: { category?: string; month?: string }) {
    let expenses = await this.memory.get<Expense[]>('expenses') ?? [];

    if (params?.category) {
      expenses = expenses.filter(e => e.category === params.category?.toLowerCase());
    }
    if (params?.month) {
      expenses = expenses.filter(e => e.date.startsWith(params.month!));
    }

    const sorted = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return new Table(sorted)
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
   * @format dashboard
   * @autorun
   * @icon 📊
   */
  async summary(params?: { month?: string }) {
    const expenses = await this.memory.get<Expense[]>('expenses') ?? [];
    const month = params?.month || new Date().toISOString().slice(0, 7);
    const monthExpenses = expenses.filter(e => e.date.startsWith(month));

    const groups = monthExpenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = [];
      acc[e.category].push(e);
      return acc;
    }, {} as Record<string, Expense[]>);

    const rows = Object.entries(groups).map(([category, items]) => {
      const total = items.reduce((sum, e) => sum + e.amount, 0);
      return {
        category,
        count: items.length,
        total: Math.round(total * 100) / 100,
        average: Math.round((total / items.length) * 100) / 100,
      };
    }).sort((a, b) => b.total - a.total);

    const grandTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

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
   * @icon 🎯
   */
  async budget(params?: { limit?: number }) {
    if (params?.limit !== undefined) {
      await this.memory.set('budget', { limit: params.limit });
      this.emit('budget-set', { limit: params.limit });
      return { budget: params.limit, status: 'set' };
    }

    const budget = await this.memory.get<BudgetConfig>('budget');
    if (!budget) {
      throw new Error('No budget set — use budget(limit) to set one');
    }

    const expenses = await this.memory.get<Expense[]>('expenses') ?? [];
    const month = new Date().toISOString().slice(0, 7);
    const spent = expenses
      .filter(e => e.date.startsWith(month))
      .reduce((sum, e) => sum + e.amount, 0);
    const remaining = budget.limit - spent;

    return {
      budget: budget.limit,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      status: remaining < 0 ? 'over budget' : remaining < budget.limit * 0.1 ? 'almost at limit' : 'on track',
    };
  }
}
