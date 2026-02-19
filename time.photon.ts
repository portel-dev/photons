/**
 * Time - Timezone and time conversion
 *
 * Timezone-aware time operations using native Node.js Intl API (zero dependencies).
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 🕐
 * @tags time, timezone, conversion
 */

export default class Time {
  private localTimezone: string;

  constructor(local_timezone?: string) {
    this.localTimezone =
      local_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Current time in a timezone
   * @param timezone IANA timezone {@example America/New_York}
   * @autorun
   * @format card
   */
  async now(params?: { timezone?: string }) {
    const tz = params?.timezone || this.localTimezone;
    this.validateTimezone(tz);

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const getValue = (type: string) => parts.find(p => p.type === type)?.value;

    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'longOffset',
    });
    const offsetParts = offsetFormatter.formatToParts(now);
    const offset = offsetParts.find(p => p.type === 'timeZoneName')?.value;

    return {
      timezone: tz,
      datetime: `${getValue('year')}-${getValue('month')}-${getValue('day')}T${getValue('hour')}:${getValue('minute')}:${getValue('second')}`,
      formatted: formatter.format(now),
      offset,
      timestamp: now.getTime(),
    };
  }

  /**
   * Convert time between timezones
   * @param source_timezone Source IANA timezone {@example America/New_York}
   * @param time Time in HH:MM format {@example 14:30}
   * @param target_timezone Target IANA timezone {@example Europe/London}
   * @param date Date in YYYY-MM-DD format {@example 2024-03-15}
   * @format card
   */
  async convert(params: {
    source_timezone: string;
    time: string;
    target_timezone: string;
    date?: string;
  }) {
    this.validateTimezone(params.source_timezone);
    this.validateTimezone(params.target_timezone);

    const timeMatch = params.time.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      throw new Error('Invalid time format. Use HH:MM (24-hour, e.g., 14:30)');
    }

    const [, hoursStr, minutesStr] = timeMatch;
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time. Hours: 0-23, Minutes: 0-59');
    }

    let dateStr = params.date;
    if (!dateStr) {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: params.source_timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      dateStr = formatter.format(now);
    }

    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
      throw new Error('Invalid date format. Use YYYY-MM-DD (e.g., 2024-03-15)');
    }

    const utcDate = new Date(
      `${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00Z`
    );

    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: params.target_timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const targetParts = targetFormatter.formatToParts(utcDate);
    const getValue = (type: string) =>
      targetParts.find(p => p.type === type)?.value;

    return {
      source: {
        timezone: params.source_timezone,
        time: params.time,
        date: dateStr,
      },
      target: {
        timezone: params.target_timezone,
        time: `${getValue('hour')}:${getValue('minute')}`,
        date: `${getValue('year')}-${getValue('month')}-${getValue('day')}`,
      },
    };
  }

  /**
   * List common timezones
   * @param region Filter by region {@choice America,Europe,Asia,Africa,Pacific,Atlantic,Indian}
   * @autorun
   * @format table
   */
  async timezones(
    params?: {
      region?: 'America' | 'Europe' | 'Asia' | 'Africa' | 'Pacific' | 'Atlantic' | 'Indian';
    }
  ) {
    const all: Record<string, string[]> = {
      America: [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'America/Toronto',
        'America/Vancouver',
        'America/Mexico_City',
        'America/Sao_Paulo',
        'America/Buenos_Aires',
      ],
      Europe: [
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Europe/Rome',
        'Europe/Madrid',
        'Europe/Amsterdam',
        'Europe/Brussels',
        'Europe/Vienna',
        'Europe/Moscow',
      ],
      Asia: [
        'Asia/Dubai',
        'Asia/Kolkata',
        'Asia/Shanghai',
        'Asia/Hong_Kong',
        'Asia/Tokyo',
        'Asia/Seoul',
        'Asia/Singapore',
        'Asia/Bangkok',
        'Asia/Jakarta',
      ],
      Pacific: [
        'Pacific/Auckland',
        'Pacific/Fiji',
        'Pacific/Honolulu',
        'Pacific/Guam',
        'Pacific/Sydney',
      ],
      Africa: [
        'Africa/Cairo',
        'Africa/Johannesburg',
        'Africa/Nairobi',
        'Africa/Lagos',
        'Africa/Casablanca',
      ],
      Atlantic: [
        'Atlantic/Reykjavik',
        'Atlantic/Azores',
        'Atlantic/Bermuda',
      ],
      Indian: [
        'Indian/Maldives',
        'Indian/Mauritius',
      ],
    };

    if (params?.region) {
      if (!all[params.region]) {
        throw new Error(
          `Unknown region: ${params.region}. Available: ${Object.keys(all).join(', ')}`
        );
      }
      return all[params.region].map(tz => ({ timezone: tz, region: params.region }));
    }

    const result = [];
    for (const [region, zones] of Object.entries(all)) {
      result.push(...zones.map(tz => ({ timezone: tz, region })));
    }
    return result;
  }

  private validateTimezone(tz: string) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
    } catch {
      throw new Error(
        `Invalid timezone: ${tz}. Use IANA names like "America/New_York"`
      );
    }
  }
}
