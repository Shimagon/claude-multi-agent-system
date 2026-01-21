#!/bin/bash

# AI並列実行チーム - 起動スクリプト

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 AI並列実行チームを起動中..."
echo "プロジェクトディレクトリ: $PROJECT_DIR"

# 既存のセッションをクリーンアップ
tmux kill-session -t team 2>/dev/null

# logsとresultsディレクトリ作成
mkdir -p "$SCRIPT_DIR/logs"
mkdir -p "$SCRIPT_DIR/results"

# チームセッション（3分割 - dev1, dev2, dev3）
tmux new-session -d -s team -c "$PROJECT_DIR"

# 2つのペインを追加（合計3ペイン）
tmux split-window -h -t team -c "$PROJECT_DIR"
tmux split-window -v -t team:0.0 -c "$PROJECT_DIR"

# 各画面でClaude起動
# team:0.0 = dev1
tmux send-keys -t team:0.0 "cd $PROJECT_DIR" C-m
tmux send-keys -t team:0.0 "claude $SCRIPT_DIR/instructions/developer.md" C-m

# team:0.1 = dev2
tmux send-keys -t team:0.1 "cd $PROJECT_DIR" C-m
tmux send-keys -t team:0.1 "claude $SCRIPT_DIR/instructions/developer.md" C-m

# team:0.2 = dev3
tmux send-keys -t team:0.2 "cd $PROJECT_DIR" C-m
tmux send-keys -t team:0.2 "claude $SCRIPT_DIR/instructions/developer.md" C-m

echo ""
echo "✅ AI並列実行チームを起動しました！"
echo ""
echo "📋 使い方："
echo "  チーム画面に接続: tmux attach -t team"
echo ""
echo "🎮 画面操作："
echo "  Ctrl+B → ↑↓←→ で画面移動"
echo "  Ctrl+B → d でデタッチ（終了ではない）"
echo "  tmux kill-server で完全終了"
echo ""
echo "📨 メッセージ送信："
echo "  ./ai-team/send-message.sh dev1 \"タスク内容\""
echo "  ./ai-team/send-message.sh dev2 \"タスク内容\""
echo "  ./ai-team/send-message.sh dev3 \"タスク内容\""
echo ""
echo "⚡ 次のステップ: ./ai-team/initialize-agents.sh を実行してエージェントを初期化"
