/**
 * _worker.js — Cloudflare Pages Worker for calculator.snabbb.com
 *
 * Injects the user's Snabbb theme before React paints:
 * - Reads `snabbb-theme` cookie from .snabbb.com.
 * - If authenticated and no cookie exists, asks Odoo for /api/user/theme.
 * - Injects window.__SNABBB_THEME__ into <head>.
 * - Refreshes the cross-subdomain theme cookie.
 */

const ODOO_THEME_URL = 'https://mrbur.odoo.com/api/user/theme';
const COOKIE_NAME = 'snabbb-theme';
const COOKIE_DOMAIN = '.snabbb.com';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const VALID_THEMES = new Set(['light', 'dark', 'system']);
const DEFAULT_THEME = 'light';

function parseTheme(value) {
  if (!value) return null;
  const raw = String(value).trim().toLowerCase();
  return VALID_THEMES.has(raw) ? raw : null;
}

function readThemeCookie(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)snabbb-theme=([^;]+)/);
  return match ? parseTheme(decodeURIComponent(match[1])) : null;
}

async function fetchThemeFromOdoo(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  if (!cookieHeader.includes('session_id=')) return null;

  try {
    const res = await fetch(ODOO_THEME_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.ok && !data?.authenticated) return null;

    return parseTheme(data.theme);
  } catch {
    return null;
  }
}

function buildThemeCookie(theme) {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(theme)}`,
    'Path=/',
    `Domain=${COOKIE_DOMAIN}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    'SameSite=Lax',
    'Secure',
  ].join('; ');
}


async function proxyThemeApi(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const init = {
    method: request.method,
    headers: {
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
      Cookie: cookieHeader,
    },
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.text();
  }

  try {
    const odooResponse = await fetch(ODOO_THEME_URL, init);
    const headers = new Headers(odooResponse.headers);
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');

    if (request.method === 'POST' && odooResponse.ok) {
      try {
        const clone = odooResponse.clone();
        const data = await clone.json();
        const theme = parseTheme(data?.theme);
        if (theme) headers.append('Set-Cookie', buildThemeCookie(theme));
      } catch {
        // Keep the proxied Odoo response even if the body is not JSON.
      }
    }

    return new Response(odooResponse.body, {
      status: odooResponse.status,
      statusText: odooResponse.statusText,
      headers,
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'theme_sync_unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function isHtmlRequest(request) {
  const accept = request.headers.get('Accept') || '';
  if (!accept.includes('text/html')) return false;

  const url = new URL(request.url);
  const path = url.pathname;

  if (path.startsWith('/api/')) return false;
  if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map|json|webp|avif)$/i.test(path)) return false;

  return true;
}

class ThemeInjector {
  constructor(theme) {
    this.theme = theme;
    this.injected = false;
  }

  element(element) {
    if (this.injected) return;
    this.injected = true;
    element.prepend(`<script>window.__SNABBB_THEME__=${JSON.stringify(this.theme)};</script>`, { html: true });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/user/theme') {
      return proxyThemeApi(request);
    }

    if (!isHtmlRequest(request)) {
      return env.ASSETS.fetch(request);
    }

    const cookieTheme = readThemeCookie(request);
    const hasSession = (request.headers.get('Cookie') || '').includes('session_id=');
    let odooTheme = null;

    if (!cookieTheme && hasSession) {
      odooTheme = await fetchThemeFromOdoo(request);
    } else if (cookieTheme && hasSession) {
      ctx.waitUntil(fetchThemeFromOdoo(request));
    }

    const theme = odooTheme || cookieTheme || DEFAULT_THEME;
    const pageResponse = await env.ASSETS.fetch(request);

    if (!pageResponse.ok || !pageResponse.headers.get('Content-Type')?.includes('text/html')) {
      return pageResponse;
    }

    const headers = new Headers(pageResponse.headers);
    headers.append('Set-Cookie', buildThemeCookie(theme));

    return new HTMLRewriter()
      .on('head', new ThemeInjector(theme))
      .transform(new Response(pageResponse.body, { status: pageResponse.status, headers }));
  },
};
