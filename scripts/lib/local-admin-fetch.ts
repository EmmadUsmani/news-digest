import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

const origin = 'http://127.0.0.1:8000';

export function createLocalAdminFetch(
  readToken: () => string | undefined,
  read: typeof fetch = fetch,
): typeof fetch {
  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.origin !== origin || !url.pathname.startsWith('/api/admin/'))
      return read(input, init);
    const token = readToken();
    if (!token || /[\r\n]/.test(token))
      throw new Error('Local admin token is missing or invalid');
    const headers = new Headers(
      input instanceof Request ? input.headers : undefined,
    );
    new Headers(init?.headers).forEach((value, name) =>
      headers.set(name, value),
    );
    headers.set('ADMIN_LOCAL_TOKEN', token);
    // Never forward the credential to a redirect destination.
    return read(input, { ...init, headers, redirect: 'error' });
  };
}

export const localAdminFetch = createLocalAdminFetch(() => {
  try {
    return parseEnv(
      readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8'),
    ).ADMIN_LOCAL_TOKEN;
  } catch {
    throw new Error('Cannot read local admin credentials');
  }
});
