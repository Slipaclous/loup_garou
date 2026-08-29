import type { Metadata, Viewport } from 'next';
import { Cinzel_Decorative, MedievalSharp, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { AtmosphereBackground } from '@/components/effects/AtmosphereBackground';

const cinzel = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const medieval = MedievalSharp({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-medieval',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#050406',
};

export const metadata: Metadata = {
  title: 'Les Loups-Garous de Thiercelieux — Édition Horreur Gothique',
  description: 'Animez vos soirées avec l\'application horreur médiévale et cinématique des Loups-Garous de Thiercelieux.',
  other: {
    'charset': 'utf-8',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`dark ${cinzel.variable} ${medieval.variable} ${inter.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      </head>
      <body className="bg-[#050406] text-stone-200 min-h-screen flex flex-col antialiased selection:bg-red-800 selection:text-white font-sans overflow-x-hidden relative">
        {/* Vignette de cinéma sombre et grain atmosphérique */}
        <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_150px_rgba(0,0,0,0.95)] opacity-85" />
        
        {/* Fond atmosphérique animé avec lune de sang */}
        <AtmosphereBackground isNight={true} isBloodMoon={true} />

        <Navbar />
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
