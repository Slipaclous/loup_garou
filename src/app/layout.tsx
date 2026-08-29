import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'Les Loups-Garous de Thiercelieux — Édition Soirée Web',
  description: 'Animez vos soirées entre amis avec l\'application moderne et cinématique du jeu des Loups-Garous de Thiercelieux.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#06070a] text-neutral-100 min-h-screen flex flex-col antialiased selection:bg-red-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col relative">
          {children}
        </main>
      </body>
    </html>
  );
}
