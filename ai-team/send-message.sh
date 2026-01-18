#!/bin/bash

# AI並列実行チーム - メッセージ送信システム

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 使用方法表示
show_usage() {
    cat << EOF
🚀 AIチーム メッセージ送信システム

使用方法:
  $0 [エージェント名] [メッセージ]
  $0 --list

利用可能エージェント:
  dev1    - 実行エージェント1
  dev2    - 実行エージェント2
  dev3    - 実行エージェント3

使用例:
  $0 dev1 "ログイン画面のUIを作成してください"
  $0 dev2 "認証APIを実装してください"
  $0 dev3 "テストコードを書いてください"
EOF
}

# エージェント一覧表示
show_agents() {
    echo "📋 AIチームメンバー一覧:"
    echo "========================"
    echo "  dev1    → team:0.0     (実行エージェント1)"
    echo "  dev2    → team:0.1     (実行エージェント2)"
    echo "  dev3    → team:0.2     (実行エージェント3)"
}

# ログ機能
log_message() {
    local agent="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    mkdir -p "$SCRIPT_DIR/logs"
    echo "[$timestamp] → $agent: \"$message\"" >> "$SCRIPT_DIR/logs/communication.log"
}

# セッション存在確認
check_session() {
    local session_name="$1"
    if ! tmux has-session -t "$session_name" 2>/dev/null; then
        echo "❌ エラー: セッション '$session_name' が見つかりません"
        echo "先に ./ai-team/start-ai-team.sh を実行してください"
        return 1
    fi
    return 0
}

# メッセージ送信
send_message() {
    local target="$1"
    local message="$2"
    local agent_name="$3"

    echo "📤 送信中: $agent_name へメッセージを送信..."

    # プロンプトクリア
    tmux send-keys -t "$target" C-c
    sleep 0.3

    tmux send-keys -t "$target" C-u
    sleep 0.2

    # メッセージ送信
    tmux send-keys -t "$target" "$message"
    sleep 0.3

    # Enter押下
    tmux send-keys -t "$target" C-m
    sleep 0.3

    echo "✅ 送信完了: $agent_name"
}

# メイン処理
main() {
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi

    if [[ "$1" == "--list" ]]; then
        show_agents
        exit 0
    fi

    if [[ $# -lt 2 ]]; then
        show_usage
        exit 1
    fi

    local agent="$1"
    local message="$2"
    local target=""

    case $agent in
        "dev1")
            target="team:0.0"
            ;;
        "dev2")
            target="team:0.1"
            ;;
        "dev3")
            target="team:0.2"
            ;;
        *)
            echo "❌ エラー: 無効なエージェント名 '$agent'"
            echo "利用可能エージェント: dev1, dev2, dev3"
            exit 1
            ;;
    esac

    # セッション存在確認
    if ! check_session "team"; then
        exit 1
    fi

    # メッセージ送信
    send_message "$target" "$message" "$agent"

    # ログ記録
    log_message "$agent" "$message"

    echo ""
    echo "🎯 メッセージ詳細:"
    echo "   宛先: $agent ($target)"
    echo "   内容: \"$message\""
    echo "   ログ: $SCRIPT_DIR/logs/communication.log"

    return 0
}

main "$@"
