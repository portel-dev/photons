/**
 * Weather - Wrap any API in 20 lines
 *
 * Shows how a photon turns an external API into MCP tools with zero
 * boilerplate. Uses the free Open-Meteo API (no API key needed).
 *
 * @version 1.0.0
 * @license MIT
 * @author Portel
 * @icon 🌤️
 * @tags demo, api, weather, beginner
 */

export default class Weather {
  /**
   * Get current weather for a location
   * @param latitude Latitude (-90 to 90)
   * @param longitude Longitude (-180 to 180)
   */
  async current(latitude: number, longitude: number) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return { error: `API error: ${res.status}` };
    const data = await res.json();
    const c = data.current;
    return {
      temperature: `${c.temperature_2m}°C`,
      humidity: `${c.relative_humidity_2m}%`,
      wind: `${c.wind_speed_10m} km/h`,
      condition: weatherCode(c.weather_code),
      location: { latitude, longitude, timezone: data.timezone },
    };
  }

  /**
   * Get 7-day forecast for a location
   * @param latitude Latitude (-90 to 90)
   * @param longitude Longitude (-180 to 180)
   */
  async forecast(latitude: number, longitude: number) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return { error: `API error: ${res.status}` };
    const data = await res.json();
    const d = data.daily;
    return {
      location: { latitude, longitude, timezone: data.timezone },
      days: d.time.map((date: string, i: number) => ({
        date,
        high: `${d.temperature_2m_max[i]}°C`,
        low: `${d.temperature_2m_min[i]}°C`,
        rain: `${d.precipitation_sum[i]} mm`,
        condition: weatherCode(d.weather_code[i]),
      })),
    };
  }
}

function weatherCode(code: number): string {
  const codes: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm',
  };
  return codes[code] || `Unknown (${code})`;
}
