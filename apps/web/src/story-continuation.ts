// Publisher feed teasers can explicitly hand the reader back to the article.
export function storyNeedsContinuation(text: string) {
  return (
    /(?:…|\.{3})\s*$/.test(text) ||
    /\bRead (?:the )?full article on [a-z0-9.-]+\s*[.!]?\s*$/i.test(text)
  );
}
