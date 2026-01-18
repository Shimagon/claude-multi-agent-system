#!/bin/bash

# マルチエージェント自動起動スクリプト
# 使い方: bash ./ai-team/auto-start.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 マルチエージェントシステムを起動中..."
echo ""

# 既存セッションをチェック
if tmux has-session -t team 2>/dev/null; then
    echo "✅ tmuxセッション(team)は既に起動しています"
else
    echo "📦 tmuxセッションを起動..."
    "$SCRIPT_DIR/start-ai-team.sh"

    echo ""
    echo "⏳ Claude Codeの起動を待機中（15秒）..."
    sleep 15

    echo "📨 エージェントを初期化中..."
    "$SCRIPT_DIR/initialize-agents.sh"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ マルチエージェントシステム準備完了！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📺 監視画面を開くには別ターミナルで:"
echo "   wsl -e bash -c 'tmux attach -t team'"
echo ""
echo "📨 タスク送信:"
echo "   PM(VSCode拡張Claude)に話しかけるだけでOK！"
echo ""
echo "📊 トークン使用量モニター起動（別ターミナル推奨）:"
echo "   claude-monitor --timezone Asia/Tokyo"
echo ""
