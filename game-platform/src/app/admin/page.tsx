"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser, isCurrentUserAdmin, createInvitation, getMyInvitations } from "@/lib/supabase";

interface Invitation {
  id: string;
  code: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

interface InviteStatus {
  canInvite: boolean;
  remaining: number;
  isAdmin: boolean;
}

export default function AdminPage() {
  const [expiryDays, setExpiryDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteStatus, setInviteStatus] = useState<InviteStatus | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    setIsPageLoading(true);
    try {
      const user = await getCurrentUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const isAdmin = await isCurrentUserAdmin();

      if (!isAdmin) {
        window.location.href = '/';
        return;
      }

      setInviteStatus({
        canInvite: true,
        remaining: -1,
        isAdmin: true,
      });

      const invitationsResult = await getMyInvitations();
      if (invitationsResult.success && invitationsResult.data) {
        setInvitations(invitationsResult.data as Invitation[]);
      }
    } catch (err) {
      setError("データの読み込みに失敗しました");
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await createInvitation(null, expiryDays);

      if (!result.success) {
        setError(result.error || "招待コードの作成に失敗しました");
        return;
      }

      const { code, invitation } = result.data as { code: string; invitation: Invitation };
      const inviteLink = `localhost:3001/signup?code=${code}`;
      setSuccess(`招待コード: ${code}\n招待リンク: ${inviteLink}`);

      if (invitation) {
        setInvitations(prev => [invitation, ...prev]);
      }
    } catch (err) {
      setError("予期しないエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setCopiedLink(null);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("コピーに失敗しました");
    }
  };

  const copyLink = async (code: string) => {
    try {
      const link = `localhost:3001/signup?code=${code}`;
      await navigator.clipboard.writeText(link);
      setCopiedLink(code);
      setCopiedCode(null);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error("コピーに失敗しました");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--foreground)]/60 text-lg">読み込み中...</div>
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
          aria-label="戻る"
        >
          <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-4">
        {/* Title Section */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎫</div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            管理者ダッシュボード
          </h1>
          <p className="text-[var(--foreground)]/60">
            招待コードの管理
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          {inviteStatus?.isAdmin ? (
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-[var(--secondary)] to-[var(--accent-pink)] text-white">
              👑 管理者（無制限）
            </span>
          ) : (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--foreground)]/10 text-[var(--foreground)]/80">
              残り: {inviteStatus?.remaining ?? 0}
            </span>
          )}
        </div>

        {/* Create Invitation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded-2xl text-sm whitespace-pre-line break-all">
              ✅ {success}
            </div>
          )}

          {/* Expiry Days Field */}
          <div className="bg-gradient-to-r from-[var(--accent-yellow)]/20 to-[var(--primary)]/20 rounded-3xl p-4 border-2 border-dashed border-[var(--primary)]/40">
            <label className="block mb-2">
              <span className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                <span className="text-lg">⏰</span>
                招待コードの有効期限
              </span>
            </label>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(Number(e.target.value))}
              disabled={isLoading || !inviteStatus?.canInvite}
              className="w-full min-h-[56px] px-4 rounded-2xl text-lg
                         bg-white border-2 border-[var(--foreground)]/20
                         focus:border-[var(--primary)] focus:outline-none transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={1}>1日</option>
              <option value={3}>3日</option>
              <option value={7}>7日</option>
              <option value={14}>14日</option>
              <option value={30}>30日</option>
            </select>
            <p className="mt-2 text-xs text-[var(--foreground)]/50">
              この期間内にコードを使用しないと無効になります
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !inviteStatus?.canInvite}
            className="w-full min-h-[56px] rounded-2xl text-white text-lg font-bold
                       bg-gradient-to-r from-[var(--secondary)] to-[var(--accent-pink)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-[0.98] transition-all duration-200
                       shadow-lg shadow-[var(--secondary)]/30"
          >
            {isLoading ? "作成中..." : "招待コードを発行 🎉"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[var(--foreground)]/10"></div>
          <span className="text-sm text-[var(--foreground)]/40 flex items-center gap-2">
            <span>📋</span> 発行済みコード
          </span>
          <div className="flex-1 h-px bg-[var(--foreground)]/10"></div>
        </div>

        {/* Invitations List */}
        <div className="space-y-3">
          {invitations.length === 0 ? (
            <p className="text-center text-[var(--foreground)]/40 py-8">
              まだ招待コードがありません。最初のコードを発行しましょう！ 🚀
            </p>
          ) : (
            invitations.map((inv) => (
              <div
                key={inv.id}
                className={`bg-white rounded-2xl p-4 border-2 transition-all
                  ${inv.used
                    ? "border-[var(--foreground)]/10 opacity-60"
                    : isExpired(inv.expires_at)
                      ? "border-red-300"
                      : "border-[var(--accent-green)]/30 hover:border-[var(--accent-green)]"
                  }`}
              >
                {/* Code Display */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-4 py-2 rounded-xl text-lg font-bold tracking-wider bg-[var(--primary)]/10 text-[var(--primary)]">
                    {inv.code}
                  </span>
                  {/* Status Badge */}
                  {inv.used ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--foreground)]/10 text-[var(--foreground)]/50">
                      使用済み
                    </span>
                  ) : isExpired(inv.expires_at) ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                      期限切れ
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-green)]/20 text-[var(--accent-green)]">
                      ✨ 有効
                    </span>
                  )}
                </div>

                {/* Copy Buttons */}
                {!inv.used && !isExpired(inv.expires_at) && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => copyCode(inv.code)}
                      className="flex-1 min-h-[44px] px-3 rounded-xl text-sm font-medium
                                 bg-[var(--foreground)]/5 text-[var(--foreground)]/70
                                 hover:bg-[var(--foreground)]/10 active:scale-[0.98] transition-all
                                 flex items-center justify-center gap-2"
                    >
                      {copiedCode === inv.code ? (
                        <>✅ コピー済み</>
                      ) : (
                        <>📋 コードをコピー</>
                      )}
                    </button>
                    <button
                      onClick={() => copyLink(inv.code)}
                      className="flex-1 min-h-[44px] px-3 rounded-xl text-sm font-medium
                                 bg-[var(--secondary)]/10 text-[var(--secondary)]
                                 hover:bg-[var(--secondary)]/20 active:scale-[0.98] transition-all
                                 flex items-center justify-center gap-2"
                    >
                      {copiedLink === inv.code ? (
                        <>✅ コピー済み</>
                      ) : (
                        <>🔗 リンクをコピー</>
                      )}
                    </button>
                  </div>
                )}

                {/* Details */}
                <div className="flex items-center justify-between text-sm text-[var(--foreground)]/50">
                  <span>作成日: {formatDate(inv.created_at)}</span>
                  <span>有効期限: {formatDate(inv.expires_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  );
}
