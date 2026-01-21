"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyInvitations, createInvitation, getCurrentUser } from "@/lib/supabase";

interface Invitation {
  id: string;
  code: string;
  email: string | null;
  used: boolean;
  expires_at: string;
  created_at: string;
}

const MAX_INVITATIONS = 5;

export default function InvitePage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthAndLoadInvitations();
  }, []);

  const checkAuthAndLoadInvitations = async () => {
    const user = await getCurrentUser();
    if (!user) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }
    setIsLoggedIn(true);
    await loadInvitations();
  };

  const loadInvitations = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getMyInvitations();

    if (!result.success) {
      setError(result.error || "招待コードの取得に失敗しました");
    } else {
      setInvitations(result.data || []);
    }

    setIsLoading(false);
  };

  const handleCreateInvitation = async () => {
    if (invitations.length >= MAX_INVITATIONS) {
      setError(`招待コードは最大${MAX_INVITATIONS}個まで発行できます`);
      return;
    }

    setIsCreating(true);
    setError(null);

    const result = await createInvitation("", 7);

    if (!result.success) {
      setError(result.error || "招待コードの発行に失敗しました");
    } else {
      await loadInvitations();
    }

    setIsCreating(false);
  };

  const copyToClipboard = async (code: string) => {
    const inviteUrl = `${window.location.origin}/signup?code=${code}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      setError("コピーに失敗しました");
    }
  };

  const usedCount = invitations.filter((inv) => inv.used).length;
  const remainingCount = MAX_INVITATIONS - invitations.length;

  // ログインチェック中
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-[var(--primary)]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  // 未ログイン
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            ログインが必要です
          </h1>
          <p className="text-[var(--foreground)]/60 mb-8">
            招待コードを発行するにはログインしてください
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 rounded-2xl text-white font-bold
                       bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
                       active:scale-[0.98] transition-all"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex items-center">
        <Link
          href="/"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full hover:bg-[var(--foreground)]/5 active:scale-95 transition-all"
          aria-label="Go back"
        >
          <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-4">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎫</div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            友達を招待しよう！
          </h1>
          <p className="text-[var(--foreground)]/60">
            招待コードを共有してゲームに招待
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-3xl p-4 mb-6 border-2 border-[var(--primary)]/30">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-3xl font-bold text-[var(--primary)]">
                {invitations.length}
              </div>
              <div className="text-xs text-[var(--foreground)]/60">発行済み</div>
            </div>
            <div className="w-px bg-[var(--foreground)]/20"></div>
            <div>
              <div className="text-3xl font-bold text-[var(--accent-green)]">
                {usedCount}
              </div>
              <div className="text-xs text-[var(--foreground)]/60">使用済み</div>
            </div>
            <div className="w-px bg-[var(--foreground)]/20"></div>
            <div>
              <div className="text-3xl font-bold text-[var(--secondary)]">
                {remainingCount}
              </div>
              <div className="text-xs text-[var(--foreground)]/60">残り</div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 text-center text-sm">
            {error}
          </div>
        )}

        {/* Create Button */}
        {remainingCount > 0 && (
          <button
            onClick={handleCreateInvitation}
            disabled={isCreating}
            className="w-full min-h-[56px] rounded-2xl text-white text-lg font-bold mb-6
                       bg-gradient-to-r from-[var(--secondary)] to-[var(--accent-pink)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-[0.98] transition-all duration-200
                       shadow-lg shadow-[var(--secondary)]/30"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                発行中...
              </span>
            ) : (
              "＋ 新しい招待コードを発行"
            )}
          </button>
        )}

        {/* Invitations List */}
        {isLoading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-8 w-8 mx-auto text-[var(--primary)]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-2 text-[var(--foreground)]/60">読み込み中...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-[var(--foreground)]/60">
              まだ招待コードがありません<br />
              上のボタンから発行してみましょう！
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => {
              const isExpired = new Date(invitation.expires_at) < new Date();
              const isCopied = copiedCode === invitation.code;

              return (
                <div
                  key={invitation.id}
                  className={`bg-white rounded-2xl p-4 border-2 transition-all
                             ${invitation.used
                               ? "border-[var(--accent-green)]/30 bg-[var(--accent-green)]/5"
                               : isExpired
                                 ? "border-red-200 bg-red-50 opacity-60"
                                 : "border-[var(--foreground)]/10"
                             }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-lg font-bold tracking-wider text-[var(--foreground)]">
                      {invitation.code}
                    </code>
                    {invitation.used ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-green)]/20 text-[var(--accent-green)]">
                        ✓ 使用済み
                      </span>
                    ) : isExpired ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-500">
                        期限切れ
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary)]/20 text-[var(--primary)]">
                        有効
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--foreground)]/50">
                      有効期限: {new Date(invitation.expires_at).toLocaleDateString("ja-JP")}
                    </span>

                    {!invitation.used && !isExpired && (
                      <button
                        onClick={() => copyToClipboard(invitation.code)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                                   ${isCopied
                                     ? "bg-[var(--accent-green)] text-white"
                                     : "bg-[var(--primary)]/10 text-[var(--primary)] active:scale-95"
                                   }`}
                      >
                        {isCopied ? "✓ コピーしました！" : "📋 リンクをコピー"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-2xl bg-[var(--foreground)]/5 text-sm text-[var(--foreground)]/60">
          <p className="font-bold mb-2">💡 招待コードについて</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>1アカウントにつき最大{MAX_INVITATIONS}個まで発行可能</li>
            <li>招待コードは発行から7日間有効</li>
            <li>使用済みのコードは再利用できません</li>
          </ul>
        </div>
      </main>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  );
}
