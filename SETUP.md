# 環境構築ガイド

完全な初心者向けのセットアップ手順です。順番に進めてください。

## 📋 必要なもの

- Windows 11（WSL2が使える環境）
- インターネット接続
- 約30分の時間

---

## ステップ1: WSL2のインストール

### 1-1. PowerShellを管理者権限で開く

1. スタートメニューで「PowerShell」を検索
2. 右クリック → 「管理者として実行」

### 1-2. WSL2をインストール

PowerShellで以下を実行：

```powershell
wsl --install
```

### 1-3. 再起動

コマンド完了後、PCを再起動してください。

### 1-4. Ubuntuを起動

再起動後、スタートメニューから「Ubuntu」を起動します。

初回起動時にユーザー名とパスワードを設定してください。

**重要**: このパスワードは忘れないようにメモしてください。

---

## ステップ2: 必要なツールのインストール

Ubuntu（WSL）のターミナルで以下を順番に実行：

### 2-1. システムを最新に更新

```bash
sudo apt update && sudo apt upgrade -y
```

### 2-2. tmuxをインストール

```bash
sudo apt install tmux -y
```

確認：
```bash
tmux -V
```

→ `tmux 3.x` のようなバージョンが表示されればOK

### 2-3. Node.jsをインストール

```bash
# nvmをインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# nvm設定を読み込み
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Node.js LTSをインストール
nvm install --lts

# Node.jsを有効化
nvm use --lts
```

確認：
```bash
node --version
npm --version
```

→ 両方ともバージョンが表示されればOK

### 2-4. Claude Code CLIをインストール

```bash
npm install -g @anthropic-ai/claude-code
```

確認：
```bash
claude --version
```

→ バージョンが表示されればOK

---

## ステップ3: Claude Code CLIにログイン

### 3-1. ログインコマンド実行

```bash
claude login
```

### 3-2. ブラウザでログイン

1. 表示されたURLをブラウザで開く
2. Anthropicアカウントでログイン
3. 認証コードが表示される

### 3-3. 認証コードを入力

ターミナルに戻り、認証コードを貼り付けてEnter

確認：
```bash
claude whoami
```

→ あなたのメールアドレスが表示されればOK

---

## ステップ4: リポジトリをクローン

### 4-1. GitHubからクローン

```bash
cd ~
mkdir -p Documents/GitHub
cd Documents/GitHub
git clone https://github.com/Shimagon/claude-multi-agent-system.git
cd claude-multi-agent-system
```

### 4-2. スクリプトに実行権限を付与

```bash
chmod +x ./ai-team/*.sh
```

---

## ステップ5: 環境確認チェックリスト

以下をすべて実行して、OKになることを確認：

```bash
# WSLが動いているか
wsl --version

# tmuxが使えるか
tmux -V

# Node.jsが使えるか
node --version

# Claude Code CLIが使えるか
claude --version

# Claude Code CLIにログインしているか
claude whoami

# リポジトリがあるか
ls -la ~/Documents/GitHub/claude-multi-agent-system
```

**すべて正常に表示されたら環境構築完了です！**

---

## 次のステップ

環境構築が完了したら、[QUICKSTART.md](QUICKSTART.md) に進んでください。

---

## ❗ トラブルシューティング

### WSLインストール時に「仮想化が無効」エラー

BIOSで仮想化（Intel VT-x / AMD-V）を有効にする必要があります。

1. PCを再起動
2. BIOS設定画面に入る（起動時にF2, Del, F12等を押す）
3. Virtualization Technology を「Enabled」にする
4. 保存して再起動

### `claude login` で「command not found」

Node.jsのPATHが通っていない可能性があります。

```bash
# ターミナルを再起動
exec $SHELL

# または、nvmを再読み込み
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### `git clone` で「Permission denied」

GitHubにSSHキーが登録されていない場合はHTTPSでクローンしてください（上記コマンドはHTTPSです）。

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

- [Claude Code公式ドキュメント](https://docs.anthropic.com/claude/docs)
- [GitHubリポジトリのIssue](https://github.com/Shimagon/claude-multi-agent-system/issues)
