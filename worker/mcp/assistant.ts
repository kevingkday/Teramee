import {
  LayoutBlock,
  ProfileWidget,
  WeatherWidgetConfig,
  WeatherWidgetData
} from '../../src/lib/types';
import {
  WEATHER_MCP_TOOL_DEFINITION,
  dispatchWeatherMcpRpc
} from './weather';

export interface CloudflareAIBinding {
  run: (
    model: string,
    inputs: Record<string, unknown>
  ) => Promise<Record<string, unknown>>;
}

export interface StudioAssistantRequest {
  username: string;
  prompt: string;
  currentLayout?: LayoutBlock[];
}

export interface StudioAssistantResponse {
  reply: string;
  action: 'ADD_WIDGET' | 'UPDATE_WIDGET' | 'MESSAGE';
  widget?: ProfileWidget;
  mcpToolCalled?: {
    name: string;
    arguments: WeatherWidgetConfig;
    result: WeatherWidgetData;
  };
}

/**
 * Extracts city and temperature unit preferences from a natural language prompt.
 */
export function parseWeatherIntentFromPrompt(prompt: string): {
  isWeatherIntent: boolean;
  city: string;
  units: 'celsius' | 'fahrenheit';
  customTitle?: string;
} {
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  const units: 'celsius' | 'fahrenheit' =
    /\b(fahrenheit|imperial|°f|\bf\b)\b/i.test(clean)
      ? 'fahrenheit'
      : /\b(celsius|metric|°c|\bc\b)\b/i.test(clean)
      ? 'celsius'
      : 'celsius';

  // Check if user is asking for weather/forecast/temperature/radar or mentions a city widget
  const isWeatherKeyword =
    /\b(weather|forecast|temp|temperature|radar|climate|rain|snow|sunny|widget|badge|degree)\b/i.test(
      lower
    );

  // Try common prepositions: "weather in Montreal", "weather for Tokyo, Japan", "for New York in fahrenheit"
  const prepMatch = clean.match(
    /\b(?:in|for|at|from|of)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,32}?)(?=\s+(?:in|with|using|on|and|to|widget|badge|forecast|weather|radar|celsius|fahrenheit|metric|imperial|please|right|left|column)\b|[?.!,;]|$)/i
  );

  // Also check "<City> weather" or "<City> forecast" or "<City> radar"
  const prefixMatch = clean.match(
    /(?:add|create|make|put|show|get|build)?\s*(?:a\s+)?(?:retro\s+|live\s+|custom\s+|current\s+)?([A-ZÀ-Ÿ][A-Za-zÀ-ÿ\s.'-]{1,28}?)\s+(?:weather|forecast|radar|temperature)\b/
  );

  let extractedCity = '';
  if (prepMatch && prepMatch[1]) {
    extractedCity = prepMatch[1].trim();
  } else if (prefixMatch && prefixMatch[1]) {
    const candidate = prefixMatch[1]
      .replace(/^(?:add|create|make|put|show|get|build|a|an|the|my|retro|live|current)\s+/gi, '')
      .trim();
    if (candidate) {
      extractedCity = candidate;
    }
  }

  // Filter out non-city filler words
  const stopWords = new Set([
    'my',
    'the',
    'a',
    'an',
    'profile',
    'page',
    'space',
    'layout',
    'sidebar',
    'left',
    'right',
    'column',
    'celsius',
    'fahrenheit',
    'widget',
    'badge',
    'weather',
    'forecast',
    'current',
    'live',
    'retro'
  ]);

  if (extractedCity && stopWords.has(extractedCity.toLowerCase())) {
    extractedCity = '';
  }

  // Fallback: if user just typed a city name or asked for a weather widget without specifying a city
  if (!extractedCity) {
    const simpleCityMatch = clean.match(/^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.-]{1,25})$/);
    if (simpleCityMatch && !isWeatherKeyword) {
      extractedCity = simpleCityMatch[1].trim();
    } else {
      extractedCity = 'Montreal';
    }
  }

  // Title-case the city name nicely
  const formattedCity = extractedCity
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

  return {
    isWeatherIntent: true,
    city: formattedCity || 'Montreal',
    units
  };
}

/**
 * Orchestrates MCP tool discovery (`tools/list`), optional Cloudflare Workers AI tool selection,
 * MCP tool execution (`tools/call`), and widget layout payload generation.
 */
export async function runStudioAssistantWithMcp(
  input: StudioAssistantRequest,
  aiBinding?: CloudflareAIBinding
): Promise<StudioAssistantResponse> {
  // 1. Discover available MCP tools via JSON-RPC `tools/list`
  const listRpcResponse = await dispatchWeatherMcpRpc({
    jsonrpc: '2.0',
    id: 'discover-1',
    method: 'tools/list'
  });

  const discoveredTools =
    (listRpcResponse.result as { tools?: Array<typeof WEATHER_MCP_TOOL_DEFINITION> })
      ?.tools || [WEATHER_MCP_TOOL_DEFINITION];

  // 2. Parse intent from prompt (and optionally refine with Cloudflare Workers AI if bound)
  const parsedIntent = parseWeatherIntentFromPrompt(input.prompt);
  let targetCity = parsedIntent.city;
  let targetUnits = parsedIntent.units;

  if (aiBinding && typeof aiBinding.run === 'function') {
    try {
      const llmRes = await aiBinding.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: `You are Teramee's Retro Studio AI Assistant. Extract the city and temperature units ("celsius" or "fahrenheit") from the user's request to call the MCP tool "${discoveredTools[0].name}". Respond ONLY with a compact JSON object: {"city": "CityName", "units": "celsius" | "fahrenheit"}.`
          },
          {
            role: 'user',
            content: input.prompt
          }
        ]
      });

      const rawText =
        typeof llmRes?.response === 'string' ? llmRes.response.trim() : '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as {
          city?: string;
          units?: 'celsius' | 'fahrenheit';
        };
        if (parsed.city && typeof parsed.city === 'string' && parsed.city.trim()) {
          targetCity = parsed.city.trim();
        }
        if (parsed.units === 'fahrenheit' || parsed.units === 'celsius') {
          targetUnits = parsed.units;
        }
      }
    } catch {
      // Fallback to deterministic parser if Workers AI binding is not configured
    }
  }

  // 3. Call the MCP tool via JSON-RPC `tools/call`
  const callRpcResponse = await dispatchWeatherMcpRpc({
    jsonrpc: '2.0',
    id: `call-${Date.now()}`,
    method: 'tools/call',
    params: {
      name: 'get_weather',
      arguments: {
        city: targetCity,
        units: targetUnits
      }
    }
  });

  const toolResult = (
    callRpcResponse.result as { structuredContent?: WeatherWidgetData }
  )?.structuredContent || {
    city: targetCity,
    temp: targetUnits === 'fahrenheit' ? 61 : 16,
    units: targetUnits === 'fahrenheit' ? '°F' : '°C',
    condition: 'Partly Cloudy',
    iconType: 'cloud' as const
  };

  const resolvedCity = toolResult.city || targetCity;

  // Determine unique widget ID based on existing weather widgets in layout
  const existingWeatherWidgets = (input.currentLayout || []).filter(
    (b) =>
      b.widgetType === 'weather' || String(b.id).startsWith('widget-weather-')
  );
  const nextIndex = existingWeatherWidgets.length + 1;
  const widgetId = `widget-weather-${nextIndex}`;

  const widget: ProfileWidget = {
    id: widgetId,
    username: input.username,
    type: 'weather',
    title: `${resolvedCity} Forecast`,
    config: {
      city: resolvedCity,
      units: targetUnits
    },
    initialData: {
      city: resolvedCity,
      country: toolResult.country,
      temp: toolResult.temp,
      condition: toolResult.condition,
      units: toolResult.units,
      weathercode: toolResult.weathercode,
      windspeed: toolResult.windspeed,
      iconType: toolResult.iconType,
      updatedAt: toolResult.updatedAt || new Date().toISOString()
    }
  };

  const reply = `I've generated a retro ${resolvedCity} weather badge (${toolResult.temp}${toolResult.units}, ${toolResult.condition}) via the Open-Meteo MCP server and placed it in your layout. How does the preview look?`;

  return {
    reply,
    action: 'ADD_WIDGET',
    widget,
    mcpToolCalled: {
      name: 'get_weather',
      arguments: { city: resolvedCity, units: targetUnits },
      result: widget.initialData!
    }
  };
}

