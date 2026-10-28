import { ensureSchema, D1Database } from './schema';
import {
  getProfileFromDb,
  saveProfileToDb,
  addGuestbookCommentToDb,
  deleteGuestbookCommentFromDb,
  toggleFriendInDb,
  toggleFavoriteInDb,
  getMessagesForUserFromDb,
  sendMessageInDb,
  markMessageReadInDb,
  deleteMessageFromDb,
  checkUsernameAvailability,
  registerUserInDb,
  verifyUserCredentials,
  getRecentProfilesFromDb,
  createActivityInDb,
  getGlobalFeedFromDb,
  recordProfileViewInDb,
  getRecentVisitorsFromDb
} from './db';
import { sanitizeAndScopeCss } from '../src/lib/sanitize-css';
import { UserProfile } from '../src/lib/types';

export interface Env {
  DB: D1Database;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const AUTH_COOKIE_NAME = 'teramee_session';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      ...(extraHeaders || {})
    }
  });
}

function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    u: username.toLowerCase(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  });
  return btoa(payload);
}

function parseSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  if (token.startsWith('sm_sess_')) {
    const parts = token.split('_');
    return parts.slice(3).join('_') || null;
  }
  try {
    const raw = token.includes('.') ? token.split('.')[0] : token;
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return decoded.u || null;
  } catch {
    return null;
  }
}

function getAuthenticatedUser(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter((parts) => parts.length >= 2)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
  );
  if (cookies[AUTH_COOKIE_NAME]) {
    const user = parseSessionToken(cookies[AUTH_COOKIE_NAME]);
    if (user) return user;
  }
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return parseSessionToken(authHeader.slice(7).trim());
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    if (pathname.startsWith('/api/') && env.DB) {
      try {
        await ensureSchema(env.DB);
      } catch (err) {
        console.error('Database schema ensure error:', err);
      }
    }

    // --- AUTH & REGISTRATION ENDPOINTS ---

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

    if (pathname === '/api/auth/me' && request.method === 'GET') {
      const username = getAuthenticatedUser(request);
      if (!username) {
        return jsonResponse({ authenticated: false, user: null });
      }
      const profile = await getProfileFromDb(env.DB, username);
      return jsonResponse({
        authenticated: true,
        user: {
          username: profile?.username || username,
          displayName: profile?.displayName || username,
          avatarUrl: profile?.avatarUrl || ''
        }
      });
    }

    if (pathname === '/api/auth/logout' && request.method === 'POST') {
      return jsonResponse(
        { success: true },
        200,
        {
          'Set-Cookie': `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
        }
      );
    }

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
        const sessionToken = createSessionToken(regResult.profile.username);

        return jsonResponse(
          {
            success: true,
            user: {
              username: regResult.profile.username,
              displayName: regResult.profile.displayName,
              avatarUrl: regResult.profile.avatarUrl
            },
            profile: regResult.profile,
            sanitizedCss: cssResult.sanitizedCss,
            sessionToken
          },
          201,
          {
            'Set-Cookie': `${AUTH_COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
          }
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Registration error: ${message}` }, 500);
      }
    }

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
        const sessionToken = createSessionToken(loginResult.profile.username);

        return jsonResponse(
          {
            success: true,
            user: {
              username: loginResult.profile.username,
              displayName: loginResult.profile.displayName,
              avatarUrl: loginResult.profile.avatarUrl
            },
            profile: loginResult.profile,
            sanitizedCss: cssResult.sanitizedCss,
            sessionToken
          },
          200,
          {
            'Set-Cookie': `${AUTH_COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
          }
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Login error: ${message}` }, 500);
      }
    }

    // --- DIRECT MESSAGES ENDPOINT ---

    if (pathname === '/api/messages') {
      const authUser = getAuthenticatedUser(request);
      if (!authUser) {
        return jsonResponse({ error: 'Please log in to view or send messages.' }, 401);
      }

      if (request.method === 'GET') {
        const messages = await getMessagesForUserFromDb(env.DB, authUser);
        const unreadCount = messages.filter((m) => !m.read).length;
        return jsonResponse({ messages, unreadCount });
      }

      if (request.method === 'POST') {
        const body = (await request.json()) as {
          toUsername?: string;
          subject?: string;
          body?: string;
        };
        if (!body.toUsername || !body.body?.trim()) {
          return jsonResponse({ error: 'Recipient and message body are required.' }, 400);
        }
        const senderProfile = await getProfileFromDb(env.DB, authUser);
        const msg = await sendMessageInDb(env.DB, {
          fromUsername: authUser,
          fromDisplayName: senderProfile?.displayName || authUser,
          fromAvatarUrl: senderProfile?.avatarUrl || '',
          toUsername: body.toUsername,
          subject: body.subject || 'New Message',
          body: body.body
        });
        return jsonResponse({ success: true, message: msg });
      }

      if (request.method === 'PUT') {
        const body = (await request.json()) as { messageId?: string };
        if (!body.messageId) {
          return jsonResponse({ error: 'messageId is required.' }, 400);
        }
        await markMessageReadInDb(env.DB, body.messageId, authUser);
        return jsonResponse({ success: true });
      }

      if (request.method === 'DELETE') {
        const messageId = url.searchParams.get('id') || '';
        if (!messageId) {
          return jsonResponse({ error: 'Message ID is required.' }, 400);
        }
        await deleteMessageFromDb(env.DB, messageId, authUser);
        return jsonResponse({ success: true });
      }
    }

    // --- PROFILES, FEED & SOCIAL ENDPOINTS ---

    if (pathname === '/api/feed' && request.method === 'GET') {
      try {
        const limitParam = parseInt(url.searchParams.get('limit') || '20', 10);
        const cursorParam = url.searchParams.get('cursor') || undefined;
        const usernameParam = url.searchParams.get('username') || undefined;
        const feedResult = await getGlobalFeedFromDb(
          env.DB,
          Number.isNaN(limitParam) ? 20 : limitParam,
          cursorParam,
          usernameParam
        );
        return jsonResponse(feedResult);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Failed to fetch activity feed: ${message}` }, 500);
      }
    }

    if (pathname === '/api/profiles' && request.method === 'GET') {
      try {
        const recent = await getRecentProfilesFromDb(env.DB, 14);
        return jsonResponse({ profiles: recent });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Failed to fetch profiles: ${message}` }, 500);
      }
    }

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
          let targetUsername = username.toLowerCase().trim();
          if (targetUsername === 'tom') targetUsername = 'kevin';

          const authUser = getAuthenticatedUser(request);
          if (!authUser || authUser.toLowerCase() !== targetUsername) {
            return jsonResponse(
              { error: `Unauthorized: You must be logged in as @${targetUsername} to save changes.` },
              401
            );
          }

          const body = (await request.json()) as Partial<UserProfile>;
          const existing = await getProfileFromDb(env.DB, targetUsername);

          if (!existing) {
            return jsonResponse(
              { error: `Profile '@${targetUsername}' not found to update.` },
              404
            );
          }

          const toSave: UserProfile = {
            ...existing,
            ...body,
            username: existing.username
          };

          const saved = await saveProfileToDb(env.DB, toSave);
          const cssResult = sanitizeAndScopeCss(saved.rawCss || '');

          // Record granular activity feed items for profile changes
          let recordedSpecificActivity = false;

          if (
            (existing.songTitle || '') !== (toSave.songTitle || '') ||
            (existing.songArtist || '') !== (toSave.songArtist || '') ||
            (existing.mediaUrl || '') !== (toSave.mediaUrl || '')
          ) {
            const trackLabel = toSave.songTitle || 'a new track';
            const artistSuffix = toSave.songArtist ? ` by ${toSave.songArtist}` : '';
            await createActivityInDb(env.DB, {
              actorUsername: existing.username,
              actionType: 'SONG_CHANGED',
              summary: `updated their profile track to '${trackLabel}'${artistSuffix}`,
              metadata: {
                songTitle: toSave.songTitle,
                songArtist: toSave.songArtist
              }
            });
            recordedSpecificActivity = true;
          }

          if ((existing.mood || '') !== (toSave.mood || '') && toSave.mood) {
            await createActivityInDb(env.DB, {
              actorUsername: existing.username,
              actionType: 'MOOD_UPDATED',
              summary: `updated their current mood to '${toSave.mood}'`,
              metadata: { mood: toSave.mood }
            });
            recordedSpecificActivity = true;
          }

          if (
            JSON.stringify(existing.topFriends || []) !==
            JSON.stringify(toSave.topFriends || [])
          ) {
            await createActivityInDb(env.DB, {
              actorUsername: existing.username,
              actionType: 'TOP_FRIENDS_CHANGED',
              summary: 'rearranged their Top 8 Friends squad',
              metadata: {}
            });
            recordedSpecificActivity = true;
          }

          if ((toSave.photos || []).length > (existing.photos || []).length) {
            await createActivityInDb(env.DB, {
              actorUsername: existing.username,
              actionType: 'PHOTO_ADDED',
              summary: 'added new Polaroid snaps to their photo album',
              metadata: { photoCount: (toSave.photos || []).length }
            });
            recordedSpecificActivity = true;
          }

          if (
            !recordedSpecificActivity ||
            (existing.rawCss || '') !== (toSave.rawCss || '') ||
            JSON.stringify(existing.tokens) !== JSON.stringify(toSave.tokens)
          ) {
            await createActivityInDb(env.DB, {
              actorUsername: existing.username,
              actionType: 'PROFILE_UPDATED',
              summary: 'customized their profile layout and scoped CSS theme',
              metadata: {}
            });
          }

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

    const guestbookMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/guestbook$/);
    if (guestbookMatch) {
      const username = decodeURIComponent(guestbookMatch[1]);
      if (request.method === 'POST') {
        try {
          const body = (await request.json()) as {
            author?: string;
            content?: string;
            avatarUrl?: string;
            username?: string;
          };
          const { author, content, avatarUrl, username: authorUsername } = body || {};

          if (!content || typeof content !== 'string' || !content.trim()) {
            return jsonResponse({ error: 'Comment content is required.' }, 400);
          }

          const authUser = getAuthenticatedUser(request);
          const entry = await addGuestbookCommentToDb(
            env.DB,
            username,
            author || 'Anonymous Visitor',
            content,
            avatarUrl,
            authorUsername || authUser || undefined
          );

          const actorHandle =
            (authorUsername || authUser || author || 'visitor')
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '') || 'visitor';

          await createActivityInDb(env.DB, {
            actorUsername: actorHandle,
            targetUsername: username.toLowerCase().trim(),
            actionType: 'GUESTBOOK_SIGNED',
            summary: `signed the guestbook wall on @${username.toLowerCase().trim()}`,
            metadata: { snippet: content.slice(0, 100) }
          });

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

      if (request.method === 'DELETE') {
        const commentId = url.searchParams.get('id') || '';
        if (!commentId) {
          return jsonResponse({ error: 'Comment ID is required.' }, 400);
        }
        await deleteGuestbookCommentFromDb(env.DB, username, commentId);
        return jsonResponse({ success: true });
      }
    }

    const friendMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/friend$/);
    if (friendMatch && request.method === 'POST') {
      const targetUser = decodeURIComponent(friendMatch[1]);
      const authUser = getAuthenticatedUser(request);
      if (!authUser) {
        return jsonResponse({ error: 'Please log in to add friends.' }, 401);
      }
      const result = await toggleFriendInDb(env.DB, authUser, targetUser);
      return jsonResponse({ success: true, ...result });
    }

    const favoriteMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/favorite$/);
    if (favoriteMatch && request.method === 'POST') {
      const targetUser = decodeURIComponent(favoriteMatch[1]);
      const authUser = getAuthenticatedUser(request);
      if (!authUser) {
        return jsonResponse({ error: 'Please log in to favorite profiles.' }, 401);
      }
      const result = await toggleFavoriteInDb(env.DB, authUser, targetUser);
      return jsonResponse({ success: true, ...result });
    }

    const viewMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/view$/);
    if (viewMatch && request.method === 'POST') {
      try {
        const profileUsername = decodeURIComponent(viewMatch[1]);
        let viewerUsername = getAuthenticatedUser(request);
        let viewerAvatarUrl: string | undefined;

        if (!viewerUsername) {
          try {
            const body = (await request.json()) as {
              viewerUsername?: string;
              viewerAvatarUrl?: string;
            };
            if (body?.viewerUsername) {
              viewerUsername = body.viewerUsername;
              viewerAvatarUrl = body.viewerAvatarUrl;
            }
          } catch {
            // No JSON body provided
          }
        }

        if (!viewerUsername) {
          return jsonResponse({ recorded: false, reason: 'Unauthenticated visitor' });
        }

        const result = await recordProfileViewInDb(
          env.DB,
          profileUsername,
          viewerUsername,
          viewerAvatarUrl
        );
        return jsonResponse(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Failed to record view: ${message}` }, 500);
      }
    }

    const visitorsMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/visitors$/);
    if (visitorsMatch && request.method === 'GET') {
      try {
        const profileUsername = decodeURIComponent(visitorsMatch[1]);
        const visitors = await getRecentVisitorsFromDb(env.DB, profileUsername, 8);
        return jsonResponse({ visitors });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Failed to load recent visitors: ${message}` }, 500);
      }
    }

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

    // Fallback to Cloudflare Static Assets
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status === 404 && pathname.startsWith('/user/')) {
        const fallbackUrl = new URL('/user/kevin', request.url);
        return env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
      }
      return assetRes;
    }

    return new Response('Not Found', { status: 404 });
  }
};
