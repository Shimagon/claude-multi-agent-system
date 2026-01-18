# マルチエージェントAIシステム 完全ガイド

## このシステムって何？

VSCode拡張のClaude（PM役）が、ターミナルで動く3つのClaude（作業者）に指示を出して、
**並列で作業させる**システムです。

```
あなた（人間）
    ↓ 「この機能作って」
私（VSCode拡張Claude = PM）
    ↓ タスクを分割して指示
┌─────────┬─────────┬─────────┐
│  dev1   │  dev2   │  dev3   │
│ (UI担当) │(API担当) │(テスト) │
└─────────┴─────────┴─────────┘
    ↓ 並列で作業
結果をPMが収集 → あなたに報告
```

---

# 🖥️ Windows PCでのセットアップ（初回のみ）

## Step 1: WSLとUbuntuをインストール

**PowerShellを管理者権限で開いて実行：**
```powershell
wsl --install -d Ubuntu
```

- 再起動が必要な場合がある
- ユーザー名とパスワードを設定する画面が出る
- 設定したパスワードは忘れないように！

## Step 2: WSLに入る

```powershell
wsl
```

これでLinux環境に入れる。プロンプトが変わる：
```
taisei@localhost:/mnt/c/Users/...$
```

## Step 3: tmuxをインストール

```bash
sudo apt update && sudo apt install tmux -y
```

確認：
```bash
tmux -V
# → tmux 3.4 とか表示されればOK
```

## Step 4: Node.jsをインストール（WSL内に）

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

確認：
```bash
node --version
# → v20.x.x と表示されればOK
```

## Step 5: Claude Codeをインストール（WSL内に）

```bash
sudo npm install -g @anthropic-ai/claude-code
```

確認：
```bash
which claude
# → /usr/bin/claude と表示されればOK

claude --version
# → 2.x.x (Claude Code) と表示されればOK
```

## Step 6: ai-teamフォルダをプロジェクトにコピー

このフォルダ（ai-team）を使いたいプロジェクトにコピーすればOK。

---

# 🍎 MacBookでのセットアップ（初回のみ）

## Step 1: Homebrewでtmuxをインストール

```bash
brew install tmux
```

## Step 2: Node.jsをインストール（なければ）

```bash
brew install node
```

## Step 3: Claude Codeをインストール

```bash
npm install -g @anthropic-ai/claude-code
```

## Step 4: ai-teamフォルダをプロジェクトにコピー

このフォルダ（ai-team）を使いたいプロジェクトにコピー。

## Step 5: 実行権限を付与

```bash
chmod +x ./ai-team/*.sh
```

---

# 🚀 毎回の起動方法

## Windows の場合

### 1. WSLに入ってプロジェクトに移動
```powershell
wsl
cd /mnt/c/Users/taise/Documents/GitHub/[プロジェクト名]
```

### 2. システム起動
```bash
./ai-team/start-ai-team.sh
```

### 3. ログイン（初回 or セッション切れ時のみ）

各ペインでログインURLが表示されたら：
1. URLをコピー（改行が入ってたら繋げる）
2. ブラウザで開いてログイン
3. 表示されたコードをペインに貼り付け

### 4. 初期化
```bash
./ai-team/initialize-agents.sh
```

### 5. 監視用に別ターミナルを開く

VSCodeで `+` ボタンで新しいターミナルを追加：
```bash
wsl
cd /mnt/c/Users/taise/Documents/GitHub/[プロジェクト名]
tmux attach -t team
```

---

## Mac の場合

### 1. プロジェクトに移動
```bash
cd ~/Documents/GitHub/[プロジェクト名]
```

### 2. システム起動
```bash
./ai-team/start-ai-team.sh
```

### 3. ログイン（初回のみ）
URLをブラウザで開いてログイン

### 4. 初期化
```bash
./ai-team/initialize-agents.sh
```

### 5. 監視用に別ターミナルを開く
```bash
tmux attach -t team
```

---

# 📨 コマンド一覧

## メッセージを送る

```bash
# dev1に送る
./ai-team/send-message.sh dev1 "タスク内容"

# dev2に送る
./ai-team/send-message.sh dev2 "タスク内容"

# dev3に送る
./ai-team/send-message.sh dev3 "タスク内容"
```

## 結果を確認

```bash
# dev1の結果
cat ./ai-team/results/dev1_result.txt

# dev2の結果
cat ./ai-team/results/dev2_result.txt

# dev3の結果
cat ./ai-team/results/dev3_result.txt

# 全部まとめて確認
./ai-team/check-results.sh
```

## 結果をクリア

```bash
rm ./ai-team/results/*.txt
```

## tmux操作

```bash
# チーム画面に接続
tmux attach -t team

# 画面内でペイン移動
Ctrl+B → 矢印キー（↑↓←→）

# デタッチ（画面から離れる、終了ではない）
Ctrl+B → d

# 完全終了
tmux kill-server

# セッション一覧
tmux list-sessions
```

---

# 🔄 別のプロジェクトで使う方法

## 方法1: ai-teamフォルダをコピー

```bash
# 例：新しいゲームプロジェクトで使いたい場合
cp -r ./ai-team ~/Documents/GitHub/新しいプロジェクト/
```

そのプロジェクトで：
```bash
cd ~/Documents/GitHub/新しいプロジェクト
./ai-team/start-ai-team.sh
./ai-team/initialize-agents.sh
```

## 方法2: 共通の場所に置く（上級者向け）

`~/ai-team/` に置いて、どのプロジェクトからも呼び出す。

---

# ❓ トラブルシューティング

## 「Permission denied」が出る

```bash
chmod +x ./ai-team/*.sh
```

## 「tmux: command not found」が出る

```bash
# Ubuntu/WSL
sudo apt install tmux -y

# Mac
brew install tmux
```

## 「claude: command not found」が出る

```bash
sudo npm install -g @anthropic-ai/claude-code
```

## ログインURLが改行で切れてる

私（VSCode拡張Claude）に「このURL使えるようにして」と言えば繋げます。

## tmuxの画面がおかしくなった

```bash
# 一度全部終了
tmux kill-server

# 再起動
./ai-team/start-ai-team.sh
```

## Claudeが応答しない

ペインで `Ctrl+C` を押してから再度メッセージを送る。

---

# 📝 入力したコマンド履歴（このPCでやったこと）

## 1. WSL + Ubuntuインストール
```powershell
wsl --install -d Ubuntu
```

## 2. WSL内でセットアップ
```bash
# tmuxインストール
sudo apt update && sudo apt install tmux -y

# Node.jsインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Claude Codeインストール
sudo npm install -g @anthropic-ai/claude-code
```

## 3. システム起動
```bash
cd /mnt/c/Users/taise/Documents/GitHub/Shin-Sushi-master-/online_game
./ai-team/start-ai-team.sh
./ai-team/initialize-agents.sh
```

## 4. テスト実行
```bash
./ai-team/send-message.sh dev1 "テストタスクです。現在の時刻をresults/dev1_result.txtに書き出してください。"
cat ./ai-team/results/dev1_result.txt
```

---

# 🎮 使用例

## 例1: UIとAPIを並列で開発

```bash
./ai-team/send-message.sh dev1 "ログイン画面のUIをReactで作成してください"
./ai-team/send-message.sh dev2 "ログインAPIをNode.jsで実装してください"
./ai-team/send-message.sh dev3 "ログイン機能のテストコードを書いてください"
```

## 例2: 調査タスク

```bash
./ai-team/send-message.sh dev1 "競合サービスの機能を調査して"
./ai-team/send-message.sh dev2 "使えそうなライブラリを調査して"
./ai-team/send-message.sh dev3 "技術的な実現可能性を調査して"
```

## 例3: ドキュメント作成

```bash
./ai-team/send-message.sh dev1 "READMEを作成して"
./ai-team/send-message.sh dev2 "API仕様書を作成して"
./ai-team/send-message.sh dev3 "セットアップ手順書を作成して"
```

---

# 🌟 VSCode拡張機能からの操作（超重要！）

## なぜ拡張機能をPMにするのが最強か

| ターミナルだけ | 拡張機能（この方法） |
|---------------|----------------------|
| テキストのみ | **画像も送れる** |
| コピペ多い | **Claudeが直接指示出せる** |
| 状況説明が面倒 | **スクショで一発** |
| 手動操作多い | **PM役が自動で指示** |

## VSCode拡張Claudeから直接指示を出す方法

拡張機能のClaudeは、以下のコマンドでWSL経由でdev達に直接指示を送れる：

```
# Claudeがこのコマンドを実行する
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/[プロジェクト] && ./ai-team/send-message.sh dev1 'タスク内容'"
```

**使い方：**
1. VSCode拡張機能でClaudeを開く
2. 「dev1にこのタスクをやらせて」と言う
3. Claudeが自動でコマンドを実行
4. 結果もClaudeが確認して報告

これで**あなたはClaudeに話しかけるだけ**でOK！

---

# ⚠️ bypass permissions on について

tmux画面に `bypass permissions on` と表示されるのは正常です。

**意味：**
- 通常：Claudeがファイル編集やコマンド実行前に「許可しますか？」と聞く
- bypass on：**自動で実行**（聞かない）

**なぜ必要か：**
マルチエージェントでは自動実行が必須。毎回許可を求めると並列作業できない。

**安全性：**
- プロジェクトフォルダ内でしか動かない
- 危険なコマンド（rm -rf / など）は実行しない設計
- 心配なら監視用ターミナルで動きを見守る

---

# 📅 作成日
2026年1月19日

# 🔧 環境情報
- Windows 11
- WSL2 + Ubuntu
- tmux 3.4
- Node.js v20.20.0
- Claude Code 2.1.12

---

# 📋 実際にやったこと全記録

## 2026年1月19日 セットアップ記録

### 1. 最初の状態確認
```powershell
wsl --version   # WSLはあったがディストロなし
```

### 2. Ubuntuインストール
```powershell
wsl --install -d Ubuntu
# → ユーザー名: taisei、パスワード設定
```

### 3. WSL内でツールインストール
```bash
wsl
sudo apt update && sudo apt install tmux -y
tmux -V  # → tmux 3.4

# Node.js（最初Windows側を見てたので再インストール）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # → v20.20.0

# Claude Code
sudo npm install -g @anthropic-ai/claude-code
which claude  # → /usr/bin/claude
claude --version  # → 2.1.12
```

### 4. ai-teamファイル作成
VSCode拡張Claudeが以下を作成：
- `ai-team/instructions/developer.md`
- `ai-team/instructions/CLAUDE.md`
- `ai-team/start-ai-team.sh`
- `ai-team/send-message.sh`
- `ai-team/initialize-agents.sh`
- `ai-team/check-results.sh`
- `ai-team/SETUP_MEMO.md`
- `ai-team/COMPLETE_GUIDE.md`（このファイル）

### 5. 実行権限付与
```bash
chmod +x ./ai-team/*.sh
```

### 6. システム起動
```bash
./ai-team/start-ai-team.sh
```

### 7. 各ペインでログイン
- URLが改行で切れてた → 拡張機能Claudeに繋げてもらった
- 各ペインでブラウザログイン → コード貼り付け
- 「Yes, I accept」を選択（bypass permissions）

### 8. 初期化
```bash
./ai-team/initialize-agents.sh
```

### 9. 動作テスト
```bash
# 手動テスト
./ai-team/send-message.sh dev1 "テストタスクです。現在の時刻をresults/dev1_result.txtに書き出してください。"

# VSCode拡張Claudeからの直接指示テスト
# → 3つ同時にタスク送信成功！
```

### 結果
- dev1: 1から10の数字書き出し → 成功
- dev2: 今日の日付（2026年01月19日 Monday）→ 成功
- dev3: フォルダ構成調査 → 成功

**マルチエージェントシステム完成！**

---

# 🛡️ コンテキスト消失・同期問題の対策

## 問題と対策

| 問題 | 対策 |
|------|------|
| dev達がPMに報告を忘れる | **ファイル出力を必須化** |
| 長時間タスクで状況不明 | **進捗をファイルに定期出力** |
| send-messageが失敗 | **ファイル出力が本命、通知は補助** |
| devが自分の役割を忘れる | **作業開始時に確認するルール** |

## 仕組み

```
dev達の作業結果
    ↓ ファイルに書き出し
./ai-team/results/devX_result.txt
    ↓ PMが定期確認
PM（VSCode拡張Claude）
    ↓ 報告
あなた
```

**ファイルベースなので確実に同期される**

## PMの確認コマンド

```bash
# 結果を一括確認
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/[プロジェクト] && ./ai-team/check-results.sh"
```

## dev達への指示テンプレート（推奨）

```
[タスク内容]

完了したら必ず以下を実行：
echo "【完了報告】タスク: ○○ 結果: ○○ 時刻: $(date)" >> ./ai-team/results/devX_result.txt
```

---

# 🔑 PM（VSCode拡張Claude）の許可設定

`.claude/settings.local.json` で以下を許可済み：

```json
{
  "permissions": {
    "allow": [
      "Bash(wsl*)",
      "Bash(npm*)",
      "Bash(npx*)",
      "Bash(cat*)",
      "Bash(ls*)",
      "Bash(mkdir*)",
      "Bash(chmod*)",
      "Bash(rm ./ai-team/results/*)"
    ]
  }
}
```

これで**PMは許可なしでdev達に指示を送れる**。

---

# 🔄 自動待機システム（send-and-wait.sh）

## 問題
以前：PMが指示送信 → 「終わった？」と聞く → 結果取得（めんどい）

## 解決
`send-and-wait.sh` を作成。送信して自動で結果を待って報告。

## 使い方
```bash
bash ./ai-team/send-and-wait.sh dev1 "タスク内容" 60
# 第3引数はタイムアウト秒（省略時120秒）
```

## 仕組み
1. 結果ファイルをクリア
2. タスク送信
3. 結果ファイルが作成されるまでポーリング
4. 完了報告を検知したら結果を表示

---

# 🎯 ワンコマンド起動

## キーワード
「マルチスタート」「マルチエージェントスタート」「マルチでやって」「並列でやって」

## PM起動コマンド
```bash
wsl -e bash -c "cd /mnt/c/Users/taise/Documents/GitHub/Shin-Sushi-master-/online_game && bash ./ai-team/auto-start.sh"
```

## 監視画面（別ターミナル）
```bash
wsl -e bash -c "tmux attach -t team"
```

---

# 💡 マルチエージェント提案基準

## マルチ向き
- 複数ファイル同時編集
- UI + API + テスト並列
- 複数調査タスク

## シングルで十分
- 1ファイル修正
- 単一機能実装

---

# 📊 トークン使用量モニター（オプション）

## インストール
```bash
# WSL内で実行
curl -LsSf https://astral.sh/uv/install.sh | sh
exec $SHELL
uv tool install claude-monitor
```

## 起動
```bash
claude-monitor --timezone Asia/Tokyo
```

## 表示項目
- 📊 Token Usage: 使用率
- ⏳ Time to Reset: リセットまでの時間
- 🎯 Tokens: 使用済み/制限値
- 🔥 Burn Rate: 消費率（tokens/分）
- 🏁 Predicted End: 使い切り予測時刻
- 🔄 Token Reset: 次のリセット時刻

## 料金
**追加料金なし**。サブスクリプション内で動作。

---

# 🎯 トークン削減戦略

## 基本方針
- **PM（VSCode拡張）**: 会話履歴保持（あなたと対話）
- **サブエージェント（dev達）**: 使い捨て（最小コンテキスト）

## PMの責任
サブエージェントへの指示を**具体的で最小限**にする。

### ❌ 悪い例
```bash
./send-message.sh dev1 "ログイン機能作って"
```
→ 曖昧で何度もやり取りが必要

### ✅ 良い例
```bash
./send-message.sh dev1 "
src/auth/login.ts の login関数を実装
- JWT認証使用
- bcryptでハッシュ化
- 401エラーハンドリング
完了後results/dev1_result.txtに報告"
```
→ 一発で完了、トークン最小

## サブエージェント設定
- **developer.md**: 50行以下に圧縮（現在103行）
- **履歴不要**: 各タスクは独立
- **ファイル指定**: 対象ファイルを明示

## PM側のルール
1. タスク分析（あなたとPMの会話）
2. 具体的指示作成
3. サブに送信
4. 結果取得・報告

**PMの会話履歴は保持**（コンテキスト重要）
**サブは使い捨て**（トークン削減）
