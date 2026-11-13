import React from 'react';

export function LinkedPostText({
  text,
  postUrl,
}: {
  text: string;
  postUrl: string;
}) {
  const parts = text.split(/((?:https?:\/\/|pic\.twitter\.com\/)[^\s<>]+)/gi);
  return parts.map((part, index) => {
    if (!/^(?:https?:\/\/|pic\.twitter\.com\/)/i.test(part))
      return part ? (
        <a key={index} href={postUrl} target="_blank" rel="noreferrer">
          {part}
        </a>
      ) : null;
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
    const destination = /^pic\.twitter\.com\//i.test(url)
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
          target="_blank"
          rel="noreferrer"
          // Some official paragraphs place an anchor directly after a word.
          // Separate its destination visually without changing the saved text.
          className={`underline underline-offset-2 ${/[\p{L}\p{N}.!?…]$/u.test(parts[index - 1] ?? '') ? 'ms-1' : ''}`}
        >
          {url}
        </a>
        {part.slice(url.length)}
      </React.Fragment>
    );
  });
}
