// Publisher feed teasers can explicitly hand the reader back to the article.
export function storyNeedsContinuation(text: string) {
  return (
    /(?:…|\.{3})\s*$/.test(text) ||
    /(?:^|[.!?…]\s+)Read more[.!]?\s*$/i.test(text) ||
    /\bRead (?:the )?full (?:article|story)(?: on [a-z0-9.-]+| at [a-z0-9][a-z0-9 .&’'-]{0,79})?\s*[.!]?(?:\s+Comments)?\s*$/i.test(
      text,
    )
  );
}
