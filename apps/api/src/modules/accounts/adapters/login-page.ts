import { createHash } from 'node:crypto';

import { accountPageStyle } from './sign-in-page';

// Credentials stay in form memory and same-origin POST bodies only.
const script = `(() => {
  history.replaceState(null, '', '/account/login');
  const form = document.querySelector('form');
  const email = document.querySelector('#email');
  const code = document.querySelector('#code');
  const request = document.querySelector('#request');
  const redeem = document.querySelector('#redeem');
  const message = document.querySelector('[role="status"]');
  let busy = false;
  code.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); form.requestSubmit(redeem); }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    const verifying = event.submitter === redeem;
    if (!email.checkValidity() || (verifying && !/^[0-9]{6}$/.test(code.value))) {
      message.textContent = 'Enter your email and a six-digit code.';
      return;
    }
    busy = true;
    request.disabled = redeem.disabled = true;
    message.textContent = verifying ? 'Signing in…' : 'Requesting a code…';
    const body = verifying ? { email: email.value, code: code.value } : { email: email.value };
    try {
      const response = await fetch('/api/account/' + (verifying ? 'redeem' : 'code'), {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (verifying && response.status === 204) {
        code.value = ''; email.value = '';
        location.replace('/');
        return;
      }
      if (!verifying && response.status === 202) {
        message.textContent = 'If this address can sign in, a code is available through the configured delivery method. Enter it below.';
        code.focus();
      } else {
        message.textContent = verifying ? 'Sign-in could not be completed. Check the code or request a new one.' : 'A code could not be requested. Try again later.';
      }
    } catch {
      message.textContent = 'Could not connect. Try again.';
    } finally {
      if (verifying) code.value = '';
      body.code = '';
      busy = false;
      request.disabled = redeem.disabled = false;
    }
  });
})();`;

const style =
  accountPageStyle +
  `
  label { display: block; margin: 20px 0 8px; }
  input { box-sizing: border-box; width: 100%; font: inherit; padding: 12px; border: 1px solid currentColor; border-radius: 6px; }
  button { margin-top: 16px; }
`;

export const loginPagePolicy = [
  "default-src 'none'",
  `script-src 'sha256-${createHash('sha256').update(script).digest('base64')}'`,
  `style-src 'sha256-${createHash('sha256').update(style).digest('base64')}'`,
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

export const loginPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><title>Sign in · News Digest</title>
<style>${style}</style></head><body><main>
<h1>Sign in to News Digest</h1>
<p>Sign in with a code to sync your saved items and hidden topics across devices.</p>
<form>
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" maxlength="254" required>
<button id="request" type="submit">Request code</button>
<label for="code">Six-digit code</label>
<input id="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6">
<button id="redeem" type="submit">Sign in</button>
</form>
<p role="status" aria-live="polite"></p>
<noscript>Enable JavaScript to sign in with a code.</noscript>
<p><a href="/">Back to the digest</a></p>
</main><script>${script}</script></body></html>`;
