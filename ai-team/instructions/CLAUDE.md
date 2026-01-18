# AI並列実行チーム - システム説明書

## システム概要
VSCode拡張版Claude（PM）がtmux経由でターミナルのClaude達に指示を出し、
並列で作業を実行するマルチエージェントシステムです。

## 📁 システム構成

```
ai-team/
├── instructions/
│   ├── developer.md    # 作業者（dev1-3）用の役割説明
│   └── CLAUDE.md       # このファイル（システム説明）
├── logs/
│   └── communication.log  # 通信ログ
├── results/
│   ├── dev1_result.txt    # dev1の作業結果
│   ├── dev2_result.txt    # dev2の作業結果
│   └── dev3_result.txt    # dev3の作業結果
├── start-ai-team.sh       # システム起動
├── send-message.sh        # メッセージ送信
├── initialize-agents.sh   # エージェント初期化
└── SETUP_MEMO.md          # セットアップ手順メモ
```

## 🤖 チーム構成

### PM（プロジェクトマネージャー）- VSCode拡張版Claude
**役割：** 戦略決定、タスク分配、結果統合
- ユーザーからの依頼を受けて作業計画を立てる
- send-message.shでdev達にタスクを配布
- results/フォルダから結果を収集してユーザーに報告

### 実行エージェント（dev1, dev2, dev3）- tmux内のClaude
**役割：** 実際の作業実行
- PMからの指示に従って作業
- 完了したらresults/に結果を書き出し
- 柔軟に役割を変更可能（開発、調査、企画など）

## 🔄 ワークフロー

```
1. ユーザー → PM（依頼）
2. PM → タスク分析・分割
3. PM → dev達にsend-message.shで指示配布
4. dev達 → 並列で作業実行
5. dev達 → results/に完了報告
6. PM → 結果を収集・統合
7. PM → ユーザーに報告
```

## 📞 通信システム

### メッセージ送信
```bash
./send-message.sh [エージェント名] "[メッセージ]"
```

**利用可能エージェント：**
- `dev1` - 実行エージェント1（team:0.0）
- `dev2` - 実行エージェント2（team:0.1）
- `dev3` - 実行エージェント3（team:0.2）

### 結果確認
PMはresults/フォルダ内のファイルを読んで結果を取得

## 🚀 起動方法

### 1. WSLに入る
```bash
wsl
cd /mnt/c/Users/taise/Documents/GitHub/Shin-Sushi-master-/online_game
```

### 2. システム起動
```bash
./ai-team/start-ai-team.sh
```

### 3. エージェント初期化
```bash
./ai-team/initialize-agents.sh
```

### 4. 画面操作
```bash
tmux attach -t team     # チーム画面に接続
# Ctrl+B → 矢印キー    # ペイン移動
# Ctrl+B → d           # デタッチ（終了せず離れる）
```

### 5. 停止
```bash
tmux kill-server
```

## 💡 使用例

### 例1: 機能開発
```bash
# PMがdev1にフロントエンド、dev2にバックエンドを依頼
./send-message.sh dev1 "ログイン画面のUIを作成してください"
./send-message.sh dev2 "認証APIを実装してください"
./send-message.sh dev3 "テストコードを書いてください"
```

### 例2: 調査タスク
```bash
./send-message.sh dev1 "競合サービスの機能を調査してください"
./send-message.sh dev2 "技術選定のための比較資料を作成してください"
```

## 注意事項
- 各devは独立したClaudeセッションなので、互いの文脈は共有されない
- 長時間の作業は進捗報告を挟むと良い
- tmuxセッションはPCを再起動すると消えるので再起動が必要
