/**
 * Form Inbox - Webhook-powered form submission collector
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags forms, webhooks, submissions, feedback, daemon
 * @icon 📬
 * @stateful
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { existsSync, readFileSync, mkdirSync } from 'fs';

interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea';
  required: boolean;
  options?: string[]; // for select type
}

interface Form {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
  submissionCount: number;
  webhookSecret?: string;
}

interface Submission {
  id: string;
  formId: string;
  data: Record<string, string>;
  submittedAt: string;
  source: string;
  metadata?: Record<string, string>;
}

interface InboxData {
  forms: Form[];
  submissions: Submission[];
}

const DATA_DIR = path.join(process.env.PHOTONS_DIR || path.join(os.homedir(), '.photon'), 'form-inbox');
const DATA_PATH = path.join(DATA_DIR, 'data.json');

export default class FormInboxPhoton extends PhotonMCP {
  private loadData(): InboxData {
    try {
      if (existsSync(DATA_PATH)) {
        return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
      }
    } catch {}
    return { forms: [], submissions: [] };
  }

  private async saveData(data: InboxData): Promise<void> {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * List all forms with submission counts
   */
  async forms(): Promise<Form[]> {
    const data = this.loadData();
    return data.forms;
  }

  /**
   * Create a new form with field definitions
   */
  async formCreate(params: {
    name: string;
    fields: FormField[];
    webhookSecret?: string;
  }): Promise<Form> {
    const data = this.loadData();

    const form: Form = {
      id: this.generateId(),
      name: params.name,
      fields: params.fields,
      createdAt: new Date().toISOString(),
      submissionCount: 0,
      webhookSecret: params.webhookSecret,
    };

    data.forms.push(form);
    await this.saveData(data);

    this.emit({ emit: 'toast', message: `Form created: ${form.name}` });
    this.emit({ channel: 'form-inbox', event: 'form-created', data: { form } });

    return form;
  }

  /**
   * Delete a form and all its submissions
   */
  async formDelete(params: { formId: string }): Promise<Form> {
    const data = this.loadData();
    const index = data.forms.findIndex(f => f.id === params.formId);
    if (index === -1) throw new Error(`Form not found: ${params.formId}`);

    const form = data.forms[index];
    data.forms.splice(index, 1);
    data.submissions = data.submissions.filter(s => s.formId !== params.formId);
    await this.saveData(data);

    this.emit({ emit: 'toast', message: `Form deleted: ${form.name}` });
    this.emit({ channel: 'form-inbox', event: 'form-deleted', data: { formId: params.formId } });

    return form;
  }

  /**
   * List submissions for a form with pagination
   */
  async submissions(params: {
    formId: string;
    limit?: number;
    offset?: number;
  }): Promise<{ submissions: Submission[]; total: number; hasMore: boolean }> {
    const data = this.loadData();
    const form = data.forms.find(f => f.id === params.formId);

    if (!form) {
      throw new Error(`Form not found: ${params.formId}`);
    }

    const all = data.submissions
      .filter(s => s.formId === params.formId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const page = all.slice(offset, offset + limit);

    return {
      submissions: page,
      total: all.length,
      hasMore: offset + limit < all.length,
    };
  }

  /**
   * Get a single submission detail
   */
  async submission(params: { submissionId: string }): Promise<Submission> {
    const data = this.loadData();
    const sub = data.submissions.find(s => s.id === params.submissionId);

    if (!sub) {
      throw new Error(`Submission not found: ${params.submissionId}`);
    }

    return sub;
  }

  /**
   * Delete a submission
   */
  async submissionDelete(params: { submissionId: string }): Promise<Submission> {
    const data = this.loadData();
    const index = data.submissions.findIndex(s => s.id === params.submissionId);
    if (index === -1) throw new Error(`Submission not found: ${params.submissionId}`);

    const sub = data.submissions[index];
    data.submissions.splice(index, 1);
    const form = data.forms.find(f => f.id === sub.formId);
    if (form && form.submissionCount > 0) form.submissionCount--;
    await this.saveData(data);

    return sub;
  }

  /**
   * Export submissions as JSON or CSV
   */
  async export(params: {
    formId: string;
    format: 'json' | 'csv';
  }): Promise<{ data: string; filename: string; contentType: string }> {
    const data = this.loadData();
    const form = data.forms.find(f => f.id === params.formId);

    if (!form) {
      throw new Error(`Form not found: ${params.formId}`);
    }

    const subs = data.submissions
      .filter(s => s.formId === params.formId)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

    const safeName = form.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    if (params.format === 'json') {
      return {
        data: JSON.stringify(subs, null, 2),
        filename: `${safeName}_submissions.json`,
        contentType: 'application/json',
      };
    }

    // CSV export
    const fieldNames = form.fields.map(f => f.name);
    const headers = ['id', 'submittedAt', 'source', ...fieldNames];
    const rows = subs.map(s => {
      const values = [
        s.id,
        s.submittedAt,
        s.source,
        ...fieldNames.map(name => {
          const val = s.data[name] ?? '';
          // Escape CSV values
          return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        }),
      ];
      return values.join(',');
    });

    return {
      data: [headers.join(','), ...rows].join('\n'),
      filename: `${safeName}_submissions.csv`,
      contentType: 'text/csv',
    };
  }

  /**
   * Submission statistics across all forms
   */
  async stats(): Promise<{
    totalForms: number;
    totalSubmissions: number;
    perForm: Array<{ formId: string; formName: string; count: number }>;
    last7Days: Array<{ date: string; count: number }>;
  }> {
    const data = this.loadData();

    const perForm = data.forms.map(f => ({
      formId: f.id,
      formName: f.name,
      count: f.submissionCount,
    }));

    // Submissions per day for last 7 days
    const last7Days: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = data.submissions.filter(s =>
        s.submittedAt.startsWith(dateStr)
      ).length;

      last7Days.push({ date: dateStr, count });
    }

    return {
      totalForms: data.forms.length,
      totalSubmissions: data.submissions.length,
      perForm,
      last7Days,
    };
  }

  /**
   * Receive form submission via webhook
   * @internal
   */
  async handleSubmission(params: {
    form?: string;
    _webhook?: { query?: { form?: string }; headers?: Record<string, string>; ip?: string };
    [key: string]: any;
  }): Promise<{ received: boolean; submissionId?: string; errors?: string[] }> {
    const formId = params._webhook?.query?.form || params.form;

    if (!formId) {
      return { received: false, errors: ['Missing form ID. Use ?form=<formId> query parameter.'] };
    }

    const data = this.loadData();
    const form = data.forms.find(f => f.id === formId);

    if (!form) {
      return { received: false, errors: [`Form not found: ${formId}`] };
    }

    // Validate required fields
    const errors: string[] = [];
    const submissionData: Record<string, string> = {};

    for (const field of form.fields) {
      const value = params[field.name];

      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`Missing required field: ${field.name}`);
        continue;
      }

      if (value !== undefined && value !== null) {
        // Basic type validation
        if (field.type === 'email' && typeof value === 'string' && !value.includes('@')) {
          errors.push(`Invalid email: ${field.name}`);
        }
        if (field.type === 'number' && isNaN(Number(value))) {
          errors.push(`Invalid number: ${field.name}`);
        }
        if (field.type === 'select' && field.options && !field.options.includes(String(value))) {
          errors.push(`Invalid option for ${field.name}: ${value}. Valid: ${field.options.join(', ')}`);
        }

        submissionData[field.name] = String(value);
      }
    }

    if (errors.length > 0) {
      return { received: false, errors };
    }

    const submission: Submission = {
      id: this.generateId(),
      formId,
      data: submissionData,
      submittedAt: new Date().toISOString(),
      source: params._webhook?.ip || 'unknown',
      metadata: params._webhook?.headers
        ? { 'user-agent': params._webhook.headers['user-agent'] || '' }
        : undefined,
    };

    data.submissions.push(submission);
    form.submissionCount++;
    await this.saveData(data);

    this.emit({ emit: 'toast', message: `New submission for "${form.name}"` });
    this.emit({ channel: 'form-inbox', event: 'submission-received', data: { formId, submissionId: submission.id } });

    return { received: true, submissionId: submission.id };
  }

  /**
   * Receive bulk CSV import via webhook
   * @internal
   */
  async handleBulkImport(params: {
    form?: string;
    csv?: string;
    _webhook?: { query?: { form?: string }; ip?: string };
  }): Promise<{ imported: number; errors: string[] }> {
    const formId = params._webhook?.query?.form || params.form;

    if (!formId) {
      return { imported: 0, errors: ['Missing form ID. Use ?form=<formId> query parameter.'] };
    }

    if (!params.csv) {
      return { imported: 0, errors: ['Missing csv field in request body.'] };
    }

    const data = this.loadData();
    const form = data.forms.find(f => f.id === formId);

    if (!form) {
      return { imported: 0, errors: [`Form not found: ${formId}`] };
    }

    const lines = params.csv.trim().split('\n');
    if (lines.length < 2) {
      return { imported: 0, errors: ['CSV must have at least a header row and one data row.'] };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const errors: string[] = [];
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const rowData: Record<string, string> = {};

      for (let j = 0; j < headers.length; j++) {
        rowData[headers[j]] = values[j] || '';
      }

      // Check required fields
      let rowValid = true;
      for (const field of form.fields) {
        if (field.required && !rowData[field.name]) {
          errors.push(`Row ${i}: missing required field "${field.name}"`);
          rowValid = false;
        }
      }

      if (rowValid) {
        const submission: Submission = {
          id: this.generateId(),
          formId,
          data: rowData,
          submittedAt: new Date().toISOString(),
          source: params._webhook?.ip || 'bulk-import',
        };
        data.submissions.push(submission);
        form.submissionCount++;
        imported++;
      }
    }

    await this.saveData(data);

    if (imported > 0) {
      this.emit({ emit: 'toast', message: `Bulk import: ${imported} submissions added to "${form.name}"` });
      this.emit({ channel: 'form-inbox', event: 'bulk-import', data: { formId, imported } });
    }

    return { imported, errors };
  }

  /**
   * Daily submission digest
   * @scheduled 0 9 * * *
   * @internal
   */
  async scheduledDigest(): Promise<{ forms: number; submissions: number; summary: string }> {
    const data = this.loadData();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const yesterdaySubmissions = data.submissions.filter(s =>
      s.submittedAt.startsWith(dateStr)
    );

    // Count per form
    const perForm: Record<string, number> = {};
    for (const sub of yesterdaySubmissions) {
      perForm[sub.formId] = (perForm[sub.formId] || 0) + 1;
    }

    const formSummaries = Object.entries(perForm).map(([formId, count]) => {
      const form = data.forms.find(f => f.id === formId);
      return `${form?.name || formId}: ${count} submissions`;
    });

    const summary = yesterdaySubmissions.length === 0
      ? `No submissions received on ${dateStr}.`
      : `${dateStr} digest: ${yesterdaySubmissions.length} total submissions.\n${formSummaries.join('\n')}`;

    if (yesterdaySubmissions.length > 0) {
      this.emit({ emit: 'toast', message: `Daily digest: ${yesterdaySubmissions.length} submissions yesterday` });
    }

    return {
      forms: Object.keys(perForm).length,
      submissions: yesterdaySubmissions.length,
      summary,
    };
  }

  /**
   * Cleanup old submissions (90+ days)
   * @scheduled 0 0 * * 0
   * @internal
   */
  async scheduledCleanup(): Promise<{ removed: number }> {
    const data = this.loadData();
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const before = data.submissions.length;
    const removed: Record<string, number> = {};

    data.submissions = data.submissions.filter(s => {
      const age = new Date(s.submittedAt).getTime();
      if (age < ninetyDaysAgo) {
        removed[s.formId] = (removed[s.formId] || 0) + 1;
        return false;
      }
      return true;
    });

    // Update form submission counts
    for (const [formId, count] of Object.entries(removed)) {
      const form = data.forms.find(f => f.id === formId);
      if (form) {
        form.submissionCount = Math.max(0, form.submissionCount - count);
      }
    }

    const totalRemoved = before - data.submissions.length;

    if (totalRemoved > 0) {
      await this.saveData(data);
      this.emit({ emit: 'toast', message: `Cleanup: removed ${totalRemoved} submissions older than 90 days` });
    }

    return { removed: totalRemoved };
  }
}
