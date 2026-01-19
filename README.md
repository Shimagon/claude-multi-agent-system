# Claude Multi-Agent System

VSCode拡張Claude（PM）+ 3 Terminal Claude（dev1/dev2/dev3）によるマルチエージェント開発システム

## 🆕 新しいClaudeセッションの方へ

このプロジェクトを初めて使う、または新しいClaudeセッションで開いた場合：

1. **[QUICKSTART.md](QUICKSTART.md) を読んでください** - すぐに使えるコマンドが全て記載されています
2. または、Claudeに以下のように指示してください：

```
QUICKSTART.mdを読んで、マルチエージェントシステムを起動してください
```

これだけで自動的にシステムが立ち上がります。

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

### 前提条件チェック

始める前に、以下の環境確認コマンドを実行してください：

```bash
wsl -e bash -c "echo '=== 環境確認 ==='; \
  echo -n '✅ WSL: '; wsl --version | head -1; \
  echo -n '✅ tmux: '; tmux -V; \
  echo -n '✅ Node.js: '; node --version; \
  echo -n '✅ Claude CLI: '; claude --version; \
  echo -n '✅ Claude Login: '; claude whoami || echo '❌ 未ログイン'"
```

すべて✅が表示されない場合は、[SETUP.md](SETUP.md) で環境構築を完了してください。

### 必要環境
- Windows 11 + WSL2 + Ubuntu
- tmux
- Node.js
- Claude Code CLI
- VSCode + Claude拡張機能

### セットアップ

#### 初めての方

完全な環境構築手順は [SETUP.md](SETUP.md) を参照してください。

#### すでに環境が整っている方

1. **リポジトリをクローン**
```bash
cd ~/Documents/GitHub
git clone https://github.com/Shimagon/claude-multi-agent-system.git
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

4. **各ペインでClaude Codeにログイン**（初回のみ）
   - ブラウザでログインURLを開く
   - 認証コードをコピー＆ペースト
   - "Yes, I accept" を選択（bypass permissions）

### 使い方

#### 初回起動（新しいClaudeセッションの場合）

VSCode拡張Claudeに以下のコマンドを貼り付けて実行：

```bash
wsl -e bash -c "cd ~/Documents/GitHub/claude-multi-agent-system && bash ./ai-team/auto-start.sh"
```

#### タスク送信（実際に動く例）

エージェントが起動したら、VSCode拡張Claudeから指示を送る：

```bash
# 例1: README.mdを調査
wsl -e bash -c "cd ~/Documents/GitHub/claude-multi-agent-system && ./ai-team/send-and-wait.sh dev3 'README.mdを読んで、このプロジェクトの主な特徴を3つリストアップ。完了後results/dev3_result.txtに報告'"

# 例2: ai-teamフォルダのスクリプトを調査
wsl -e bash -c "cd ~/Documents/GitHub/claude-multi-agent-system && ./ai-team/send-and-wait.sh dev2 'ai-teamフォルダ内のスクリプトファイルをリストアップして役割を説明。完了後results/dev2_result.txtに報告'"
```

#### 結果確認

```bash
wsl -e bash -c "cd ~/Documents/GitHub/claude-multi-agent-system && ./ai-team/check-results.sh"
```

## 📚 ドキュメント

- **[SETUP.md](SETUP.md)** - 完全な環境構築ガイド（初心者向け）
- **[QUICKSTART.md](QUICKSTART.md)** - 新しいClaudeセッション用コマンド集（重要！）
- [COMPLETE_GUIDE.md](ai-team/COMPLETE_GUIDE.md) - 詳細な使い方とトークン最適化戦略
- [SETUP_MEMO.md](ai-team/SETUP_MEMO.md) - 環境構築メモ
- [developer.md](ai-team/instructions/developer.md) - サブエージェント用ルール

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

## ❗ トラブルシューティング

### よくあるエラーと対処法

| エラー | 原因 | 解決方法 |
|--------|------|----------|
| `tmux: command not found` | tmux未インストール | `wsl -e bash -c "sudo apt install tmux -y"` |
| `session already exists: team` | tmuxセッション起動済み | `wsl -e bash -c "tmux kill-session -t team"` |
| `claude: command not found` | Claude CLI未インストール | `wsl -e bash -c "npm install -g @anthropic-ai/claude-code"` |
| `Permission denied` | 実行権限なし | `wsl -e bash -c "chmod +x ./ai-team/*.sh"` |
| タスクに反応しない | Claude未ログイン | `wsl -e bash -c "claude login"` |
| 結果ファイルが空 | 前回の結果が残存 | `wsl -e bash -c "rm -f ./ai-team/results/*.txt"` |

詳細は [QUICKSTART.md](QUICKSTART.md#❗-トラブルシューティング) を参照してください。

## 📅 作成日
2026年1月19日

## 📝 ライセンス
MIT

## 🙏 謝辞
この仕組みは[こちらの記事](https://zenn.dev/tam_tam/articles/dd90d92f85c3b7)にインスパイアされました。

---

**作成者**: VSCode拡張Claude + ユーザー協働
**Co-Authored-By**: Claude Sonnet 4.5
