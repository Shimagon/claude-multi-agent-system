#!/bin/bash

# AI並列実行チーム - 結果確認スクリプト
# PMがdev達の作業結果を確認するために使用

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"

echo "📊 作業結果確認"
echo "==============="
echo ""

# dev1の結果
if [[ -f "$RESULTS_DIR/dev1_result.txt" ]]; then
    echo "📁 dev1の結果:"
    echo "----------------------------------------"
    cat "$RESULTS_DIR/dev1_result.txt"
    echo "----------------------------------------"
    echo ""
else
    echo "📁 dev1: 結果ファイルなし"
    echo ""
fi

# dev2の結果
if [[ -f "$RESULTS_DIR/dev2_result.txt" ]]; then
    echo "📁 dev2の結果:"
    echo "----------------------------------------"
    cat "$RESULTS_DIR/dev2_result.txt"
    echo "----------------------------------------"
    echo ""
else
    echo "📁 dev2: 結果ファイルなし"
    echo ""
fi

# dev3の結果
if [[ -f "$RESULTS_DIR/dev3_result.txt" ]]; then
    echo "📁 dev3の結果:"
    echo "----------------------------------------"
    cat "$RESULTS_DIR/dev3_result.txt"
    echo "----------------------------------------"
    echo ""
else
    echo "📁 dev3: 結果ファイルなし"
    echo ""
fi

echo "💡 結果をクリアするには:"
echo "   rm $RESULTS_DIR/*.txt"
