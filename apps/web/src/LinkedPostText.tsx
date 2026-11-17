import React from 'react';

export function LinkedPostText({
  text,
  postUrl,
}: {
  text: string;
  postUrl: string;
}) {
  const parts = text.split(
    /(https?:\/\/t\.co\/[a-z0-9]+(?=#[\p{L}\p{N}_])|(?:https?:\/\/|pic\.twitter\.com\/)[^\s<>]+|(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>]*(?:…|\.{3}))/giu,
  );
  return parts.map((part, index) => {
    if (
      !/^(?:https?:\/\/|pic\.twitter\.com\/)/i.test(part) &&
      !/^(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>]*(?:…|\.{3})$/i.test(part)
    )
      return part.trim() ? (
        <a
          key={index}
          href={postUrl}
          target="_blank"
          rel="noreferrer"
          // Saved short links sometimes run directly into the next hashtag.
          className={
            /^#[\p{L}\p{N}_]/u.test(part) &&
            /^https?:\/\/t\.co\/[a-z0-9]+$/i.test(parts[index - 1] ?? '')
              ? 'ms-1'
              : undefined
          }
        >
          {part}
        </a>
      ) : (
        part
      );
    // Leave sentence punctuation and closing quotes outside the link; preserve
    // quotes inside paths and keep the original saved text unchanged.
    let url = part.replace(/[.,;:!?\x22\x27”’»。、！？：；…]+$/, '');
    // Keep balanced URL parentheses (e.g. Wikipedia titles), but exclude
    // closing delimiters belonging to the surrounding sentence.
    while (/[)\]}）］｝】》〉」』]$/.test(url)) {
      const close = url.at(-1)!;
      const open = {
        ')': '(',
        ']': '[',
        '}': '{',
        '）': '（',
        '］': '［',
        '｝': '｛',
        '】': '【',
        '》': '《',
        '〉': '〈',
        '」': '「',
        '』': '『',
      }[close]!;
      if (url.split(close).length <= url.split(open).length) break;
      url = url.slice(0, -1).replace(/[.,;:!?\x22\x27”’»。、！？：；…]+$/, '');
    }
    // A saved display URL ending in an ellipsis is incomplete. The original
    // post can resolve its full destination; the shortened path cannot.
    const clipped =
      /(?:…|\.{3})[.,;:!?\x22\x27”’»。、！？：；)\]}>）］｝】》〉」』]*$/.test(
        part,
      );
    const destination = clipped
      ? postUrl
      : /^pic\.twitter\.com\//i.test(url)
        ? `https://${url}`
        : url;
    try {
      new URL(destination);
    } catch {
      return part;
    }
    return (
      <React.Fragment key={index}>
        <a
          href={destination}
          title={clipped ? 'Open original post for the full link' : undefined}
          target="_blank"
          rel="noreferrer"
          // Some official paragraphs place an anchor directly after text or emoji.
          // Separate it visually, keeping opening delimiters beside their URL
          // and leaving the saved text unchanged.
          className={`underline underline-offset-2 ${/[^\s([{（［｛【《〈「『]$/u.test(parts[index - 1] ?? '') ? 'ms-1' : ''}`}
        >
          {url}
        </a>
        {part.slice(url.length)}
      </React.Fragment>
    );
  });
}
