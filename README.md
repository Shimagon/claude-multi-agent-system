# Claude Multi-Agent System

VSCode拡張Claude（PM）+ 3 Terminal Claude（dev1/dev2/dev3）によるマルチエージェント開発システム

## 🌟 特徴

- **VSCode拡張ClaudeがPM役**: 画像も送れる、会話履歴を保持
- **3つのターミナルClaude**: 並列タスク実行（フロントエンド/バックエンド/テスト）
- **ファイルベース同期**: 確実な通信と結果取得
- **ワンコマンド起動**: `マルチスタート`で即座に開始
- **トークン最適化**: PMは会話保持、サブエージェントは使い捨て

## 📋 システム構成

```
あなた（ユーザー）
    ↓ 会話
PM（VSCode拡張Claude）
    ↓ WSL経由でタスク送信
┌─────────────────────────────┐
│ tmux session (3 panes)      │
│  dev1 (Frontend)            │
│  dev2 (Backend)             │
│  dev3 (Test/Research)       │
└─────────────────────────────┘
    ↓ ファイル出力
./ai-team/results/*.txt
    ↓ PMが確認
あなたに報告
```

## 🚀 クイックスタート

### 必要環境
- Windows 11 + WSL2 + Ubuntu
- tmux
- Node.js
- Claude Code CLI
- VSCode + Claude拡張機能

### セットアップ

1. **リポジトリをクローン**
```bash
git clone https://github.com/YOUR_USERNAME/claude-multi-agent-system.git
cd claude-multi-agent-system
```

2. **実行権限付与**
```bash
chmod +x ./ai-team/*.sh
```

3. **システム起動**
```bash
./ai-team/auto-start.sh
```

4. **各ペインでClaude Codeにログイン**
   - ブラウザでログインURLを開く
   - 認証コードをコピー＆ペースト
   - "Yes, I accept" を選択（bypass permissions）

### 使い方

VSCode拡張Claudeに話しかけるだけ：
```
「マルチスタート」
「dev1にログイン画面作って」
「dev2にAPI作って、dev3でテストして」
```

## 📚 ドキュメント

- [完全ガイド](ai-team/COMPLETE_GUIDE.md) - 詳細な使い方とトークン最適化戦略
- [セットアップメモ](ai-team/SETUP_MEMO.md) - 環境構築手順
- [Developer指示書](ai-team/instructions/developer.md) - サブエージェント用ルール

## 🎯 トークン削減戦略

- **PM**: 会話履歴を保持（あなたとの対話が重要）
- **サブエージェント**: 使い捨て（各タスクは独立）
- **具体的指示**: PMがサブに送る指示を明確化してやり取り削減

詳細は[COMPLETE_GUIDE.md](ai-team/COMPLETE_GUIDE.md#🎯-トークン削減戦略)を参照。

## 📊 トークンモニター（オプション）

```bash
# WSL内で実行
curl -LsSf https://astral.sh/uv/install.sh | sh
exec $SHELL
uv tool install claude-monitor
claude-monitor --timezone Asia/Tokyo
```

## 🛠️ スクリプト一覧

- `auto-start.sh` - ワンコマンド起動
- `start-ai-team.sh` - tmuxセッション作成
- `send-message.sh` - メッセージ送信
- `send-and-wait.sh` - メッセージ送信＆結果待機
- `check-results.sh` - 結果一括確認
- `initialize-agents.sh` - エージェント初期化

## 💡 マルチエージェント提案基準

### マルチ向き
- 複数ファイル同時編集
- UI + API + テスト並列
- 複数調査タスク

### シングルで十分
- 1ファイル修正
- 単一機能実装

## 📅 作成日
2026年1月19日

## 📝 ライセンス
MIT

## 🙏 謝辞
この仕組みは[こちらの記事](https://zenn.dev/tam_tam/articles/dd90d92f85c3b7)にインスパイアされました。

---

**作成者**: VSCode拡張Claude + ユーザー協働
**Co-Authored-By**: Claude Sonnet 4.5
