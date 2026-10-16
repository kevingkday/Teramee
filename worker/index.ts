import { ensureSchema, D1Database } from './schema';
import {
  getProfileFromDb,
  saveProfileToDb,
  addGuestbookCommentToDb,
  checkUsernameAvailability,
  registerUserInDb,
  verifyUserCredentials,
  getRecentProfilesFromDb
} from './db';
import { sanitizeAndScopeCss } from '../src/lib/sanitize-css';
import { UserProfile } from '../src/lib/types';

export interface Env {
  DB: D1Database;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Auto-initialize schema on API requests if DB is present
    if (pathname.startsWith('/api/') && env.DB) {
      try {
        await ensureSchema(env.DB);
      } catch (err) {
        console.error('Database schema ensure error:', err);
      }
    }

    // --- AUTH & REGISTRATION ENDPOINTS ---

    // Check username availability: GET /api/auth/check-username?username=...
    if (pathname === '/api/auth/check-username' && request.method === 'GET') {
      const usernameParam = url.searchParams.get('username') || '';
      try {
        const result = await checkUsernameAvailability(env.DB, usernameParam);
        return jsonResponse(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ available: false, reason: message }, 500);
      }
    }

    // User Registration: POST /api/auth/register
    if (pathname === '/api/auth/register' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          username?: string;
          displayName?: string;
          password?: string;
          presetId?: string;
        };

        if (!body.username) {
          return jsonResponse({ error: 'Username is required.' }, 400);
        }

        const regResult = await registerUserInDb(env.DB, {
          username: body.username,
          displayName: body.displayName || body.username,
          password: body.password || '',
          presetId: body.presetId || 'classic-blue'
        });

        if (!regResult.success || !regResult.profile) {
          return jsonResponse({ error: regResult.error || 'Failed to register.' }, 400);
        }

        const cssResult = sanitizeAndScopeCss(regResult.profile.rawCss || '');

        return jsonResponse({
          success: true,
          profile: regResult.profile,
          sanitizedCss: cssResult.sanitizedCss,
          sessionToken: `sm_sess_${Date.now()}_${regResult.profile.username}`
        }, 201);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Registration error: ${message}` }, 500);
      }
    }

    // User Login: POST /api/auth/login
    if (pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          username?: string;
          password?: string;
        };

        if (!body.username) {
          return jsonResponse({ error: 'Username is required.' }, 400);
        }

        const loginResult = await verifyUserCredentials(
          env.DB,
          body.username,
          body.password || ''
        );

        if (!loginResult.success || !loginResult.profile) {
          return jsonResponse({ error: loginResult.error || 'Invalid credentials.' }, 401);
        }

        const cssResult = sanitizeAndScopeCss(loginResult.profile.rawCss || '');

        return jsonResponse({
          success: true,
          profile: loginResult.profile,
          sanitizedCss: cssResult.sanitizedCss,
          sessionToken: `sm_sess_${Date.now()}_${loginResult.profile.username}`
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Login error: ${message}` }, 500);
      }
    }

    // List recent profiles: GET /api/profiles
    if (pathname === '/api/profiles' && request.method === 'GET') {
      try {
        const recent = await getRecentProfilesFromDb(env.DB, 12);
        return jsonResponse({ profiles: recent });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Failed to fetch profiles: ${message}` }, 500);
      }
    }

    // 1. GET /api/profiles/:username
    // Matches: /api/profiles/:username (and not /guestbook)
    const profileMatch = pathname.match(/^\/api\/profiles\/([^/]+)$/);
    if (profileMatch) {
      const username = decodeURIComponent(profileMatch[1]);

      if (request.method === 'GET') {
        try {
          const profile = await getProfileFromDb(env.DB, username);
          if (!profile) {
            return jsonResponse({ error: `Profile '@${username}' not found.` }, 404);
          }
          const cssResult = sanitizeAndScopeCss(profile.rawCss || '');
          return jsonResponse({
            profile,
            sanitizedCss: cssResult.sanitizedCss,
            cssAudit: cssResult
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          return jsonResponse({ error: `Failed to load profile: ${message}` }, 500);
        }
      }

      if (request.method === 'PUT') {
        try {
          const body = (await request.json()) as Partial<UserProfile>;
          const existing = await getProfileFromDb(env.DB, username);

          if (!existing) {
            return jsonResponse(
              { error: `Profile '@${username}' not found to update.` },
              404
            );
          }

          const toSave: UserProfile = {
            ...existing,
            ...body,
            username: existing.username // Preserve canonical username
          };

          const saved = await saveProfileToDb(env.DB, toSave);
          const cssResult = sanitizeAndScopeCss(saved.rawCss || '');

          return jsonResponse({
            success: true,
            profile: saved,
            sanitizedCss: cssResult.sanitizedCss,
            cssAudit: cssResult
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          return jsonResponse({ error: `Failed to save profile: ${message}` }, 500);
        }
      }
    }

    // 2. POST /api/profiles/:username/guestbook
    const guestbookMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/guestbook$/);
    if (guestbookMatch && request.method === 'POST') {
      const username = decodeURIComponent(guestbookMatch[1]);
      try {
        const body = (await request.json()) as {
          author?: string;
          content?: string;
          avatarUrl?: string;
        };
        const { author, content, avatarUrl } = body || {};

        if (!content || typeof content !== 'string' || !content.trim()) {
          return jsonResponse({ error: 'Comment content is required.' }, 400);
        }

        const entry = await addGuestbookCommentToDb(
          env.DB,
          username,
          author || 'Anonymous Visitor',
          content,
          avatarUrl
        );

        return jsonResponse({
          success: true,
          entry
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse(
          { error: `Failed to add guestbook comment: ${message}` },
          500
        );
      }
    }

    // 3. POST /api/sanitize
    if (pathname === '/api/sanitize' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          rawCss?: string;
          scopeClass?: string;
        };
        const { rawCss, scopeClass } = body || {};
        const result = sanitizeAndScopeCss(typeof rawCss === 'string' ? rawCss : '', {
          scopeClass: typeof scopeClass === 'string' ? scopeClass : '.profile-canvas'
        });
        return jsonResponse(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `CSS sanitization error: ${message}` }, 500);
      }
    }

    // 4. Fallback to Cloudflare Static Assets
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
