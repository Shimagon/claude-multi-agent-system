#!/bin/bash

# AI並列実行チーム - エージェント初期化スクリプト

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔧 AIエージェントを初期化中..."
echo ""

# セッション確認
if ! tmux has-session -t team 2>/dev/null; then
    echo "❌ エラー: teamセッションが見つかりません"
    echo "先に ./ai-team/start-ai-team.sh を実行してください"
    exit 1
fi

# Claude起動を待つ
echo "⏳ Claudeの起動を待っています（10秒）..."
sleep 10

# 各エージェントに役割を説明
echo "📨 dev1を初期化中..."
"$SCRIPT_DIR/send-message.sh" dev1 "あなたは実行エージェント（dev1）です。instructions/developer.mdの内容に従って動作してください。

あなたの特性：
- UI/UX、フロントエンド、デザインが得意
- PMからの指示を受けて作業を実行
- 完了したらresults/dev1_result.txtに結果を書き出し

PMからの指示を待っています。"

sleep 2

echo "📨 dev2を初期化中..."
"$SCRIPT_DIR/send-message.sh" dev2 "あなたは実行エージェント（dev2）です。instructions/developer.mdの内容に従って動作してください。

あなたの特性：
- バックエンド、API、データベースが得意
- PMからの指示を受けて作業を実行
- 完了したらresults/dev2_result.txtに結果を書き出し

PMからの指示を待っています。"

sleep 2

echo "📨 dev3を初期化中..."
"$SCRIPT_DIR/send-message.sh" dev3 "あなたは実行エージェント（dev3）です。instructions/developer.mdの内容に従って動作してください。

あなたの特性：
- テスト、品質管理、リサーチが得意
- PMからの指示を受けて作業を実行
- 完了したらresults/dev3_result.txtに結果を書き出し

PMからの指示を待っています。"

echo ""
echo "✅ 全エージェントの初期化が完了しました！"
echo ""
echo "📋 次のステップ："
echo "  1. tmux attach -t team でチーム画面を確認"
echo "  2. VSCode拡張のClaude（PM）から指示を出す"
echo ""
echo "💡 PMからの指示例："
echo "  ./ai-team/send-message.sh dev1 \"ログイン画面を作成して\""
