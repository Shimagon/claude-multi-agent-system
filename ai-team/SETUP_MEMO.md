# マルチエージェントシステム セットアップメモ

## 概要
VSCode拡張版Claude（PM）がターミナルのClaude達に指示を出すシステム

## 環境
- OS: Windows 11
- WSL: Ubuntu (wsl --install -d Ubuntu)
- tmux: 3.4
- Claude Code: @anthropic-ai/claude-code

---

## セットアップ手順（Windows）

### 1. WSLとUbuntuのインストール
```powershell
# PowerShellで実行
wsl --install -d Ubuntu
```
- ユーザー名とパスワードを設定

### 2. WSL内でtmuxとClaude Codeをインストール
```bash
# WSLに入る
wsl

# tmuxインストール
sudo apt update && sudo apt install tmux -y

# Claude Codeインストール
npm install -g @anthropic-ai/claude-code
```

### 3. マルチエージェントシステムの起動
```bash
# WSLに入る
wsl

# プロジェクトディレクトリに移動
cd /mnt/c/Users/taise/Documents/GitHub/Shin-Sushi-master-/online_game

# システム起動
./ai-team/start-ai-team.sh

# エージェント初期化
./ai-team/initialize-agents.sh
```

### 4. 使い方
```bash
# メッセージ送信
./ai-team/send-message.sh dev1 "タスクを実行して"

# チーム画面に接続
tmux attach -t team

# 画面移動: Ctrl+B → 矢印キー
# デタッチ: Ctrl+B → d
# 完全終了: tmux kill-server
```

---

## MacBookでのセットアップ手順

### 1. tmuxインストール
```bash
brew install tmux
```

### 2. Claude Codeインストール
```bash
npm install -g @anthropic-ai/claude-code
```

### 3. プロジェクトをクローン/コピー
```bash
git clone [リポジトリURL]
cd online_game
```

### 4. 起動
```bash
./ai-team/start-ai-team.sh
./ai-team/initialize-agents.sh
```

---

## システム構成

```
ai-team/
├── instructions/
│   ├── pm.md           # PM（VSCode拡張Claude）用
│   ├── developer.md    # 作業者用
│   └── CLAUDE.md       # システム全体説明
├── logs/
│   └── communication.log
├── results/
│   └── (作業結果がここに保存される)
├── start-ai-team.sh    # 起動スクリプト
├── send-message.sh     # メッセージ送信
├── initialize-agents.sh # 初期化
└── SETUP_MEMO.md       # このファイル
```

## アーキテクチャ

```
あなた（人間）
    ↓ 指示
VSCode拡張Claude（PM）
    ↓ send-message.sh / tmux send-keys
ターミナルClaude達（dev1, dev2, dev3）
    ↓ 作業結果をファイルに書く
results/ フォルダ
    ↓ PMが読んで報告
あなたに表示
```

## トラブルシューティング

### WSLに入れない
```powershell
wsl --list --verbose  # インストール済みディストロ確認
wsl -d Ubuntu         # Ubuntu指定で起動
```

### tmuxセッションが見つからない
```bash
tmux list-sessions    # セッション一覧
./ai-team/start-ai-team.sh  # 再起動
```

### Claude Codeが動かない
```bash
claude --version      # バージョン確認
npm install -g @anthropic-ai/claude-code  # 再インストール
```

---

作成日: 2025-01-19
