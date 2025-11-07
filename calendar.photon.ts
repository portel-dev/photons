/**
 * Calendar - Google Calendar integration
 *
 * Provides calendar operations using Google Calendar API (OAuth2).
 * Supports event management, calendar listing, and free/busy queries.
 *
 * Common use cases:
 * - Event management: "Schedule a meeting tomorrow at 2pm", "What's on my calendar today?"
 * - Availability: "Check when John is free this week"
 * - Search: "Find all meetings with Sarah"
 *
 * Example: listEvents({ maxResults: 10 })
 *
 * Configuration:
 * - clientId: OAuth2 client ID from Google Cloud Console
 * - clientSecret: OAuth2 client secret
 * - refreshToken: OAuth2 refresh token (obtain via OAuth flow)
 *
 * @dependencies googleapis@^128.0.0
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export default class Calendar {
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

  async onInitialize() {
    try {
      // Test authentication by listing calendars
      await this.calendar.calendarList.list({ maxResults: 1 });
      console.error('[calendar] ✅ Authenticated with Google Calendar');
    } catch (error: any) {
      console.error('[calendar] ❌ Authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * List upcoming events
   * @param calendarId Calendar ID (default: 'primary')
   * @param maxResults Maximum number of events to return (default: 10)
   * @param timeMin Start time (ISO 8601, default: now)
   * @param timeMax End time (ISO 8601, optional)
   */
  async listEvents(params?: {
    calendarId?: string;
    maxResults?: number;
    timeMin?: string;
    timeMax?: string;
  }) {
    try {
      const response = await this.calendar.events.list({
        calendarId: params?.calendarId || 'primary',
        maxResults: params?.maxResults || 10,
        timeMin: params?.timeMin || new Date().toISOString(),
        timeMax: params?.timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      return {
        success: true,
        count: events.length,
        events: events.map((event) => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          attendees: event.attendees?.map((a) => ({
            email: a.email,
            responseStatus: a.responseStatus,
          })),
          htmlLink: event.htmlLink,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get a specific event
   * @param eventId Event ID
   * @param calendarId Calendar ID (default: 'primary')
   */
  async getEvent(params: { eventId: string; calendarId?: string }) {
    try {
      const response = await this.calendar.events.get({
        calendarId: params.calendarId || 'primary',
        eventId: params.eventId,
      });

      const event = response.data;

      return {
        success: true,
        event: {
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          attendees: event.attendees?.map((a) => ({
            email: a.email,
            displayName: a.displayName,
            responseStatus: a.responseStatus,
          })),
          organizer: event.organizer,
          htmlLink: event.htmlLink,
          created: event.created,
          updated: event.updated,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a new event
   * @param summary Event title
   * @param start Start time (ISO 8601)
   * @param end End time (ISO 8601)
   * @param description Event description (optional)
   * @param location Event location (optional)
   * @param attendees Array of attendee email addresses (optional)
   * @param calendarId Calendar ID (default: 'primary')
   */
  async createEvent(params: {
    summary: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    attendees?: string[];
    calendarId?: string;
  }) {
    try {
      const event: calendar_v3.Schema$Event = {
        summary: params.summary,
        description: params.description,
        location: params.location,
        start: {
          dateTime: params.start,
          timeZone: 'UTC',
        },
        end: {
          dateTime: params.end,
          timeZone: 'UTC',
        },
      };

      if (params.attendees && params.attendees.length > 0) {
        event.attendees = params.attendees.map((email) => ({ email }));
      }

      const response = await this.calendar.events.insert({
        calendarId: params.calendarId || 'primary',
        requestBody: event,
        sendUpdates: 'all', // Send invitation emails
      });

      return {
        success: true,
        event: {
          id: response.data.id,
          summary: response.data.summary,
          start: response.data.start?.dateTime,
          end: response.data.end?.dateTime,
          htmlLink: response.data.htmlLink,
        },
        message: 'Event created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update an existing event
   * @param eventId Event ID
   * @param updates Object containing fields to update
   * @param calendarId Calendar ID (default: 'primary')
   */
  async updateEvent(params: {
    eventId: string;
    updates: {
      summary?: string;
      description?: string;
      location?: string;
      start?: string;
      end?: string;
      attendees?: string[];
    };
    calendarId?: string;
  }) {
    try {
      // First get the existing event
      const existingEvent = await this.calendar.events.get({
        calendarId: params.calendarId || 'primary',
        eventId: params.eventId,
      });

      // Prepare updated event
      const updatedEvent: calendar_v3.Schema$Event = {
        ...existingEvent.data,
      };

      if (params.updates.summary) updatedEvent.summary = params.updates.summary;
      if (params.updates.description) updatedEvent.description = params.updates.description;
      if (params.updates.location) updatedEvent.location = params.updates.location;

      if (params.updates.start) {
        updatedEvent.start = {
          dateTime: params.updates.start,
          timeZone: 'UTC',
        };
      }

      if (params.updates.end) {
        updatedEvent.end = {
          dateTime: params.updates.end,
          timeZone: 'UTC',
        };
      }

      if (params.updates.attendees) {
        updatedEvent.attendees = params.updates.attendees.map((email) => ({ email }));
      }

      const response = await this.calendar.events.update({
        calendarId: params.calendarId || 'primary',
        eventId: params.eventId,
        requestBody: updatedEvent,
        sendUpdates: 'all',
      });

      return {
        success: true,
        event: {
          id: response.data.id,
          summary: response.data.summary,
          start: response.data.start?.dateTime,
          end: response.data.end?.dateTime,
          htmlLink: response.data.htmlLink,
        },
        message: 'Event updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete an event
   * @param eventId Event ID
   * @param calendarId Calendar ID (default: 'primary')
   */
  async deleteEvent(params: { eventId: string; calendarId?: string }) {
    try {
      await this.calendar.events.delete({
        calendarId: params.calendarId || 'primary',
        eventId: params.eventId,
        sendUpdates: 'all', // Send cancellation emails
      });

      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all calendars
   */
  async listCalendars(params: {}) {
    try {
      const response = await this.calendar.calendarList.list();

      const calendars = response.data.items || [];

      return {
        success: true,
        count: calendars.length,
        calendars: calendars.map((cal) => ({
          id: cal.id,
          summary: cal.summary,
          description: cal.description,
          primary: cal.primary || false,
          accessRole: cal.accessRole,
          timeZone: cal.timeZone,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check free/busy status
   * @param emails Array of email addresses to check
   * @param timeMin Start time (ISO 8601)
   * @param timeMax End time (ISO 8601)
   */
  async getFreeBusy(params: { emails: string[]; timeMin: string; timeMax: string }) {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: params.timeMin,
          timeMax: params.timeMax,
          items: params.emails.map((email) => ({ id: email })),
        },
      });

      const calendars = response.data.calendars || {};

      return {
        success: true,
        calendars: Object.entries(calendars).map(([email, data]) => ({
          email,
          busy: data.busy || [],
          errors: data.errors,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search for events
   * @param query Search query
   * @param calendarId Calendar ID (default: 'primary')
   * @param maxResults Maximum number of results (default: 10)
   */
  async searchEvents(params: { query: string; calendarId?: string; maxResults?: number }) {
    try {
      const response = await this.calendar.events.list({
        calendarId: params.calendarId || 'primary',
        q: params.query,
        maxResults: params.maxResults || 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      return {
        success: true,
        count: events.length,
        query: params.query,
        events: events.map((event) => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          htmlLink: event.htmlLink,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get upcoming events within specified hours
   * @param hours Number of hours from now (default: 24)
   * @param calendarId Calendar ID (default: 'primary')
   */
  async getUpcomingEvents(params?: { hours?: number; calendarId?: string }) {
    try {
      const hours = params?.hours || 24;
      const now = new Date();
      const timeMax = new Date(now.getTime() + hours * 60 * 60 * 1000);

      const response = await this.calendar.events.list({
        calendarId: params?.calendarId || 'primary',
        timeMin: now.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      return {
        success: true,
        hours,
        count: events.length,
        events: events.map((event) => ({
          id: event.id,
          summary: event.summary,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          htmlLink: event.htmlLink,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
