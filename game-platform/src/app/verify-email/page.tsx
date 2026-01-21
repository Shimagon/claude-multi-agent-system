"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
    getPlayerCount();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setIsVerified(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayerCount = async () => {
    try {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      setPlayerNumber(count || 1);
    } catch (err) {
      setPlayerNumber(1);
    }
  };

  const resendEmail = async () => {
    try {
      await supabase.auth.resend({
        type: "signup",
        email: email,
      });
      alert("確認メールを再送信しました！");
    } catch (err) {
      alert("メール送信に失敗しました");
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-6">🎊</div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4 text-center">
          認証完了！
        </h1>
        <p className="text-xl text-[var(--secondary)] font-bold mb-8">
          あなたは {playerNumber?.toLocaleString()} 人目に登録されたプレイヤーです！
        </p>
        <a
          href="/"
          className="w-full max-w-sm min-h-[56px] rounded-2xl text-white text-lg font-bold
                     bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
                     flex items-center justify-center
                     active:scale-[0.98] transition-all duration-200
                     shadow-lg shadow-[var(--primary)]/30"
        >
          ゲームを始める 🎮
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
      <div className="text-6xl mb-6">📧</div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4 text-center">
        メールを確認してください
      </h1>
      <p className="text-[var(--foreground)]/60 text-center mb-2">
        確認メールを以下のアドレスに送信しました：
      </p>
      <p className="text-[var(--secondary)] font-bold text-lg mb-8">
        {email}
      </p>

      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-lg mb-6">
        <p className="text-[var(--foreground)]/70 text-center text-sm mb-4">
          メール内のリンクをクリックして認証を完了してください
        </p>
        <div className="flex items-center justify-center gap-2 text-[var(--foreground)]/40">
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 bg-[var(--secondary)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-[var(--accent-pink)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>

      <button
        onClick={resendEmail}
        className="text-[var(--secondary)] font-medium underline"
      >
        メールが届かない場合は再送信
      </button>

      <p className="mt-8 text-[var(--foreground)]/40 text-sm">
        認証が完了するとあなたは{" "}
        <span className="font-bold text-[var(--primary)]">
          {playerNumber?.toLocaleString() || "..."} 人目
        </span>{" "}
        のプレイヤーとして登録されます！
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--foreground)]/60">読み込み中...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
