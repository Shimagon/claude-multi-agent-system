#!/bin/bash

# AI並列実行チーム - 送信して結果を待つスクリプト

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ $# -lt 2 ]]; then
    echo "使用方法: $0 [dev1|dev2|dev3] \"タスク内容\" [タイムアウト秒(デフォルト120)]"
    exit 1
fi

AGENT="$1"
TASK="$2"
TIMEOUT="${3:-120}"

RESULT_FILE="$SCRIPT_DIR/results/${AGENT}_result.txt"

# 古い結果をクリア
rm -f "$RESULT_FILE"

# 開始時刻を記録
START_TIME=$(date +%s)

# タスク送信
echo "📤 $AGENT にタスクを送信中..."
"$SCRIPT_DIR/send-message.sh" "$AGENT" "$TASK"

echo ""
echo "⏳ 結果を待機中（最大${TIMEOUT}秒）..."

# 結果ファイルが作成されるのを待つ
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))

    if [[ $ELAPSED -ge $TIMEOUT ]]; then
        echo "❌ タイムアウト（${TIMEOUT}秒経過）"
        exit 1
    fi

    if [[ -f "$RESULT_FILE" ]]; then
        # ファイルが存在し、内容がある場合
        if [[ -s "$RESULT_FILE" ]]; then
            # 【完了報告】が含まれているか確認
            if grep -q "完了報告\|完了\|結果" "$RESULT_FILE" 2>/dev/null; then
                echo ""
                echo "✅ 完了！（${ELAPSED}秒）"
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "📋 ${AGENT}の結果:"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                cat "$RESULT_FILE"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                exit 0
            fi
        fi
    fi

    # 5秒待って再チェック
    sleep 5
    echo "  ... 待機中（${ELAPSED}秒経過）"
done
