# クイックスタートガイド

新しいVSCode拡張Claudeセッションでマルチエージェントシステムを使う方法

## 📍 重要：パスを確認

以下のコマンドで、あなたのプロジェクトパスを確認してください：
```bash
pwd
```

例：`/mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system`

## 🚀 ステップ1：システム起動

VSCode拡張Claudeに以下を貼り付けて実行：

```bash
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system && bash ./ai-team/auto-start.sh"
```

**重要**: `taise` の部分をあなたのWindowsユーザー名に置き換えてください。

## ✅ ステップ2：起動確認

以下のコマンドで、3つのエージェント（dev1, dev2, dev3）が起動しているか確認：

```bash
wsl -e bash -c "tmux list-sessions"
```

`team` というセッションが表示されればOK。

## 📤 ステップ3：タスクを送る

### dev1にタスクを送信（フロントエンド担当）
```bash
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system && ./ai-team/send-and-wait.sh dev1 'src/components/Button.tsx を作成。Reactのボタンコンポーネント。完了後results/dev1_result.txtに報告'"
```

### dev2にタスクを送信（バックエンド担当）
```bash
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system && ./ai-team/send-and-wait.sh dev2 'api/login.ts を作成。ログインAPIエンドポイント。完了後results/dev2_result.txtに報告'"
```

### dev3にタスクを送信（テスト・調査担当）
```bash
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system && ./ai-team/send-and-wait.sh dev3 'package.json を調査して、使用している主要ライブラリをリストアップ。完了後results/dev3_result.txtに報告'"
```

## 📊 ステップ4：結果を確認

全エージェントの結果を一度に確認：
```bash
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system && ./ai-team/check-results.sh"
```

## 🛑 システム停止

作業が終わったら、tmuxセッションを終了：
```bash
wsl -e bash -c "tmux kill-session -t team"
```

## 💡 ヒント

### コマンドテンプレート（コピペ用）

起動：
```
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system && bash ./ai-team/auto-start.sh"
```

タスク送信（dev1）：
```
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system && ./ai-team/send-and-wait.sh dev1 '[ここにタスク内容]'"
```

結果確認：
```
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/claude-multi-agent-system && ./ai-team/check-results.sh"
```

停止：
```
wsl -e bash -c "tmux kill-session -t team"
```

## 🎯 VSCode拡張Claudeに何を伝えるか

新しいセッションでは、Claudeに以下のように指示してください：

```
このプロジェクトはマルチエージェントシステムです。
QUICKSTART.mdを読んで、システムを起動してください。
その後、[あなたのタスク内容]を3つのエージェントに振り分けて実行してください。
```

Claudeがこのファイルを読めば、自動的に適切なコマンドを実行してくれます。
