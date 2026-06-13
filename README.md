# Hono + Drizzle + Cloudflare Workers 掲示板

Cloudflare Workers (Hono) と Drizzle ORM、Neon Database（PostgreSQL）を使用した、軽量な匿名ひとこと掲示板アプリケーションです。

---

## 🚀 使い方

### 依存関係のインストール
```bash
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### Cloudflare へのデプロイ
```bash
npm run deploy
```

### Cloudflare バインディングの型生成
```bash
npm run cf-typegen
```

---

## 🛡️ セキュリティ対策（サプライチェーン攻撃対策）

本プロジェクトでは、依存パッケージの改ざんや外部インフラの侵害からアプリケーションと開発環境を守るため、以下の**サプライチェーン攻撃対策**を実装しています。

### 1. 外部 CDN 依存の排除（ローカルバンドル）
- **対策内容**: 外部 CDN（`jsdelivr.net`）から Pico CSS を直接ロードするのを廃止し、npm パッケージ（`@picocss/pico`）としてローカルにインストールし、Vite のビルドプロセスでバンドル化しました。
- **目的**: CDN 配信サーバーの侵害やドメイン乗っ取りによる、悪意あるスタイル/スクリプトインジェクション攻撃を防御します。

### 2. パッケージインストール時のスクリプト実行制限 (`ignore-scripts`)
- **対策内容**: [.npmrc](file:///C:/develop/repositories/hono_drizzle_claoudflare_board/.npmrc) に `ignore-scripts=true` を定義しました。
- **目的**: 依存パッケージのインストール時に自動実行されるライフサイクルスクリプト（`preinstall`, `postinstall` 等）を無効化し、パッケージを介した開発機やビルド環境へのリモートコード実行（RCE）や環境変数の窃取を防ぎます。

### 3. 依存関係のバージョンピン留め (Dependency Pinning)
- **対策内容**: [package.json](file:///C:/develop/repositories/hono_drizzle_claoudflare_board/package.json) の依存関係から `^`（キャレット）や `~` をすべて削除し、バージョンを完全に固定しました。
- **目的**: パッケージのアップデート時に、悪意のあるマイナー/パッチバージョンが自動的にインストールされてしまうリスクを排除します。

### 4. Release Age Gate の導入
- **対策内容**: [renovate.json](file:///C:/develop/repositories/hono_drizzle_claoudflare_board/renovate.json) を作成し、`minimumReleaseAge: "14 days"` を設定しました。
- **目的**: 依存関係更新ツール（Renovate）において、パッケージの新規リリースから 14 日間経過した検証済みバージョンのみを取り込むポリシーを強制し、ゼロデイの悪意あるリリースが検知されるまでのタイムラグを確保します。

### 5. Content Security Policy (CSP) & セキュアヘッダーの適用
- **対策内容**: Hono のセキュアヘッダーミドルウェア（`hono/secure-headers`）を使用して、ブラウザ層での CSP を設定しました。
- **目的**: 万が一パッケージが侵害された場合でも、ブラウザが意図しない不審な外部ドメインへの接続をブロックし、データベース認証情報や個人情報の漏洩（Data Exfiltration）および XSS 攻撃を防止します。
