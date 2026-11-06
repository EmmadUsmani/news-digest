import { useEffect, useState } from 'react';

export function StoryTime({ publishedAt }: { publishedAt: string }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const date = new Date(publishedAt);
  const minutes = Math.floor((now - date.getTime()) / 60_000);
  const exact = date.toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'long',
  });
  // Future-dated reports keep their date rather than implying they are old.
  const label =
    minutes < 0
      ? date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : minutes < 1
        ? 'Just now'
        : minutes < 60
          ? `${minutes}m ago`
          : minutes < 1440
            ? `${Math.floor(minutes / 60)}h ago`
            : `${Math.floor(minutes / 1440)}d ago`;
  return (
    <time dateTime={publishedAt} title={exact} aria-label={exact}>
      {label}
    </time>
  );
}
