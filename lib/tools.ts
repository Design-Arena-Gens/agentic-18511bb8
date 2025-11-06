type SearchResult = { summary: string; sources: { title: string; url: string }[] };

export async function searchTool(query: string): Promise<SearchResult> {
  const ddgUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
  try {
    const res = await fetch(ddgUrl, { headers: { 'User-Agent': 'AgenticBot/1.0' } });
    const text = await res.text();
    // DuckDuckGo HTML fallback parsing for a minimal summary
    const normalized = text.replace(/\s+/g, ' ').slice(0, 500);
    return {
      summary: normalized || 'No summary available',
      sources: [
        { title: 'DuckDuckGo search', url: ddgUrl },
      ],
    };
  } catch (e) {
    return {
      summary: 'Search failed',
      sources: [],
    };
  }
}

export async function fetchUrlTool(url: string): Promise<{ title?: string; preview: string }> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'AgenticBot/1.0' } });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const html = await res.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch?.[1]?.trim();
      const textPreview = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 600)
        .trim();
      return { title, preview: textPreview };
    }
    if (contentType.includes('application/json')) {
      const json = await res.json();
      const preview = JSON.stringify(json, null, 2).slice(0, 800);
      return { title: 'JSON', preview };
    }
    const text = await res.text();
    return { title: 'Content', preview: text.slice(0, 800) };
  } catch (e) {
    return { title: 'Error', preview: 'Failed to fetch url' };
  }
}

export async function mathTool(expression: string): Promise<{ value: number }> {
  const sanitized = expression.replace(/[^0-9+\-*/().^%\s]/g, '');
  // Replace ^ with ** for exponentiation
  const normalized = sanitized.replace(/\^/g, '**');
  // eslint-disable-next-line no-new-func
  const value = Function(`"use strict"; return (${normalized});`)();
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new Error('Invalid expression');
  }
  return { value };
}
