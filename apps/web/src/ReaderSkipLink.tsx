export function ReaderSkipLink({ target }: { target: string }) {
  return (
    <a
      href={`#${target}`}
      className="sr-only focus:fixed focus:top-[8px] focus:left-[16px] focus:max-w-[calc(100vw-32px)] focus:box-border [overflow-wrap:anywhere] z-50 rounded-md bg-[var(--background)] focus:px-[16px] focus:py-[12px] text-sm font-semibold text-[var(--accent)] shadow-md focus:not-sr-only"
    >
      Skip to content
    </a>
  );
}
