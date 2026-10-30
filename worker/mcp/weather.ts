import { WeatherWidgetData } from '../../src/lib/types';

export const WEATHER_MCP_TOOL_DEFINITION = {
  name: 'get_weather',
  description: 'Fetch real-time weather and temperature for any city worldwide',
  inputSchema: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City or location name (e.g. Vancouver, Tokyo, New York)' },
      units: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    required: ['city']
  }
} as const;

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export function mapWmoWeatherCode(code: number): {
  condition: string;
  iconType: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm';
} {
  if (code === 0) return { condition: 'Clear Sky', iconType: 'sun' };
  if (code === 1) return { condition: 'Mainly Clear', iconType: 'sun' };
  if (code === 2) return { condition: 'Partly Cloudy', iconType: 'cloud' };
  if (code === 3) return { condition: 'Overcast', iconType: 'cloud' };
  if (code >= 45 && code <= 48) return { condition: 'Foggy Haze', iconType: 'cloud' };
  if (code >= 51 && code <= 57) return { condition: 'Light Drizzle', iconType: 'rain' };
  if (code >= 61 && code <= 67) return { condition: 'Rainy', iconType: 'rain' };
  if (code >= 71 && code <= 77) return { condition: 'Snowfall', iconType: 'snow' };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', iconType: 'rain' };
  if (code >= 85 && code <= 86) return { condition: 'Snow Showers', iconType: 'snow' };
  if (code >= 95) return { condition: 'Thunderstorm', iconType: 'storm' };
  return { condition: 'Partly Cloudy', iconType: 'cloud' };
}

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

async function lookupCityCoordinates(query: string): Promise<GeoResult | null> {
  const candidates = [query.trim()];
  if (query.includes(',')) {
    const beforeComma = query.split(',')[0].trim();
    if (beforeComma && !candidates.includes(beforeComma)) {
      candidates.push(beforeComma);
    }
  }

  for (const candidate of candidates) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      candidate
    )}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl, {
      headers: { Accept: 'application/json' }
    });
    if (!geoRes.ok) continue;

    const geoData = (await geoRes.json()) as { results?: GeoResult[] };
    if (geoData.results && geoData.results.length > 0) {
      return geoData.results[0];
    }
  }

  return null;
}

/**
 * Executes the `get_weather` MCP tool against Open-Meteo Geocoding & Forecast APIs.
 */
export async function executeGetWeatherTool(args: {
  city: string;
  units?: 'celsius' | 'fahrenheit';
}): Promise<WeatherWidgetData & { resolvedByGeocode?: boolean }> {
  const rawCity = (args.city || '').trim() || 'Vancouver';
  const units: 'celsius' | 'fahrenheit' =
    args.units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const unitSymbol = units === 'fahrenheit' ? '°F' : '°C';

  try {
    const match = await lookupCityCoordinates(rawCity);
    if (!match) {
      return {
        city: rawCity,
        temp: units === 'fahrenheit' ? 68 : 20,
        units: unitSymbol,
        weathercode: 1,
        windspeed: 11,
        condition: 'Mainly Clear',
        iconType: 'sun',
        updatedAt: new Date().toISOString(),
        resolvedByGeocode: false
      };
    }

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
      String(match.latitude)
    )}&longitude=${encodeURIComponent(
      String(match.longitude)
    )}&current_weather=true`;

    const weatherRes = await fetch(forecastUrl, {
      headers: { Accept: 'application/json' }
    });

    if (!weatherRes.ok) {
      throw new Error(`Forecast HTTP ${weatherRes.status}`);
    }

    const weatherData = (await weatherRes.json()) as {
      current_weather?: {
        temperature: number;
        windspeed: number;
        weathercode: number;
      };
    };

    const current = weatherData.current_weather;
    const tempCelsius = typeof current?.temperature === 'number' ? current.temperature : 15;
    const finalTemp =
      units === 'fahrenheit'
        ? Math.round((tempCelsius * 9) / 5 + 32)
        : Math.round(tempCelsius);
    const weathercode = typeof current?.weathercode === 'number' ? current.weathercode : 2;
    const windspeed = typeof current?.windspeed === 'number' ? Math.round(current.windspeed) : 10;
    const mapped = mapWmoWeatherCode(weathercode);

    return {
      city: match.name || rawCity,
      country: match.country,
      temp: finalTemp,
      units: unitSymbol,
      weathercode,
      windspeed,
      condition: mapped.condition,
      iconType: mapped.iconType,
      updatedAt: new Date().toISOString(),
      resolvedByGeocode: true
    };
  } catch {
    // Graceful edge fallback if external network is unavailable
    return {
      city: rawCity,
      temp: units === 'fahrenheit' ? 64 : 18,
      units: unitSymbol,
      weathercode: 2,
      windspeed: 12,
      condition: 'Partly Cloudy',
      iconType: 'cloud',
      updatedAt: new Date().toISOString(),
      resolvedByGeocode: false
    };
  }
}

/**
 * Processes an MCP JSON-RPC 2.0 request payload (Streamable HTTP transport compatible).
 */
export async function dispatchWeatherMcpRpc(
  rpc: JsonRpcRequest
): Promise<JsonRpcResponse> {
  const id = rpc.id ?? null;

  if (rpc.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-03-26',
        serverInfo: {
          name: 'teramee-weather-mcp',
          version: '1.0.0'
        },
        capabilities: {
          tools: {}
        }
      }
    };
  }

  if (rpc.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [WEATHER_MCP_TOOL_DEFINITION]
      }
    };
  }

  if (rpc.method === 'tools/call') {
    const params = (rpc.params || {}) as {
      name?: string;
      arguments?: { city?: string; units?: 'celsius' | 'fahrenheit' };
    };

    if (params.name !== 'get_weather') {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Unknown MCP tool: ${String(params.name)}`
        }
      };
    }

    const city = params.arguments?.city || 'Vancouver';
    const units = params.arguments?.units || 'celsius';
    const weatherResult = await executeGetWeatherTool({ city, units });

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(weatherResult)
          }
        ],
        structuredContent: weatherResult,
        isError: false
      }
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${rpc.method}`
    }
  };
}

/**
 * Edge HTTP handler for Streamable HTTP MCP endpoint (`/api/mcp/weather`).
 */
export async function handleWeatherMcpRequest(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    return new Response(
      JSON.stringify({
        name: 'teramee-weather-mcp',
        transport: 'streamable-http',
        tools: [WEATHER_MCP_TOOL_DEFINITION]
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = (await request.json()) as JsonRpcRequest;
    const responsePayload = await dispatchWeatherMcpRpc(body);
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: `Parse error: ${message}` }
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
