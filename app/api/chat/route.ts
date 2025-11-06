import { NextRequest } from 'next/server';
import { streamText, tool, type ToolExecution } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { fetchUrlTool, mathTool, searchTool } from '@/lib/tools';

export const runtime = 'edge';

const openaiApiKey = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // If no LLM key, provide a simple rule-based fallback
  if (!openaiApiKey) {
    const last = messages?.[messages.length - 1]?.content as string | undefined;
    const reply = await fallbackAgent(last ?? '');
    return new Response(reply, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const openai = createOpenAI({ apiKey: openaiApiKey });

  const res = await streamText({
    model: openai('gpt-4o-mini'),
    messages,
    tools: {
      search: tool({
        description: 'Search the web for information',
        parameters: z.object({ query: z.string() }),
        execute: async ({ query }) => searchTool(query),
      }),
      fetch_url: tool({
        description: 'Fetch the textual content of a URL',
        parameters: z.object({ url: z.string().url() }),
        execute: async ({ url }) => fetchUrlTool(url),
      }),
      calculate: tool({
        description: 'Safely evaluate a math expression',
        parameters: z.object({ expression: z.string() }),
        execute: async ({ expression }) => mathTool(expression),
      }),
    },
  });

  return res.toAIStreamResponse();
}

async function fallbackAgent(input: string): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed) return 'Provide a question. Without OPENAI_API_KEY, a simple offline toolkit is used.';

  if (trimmed.toLowerCase().startsWith('search:')) {
    const query = trimmed.slice(7).trim();
    const result = await searchTool(query);
    return `search results for "${query}":\n` + result.summary;
  }

  if (trimmed.toLowerCase().startsWith('fetch:')) {
    const url = trimmed.slice(6).trim();
    const result = await fetchUrlTool(url);
    return `fetched: ${result.title || 'Untitled'}\n\n` + result.preview;
  }

  if (trimmed.toLowerCase().startsWith('calc:')) {
    const expr = trimmed.slice(5).trim();
    const result = await mathTool(expr);
    return `result: ${result.value}`;
  }

  return 'Offline mode: prefix with search:, fetch:, or calc: for basic tools. To enable full agentic reasoning, set OPENAI_API_KEY.';
}
