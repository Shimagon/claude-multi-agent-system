'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();

      // 未ログイン → /login にリダイレクト
      if (!user) {
        router.replace('/login');
        return;
      }

      // メール未確認 → /verify-email にリダイレクト
      if (!user.email_confirmed_at) {
        router.replace('/verify-email');
        return;
      }

      // 認証OK
      setIsLoading(false);
    }

    checkAuth();
  }, [router]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🎮</div>
          <p className="text-[var(--foreground)]/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--foreground)]/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            GameHub
          </h1>
          <button
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full bg-[var(--secondary)] text-white active:scale-95 transition-transform"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="text-6xl animate-bounce-subtle">
            🎮
          </div>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Play Together!
          </h2>
          <p className="text-[var(--foreground)]/70 text-lg">
            Fun games with friends, anytime, anywhere
          </p>
        </section>

        {/* CTA Button - Large Touch Target */}
        <button
          className="w-full min-h-[56px] rounded-2xl text-white text-lg font-bold
                     bg-gradient-to-r from-[var(--primary)] to-[var(--accent-pink)]
                     active:scale-[0.98] transition-all duration-200
                     shadow-[var(--shadow-pop)] animate-pulse-glow"
        >
          Start Playing Now
        </button>

        {/* Game Categories */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-[var(--foreground)]">
            Popular Games
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Game Card 1 */}
            <button className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--accent-yellow)] to-[var(--primary)] p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-[var(--shadow-card)]">
              <span className="text-4xl">🎯</span>
              <span className="text-white font-bold text-sm">Quiz Battle</span>
            </button>

            {/* Game Card 2 */}
            <button className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--secondary)] to-[var(--accent-pink)] p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-[var(--shadow-card)]">
              <span className="text-4xl">🎨</span>
              <span className="text-white font-bold text-sm">Draw & Guess</span>
            </button>

            {/* Game Card 3 */}
            <button className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-[var(--shadow-card)]">
              <span className="text-4xl">🏃</span>
              <span className="text-[var(--foreground)] font-bold text-sm">Race Run</span>
            </button>

            {/* Game Card 4 */}
            <button className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--accent-pink)] to-[var(--secondary)] p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-[var(--shadow-card)]">
              <span className="text-4xl">🎵</span>
              <span className="text-white font-bold text-sm">Music Match</span>
            </button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-[var(--foreground)]">
            Quick Start
          </h3>
          <div className="space-y-3">
            {/* Action Button 1 */}
            <button className="w-full min-h-[56px] rounded-2xl bg-white border-2 border-[var(--primary)] text-[var(--primary)] font-bold flex items-center justify-center gap-3 active:bg-[var(--primary)] active:text-white transition-colors shadow-[var(--shadow-card)]">
              <span className="text-2xl">👥</span>
              Create Room
            </button>

            {/* Action Button 2 */}
            <button className="w-full min-h-[56px] rounded-2xl bg-white border-2 border-[var(--secondary)] text-[var(--secondary)] font-bold flex items-center justify-center gap-3 active:bg-[var(--secondary)] active:text-white transition-colors shadow-[var(--shadow-card)]">
              <span className="text-2xl">🔗</span>
              Join with Code
            </button>

            {/* Action Button 3 */}
            <button className="w-full min-h-[56px] rounded-2xl bg-white border-2 border-[var(--accent-pink)] text-[var(--accent-pink)] font-bold flex items-center justify-center gap-3 active:bg-[var(--accent-pink)] active:text-white transition-colors shadow-[var(--shadow-card)]">
              <span className="text-2xl">🎲</span>
              Random Match
            </button>
          </div>
        </section>

        {/* Online Players */}
        <section className="bg-white rounded-3xl p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--foreground)]/60 text-sm">Players Online</p>
              <p className="text-3xl font-bold text-[var(--secondary)]">1,234</p>
            </div>
            <div className="flex -space-x-3">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-yellow)] border-3 border-white flex items-center justify-center text-xl">😊</div>
              <div className="w-12 h-12 rounded-full bg-[var(--accent-pink)] border-3 border-white flex items-center justify-center text-xl">😎</div>
              <div className="w-12 h-12 rounded-full bg-[var(--accent-green)] border-3 border-white flex items-center justify-center text-xl">🤩</div>
              <div className="w-12 h-12 rounded-full bg-[var(--secondary)] border-3 border-white flex items-center justify-center text-white text-sm font-bold">+99</div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation - Fixed, Large Touch Targets */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--foreground)]/10 px-4 py-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          <button className="min-h-[56px] min-w-[64px] flex flex-col items-center justify-center gap-1 text-[var(--primary)]">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="min-h-[56px] min-w-[64px] flex flex-col items-center justify-center gap-1 text-[var(--foreground)]/40">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span className="text-xs font-medium">Explore</span>
          </button>
          <button className="min-h-[56px] min-w-[64px] flex flex-col items-center justify-center gap-1 text-[var(--foreground)]/40">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span className="text-xs font-medium">Friends</span>
          </button>
          <button className="min-h-[56px] min-w-[64px] flex flex-col items-center justify-center gap-1 text-[var(--foreground)]/40">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Spacer for bottom navigation */}
      <div className="h-20"></div>
    </div>
  );
}
