# クイックスタートガイド（macOS版）

新しいVSCode拡張Claudeセッションでマルチエージェントシステムを使う方法（Mac用）

---

## ⚠️ 始める前に

環境構築がまだの場合は、まず [SETUP.md](SETUP.md) を完了してください。

---

## ステップ0: 環境確認

以下のコマンドをターミナルで実行してください。

すべてOKになれば次に進めます：

```bash
echo "=== Mac環境確認 ===" && \
echo -n "✅ tmux: " && (tmux -V 2>/dev/null || echo "❌ 未インストール: brew install tmux") && \
echo -n "✅ Node.js: " && (node --version 2>/dev/null || echo "❌ 未インストール") && \
echo -n "✅ Claude CLI: " && (claude --version 2>/dev/null || echo "❌ 未インストール: npm install -g @anthropic-ai/claude-code") && \
echo -n "✅ Claude Login: " && (claude whoami 2>/dev/null || echo "❌ 未ログイン - claude login を実行してください")
```

**すべて✅が表示されたら準備完了です！**

---

## ステップ1: プロジェクトディレクトリに移動

```bash
cd /Users/taisei/Documents/GitHub/claude-multi-agent-system
```

---

## ステップ2: システム起動

### 推奨：監視画面付きで起動（エージェントの動きが見える）

**新しいターミナルで実行：**

```bash
bash ./ai-team/start-and-watch.sh
```

これで自動的にtmux監視画面が開き、3つのエージェント（dev1/dev2/dev3）の動作がリアルタイムで見えます。

**tmux画面の操作:**
- `Ctrl+B` → `↑↓←→` : ペイン間を移動
- `Ctrl+B` → `d` : 監視画面を閉じる（エージェントは動き続ける）
- `Ctrl+C` : 現在のコマンドをキャンセル

### 別の方法：バックグラウンドで起動（監視画面なし）

```bash
bash ./ai-team/auto-start.sh
```

**起動確認:**
```bash
tmux list-sessions
```

`team` というセッションが表示されればOK。

**後から監視画面を開く:**
```bash
tmux attach -t team
```

---

## ステップ3: タスクを送る

### 実際に動く例（このリポジトリで試せます）

#### 例1: README.mdを調査
```bash
./ai-team/send-and-wait.sh dev3 'README.mdを読んで、このプロジェクトの主な特徴を3つリストアップ。完了後results/dev3_result.txtに報告'
```

#### 例2: ai-teamフォルダを調査
```bash
./ai-team/send-and-wait.sh dev2 'ai-teamフォルダ内のスクリプトファイルをリストアップして、それぞれの役割を簡単に説明。完了後results/dev2_result.txtに報告'
```

#### 例3: QUICKSTART.mdの行数をカウント
```bash
./ai-team/send-and-wait.sh dev1 'QUICKSTART.mdの総行数を調べて報告。完了後results/dev1_result.txtに報告'
```

---

## ステップ4: 結果を確認

### 全エージェントの結果を一度に確認

```bash
./ai-team/check-results.sh
```

---

## ステップ5: システム停止

作業が終わったら、tmuxセッションを終了：

```bash
tmux kill-session -t team
```

---

## 💡 コマンドテンプレート（コピペ用）

### 起動
```bash
bash ./ai-team/auto-start.sh
```

### タスク送信（dev1 - フロントエンド担当）
```bash
./ai-team/send-and-wait.sh dev1 '[ここにタスク内容]'
```

### タスク送信（dev2 - バックエンド担当）
```bash
./ai-team/send-and-wait.sh dev2 '[ここにタスク内容]'
```

### タスク送信（dev3 - テスト・調査担当）
```bash
./ai-team/send-and-wait.sh dev3 '[ここにタスク内容]'
```

### 結果確認
```bash
./ai-team/check-results.sh
```

### 停止
```bash
tmux kill-session -t team
```

---

## ❗ トラブルシューティング

### エラー: `tmux: command not found`

**原因**: tmuxがインストールされていない

**解決方法**:
```bash
brew install tmux
```

### エラー: `session already exists: team`

**原因**: tmuxセッションが既に起動している

**解決方法**:
```bash
# 既存セッションを削除
tmux kill-session -t team

# 再度起動
bash ./ai-team/auto-start.sh
```

### エラー: `claude: command not found`

**原因**: Claude Code CLIがインストールされていない、またはパスが通っていない

**解決方法**:
```bash
# npmでグローバルインストール
npm install -g @anthropic-ai/claude-code

# ターミナルを再起動
exec $SHELL
```

### エラー: `Permission denied`

**原因**: スクリプトに実行権限がない

**解決方法**:
```bash
chmod +x ./ai-team/*.sh
```

### タスクを送っても反応がない

**原因**: Claude Code CLIがログインしていない

**確認**:
```bash
claude whoami
```

**解決方法**:
```bash
claude login
```

ブラウザで表示されたURLを開き、認証コードをコピーしてターミナルに貼り付け。

### 結果ファイルが空、または古い

**原因**: 前回の結果が残っている

**解決方法**:
```bash
# 結果ファイルをクリア
rm -f ./ai-team/results/*.txt

# 再度タスクを送信
```

---

## 🎯 VSCode拡張Claudeに何を伝えるか

新しいセッションでは、Claudeに以下のように指示してください：

```
このプロジェクトはマルチエージェントシステムです。
QUICKSTART_MAC.mdを読んで、システムを起動してください。
その後、README.mdを調査するタスクをdev3に送って、結果を報告してください。
```

Claudeがこのファイルを読めば、自動的に適切なコマンドを実行してくれます。

---

## 📚 次のステップ

- [COMPLETE_GUIDE.md](ai-team/COMPLETE_GUIDE.md) - 詳細な使い方とトークン最適化戦略
- [README.md](README.md) - プロジェクト概要と特徴
- [developer.md](ai-team/instructions/developer.md) - サブエージェント用ルール
