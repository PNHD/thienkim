import { Hono } from 'hono';
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

function unauthorized(c: Parameters<Parameters<typeof secureApp.use>[1]>[0]) {
  return c.text('Authentication required', 401, {
    'WWW-Authenticate': 'Basic realm="Thien Kim Pipeline", charset="UTF-8"',
  });
}

// The pipeline is an internal product and its routes can spend provider credits,
// mutate D1 state, and delete packs. Fail closed when deployment credentials are
// absent and require HTTP Basic authentication before the existing Hono app is
// reached. Browser sessions then authenticate both the dashboard and same-origin
// API calls without placing credentials in application JavaScript.
secureApp.use('*', async (c, next) => {
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
