import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Agentopoly — Real-Time Multiplayer Monopoly',
  description:
    'Play real-time multiplayer Monopoly online with your friends. Features animated 3D board visuals, Web Audio sound engine, title deeds, and live PartyKit state sync.',
  keywords: ['Monopoly', 'Multiplayer Game', 'Board Game', 'PartyKit', 'Next.js', 'Realtime Game'],
  openGraph: {
    title: 'Agentopoly — Real-Time Multiplayer Monopoly',
    description: 'Play real-time multiplayer Monopoly online with your friends.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
