import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-headings',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ReelAI - Pictory-Style AI Video Generator SaaS',
  description: 'Convert text scripts into highly engaging videos with AI voice narration, aligned subtitles, transitions, and stock visuals in one click.',
  keywords: ['AI Video Generator', 'SaaS', 'Pictory alternative', 'ElevenLabs TTS', 'Text to Video', 'Video Editor Web'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
