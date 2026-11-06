export function ReaderSkipLink({ target }: { target: string }) {
  return (
    <a
      href={`#${target}`}
      className="sr-only focus:fixed focus:top-2 focus:left-4 z-50 rounded-md bg-[var(--background)] focus:px-4 focus:py-3 text-sm font-semibold text-[var(--accent)] shadow-md focus:not-sr-only"
    >
      Skip to content
    </a>
  );
}
