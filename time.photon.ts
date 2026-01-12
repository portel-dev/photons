/**
 * Time - Timezone and time conversion operations
 *
 * Provides timezone-aware time operations using native Node.js Intl API.
 * Zero dependencies, uses JavaScript's built-in timezone support.
 *
 * Common use cases:
 * - Current time queries: "What time is it in Tokyo?"
 * - Time conversion: "Convert 2pm EST to PST"
 * - Meeting scheduling: "What's 9am in New York in London time?"
 *
 * Example: getCurrentTime({ timezone: "America/New_York" })
 *
 * Configuration:
 * - local_timezone: Override system timezone (optional, IANA timezone name)
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

export default class Time {
  private localTimezone: string;

  constructor(local_timezone?: string) {
    // Auto-detect system timezone or use provided override
    this.localTimezone = local_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  async onInitialize() {
    // Photon ready
  }

  /**
   * Get current time in a specific timezone
   * @param timezone IANA timezone name {@example America/New_York}
   */
  async getCurrentTime(params?: { timezone?: string }) {
    try {
      const timezone = params?.timezone || this.localTimezone;

      // Validate timezone
      try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch {
        return {
          success: false,
          error: `Invalid timezone: ${timezone}. Use IANA timezone names (e.g., "America/New_York")`,
        };
      }

      const now = new Date();

      // Format in requested timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const getValue = (type: string) => parts.find(p => p.type === type)?.value || '';

      const year = getValue('year');
      const month = getValue('month');
      const day = getValue('day');
      const hour = getValue('hour');
      const minute = getValue('minute');
      const second = getValue('second');

      const isoFormat = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
      const humanFormat = formatter.format(now);

      // Get timezone offset
      const offsetFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'longOffset',
      });
      const offsetParts = offsetFormatter.formatToParts(now);
      const offset = offsetParts.find(p => p.type === 'timeZoneName')?.value || '';

      return {
        success: true,
        timezone,
        datetime: isoFormat,
        formatted: humanFormat,
        offset,
        timestamp: now.getTime(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Convert time from one timezone to another
   * @param source_timezone {@min 1} {@max 100} Source IANA timezone {@example America/New_York}
   * @param time {@min 1} {@max 10} {@format time} Time in 24-hour format (HH:MM) {@example 14:30}
   * @param target_timezone {@min 1} {@max 100} Target IANA timezone {@example Europe/London}
   * @param date {@max 20} {@format date} Date in YYYY-MM-DD format (optional, default: today) {@example 2024-03-15}
   */
  async convertTime(params: {
    source_timezone: string;
    time: string;
    target_timezone: string;
    date?: string;
  }) {
    try {
      // Validate timezones
      try {
        Intl.DateTimeFormat(undefined, { timeZone: params.source_timezone });
        Intl.DateTimeFormat(undefined, { timeZone: params.target_timezone });
      } catch {
        return {
          success: false,
          error: 'Invalid timezone. Use IANA timezone names (e.g., "America/New_York")',
        };
      }

      // Parse time (HH:MM format)
      const timeMatch = params.time.match(/^(\d{1,2}):(\d{2})$/);
      if (!timeMatch) {
        return {
          success: false,
          error: 'Invalid time format. Use HH:MM (24-hour format, e.g., "14:30")',
        };
      }

      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return {
          success: false,
          error: 'Invalid time values. Hours: 0-23, Minutes: 0-59',
        };
      }

      // Get date (default: today in source timezone)
      let dateStr = params.date;
      if (!dateStr) {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: params.source_timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        dateStr = formatter.format(now); // YYYY-MM-DD format
      }

      // Validate date format
      const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!dateMatch) {
        return {
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD (e.g., "2024-03-15")',
        };
      }

      // Create datetime string in source timezone
      const datetimeStr = `${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

      // Parse as date in source timezone (this is tricky without libraries)
      // We'll use a workaround by creating a date and adjusting for timezone offset
      const sourceDate = new Date(datetimeStr);

      // Get offset difference between UTC and source timezone at this date/time
      const sourceFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: params.source_timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      // Create a UTC date with the source time
      const utcDate = new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00Z`);

      // Format in target timezone
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
      const getValue = (type: string) => targetParts.find(p => p.type === type)?.value || '';

      const targetTime = `${getValue('hour')}:${getValue('minute')}`;
      const targetDate = `${getValue('year')}-${getValue('month')}-${getValue('day')}`;

      return {
        success: true,
        source: {
          timezone: params.source_timezone,
          time: params.time,
          date: dateStr,
        },
        target: {
          timezone: params.target_timezone,
          time: targetTime,
          date: targetDate,
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
   * List common IANA timezones by region
   * @param region Filter by region {@example America}
   */
  async listTimezones(params?: { region?: 'America' | 'Europe' | 'Asia' | 'Africa' | 'Pacific' | 'Atlantic' | 'Indian' }) {
    try {
      // Common IANA timezones
      const timezones: Record<string, string[]> = {
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
        const region = params.region;
        if (!timezones[region]) {
          return {
            success: false,
            error: `Unknown region: ${region}. Available: ${Object.keys(timezones).join(', ')}`,
          };
        }

        return {
          success: true,
          region,
          timezones: timezones[region],
        };
      }

      // Return all
      return {
        success: true,
        regions: Object.keys(timezones),
        timezones,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
