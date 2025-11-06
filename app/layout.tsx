import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Agentic ? Powerful Agent',
  description: 'A powerful agent with tools and streaming',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-[#0b0e14] text-white antialiased">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Agentic</h1>
            <p className="text-sm text-neutral-300">A powerful agent with built-in tools</p>
          </header>
          <main>{children}</main>
          <footer className="mt-12 text-xs text-neutral-400">
            <p>Built for Vercel deployment</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
