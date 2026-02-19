/**
 * Google Calendar - Schedule and manage events
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 📅
 * @tags google, calendar, scheduling
 * @dependencies googleapis@^128.0.0
 */

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: string | { dateTime: string; timeZone: string };
  end?: string | { dateTime: string; timeZone: string };
  location?: string;
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  htmlLink: string;
}

export default class GoogleCalendarPhoton {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private refreshToken: string
  ) {
    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Calendar requires clientId, clientSecret, and refreshToken');
    }

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * List events
   * @param calendar Calendar ID (default: primary)
   * @param limit Results (default: 10) {@min 1} {@max 100}
   * @param from Start time (ISO 8601, optional)
   * @param to End time (ISO 8601, optional)
   * @format list {@title summary, @subtitle start, @badge location}
   * @autorun
   * @icon 📋
   */
  async list(params?: {
    calendar?: string;
    limit?: number;
    from?: string;
    to?: string;
  }) {
    const response = await this.calendar.events.list({
      calendarId: params?.calendar || 'primary',
      maxResults: params?.limit || 10,
      timeMin: params?.from || new Date().toISOString(),
      timeMax: params?.to,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    return {
      count: events.length,
      events: events.map(e => ({
        id: e.id,
        summary: e.summary,
        description: e.description,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        location: e.location,
        attendees: e.attendees?.map(a => ({
          email: a.email,
          displayName: a.displayName,
          responseStatus: a.responseStatus,
        })),
        htmlLink: e.htmlLink,
      })),
    };
  }

  /**
   * Get event
   * @param id Event ID
   * @param calendar Calendar ID (default: primary)
   * @format card
   * @icon 📖
   */
  async get(params: { id: string; calendar?: string }) {
    const response = await this.calendar.events.get({
      calendarId: params.calendar || 'primary',
      eventId: params.id,
    });

    const e = response.data;

    return {
      id: e.id,
      summary: e.summary,
      description: e.description,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      location: e.location,
      attendees: e.attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus,
      })),
      organizer: e.organizer,
      htmlLink: e.htmlLink,
      created: e.created,
      updated: e.updated,
    } as CalendarEvent & { organizer?: any; created?: string; updated?: string };
  }

  /**
   * Create event
   * @param summary Title
   * @param start Start time (ISO 8601) {@example 2024-03-15T14:00:00Z}
   * @param end End time (ISO 8601) {@example 2024-03-15T15:00:00Z}
   * @param description Description (optional) {@field textarea}
   * @param location Location (optional)
   * @param attendees Attendee emails (JSON array, optional)
   * @param calendar Calendar ID (default: primary)
   * @icon ✨
   */
  async create(params: {
    summary: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    attendees?: string[];
    calendar?: string;
  }) {
    const event: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      location: params.location,
      start: { dateTime: params.start, timeZone: 'UTC' },
      end: { dateTime: params.end, timeZone: 'UTC' },
    };

    if (params.attendees?.length) {
      event.attendees = params.attendees.map(email => ({ email }));
    }

    const response = await this.calendar.events.insert({
      calendarId: params.calendar || 'primary',
      requestBody: event,
      sendUpdates: 'all',
    });

    return {
      id: response.data.id,
      summary: response.data.summary,
      start: response.data.start?.dateTime,
      end: response.data.end?.dateTime,
      htmlLink: response.data.htmlLink,
    };
  }

  /**
   * Update event
   * @param id Event ID
   * @param updates Fields to update (JSON object)
   * @param calendar Calendar ID (default: primary)
   * @icon ✏️
   */
  async update(params: {
    id: string;
    updates: {
      summary?: string;
      description?: string;
      location?: string;
      start?: string;
      end?: string;
      attendees?: string[];
    };
    calendar?: string;
  }) {
    const existing = await this.calendar.events.get({
      calendarId: params.calendar || 'primary',
      eventId: params.id,
    });

    const updatedEvent: calendar_v3.Schema$Event = { ...existing.data };

    if (params.updates.summary) updatedEvent.summary = params.updates.summary;
    if (params.updates.description) updatedEvent.description = params.updates.description;
    if (params.updates.location) updatedEvent.location = params.updates.location;

    if (params.updates.start) {
      updatedEvent.start = { dateTime: params.updates.start, timeZone: 'UTC' };
    }

    if (params.updates.end) {
      updatedEvent.end = { dateTime: params.updates.end, timeZone: 'UTC' };
    }

    if (params.updates.attendees) {
      updatedEvent.attendees = params.updates.attendees.map(email => ({ email }));
    }

    const response = await this.calendar.events.update({
      calendarId: params.calendar || 'primary',
      eventId: params.id,
      requestBody: updatedEvent,
      sendUpdates: 'all',
    });

    return {
      id: response.data.id,
      summary: response.data.summary,
      start: response.data.start?.dateTime,
      end: response.data.end?.dateTime,
      htmlLink: response.data.htmlLink,
    };
  }

  /**
   * Delete event
   * @param id Event ID
   * @param calendar Calendar ID (default: primary)
   * @icon 🗑
   */
  async remove(params: { id: string; calendar?: string }) {
    await this.calendar.events.delete({
      calendarId: params.calendar || 'primary',
      eventId: params.id,
      sendUpdates: 'all',
    });

    return { id: params.id };
  }

  /**
   * List calendars
   * @format list {@title summary, @subtitle id, @badge primary}
   * @autorun
   * @icon 📦
   */
  async calendars() {
    const response = await this.calendar.calendarList.list();
    const items = response.data.items || [];

    return {
      count: items.length,
      calendars: items.map(c => ({
        id: c.id,
        summary: c.summary,
        description: c.description,
        primary: c.primary || false,
        accessRole: c.accessRole,
        timeZone: c.timeZone,
      })),
    };
  }

  /**
   * Check free/busy
   * @param emails Email addresses (JSON array)
   * @param from Start time (ISO 8601)
   * @param to End time (ISO 8601)
   * @format list {@title email, @subtitle busy}
   * @icon ⏰
   */
  async freeBusy(params: { emails: string[]; from: string; to: string }) {
    const response = await this.calendar.freebusy.query({
      requestBody: {
        timeMin: params.from,
        timeMax: params.to,
        items: params.emails.map(email => ({ id: email })),
      },
    });

    return {
      calendars: Object.entries(response.data.calendars || {}).map(([email, data]) => ({
        email,
        busy: (data as any).busy || [],
        errors: (data as any).errors,
      })),
    };
  }

  /**
   * Search events
   * @param query Search terms
   * @param calendar Calendar ID (default: primary)
   * @param limit Results (default: 10) {@min 1} {@max 100}
   * @format list {@title summary, @subtitle start, @badge location}
   * @icon 🔍
   */
  async search(params: { query: string; calendar?: string; limit?: number }) {
    const response = await this.calendar.events.list({
      calendarId: params.calendar || 'primary',
      q: params.query,
      maxResults: params.limit || 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    return {
      count: events.length,
      events: events.map(e => ({
        id: e.id,
        summary: e.summary,
        description: e.description,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        location: e.location,
        htmlLink: e.htmlLink,
      })),
    };
  }

  /**
   * Get upcoming (within N hours)
   * @param hours Hours ahead (default: 24) {@min 1} {@max 720}
   * @param calendar Calendar ID (default: primary)
   * @format list {@title summary, @subtitle start}
   * @autorun
   * @icon 🚀
   */
  async upcoming(params?: { hours?: number; calendar?: string }) {
    const hours = params?.hours || 24;
    const now = new Date();
    const to = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const response = await this.calendar.events.list({
      calendarId: params?.calendar || 'primary',
      timeMin: now.toISOString(),
      timeMax: to.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    return {
      hours,
      count: events.length,
      events: events.map(e => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        location: e.location,
        htmlLink: e.htmlLink,
      })),
    };
  }
}
