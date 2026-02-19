/**
 * Weather - Current weather and forecasts
 *
 * Zero-dependency weather API wrapper using Open-Meteo (free, no key required).
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 🌤️
 * @tags weather, api, forecast
 */

export default class Weather {
  /**
   * Current weather conditions
   * @param latitude {@example 40.7128}
   * @param longitude {@example -74.006}
   * @format card
   */
  async current(latitude: number, longitude: number) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const c = data.current;

    return {
      temperature: `${c.temperature_2m}°C`,
      humidity: `${c.relative_humidity_2m}%`,
      wind: `${c.wind_speed_10m} km/h`,
      condition: this.weatherCode(c.weather_code),
      timezone: data.timezone,
    };
  }

  /**
   * 7-day weather forecast
   * @param latitude {@example 40.7128}
   * @param longitude {@example -74.006}
   * @format table
   */
  async forecast(latitude: number, longitude: number) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const d = data.daily;

    return d.time.map((date: string, i: number) => ({
      date,
      high: `${d.temperature_2m_max[i]}°C`,
      low: `${d.temperature_2m_min[i]}°C`,
      rain: `${d.precipitation_sum[i]} mm`,
      condition: this.weatherCode(d.weather_code[i]),
    }));
  }

  private weatherCode(code: number): string {
    const codes: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight showers',
      81: 'Moderate showers',
      82: 'Violent showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Severe thunderstorm',
    };
    return codes[code] || `Unknown (${code})`;
  }
}
