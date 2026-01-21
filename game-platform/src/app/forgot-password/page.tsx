"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email) {
        setError("メールアドレスを入力してください");
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSent(true);
    } catch (err) {
      setError("予期しないエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-6">📬</div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4 text-center">
          メールを送信しました
        </h1>
        <p className="text-[var(--foreground)]/60 text-center mb-2">
          パスワードリセット用のリンクを送信しました：
        </p>
        <p className="text-[var(--secondary)] font-bold text-lg mb-8">
          {email}
        </p>
        <p className="text-[var(--foreground)]/40 text-sm text-center mb-8">
          メールをご確認ください。リンクをクリックして新しいパスワードを設定できます。
        </p>
        <Link
          href="/login"
          className="text-[var(--secondary)] font-medium"
        >
          ← ログインに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Main Content */}
      <main className="flex-1 px-6 py-8 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            パスワードをお忘れですか？
          </h1>
          <p className="text-[var(--foreground)]/60">
            登録したメールアドレスを入力してください
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-[var(--foreground)]/70 flex items-center gap-2">
                <span className="text-lg">📧</span>
                メールアドレス
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              className="w-full min-h-[56px] px-4 rounded-2xl text-lg
                         bg-white border-2 border-[var(--foreground)]/20
                         focus:border-[var(--secondary)] focus:outline-none transition-colors
                         disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!email || isLoading}
            className="w-full min-h-[56px] rounded-2xl text-white text-lg font-bold
                       bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-[0.98] transition-all duration-200
                       shadow-lg shadow-[var(--primary)]/30"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                送信中...
              </span>
            ) : (
              "リセットメールを送信 📧"
            )}
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-center mt-8 text-[var(--foreground)]/60">
          <Link href="/login" className="text-[var(--secondary)] font-bold">
            ← ログインに戻る
          </Link>
        </p>
      </main>
    </div>
  );
}
