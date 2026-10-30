import { NextRequest } from 'next/server';
import { handleWeatherMcpRequest } from '@worker/mcp/weather';

export async function GET(request: NextRequest) {
  return handleWeatherMcpRequest(request as unknown as Request);
}

export async function POST(request: NextRequest) {
  return handleWeatherMcpRequest(request as unknown as Request);
}
