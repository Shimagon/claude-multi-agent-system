---
description: マルチエージェントシステムを他のプロジェクトにセットアップする方法
---

# マルチエージェントシステム セットアップガイド

このシステムを他のプロジェクトで使う場合の手順です。

## 前提条件

- macOS または Windows + WSL2
- tmux がインストールされていること (`brew install tmux` / `apt install tmux`)
- Claude CLI がインストール済み (`npm install -g @anthropic-ai/claude-code`)
- Claude CLI にログイン済み (`claude login`)

## ⚠️ 重要: 許可設定（これをやらないとサブエージェントが止まる）

サブエージェントがファイル操作のたびに許可を求めて止まってしまう問題を回避するため、**`.claude/settings.local.json`** に以下の設定を追加してください：

```json
{
  "permissions": {
    "allow": [
      "Bash",
      "Read",
      "Write",
      "Edit",
      "MultiEdit",
      "Glob",
      "Grep",
      "LS"
    ]
  }
}
```

> **注意**: これは全ての操作を許可する設定です。信頼できるプロジェクトでのみ使用してください。

## セットアップ手順

### 1. ai-teamフォルダをコピー

```bash
# このリポジトリからai-teamフォルダを対象プロジェクトにコピー
cp -r /Users/taisei/Documents/GitHub/claude-multi-agent-system/ai-team /path/to/your-project/
```

### 2. 実行権限を付与

```bash
cd /path/to/your-project
chmod +x ./ai-team/*.sh
```

### 3. 対象ディレクトリでClaudeを一度起動して信頼を確認

```bash
cd /path/to/your-project
claude
# 「Yes, continue」を選択してからexitする
```

### 4. システム起動

```bash
# フルスクリーンのターミナルで実行
cd /path/to/your-project
bash ./ai-team/start-and-watch.sh
```

## 使い方

### PMとして指示を出す（VSCode拡張ClaudeまたはGemini）

このVSCode拡張のClaudeがPM役として動き、以下のコマンドでサブエージェントに指示を出します：

```bash
# dev1（フロントエンド担当）にタスク送信
./ai-team/send-and-wait.sh dev1 'タスク内容。完了後results/dev1_result.txtに報告'

# dev2（バックエンド担当）
./ai-team/send-and-wait.sh dev2 'タスク内容。完了後results/dev2_result.txtに報告'

# dev3（テスト・調査担当）
./ai-team/send-and-wait.sh dev3 'タスク内容。完了後results/dev3_result.txtに報告'
```

### 結果確認

```bash
./ai-team/check-results.sh
```

### システム停止

```bash
tmux kill-session -t team
```

## 重要なポイント

1. **ターミナルはフルスクリーン** - tmuxの3分割表示に十分な横幅が必要
2. **先にディレクトリを信頼済みに** - 一度 `claude` を普通に起動して承認しておく
3. **--dangerously-skip-permissions は使わない** - 確認画面がtmux内で操作できないため
4. **結果はファイル経由** - サブエージェントは `results/devX_result.txt` に書き出し

## トラブルシューティング

### 確認画面が操作できない

→ `--dangerously-skip-permissions` を使っている場合に発生。`start-ai-team.sh` からこのオプションを削除する。

### tmuxセッションが既に存在

```bash
tmux kill-session -t team
```

### Claudeが反応しない

```bash
claude whoami  # ログイン確認
claude login   # 再ログイン
```
