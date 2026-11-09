import { Link } from '@tanstack/react-router';

import { ThemeToggle } from './components/theme-toggle';

export function Privacy() {
  const accountsEnabled = import.meta.env.VITE_READER_ACCOUNTS === '1';
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 pb-16 sm:px-6">
      <header className="flex items-center justify-between border-b border-[var(--border)] py-5">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          News Digest
        </Link>
        <ThemeToggle />
      </header>
      <article className="space-y-8 pt-12 text-base leading-relaxed">
        <h1 className="m-0 font-sans text-3xl font-semibold tracking-tight">
          Privacy
        </h1>
        <section className="space-y-3 p-0">
          <h2 className="font-sans text-xl font-semibold">In your browser</h2>
          <p>
            Your hidden topics, saved stories and posts, and theme choice stay
            in this browser. Clearing this site's browser data removes these
            local choices.
          </p>
          <p>
            News Digest does not use advertising or tracking analytics. It
            reports limited technical error details to help fix broken pages,
            without error messages, page URLs or saved choices.
          </p>
        </section>
        <section className="space-y-3 p-0">
          <h2 className="font-sans text-xl font-semibold">Accounts</h2>
          {accountsEnabled ? (
            <>
              <p>
                Signing in stores your email, sessions, hidden topics and
                bookmarks on the server so your choices can sync across devices.
                A secure cookie keeps you signed in. Login codes and sign-in
                links are temporary and single use.
              </p>
              <p>
                Use the account menu to sign out of this device or all devices.
                To delete your account, choose Delete account and confirm by
                typing DELETE. This removes your account and its saved choices
                from the active database and clears choices in the browser used
                for deletion. Other browsers can retain local copies; clear
                their site data to remove them.
              </p>
              <p>
                Private backups may retain earlier copies until those backups
                expire.
              </p>
            </>
          ) : (
            <p>
              Reader accounts are currently disabled. Hidden topics and
              bookmarks are stored only in your browser.
            </p>
          )}
        </section>
        <section className="space-y-3 p-0">
          <h2 className="font-sans text-xl font-semibold">
            Posts and external links
          </h2>
          <p>
            Embedded posts and media can connect your browser to services such
            as X and Bluesky. Those services receive connection information and
            may use cookies under their own privacy policies. Opening a source
            link takes you to that publisher's site.
          </p>
          <p>
            This site's hosting proxy also handles your connection and, while
            access is private, your exe.dev sign-in.
          </p>
        </section>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-md text-sm font-normal text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          Back to the latest edition
        </Link>
      </article>
    </main>
  );
}
