export function WhyThis({ reason }: { reason?: string }) {
  if (!reason?.trim()) return null;
  return (
    <details className="group mt-[8px] text-sm text-[var(--secondary)]">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-[8px] rounded px-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
        <span aria-hidden="true" className="group-open:rotate-90">
          ›
        </span>
        Why this
      </summary>
      <p className="my-[8px] px-[4px] whitespace-pre-line [overflow-wrap:anywhere]">
        {reason}
      </p>
    </details>
  );
}
