const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;

export function extractLinks(text: string): string[] {
  const seen = new Set<string>();
  const links: string[] = [];
  for (const part of splitBodyByLinks(text)) {
    if (part.type === 'link' && !seen.has(part.content)) {
      seen.add(part.content);
      links.push(part.content);
    }
  }
  return links;
}

export function splitBodyByLinks(text: string): Array<{ type: 'text' | 'link'; content: string }> {
  const parts: Array<{ type: 'text' | 'link'; content: string }> = [];
  const regex = new RegExp(URL_PATTERN.source, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    // Strip trailing punctuation that's likely not part of the URL
    const url = match[0].replace(/[.,;:!?)\]>'"]+$/, '');
    parts.push({ type: 'link', content: url });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
}
