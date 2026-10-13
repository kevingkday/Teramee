import { NextRequest, NextResponse } from 'next/server';
import { sanitizeAndScopeCss } from '@/lib/sanitize-css';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawCss, scopeClass } = body || {};

    const result = sanitizeAndScopeCss(typeof rawCss === 'string' ? rawCss : '', {
      scopeClass: typeof scopeClass === 'string' ? scopeClass : '.profile-canvas'
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Sanitization pipeline error: ${message}` },
      { status: 500 }
    );
  }
}
