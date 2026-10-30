import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { isUserAdmin, upsertProfileWidget } from '@/lib/db';
import { LayoutBlock } from '@/lib/types';
import { runStudioAssistantWithMcp } from '@worker/mcp/assistant';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      username?: string;
      prompt?: string;
      currentLayout?: LayoutBlock[];
      saveImmediately?: boolean;
    };

    const targetUsername = (body.username || '').toLowerCase().trim() || 'glitterqueen99';
    const authUser = getAuthenticatedUser(request);

    if (!authUser || (authUser.toLowerCase() !== targetUsername && !isUserAdmin(authUser))) {
      return NextResponse.json(
        {
          error: `Please log in as @${targetUsername} to use the Studio AI Assistant.`
        },
        { status: 401 }
      );
    }

    if (!body.prompt || !body.prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const assistantRes = await runStudioAssistantWithMcp({
      username: targetUsername,
      prompt: body.prompt,
      currentLayout: body.currentLayout || []
    });

    if (body.saveImmediately && assistantRes.widget) {
      upsertProfileWidget(targetUsername, assistantRes.widget);
    }

    return NextResponse.json(assistantRes);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Studio Assistant error: ${message}` },
      { status: 500 }
    );
  }
}
