/**
 * Input Showcase
 * @description Demonstrates all input types: sliders, dates, time, ranges
 * @category Development
 */
export default class InputShowcase {
  /**
   * Test slider with explicit min/max bounds
   * @param count Number of items {@min 1} {@max 50}
   * @param rating Quality rating {@min 0} {@max 5} {@multipleOf 0.5}
   * @param temperature Temperature value {@min -20} {@max 45}
   */
  sliders(params: { count: number; rating: number; temperature: number }) {
    return {
      message: 'Slider values received',
      count: params.count,
      rating: params.rating,
      temperature: params.temperature,
    };
  }

  /**
   * Test slider with partial or no bounds
   * @param unbounded A number with no constraints
   * @param minOnly Only has a minimum {@min 10}
   * @param maxOnly Only has a maximum {@max 500}
   * @param percentage A float between 0 and 1
   */
  unboundedSliders(params: {
    unbounded: number;
    minOnly: number;
    maxOnly: number;
    percentage: number;
  }) {
    return {
      message: 'Unbounded slider values',
      ...params,
    };
  }

  /**
   * Test date inputs with @format annotation
   * @param date Pick a date {@format date}
   * @param eventStart Event start time {@format date-time}
   * @param alarmTime Daily alarm {@format time}
   */
  dates(params: { date: string; eventStart: string; alarmTime: string }) {
    return {
      message: 'Date values received',
      ...params,
    };
  }

  /**
   * Test date detection by key name heuristic
   * @param deadline Project deadline
   * @param birthday Your birthday
   * @param startTime Meeting start time
   */
  dateHeuristics(params: { deadline: string; birthday: string; startTime: string }) {
    return {
      message: 'Heuristic-detected date values',
      ...params,
    };
  }

  /**
   * Test date range and datetime range
   * @param period Report period {@format date-range}
   * @param window Event window {@format datetime-range}
   */
  dateRanges(params: {
    period: { start: string; end: string };
    window: { start: string; end: string };
  }) {
    return {
      message: 'Range values received',
      period: `${params.period.start} to ${params.period.end}`,
      window: `${params.window.start} to ${params.window.end}`,
    };
  }

  /**
   * Test mixed inputs in a single form
   * @param name Event name
   * @param attendees Number of attendees {@min 1} {@max 1000}
   * @param date Event date {@format date}
   * @param duration Hours {@min 0.5} {@max 24} {@multipleOf 0.5}
   * @param priority Priority level (low, medium, high)
   */
  mixed(params: {
    name: string;
    attendees: number;
    date: string;
    duration: number;
    priority: string;
  }) {
    return {
      message: `Event "${params.name}" created`,
      ...params,
    };
  }
}
