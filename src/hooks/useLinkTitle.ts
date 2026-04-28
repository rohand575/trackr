import { useEffect, useState } from 'react';

const titleCache = new Map<string, string>();

async function fetchTitle(url: string): Promise<string> {
  try {
    if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.title) return data.title;
      }
    }

    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.title) return data.data.title;
    }
  } catch {
    // fall through to URL fallback
  }
  return url;
}

export function useLinkTitle(url: string): string {
  const [title, setTitle] = useState<string>(titleCache.get(url) ?? '');

  useEffect(() => {
    if (titleCache.has(url)) {
      setTitle(titleCache.get(url)!);
      return;
    }
    fetchTitle(url).then((t) => {
      titleCache.set(url, t);
      setTitle(t);
    });
  }, [url]);

  return title || url;
}
