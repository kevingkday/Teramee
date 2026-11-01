import { NextRequest } from 'next/server';
import { handleMusicMcpRequest } from '@worker/mcp/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleMusicMcpRequest(request as unknown as Request);
}

export async function POST(request: NextRequest) {
  return handleMusicMcpRequest(request as unknown as Request);
}
