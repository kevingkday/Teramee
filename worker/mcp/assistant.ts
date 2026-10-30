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

export interface McpServerCatalogEntry {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'coming_soon';
  transport: string;
  endpoint?: string;
  description: string;
  widgetType: string;
  toolName: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    options?: string[];
  }>;
  examples: string[];
}

export const MCP_SERVER_CATALOG: McpServerCatalogEntry[] = [
  {
    id: 'open-meteo-weather',
    name: 'Open-Meteo Weather & Radar MCP',
    provider: 'Open-Meteo (Built-in Edge MCP)',
    status: 'active',
    transport: 'Streamable HTTP (JSON-RPC 2.0)',
    endpoint: '/api/mcp/weather',
    description:
      'Adds a live 90s CRT/LED weather & radar badge for any city worldwide with real-time temperature, conditions, windspeed, and 20-minute auto-refresh.',
    widgetType: 'weather',
    toolName: 'get_weather',
    parameters: [
      {
        name: 'city',
        type: 'string',
        required: true,
        description: 'Any city worldwide (e.g. Vancouver, Tokyo, New York, London)'
      },
      {
        name: 'units',
        type: 'enum',
        required: false,
        description: 'Temperature scale (default: celsius)',
        options: ['celsius', 'fahrenheit']
      }
    ],
    examples: [
      'Add Vancouver weather in Celsius',
      'Add Tokyo weather forecast in Celsius',
      'Add New York weather in Fahrenheit',
      'Change my weather widget to London'
    ]
  },
  {
    id: 'lastfm-now-playing',
    name: 'Last.fm / Scrobbler Now Playing MCP',
    provider: 'Last.fm Audio Scrobbler',
    status: 'coming_soon',
    transport: 'Streamable HTTP (JSON-RPC 2.0)',
    description:
      'Displays your live recently played tracks and top artists in a classic Winamp/CD-player ticker.',
    widgetType: 'music_scrobbler',
    toolName: 'get_recent_tracks',
    parameters: [
      {
        name: 'lastfm_username',
        type: 'string',
        required: true,
        description: 'Your Last.fm handle'
      }
    ],
    examples: ['Add my Last.fm recent tracks widget']
  },
  {
    id: 'github-retro-activity',
    name: 'GitHub Commit Matrix MCP',
    provider: 'GitHub Public Events API',
    status: 'coming_soon',
    transport: 'Streamable HTTP (JSON-RPC 2.0)',
    description:
      'Renders a neon terminal commit log and green pixel contribution badge on your profile.',
    widgetType: 'github_activity',
    toolName: 'get_github_activity',
    parameters: [
      {
        name: 'github_username',
        type: 'string',
        required: true,
        description: 'Your GitHub username'
      }
    ],
    examples: ['Add a GitHub commit activity widget']
  }
];

export interface StudioAssistantRequest {
  username: string;
  prompt: string;
  currentLayout?: LayoutBlock[];
}

export interface StudioAssistantResponse {
  reply: string;
  action: 'ADD_WIDGET' | 'UPDATE_WIDGET' | 'MESSAGE';
  widget?: ProfileWidget;
  aiPowered?: boolean;
  availableMcpServers?: McpServerCatalogEntry[];
  mcpToolCalled?: {
    name: string;
    arguments: WeatherWidgetConfig;
    result: WeatherWidgetData;
  };
}

interface ParsedAssistantIntent {
  intent: 'CALL_WEATHER_MCP' | 'NEED_CITY' | 'DISCOVER_MCP' | 'UNSUPPORTED_MCP';
  city?: string;
  units: 'celsius' | 'fahrenheit';
  mode: 'add' | 'update';
  replyOverride?: string;
  aiUsed: boolean;
}

const NON_CITY_WORDS = new Set([
  'a',
  'an',
  'the',
  'my',
  'me',
  'i',
  'we',
  'you',
  'please',
  'can',
  'could',
  'would',
  'should',
  'add',
  'create',
  'make',
  'put',
  'show',
  'get',
  'give',
  'build',
  'set',
  'update',
  'change',
  'switch',
  'replace',
  'use',
  'want',
  'need',
  'like',
  'weather',
  'forecast',
  'radar',
  'temperature',
  'temp',
  'widget',
  'badge',
  'card',
  'block',
  'box',
  'mcp',
  'server',
  'servers',
  'tool',
  'tools',
  'profile',
  'page',
  'canvas',
  'layout',
  'sidebar',
  'column',
  'left',
  'right',
  'retro',
  'live',
  'current',
  'local',
  'city',
  'location',
  'celsius',
  'fahrenheit',
  'metric',
  'imperial',
  'help',
  'what',
  'which',
  'how',
  'who',
  'where',
  'why',
  'available',
  'possible',
  'options',
  'list'
]);

/**
 * Deterministic fallback intent & entity analyzer (used when Cloudflare Workers AI binding is unavailable, e.g., local dev).
 * Never defaults to "Montreal" — if no city is provided, it asks the user which city they want.
 */
export function parseWeatherIntentFromPrompt(prompt: string): ParsedAssistantIntent {
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  const units: 'celsius' | 'fahrenheit' =
    /\b(fahrenheit|imperial|°f|\bf\b)\b/i.test(clean)
      ? 'fahrenheit'
      : 'celsius';

  const isUpdateMode = /\b(change|update|switch|replace|set\s+it\s+to|instead)\b/i.test(lower);

  // 1. Check if user is asking what's possible / what MCP servers or widgets are available / help
  if (
    /\b(what\s+can\s+(?:i|you)|what\s+is\s+possible|what\s+mcp|which\s+mcp|available\s+mcp|available\s+widgets|what\s+widgets|list\s+mcp|help|capabilities|what\s+do\s+you\s+do|how\s+does\s+this\s+work)\b/i.test(
      lower
    ) ||
    lower === 'help' ||
    lower === 'mcp' ||
    lower === 'widgets'
  ) {
    return {
      intent: 'DISCOVER_MCP',
      units,
      mode: 'add',
      aiUsed: false
    };
  }

  // 2. Check if user is asking for an unsupported MCP widget (music, github, spotify, crypto, etc.)
  if (
    /\b(spotify|last\.?fm|music\s+widget|song\s+widget|playlist|github|commit|crypto|bitcoin|stock|calendar|youtube|twitch|discord|horoscope|clock|countdown)\b/i.test(
      lower
    ) &&
    !/\b(weather|forecast|temperature|temp|radar)\b/i.test(lower)
  ) {
    return {
      intent: 'UNSUPPORTED_MCP',
      units,
      mode: 'add',
      aiUsed: false
    };
  }

  // 3. Extract city name from natural language (case-insensitive!)
  let candidateCity = '';

  // Pattern A: "weather/forecast/widget in/for/at/from <City>" or "change/switch/set to <City>"
  const prepMatch = clean.match(
    /\b(?:in|for|at|from|of|to)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.,'-]{1,36}?)(?=\s+(?:in\s+(?:celsius|fahrenheit|metric|imperial)|with|using|on\s+my|widget|badge|forecast|weather|radar|temperature|temp|celsius|fahrenheit|metric|imperial|please|thanks|right|left|column|\b[cf]\b)\b|[?.!;]|$)/i
  );

  // Pattern B: "<City> weather / forecast / radar / widget" (case-insensitive)
  const beforeWeatherMatch = clean.match(
    /(?:^(?:add|create|make|put|show|get|give\s+me|build|update|change|switch|use|i\s+want|can\s+i\s+get|can\s+i\s+have)?\s*(?:a\s+|an\s+|the\s+|my\s+)?(?:retro\s+|live\s+|custom\s+|current\s+)?)?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,30}?)\s+(?:weather|forecast|radar|temperature|temp|widget|badge)\b/i
  );

  // Pattern C: "add / give me / show / get / i want <City>"
  const verbCityMatch = clean.match(
    /^(?:please\s+)?(?:add|create|make|put|show|get|give\s+me|use|try|i\s+want|i'd\s+like|can\s+i\s+get|can\s+you\s+add|change\s+to|switch\s+to|update\s+to)\s+(?:a\s+|an\s+|the\s+)?(?:retro\s+|live\s+|current\s+)?(?:weather\s+(?:widget\s+)?(?:for|in)\s+)?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.,'-]{1,30}?)(?:\s+in\s+(?:celsius|fahrenheit|metric|imperial)|\s+please)?[?.!]*$/i
  );

  if (prepMatch && prepMatch[1]) {
    candidateCity = prepMatch[1].trim();
  } else if (beforeWeatherMatch && beforeWeatherMatch[1]) {
    candidateCity = beforeWeatherMatch[1].trim();
  } else if (verbCityMatch && verbCityMatch[1]) {
    candidateCity = verbCityMatch[1].trim();
  } else {
    // Pattern D: User just typed a city name directly like "vancouver" or "Vancouver, BC" or "new york in fahrenheit"
    const directMatch = clean
      .replace(/\b(?:in\s+)?(?:celsius|fahrenheit|metric|imperial|°c|°f)\b/gi, '')
      .replace(/[?.!]+$/g, '')
      .trim();
    if (/^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.,'-]{1,32}$/.test(directMatch)) {
      candidateCity = directMatch;
    }
  }

  // Strip leading filler words from candidateCity (e.g. "add vancouver" -> "vancouver")
  candidateCity = candidateCity
    .replace(
      /^(?:please|add|create|make|put|show|get|give\s+me|build|set|update|change|switch|to|for|in|at|from|a|an|the|my|retro|live|current|custom|weather|forecast|radar|widget|badge)\s+/gi,
      ''
    )
    .replace(
      /\s+(?:weather|forecast|radar|widget|badge|temperature|temp|in\s+celsius|in\s+fahrenheit|celsius|fahrenheit|please)$/gi,
      ''
    )
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .trim();

  // Check if all words in candidateCity are actually filler/non-city words (e.g. user just said "add a weather widget")
  const tokens = candidateCity
    .toLowerCase()
    .split(/[\s,.-]+/)
    .filter(Boolean);
  const meaningfulTokens = tokens.filter((t) => !NON_CITY_WORDS.has(t));

  if (!candidateCity || meaningfulTokens.length === 0) {
    return {
      intent: 'NEED_CITY',
      units,
      mode: isUpdateMode ? 'update' : 'add',
      aiUsed: false
    };
  }

  // Title-case city cleanly
  const formattedCity = candidateCity
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

  return {
    intent: 'CALL_WEATHER_MCP',
    city: formattedCity,
    units,
    mode: isUpdateMode ? 'update' : 'add',
    aiUsed: false
  };
}

/**
 * Uses Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast` or `@cf/meta/llama-3.1-8b-instruct`)
 * to read the user's natural language prompt, understand their intent against the MCP Server Catalog,
 * and decide whether to invoke `get_weather`, ask for a city, or explain available MCP capabilities.
 */
async function analyzeIntentWithWorkersAI(
  prompt: string,
  aiBinding: CloudflareAIBinding,
  existingWeatherCities: string[]
): Promise<ParsedAssistantIntent | null> {
  const systemPrompt = `You are Teramee's Studio AI Assistant that manages MCP (Model Context Protocol) profile widgets.

Currently Active MCP Servers & Tools:
1. "Open-Meteo Weather & Radar MCP" -> tool: "get_weather"
   - Parameters:
     - "city" (REQUIRED string): The city name requested by the user (e.g. "Vancouver", "Tokyo", "New York"). NEVER invent or guess "Montreal" if the user did not say Montreal.
     - "units" (optional string): "celsius" or "fahrenheit" (default "celsius").

Upcoming (Not Yet Active) MCP Servers:
- Last.fm Now Playing MCP (coming soon)
- GitHub Commit Matrix MCP (coming soon)

User's existing weather widgets on their profile: ${
    existingWeatherCities.length > 0 ? existingWeatherCities.join(', ') : 'None yet'
  }

Analyze the user's message and respond ONLY with a valid JSON object matching this exact schema:
{
  "intent": "CALL_WEATHER_MCP" | "NEED_CITY" | "DISCOVER_MCP" | "UNSUPPORTED_MCP",
  "city": "Extracted City Name or empty string if none mentioned",
  "units": "celsius" | "fahrenheit",
  "mode": "add" | "update",
  "reply": "Short friendly response if intent is NEED_CITY, DISCOVER_MCP, or UNSUPPORTED_MCP"
}

Rules:
- If the user mentions ANY city name (even just "vancouver" or "add vancouver" or "weather for tokyo"), set "intent": "CALL_WEATHER_MCP" and "city" to that exact city (properly capitalized, e.g., "Vancouver").
- If the user asks to change/switch/replace their existing weather widget or already has a widget and just names a new city, set "mode": "update". Otherwise set "mode": "add".
- If the user asks for a weather widget WITHOUT naming any city (e.g., "add a weather widget"), set "intent": "NEED_CITY" and "city": "".
- If the user asks what you can do, what MCP servers exist, or asks for help, set "intent": "DISCOVER_MCP".
- If the user asks for a non-weather widget (e.g. Spotify, music, GitHub, crypto), set "intent": "UNSUPPORTED_MCP".`;

  const modelsToTry = [
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    '@cf/meta/llama-3.1-8b-instruct'
  ];

  for (const model of modelsToTry) {
    try {
      const llmRes = await aiBinding.run(model, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      });

      const rawText =
        typeof llmRes?.response === 'string'
          ? llmRes.response.trim()
          : JSON.stringify(llmRes);
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const parsed = JSON.parse(jsonMatch[0]) as {
        intent?: string;
        city?: string;
        units?: string;
        mode?: string;
        reply?: string;
      };

      const units: 'celsius' | 'fahrenheit' =
        parsed.units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
      const mode: 'add' | 'update' =
        parsed.mode === 'update' ? 'update' : 'add';

      if (parsed.intent === 'DISCOVER_MCP') {
        return {
          intent: 'DISCOVER_MCP',
          units,
          mode,
          replyOverride: parsed.reply,
          aiUsed: true
        };
      }

      if (parsed.intent === 'UNSUPPORTED_MCP') {
        return {
          intent: 'UNSUPPORTED_MCP',
          units,
          mode,
          replyOverride: parsed.reply,
          aiUsed: true
        };
      }

      if (parsed.intent === 'NEED_CITY' || !parsed.city || !parsed.city.trim()) {
        // Double check with fallback parser in case LLM missed a 1-word city
        const fallback = parseWeatherIntentFromPrompt(prompt);
        if (fallback.intent === 'CALL_WEATHER_MCP' && fallback.city) {
          return { ...fallback, aiUsed: true };
        }
        return {
          intent: 'NEED_CITY',
          units,
          mode,
          replyOverride: parsed.reply,
          aiUsed: true
        };
      }

      return {
        intent: 'CALL_WEATHER_MCP',
        city: parsed.city.trim(),
        units,
        mode,
        aiUsed: true
      };
    } catch {
      // Try next model or fallback
    }
  }

  return null;
}

/**
 * Orchestrates MCP tool discovery (`tools/list`), AI intent & tool selection,
 * MCP tool execution (`tools/call`), and widget layout payload generation.
 */
export async function runStudioAssistantWithMcp(
  input: StudioAssistantRequest,
  aiBinding?: CloudflareAIBinding
): Promise<StudioAssistantResponse> {
  // 1. Discover available MCP tools via JSON-RPC `tools/list`
  await dispatchWeatherMcpRpc({
    jsonrpc: '2.0',
    id: 'discover-1',
    method: 'tools/list'
  });

  const existingWeatherBlocks = (input.currentLayout || []).filter(
    (b) =>
      b.widgetType === 'weather' || String(b.id).startsWith('widget-weather-')
  );
  const existingCities = existingWeatherBlocks
    .map((b) => b.widgetConfig?.city || b.widgetData?.city || b.title)
    .filter(Boolean) as string[];

  // 2. Analyze user prompt using Cloudflare Workers AI (with deterministic non-defaulting fallback)
  let analysis: ParsedAssistantIntent | null = null;
  if (aiBinding && typeof aiBinding.run === 'function') {
    analysis = await analyzeIntentWithWorkersAI(
      input.prompt,
      aiBinding,
      existingCities
    );
  }
  if (!analysis) {
    analysis = parseWeatherIntentFromPrompt(input.prompt);
  }

  // 3. Handle discovery / help requests without adding a random widget
  if (analysis.intent === 'DISCOVER_MCP') {
    return {
      action: 'MESSAGE',
      aiPowered: analysis.aiUsed,
      availableMcpServers: MCP_SERVER_CATALOG,
      reply:
        `Here is what you can add right now via Teramee's MCP Servers:\n\n` +
        `• Open-Meteo Weather & Radar MCP (LIVE): Adds a 90s CRT/LED live weather widget for ANY city worldwide in °C or °F. Try typing: "Add Vancouver weather in Celsius" or "Add Tokyo in Fahrenheit".\n` +
        `• Coming Soon: Last.fm Now Playing Scrobbler MCP & GitHub Commit Matrix MCP.`
    };
  }

  // 4. Handle unsupported widget requests gracefully
  if (analysis.intent === 'UNSUPPORTED_MCP') {
    return {
      action: 'MESSAGE',
      aiPowered: analysis.aiUsed,
      availableMcpServers: MCP_SERVER_CATALOG,
      reply:
        analysis.replyOverride ||
        `That widget type isn't connected to an active MCP server yet! Right now, the Open-Meteo Weather & Radar MCP is live (Last.fm Music & GitHub Activity MCPs are coming soon). Try asking: "Add Vancouver weather in Celsius" or pick a city above!`
    };
  }

  // 5. Handle weather requests where the user didn't specify a city (never guess Montreal!)
  if (analysis.intent === 'NEED_CITY' || !analysis.city) {
    return {
      action: 'MESSAGE',
      aiPowered: analysis.aiUsed,
      availableMcpServers: MCP_SERVER_CATALOG,
      reply:
        `Which city would you like the live weather widget for? Tell me any city worldwide (for example: "Vancouver", "Add Tokyo in Celsius", or "New York in Fahrenheit") and I'll fetch it from the Open-Meteo MCP server!`
    };
  }

  const targetCity = analysis.city;
  const targetUnits = analysis.units;

  // 6. Call the MCP tool via JSON-RPC `tools/call`
  const callRpcResponse = await dispatchWeatherMcpRpc({
    jsonrpc: '2.0',
    id: `call-${Date.now()}`,
    method: 'tools/call',
    params: {
      name: WEATHER_MCP_TOOL_DEFINITION.name,
      arguments: {
        city: targetCity,
        units: targetUnits
      }
    }
  });

  const toolResult = (
    callRpcResponse.result as {
      structuredContent?: WeatherWidgetData & { resolvedByGeocode?: boolean };
    }
  )?.structuredContent;

  if (!toolResult || toolResult.resolvedByGeocode === false) {
    return {
      action: 'MESSAGE',
      aiPowered: analysis.aiUsed,
      availableMcpServers: MCP_SERVER_CATALOG,
      reply: `I queried the Open-Meteo MCP server for "${targetCity}", but couldn't find matching city coordinates. Try checking the spelling or entering a major city name like "Vancouver", "Seattle", "Tokyo", or "London"!`
    };
  }

  const resolvedCity = toolResult.city || targetCity;

  // If the user already has a weather widget and either asked to change/update it OR just typed a new city name,
  // update their most recent weather widget unless they explicitly asked for "another" / "second" widget.
  const wantsAdditionalWidget = /\b(another|second|also\s+add|one\s+more)\b/i.test(
    input.prompt
  );
  const shouldUpdateExisting =
    existingWeatherBlocks.length > 0 &&
    (analysis.mode === 'update' || !wantsAdditionalWidget);

  const widgetId = shouldUpdateExisting
    ? String(existingWeatherBlocks[existingWeatherBlocks.length - 1].id)
    : `widget-weather-${existingWeatherBlocks.length + 1}`;

  const actionType: 'ADD_WIDGET' | 'UPDATE_WIDGET' = shouldUpdateExisting
    ? 'UPDATE_WIDGET'
    : 'ADD_WIDGET';

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

  const locationLabel = toolResult.country
    ? `${resolvedCity}, ${toolResult.country}`
    : resolvedCity;

  const reply = shouldUpdateExisting
    ? `Updated your weather widget to ${locationLabel} (${toolResult.temp}${toolResult.units}, ${toolResult.condition}) via the Open-Meteo MCP server! Don't forget to click Save Profile.`
    : `I've generated a live ${locationLabel} weather badge (${toolResult.temp}${toolResult.units}, ${toolResult.condition}) via the Open-Meteo MCP server and added it to your layout! Click Save Profile to keep it.`;

  return {
    reply,
    action: actionType,
    widget,
    aiPowered: analysis.aiUsed,
    availableMcpServers: MCP_SERVER_CATALOG,
    mcpToolCalled: {
      name: 'get_weather',
      arguments: { city: resolvedCity, units: targetUnits },
      result: widget.initialData!
    }
  };
}
