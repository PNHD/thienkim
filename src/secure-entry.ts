import { Hono, type Context } from 'hono';
import app from './index';
import type { Env } from './types';

type SecureEnv = Env & {
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
};

type AppEnv = { Bindings: SecureEnv };

const secureApp = new Hono<AppEnv>();

function sameString(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function unauthorized(c: Context<AppEnv>, realm = 'Thien Kim Pipeline') {
  c.header('WWW-Authenticate', `Basic realm="${realm}", charset="UTF-8"`);
  return c.text('Authentication required', 401);
}

// The pipeline is an internal product and its routes can spend provider credits,
// mutate D1 state, and delete packs. Fail closed when deployment credentials are
// absent and require HTTP Basic authentication before the existing Hono app is
// reached. Browser sessions then authenticate both the dashboard and same-origin
// API calls without placing credentials in application JavaScript.
//
// The legacy n8n callback keeps its machine-to-machine X-N8N-Secret contract,
// but is checked here first so an unset N8N_SECRET can never become a fail-open
// comparison in the legacy route.
secureApp.use('*', async (c, next) => {
  if (c.req.path === '/api/n8n/callback') {
    const expectedSecret = c.env.N8N_SECRET;
    const providedSecret = c.req.header('X-N8N-Secret');
    if (
      !expectedSecret ||
      !providedSecret ||
      !sameString(providedSecret, expectedSecret)
    ) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    await next();
    return;
  }

  const expectedUsername = c.env.ADMIN_USERNAME;
  const expectedPassword = c.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return c.json({ error: 'Admin authentication is not configured' }, 503);
  }

  const authorization = c.req.header('Authorization') ?? '';
  if (!authorization.startsWith('Basic ')) return unauthorized(c);

  let decoded: string;
  try {
    decoded = atob(authorization.slice('Basic '.length));
  } catch {
    return unauthorized(c);
  }

  const separator = decoded.indexOf(':');
  if (separator < 0) return unauthorized(c);

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  if (
    !sameString(username, expectedUsername) ||
    !sameString(password, expectedPassword)
  ) {
    return unauthorized(c);
  }

  await next();
});

secureApp.route('/', app);

export default secureApp;
