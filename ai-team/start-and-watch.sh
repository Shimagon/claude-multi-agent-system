#!/bin/bash

# マルチエージェント起動 + 監視画面表示
# 使い方: bash ./ai-team/start-and-watch.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 マルチエージェントシステムを起動 + 監視画面を開きます"
echo ""

# 既存セッションをチェック
if tmux has-session -t team 2>/dev/null; then
    echo "✅ tmuxセッション(team)は既に起動しています"
    echo "📺 監視画面を開きます..."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📖 tmux画面の操作方法:"
    echo "  - Ctrl+B → ↑↓←→  : ペイン移動"
    echo "  - Ctrl+B → d      : 監視画面を閉じる（セッションは継続）"
    echo "  - Ctrl+C         : 現在のコマンドをキャンセル"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    sleep 2
    tmux attach -t team
else
    echo "📦 tmuxセッションを起動..."
    "$SCRIPT_DIR/start-ai-team.sh"

    echo ""
    echo "⏳ Claude Codeの起動を待機中（15秒）..."
    sleep 15

    echo "📨 エージェントを初期化中..."
    "$SCRIPT_DIR/initialize-agents.sh"

    echo ""
    echo "✅ マルチエージェントシステム準備完了！"
    echo "📺 監視画面を開きます..."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📖 tmux画面の操作方法:"
    echo "  - Ctrl+B → ↑↓←→  : ペイン移動"
    echo "  - Ctrl+B → d      : 監視画面を閉じる（セッションは継続）"
    echo "  - Ctrl+C         : 現在のコマンドをキャンセル"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    sleep 2
    tmux attach -t team
fi
