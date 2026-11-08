import { createHash } from 'node:crypto';

// No remote resources or dynamic values: the bearer stays only in this page's
// closure until an explicit confirmation POST. Never consume links on preview.
const script = `(() => {
  let token = location.hash.slice(1);
  history.replaceState(null, '', '/account/sign-in');
  const button = document.querySelector('button');
  const message = document.querySelector('[role="status"]');
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    token = '';
    message.textContent = 'This sign-in link is missing or invalid. Ask for a new link.';
    return;
  }
  button.disabled = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    message.textContent = 'Signing in…';
    try {
      const response = await fetch('/api/account/link-redeem', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      token = '';
      if (response.status === 204) {
        location.replace('/');
        return;
      }
    } catch {
      token = '';
    }
    message.textContent = 'Sign-in could not be completed. Ask for a new link.';
  });
})();`;

const style = `
  :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: light-dark(#f5f5f4, #18181b); color: light-dark(#18181b, #fafafa); }
  main { max-width: 440px; margin: 12vh auto; padding: 28px; border: 1px solid light-dark(#d4d4d8, #52525b); border-radius: 12px; background: light-dark(#fff, #27272a); }
  h1 { font-size: 1.6rem; line-height: 1.25; margin-top: 0; }
  p { line-height: 1.6; }
  button { font: inherit; padding: 12px 24px; border-radius: 6px; border: 1px solid currentColor; cursor: pointer; }
  button:disabled { cursor: default; opacity: .6; }
  a { color: inherit; text-underline-offset: 3px; }
  :focus-visible { outline: 3px solid #3b82f6; outline-offset: 4px; }
`;

export const signInPagePolicy = [
  "default-src 'none'",
  `script-src 'sha256-${createHash('sha256').update(script).digest('base64')}'`,
  `style-src 'sha256-${createHash('sha256').update(style).digest('base64')}'`,
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

export const signInPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><title>Sign in · News Digest</title>
<style>${style}</style></head><body><main>
<h1>Sign in to News Digest</h1>
<p>Continue only if you requested this link or received it from someone you trust.</p>
<button type="button" disabled>Sign in</button>
<p role="status" aria-live="polite"></p>
<noscript>Enable JavaScript to confirm this sign-in link.</noscript>
<p><a href="/">Back to the digest</a></p>
</main><script>${script}</script></body></html>`;
