"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from 'ai/react';

export function Chat() {
  const [endpoint, setEndpoint] = useState('/api/chat');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    reload,
    error
  } = useChat({ api: endpoint });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const disabled = isLoading || !endpoint;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-800 bg-[#0f1320] p-3 text-xs text-neutral-300">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono">Endpoint:</span> <code>{endpoint}</code>
          </div>
          <button
            className="rounded bg-neutral-800 px-2 py-1 hover:bg-neutral-700"
            onClick={() => reload()}
            disabled={isLoading}
          >
            Retry
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-400">{String(error)}</div>
        )}
      </div>

      <div
        ref={containerRef}
        className="h-[55vh] overflow-y-auto rounded-lg border border-neutral-800 bg-[#0f1320] p-4"
      >
        {messages.length === 0 && (
          <div className="text-neutral-400 text-sm">
            Ask me to search the web, fetch a URL, or calculate expressions. If an LLM key is configured, tool-augmented reasoning will be used.
          </div>
        )}
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              <div className={m.role === 'user' ? 'text-blue-300' : 'text-neutral-100'}>
                <span className="mr-2 font-mono text-xs uppercase tracking-wide text-neutral-400">{m.role}</span>
                {m.content}
              </div>
              {m.tool Invocations?.length ? (
                <div className="mt-2 rounded border border-neutral-800 bg-[#0b0e14] p-2 text-xs text-neutral-300">
                  <div className="font-semibold mb-1">Tools</div>
                  <ul className="space-y-1">
                    {m.toolInvocations?.map((t: any) => (
                      <li key={t.id}>
                        <span className="font-mono">{t.toolName}</span>: <span className="text-neutral-200">{JSON.stringify(t.args)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2"
      >
        <textarea
          className="flex-1 min-h-[48px] max-h-[200px] rounded-md border border-neutral-800 bg-[#0b0e14] p-3 text-sm outline-none focus:ring-2 focus:ring-blue-600"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask the agent... e.g., search: latest TypeScript news; calc: (2+3)*5; fetch: https://example.com"
        />
        <button
          className="h-[48px] shrink-0 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          type="submit"
          disabled={disabled}
        >
          Send
        </button>
      </form>
    </div>
  );
}
