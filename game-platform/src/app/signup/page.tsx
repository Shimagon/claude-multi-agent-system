"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp, validateInvitationCode } from "@/lib/supabase";

function SignupForm() {
  const searchParams = useSearchParams();
  const [invitationCode, setInvitationCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータから招待コードを自動入力・自動検証
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      const code = codeFromUrl.toUpperCase();
      setInvitationCode(code);

      // 自動検証を実行
      setIsValidating(true);
      validateInvitationCode(code).then((result) => {
        setIsCodeValid(result.success);
        setIsValidating(false);
      });
    }
  }, [searchParams]);

  const handleCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setInvitationCode(code);

    if (code.length >= 6) {
      // Supabaseで招待コードを検証
      setIsValidating(true);
      const result = await validateInvitationCode(code);
      setIsCodeValid(result.success);
      setIsValidating(false);
    } else {
      setIsCodeValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // バリデーション
      if (!isCodeValid) {
        setError("有効な招待コードを入力してください");
        return;
      }

      if (!email || !password) {
        setError("メールアドレスとパスワードを入力してください");
        return;
      }

      if (password.length < 8) {
        setError("パスワードは8文字以上で入力してください");
        return;
      }

      // サインアップ
      const result = await signUp(email, password);

      if (!result.success) {
        setError(result.error || "アカウント作成に失敗しました");
        return;
      }

      // 成功したらメール確認ページへ
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
    } catch (err) {
      setError("予期しないエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Game Arena へようこそ！
          </h1>
          <p className="text-[var(--foreground)]/60">
            アカウントを作成してゲームに参加しよう
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Invitation Code Field */}
          <div className="bg-gradient-to-r from-[var(--accent-yellow)]/20 to-[var(--primary)]/20 rounded-3xl p-4 border-2 border-dashed border-[var(--primary)]/40">
            <label className="block mb-2">
              <span className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                <span className="text-lg">🎫</span>
                招待コード
                <span className="text-xs font-normal text-[var(--foreground)]/50">(必須)</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={invitationCode}
                onChange={handleCodeChange}
                placeholder="招待コードを入力"
                disabled={isLoading}
                className={`w-full min-h-[56px] px-4 rounded-2xl text-center text-lg font-bold tracking-wider uppercase
                           bg-white border-2 transition-all outline-none
                           ${isCodeValid === true
                    ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10"
                    : isCodeValid === false
                      ? "border-red-400 bg-red-50"
                      : "border-[var(--foreground)]/20 focus:border-[var(--primary)]"
                  }`}
              />
              {isValidating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-6 w-6 text-[var(--primary)]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              {!isValidating && isCodeValid === true && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
                  ✅
                </div>
              )}
              {!isValidating && isCodeValid === false && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
                  ❌
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--foreground)]/50 text-center">
              友達から招待コードをもらおう！
            </p>
          </div>

          {/* Nickname Field */}
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-[var(--foreground)]/70 flex items-center gap-2">
                <span className="text-lg">😊</span>
                ニックネーム
              </span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ゲーム内で表示される名前"
              disabled={isLoading}
              className="w-full min-h-[56px] px-4 rounded-2xl text-lg
                         bg-white border-2 border-[var(--foreground)]/20
                         focus:border-[var(--secondary)] focus:outline-none transition-colors
                         disabled:opacity-50"
            />
          </div>

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

          {/* Password Field */}
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-[var(--foreground)]/70 flex items-center gap-2">
                <span className="text-lg">🔒</span>
                パスワード
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
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
            disabled={!isCodeValid || !email || !password || isLoading}
            className="w-full min-h-[56px] rounded-2xl text-white text-lg font-bold
                       bg-gradient-to-r from-[var(--secondary)] to-[var(--accent-pink)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-[0.98] transition-all duration-200
                       shadow-lg shadow-[var(--secondary)]/30"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                作成中...
              </span>
            ) : (
              "アカウント作成 🚀"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-8 text-[var(--foreground)]/60">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-[var(--secondary)] font-bold">
            ログイン
          </Link>
        </p>
      </main>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  );
}

// useSearchParamsはSuspenseが必要
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-5xl animate-bounce">🎉</div>
            <p className="text-[var(--foreground)]/70">読み込み中...</p>
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
