/**
 * Booking System - Time slot reservation with distributed locks
 *
 * Create resources (rooms, equipment, services), define availability,
 * and book time slots. Uses distributed locks to prevent double-booking
 * when multiple users/agents reserve simultaneously.
 *
 * ## Quick Reference
 * - `resources` — List bookable resources
 * - `resourceCreate` — Create a bookable resource
 * - `availability` — Check available slots for a date
 * - `book` — Reserve a time slot (lock-protected)
 * - `cancel` — Cancel a booking
 * - `myBookings` — List your bookings
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @dependencies @portel/photon-core@latest
 * @tags booking, scheduling, locks, reservations, daemon
 * @icon 📅
 * @stateful
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { existsSync, readFileSync, mkdirSync } from 'fs';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface Resource {
  id: string;
  name: string;
  type: 'room' | 'equipment' | 'service' | 'other';
  description?: string;
  slotDurationMinutes: number;
  availableHours: { start: string; end: string }; // "09:00"-"17:00"
  availableDays: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  createdAt: string;
}

interface Booking {
  id: string;
  resourceId: string;
  date: string;      // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  bookedBy: string;
  title?: string;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

interface BookingData {
  resources: Resource[];
  bookings: Booking[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  status: 'available' | 'booked';
  booking?: { id: string; bookedBy: string; title?: string };
}

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════

const DATA_DIR = path.join(process.env.PHOTONS_DIR || path.join(os.homedir(), '.photon'), 'booking');
const DATA_PATH = path.join(DATA_DIR, 'data.json');

// ════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════════

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function slotsOverlap(
  s1Start: string, s1End: string,
  s2Start: string, s2End: string,
): boolean {
  const a0 = timeToMinutes(s1Start);
  const a1 = timeToMinutes(s1End);
  const b0 = timeToMinutes(s2Start);
  const b1 = timeToMinutes(s2End);
  return a0 < b1 && b0 < a1;
}

// ════════════════════════════════════════════════════════════════════════════════
// BOOKING PHOTON
// ════════════════════════════════════════════════════════════════════════════════

export default class BookingPhoton extends PhotonMCP {
  private loadData(): BookingData {
    try {
      if (existsSync(DATA_PATH)) {
        return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
      }
    } catch {}
    return { resources: [], bookings: [] };
  }

  private async saveData(data: BookingData): Promise<void> {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  private findResource(data: BookingData, nameOrId: string): Resource {
    const resource = data.resources.find(
      r => r.id === nameOrId || r.name.toLowerCase() === nameOrId.toLowerCase()
    );
    if (!resource) {
      throw new Error(`Resource not found: ${nameOrId}`);
    }
    return resource;
  }

  private findBooking(data: BookingData, bookingId: string): Booking {
    const booking = data.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    return booking;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RESOURCE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * List all bookable resources
   *
   * @example resources()
   */
  async resources(): Promise<Resource[]> {
    const data = this.loadData();
    return data.resources;
  }

  /**
   * Create a bookable resource with availability settings
   *
   * @example resourceCreate({ name: "Conference Room A", type: "room", slotDurationMinutes: 60, availableHours: { start: "09:00", end: "17:00" }, availableDays: [1,2,3,4,5] })
   * @example resourceCreate({ name: "Projector", type: "equipment", slotDurationMinutes: 30, availableHours: { start: "08:00", end: "18:00" }, availableDays: [1,2,3,4,5] })
   */
  async resourceCreate(params: {
    /** Resource name */
    name: string;
    /** Resource type */
    type: 'room' | 'equipment' | 'service' | 'other';
    /** Description */
    description?: string;
    /** Duration of each slot in minutes */
    slotDurationMinutes: number;
    /** Available hours (e.g. { start: "09:00", end: "17:00" }) */
    availableHours: { start: string; end: string };
    /** Days available (0=Sun, 1=Mon, ... 6=Sat) */
    availableDays: number[];
  }): Promise<Resource> {
    const data = this.loadData();

    // Validate
    if (params.slotDurationMinutes < 5 || params.slotDurationMinutes > 480) {
      throw new Error('Slot duration must be between 5 and 480 minutes');
    }

    const startMin = timeToMinutes(params.availableHours.start);
    const endMin = timeToMinutes(params.availableHours.end);
    if (startMin >= endMin) {
      throw new Error('Available hours start must be before end');
    }

    const resource: Resource = {
      id: this.generateId(),
      name: params.name,
      type: params.type,
      description: params.description,
      slotDurationMinutes: params.slotDurationMinutes,
      availableHours: params.availableHours,
      availableDays: params.availableDays,
      createdAt: new Date().toISOString(),
    };

    data.resources.push(resource);
    await this.saveData(data);

    this.emit({ emit: 'toast', message: `Resource created: ${resource.name}` });
    this.emit({ channel: 'booking', event: 'resource-created', data: { resource } });

    return resource;
  }

  /**
   * Update a resource's details
   *
   * @example resourceUpdate({ resource: "Conference Room A", description: "2nd floor, seats 10" })
   */
  async resourceUpdate(params: {
    /** Resource name or ID */
    resource: string;
    name?: string;
    description?: string;
    slotDurationMinutes?: number;
    availableHours?: { start: string; end: string };
    availableDays?: number[];
  }): Promise<Resource> {
    const data = this.loadData();
    const resource = this.findResource(data, params.resource);

    if (params.name !== undefined) resource.name = params.name;
    if (params.description !== undefined) resource.description = params.description;
    if (params.slotDurationMinutes !== undefined) resource.slotDurationMinutes = params.slotDurationMinutes;
    if (params.availableHours !== undefined) resource.availableHours = params.availableHours;
    if (params.availableDays !== undefined) resource.availableDays = params.availableDays;

    await this.saveData(data);

    this.emit({ channel: 'booking', event: 'resource-updated', data: { resource } });

    return resource;
  }

  /**
   * Delete a resource and all its bookings
   *
   * @example resourceDelete({ resource: "Conference Room A" })
   */
  async resourceDelete(params: {
    /** Resource name or ID */
    resource: string;
  }): Promise<{ success: boolean; message: string }> {
    const data = this.loadData();
    const resource = this.findResource(data, params.resource);

    data.resources = data.resources.filter(r => r.id !== resource.id);
    data.bookings = data.bookings.filter(b => b.resourceId !== resource.id);
    await this.saveData(data);

    this.emit({ emit: 'toast', message: `Resource deleted: ${resource.name}` });
    this.emit({ channel: 'booking', event: 'resource-deleted', data: { resourceId: resource.id } });

    return { success: true, message: `Deleted resource "${resource.name}" and all its bookings` };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // AVAILABILITY & BOOKING
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Check available time slots for a resource on a date
   *
   * Returns all slots with their status (available/booked).
   *
   * @example availability({ resource: "Conference Room A", date: "2025-02-01" })
   */
  async availability(params: {
    /** Resource name or ID */
    resource: string;
    /** Date to check (YYYY-MM-DD) */
    date: string;
  }): Promise<{ resource: string; date: string; slots: TimeSlot[] }> {
    const data = this.loadData();
    const resource = this.findResource(data, params.resource);

    // Check if date is on an available day
    const dayOfWeek = new Date(params.date + 'T00:00:00').getDay();
    if (!resource.availableDays.includes(dayOfWeek)) {
      return {
        resource: resource.name,
        date: params.date,
        slots: [], // Not available on this day
      };
    }

    // Generate all possible slots
    const startMin = timeToMinutes(resource.availableHours.start);
    const endMin = timeToMinutes(resource.availableHours.end);
    const duration = resource.slotDurationMinutes;

    // Get existing bookings for this resource and date
    const existingBookings = data.bookings.filter(
      b => b.resourceId === resource.id && b.date === params.date && b.status === 'confirmed'
    );

    const slots: TimeSlot[] = [];
    for (let t = startMin; t + duration <= endMin; t += duration) {
      const slotStart = minutesToTime(t);
      const slotEnd = minutesToTime(t + duration);

      const overlapping = existingBookings.find(b =>
        slotsOverlap(slotStart, slotEnd, b.startTime, b.endTime)
      );

      if (overlapping) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          status: 'booked',
          booking: {
            id: overlapping.id,
            bookedBy: overlapping.bookedBy,
            title: overlapping.title,
          },
        });
      } else {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          status: 'available',
        });
      }
    }

    return { resource: resource.name, date: params.date, slots };
  }

  /**
   * Book a time slot
   *
   * Uses distributed lock on the resource to prevent double-booking.
   * The lock ensures that only one booking attempt per resource
   * can proceed at a time.
   *
   * @example book({ resource: "Conference Room A", date: "2025-02-01", startTime: "10:00", title: "Team standup", bookedBy: "alice" })
   */
  async book(params: {
    /** Resource name or ID */
    resource: string;
    /** Date to book (YYYY-MM-DD) */
    date: string;
    /** Start time (HH:MM) */
    startTime: string;
    /** Optional booking title */
    title?: string;
    /** Optional notes */
    notes?: string;
    /** Who is booking */
    bookedBy?: string;
  }): Promise<{ booked: boolean; booking?: Booking; error?: string }> {
    const data = this.loadData();
    const resource = this.findResource(data, params.resource);

    return this.withLock(`booking:${resource.id}`, async () => {
      // Reload data inside lock to get latest state
      const freshData = this.loadData();
      const bookedBy = params.bookedBy || 'anonymous';

      // Calculate end time from slot duration
      const startMin = timeToMinutes(params.startTime);
      const endMin = startMin + resource.slotDurationMinutes;
      const endTime = minutesToTime(endMin);

      // Check day is available
      const dayOfWeek = new Date(params.date + 'T00:00:00').getDay();
      if (!resource.availableDays.includes(dayOfWeek)) {
        return { booked: false, error: `Resource not available on this day of the week` };
      }

      // Check within available hours
      const availStart = timeToMinutes(resource.availableHours.start);
      const availEnd = timeToMinutes(resource.availableHours.end);
      if (startMin < availStart || endMin > availEnd) {
        return {
          booked: false,
          error: `Slot ${params.startTime}-${endTime} is outside available hours (${resource.availableHours.start}-${resource.availableHours.end})`,
        };
      }

      // Check for overlapping confirmed bookings
      const overlapping = freshData.bookings.find(
        b =>
          b.resourceId === resource.id &&
          b.date === params.date &&
          b.status === 'confirmed' &&
          slotsOverlap(params.startTime, endTime, b.startTime, b.endTime)
      );

      if (overlapping) {
        return {
          booked: false,
          error: `Slot already booked by ${overlapping.bookedBy}${overlapping.title ? ` (${overlapping.title})` : ''}`,
        };
      }

      // Create booking
      const booking: Booking = {
        id: this.generateId(),
        resourceId: resource.id,
        date: params.date,
        startTime: params.startTime,
        endTime,
        bookedBy,
        title: params.title,
        notes: params.notes,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      freshData.bookings.push(booking);
      await this.saveData(freshData);

      this.emit({ emit: 'toast', message: `Booked: ${resource.name} ${params.date} ${params.startTime}-${endTime}` });
      this.emit({ channel: 'booking', event: 'booking-created', data: { booking, resource: resource.name } });

      return { booked: true, booking };
    });
  }

  /**
   * Cancel a booking
   *
   * Uses distributed lock to prevent race conditions.
   *
   * @example cancel({ bookingId: "abc123" })
   */
  async cancel(params: {
    /** Booking ID to cancel */
    bookingId: string;
  }): Promise<{ cancelled: boolean; error?: string }> {
    const data = this.loadData();
    const booking = this.findBooking(data, params.bookingId);

    if (booking.status === 'cancelled') {
      return { cancelled: false, error: 'Booking is already cancelled' };
    }

    return this.withLock(`booking:${booking.resourceId}`, async () => {
      const freshData = this.loadData();
      const freshBooking = this.findBooking(freshData, params.bookingId);

      freshBooking.status = 'cancelled';
      await this.saveData(freshData);

      const resource = freshData.resources.find(r => r.id === freshBooking.resourceId);
      this.emit({ emit: 'toast', message: `Booking cancelled: ${freshBooking.title || freshBooking.id}` });
      this.emit({ channel: 'booking', event: 'booking-cancelled', data: { booking: freshBooking, resource: resource?.name } });

      return { cancelled: true };
    });
  }

  /**
   * List bookings for a resource and/or date
   *
   * @example bookings({ resource: "Conference Room A", date: "2025-02-01" })
   * @example bookings({ date: "2025-02-01" })
   */
  async bookings(params: {
    /** Resource name or ID (optional) */
    resource?: string;
    /** Date filter (YYYY-MM-DD) */
    date?: string;
    /** Include cancelled bookings */
    includeCancelled?: boolean;
  }): Promise<Booking[]> {
    const data = this.loadData();
    let results = [...data.bookings];

    if (params.resource) {
      const resource = this.findResource(data, params.resource);
      results = results.filter(b => b.resourceId === resource.id);
    }

    if (params.date) {
      results = results.filter(b => b.date === params.date);
    }

    if (!params.includeCancelled) {
      results = results.filter(b => b.status === 'confirmed');
    }

    return results.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * List bookings by a specific user
   *
   * @example myBookings({ bookedBy: "alice" })
   */
  async myBookings(params: {
    /** User who made the bookings */
    bookedBy: string;
    /** Include past bookings */
    includePast?: boolean;
  }): Promise<Booking[]> {
    const data = this.loadData();
    const today = new Date().toISOString().split('T')[0];

    let results = data.bookings.filter(
      b => b.bookedBy.toLowerCase() === params.bookedBy.toLowerCase() && b.status === 'confirmed'
    );

    if (!params.includePast) {
      results = results.filter(b => b.date >= today);
    }

    return results.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Booking statistics
   *
   * Shows utilization rates, popular times, and booking counts.
   *
   * @example stats()
   */
  async stats(): Promise<{
    totalResources: number;
    totalBookings: number;
    activeBookings: number;
    cancelledBookings: number;
    perResource: Array<{ resourceId: string; resourceName: string; bookings: number; cancellations: number }>;
    popularTimes: Array<{ hour: number; count: number }>;
  }> {
    const data = this.loadData();
    const confirmed = data.bookings.filter(b => b.status === 'confirmed');
    const cancelled = data.bookings.filter(b => b.status === 'cancelled');

    const perResource = data.resources.map(r => {
      const rBookings = confirmed.filter(b => b.resourceId === r.id);
      const rCancelled = cancelled.filter(b => b.resourceId === r.id);
      return {
        resourceId: r.id,
        resourceName: r.name,
        bookings: rBookings.length,
        cancellations: rCancelled.length,
      };
    });

    // Popular hours
    const hourCounts: Record<number, number> = {};
    for (const b of confirmed) {
      const hour = parseInt(b.startTime.split(':')[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    const popularTimes = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: Number(hour), count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalResources: data.resources.length,
      totalBookings: data.bookings.length,
      activeBookings: confirmed.length,
      cancelledBookings: cancelled.length,
      perResource,
      popularTimes,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SCHEDULED JOBS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Upcoming booking reminders
   *
   * Checks for bookings starting in the next hour and emits reminders.
   *
   * @scheduled 0 * * * *
   * @internal
   */
  async scheduledReminders(): Promise<{ reminded: number }> {
    const data = this.loadData();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const oneHourLater = currentMinutes + 60;

    const upcoming = data.bookings.filter(b => {
      if (b.status !== 'confirmed' || b.date !== today) return false;
      const bookingMinutes = timeToMinutes(b.startTime);
      return bookingMinutes > currentMinutes && bookingMinutes <= oneHourLater;
    });

    for (const booking of upcoming) {
      const resource = data.resources.find(r => r.id === booking.resourceId);
      this.emit({
        emit: 'toast',
        message: `Reminder: ${booking.title || 'Booking'} at ${booking.startTime} (${resource?.name || 'Unknown resource'})`,
      });
      this.emit({
        channel: 'booking',
        event: 'booking-reminder',
        data: { booking, resource: resource?.name },
      });
    }

    return { reminded: upcoming.length };
  }

  /**
   * Cleanup old cancelled bookings
   *
   * Removes cancelled bookings older than 30 days.
   *
   * @scheduled 0 0 * * 0
   * @internal
   */
  async scheduledCleanup(): Promise<{ removed: number }> {
    const data = this.loadData();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const before = data.bookings.length;
    data.bookings = data.bookings.filter(b => {
      if (b.status !== 'cancelled') return true;
      return new Date(b.createdAt).getTime() > thirtyDaysAgo;
    });

    const removed = before - data.bookings.length;

    if (removed > 0) {
      await this.saveData(data);
      this.emit({ emit: 'toast', message: `Cleanup: removed ${removed} old cancelled bookings` });
    }

    return { removed };
  }
}
