#!/bin/bash

# コマンドヘルパースクリプト
# 現在のディレクトリパスを自動検出して、コピペ可能なコマンドを生成します
# Mac/Windows両対応

# カレントディレクトリを取得
CURRENT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# OS判定
if [[ "$(uname)" == "Darwin" ]]; then
    IS_MAC=true
    OS_NAME="macOS"
else
    IS_MAC=false
    OS_NAME="Windows (WSL)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 現在のプロジェクトパス:"
echo "   $CURRENT_DIR"
echo "🖥️  検出されたOS: $OS_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "以下のコマンドをコピーして使用してください："
echo ""

if $IS_MAC; then
    # Mac用コマンド
    echo "🚀 システム起動:"
    echo "cd $CURRENT_DIR && bash ./ai-team/auto-start.sh"
    echo ""

    echo "📤 タスク送信（dev1 - フロントエンド）:"
    echo "cd $CURRENT_DIR && ./ai-team/send-and-wait.sh dev1 '[タスク内容]'"
    echo ""

    echo "📤 タスク送信（dev2 - バックエンド）:"
    echo "cd $CURRENT_DIR && ./ai-team/send-and-wait.sh dev2 '[タスク内容]'"
    echo ""

    echo "📤 タスク送信（dev3 - テスト・調査）:"
    echo "cd $CURRENT_DIR && ./ai-team/send-and-wait.sh dev3 '[タスク内容]'"
    echo ""

    echo "📊 結果確認:"
    echo "cd $CURRENT_DIR && ./ai-team/check-results.sh"
    echo ""

    echo "🛑 システム停止:"
    echo "tmux kill-session -t team"
else
    # Windows (WSL)用コマンド
    echo "🚀 システム起動:"
    echo "wsl -e bash -c \"cd $CURRENT_DIR && bash ./ai-team/auto-start.sh\""
    echo ""

    echo "📤 タスク送信（dev1 - フロントエンド）:"
    echo "wsl -e bash -c \"cd $CURRENT_DIR && ./ai-team/send-and-wait.sh dev1 '[タスク内容]'\""
    echo ""

    echo "📤 タスク送信（dev2 - バックエンド）:"
    echo "wsl -e bash -c \"cd $CURRENT_DIR && ./ai-team/send-and-wait.sh dev2 '[タスク内容]'\""
    echo ""

    echo "📤 タスク送信（dev3 - テスト・調査）:"
    echo "wsl -e bash -c \"cd $CURRENT_DIR && ./ai-team/send-and-wait.sh dev3 '[タスク内容]'\""
    echo ""

    echo "📊 結果確認:"
    echo "wsl -e bash -c \"cd $CURRENT_DIR && ./ai-team/check-results.sh\""
    echo ""

    echo "🛑 システム停止:"
    echo "wsl -e bash -c \"tmux kill-session -t team\""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 ヒント: [タスク内容] の部分を実際のタスクに置き換えてください"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
