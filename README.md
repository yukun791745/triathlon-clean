# triathlon-clean

軽量な Expo (React Native) のスキャフォールドです。  
このリポジトリには開発を始めるための最小構成が含まれています。

## 目的
- Expo での開発を素早く開始できるテンプレート
- TypeScript 型チェックを CI で自動化

## 必要環境
- Node.js (推奨: 18.x)
- npm（または yarn / pnpm）
- (オプション) Expo CLI: \`npm install -g expo-cli\`（ローカルでは npx で代用可能）

## ローカルでのセットアップ
\`\`\`bash
# プロジェクトルートで
npm ci
# または
# npm install
\`\`\`

## 開発サーバの起動
\`\`\`bash
# 開発サーバ (Metro) を起動
npx expo start

# キャッシュクリアして起動（必要な場合）
npx expo start -c

# Web を開く（起動後にターミナルで \`w\` 押下、またはブラウザで開く）
\`\`\`

## 型チェック
TypeScript の型チェックを実行するには：
\`\`\`bash
npx tsc --noEmit
\`\`\`

## CI（GitHub Actions）
このリポジトリには PR/Push 時に TypeScript 型チェックまたは \`npm run build\`（もし package.json にあれば）を実行するワークフローが追加されています。詳細は \`.github/workflows/ci.yml\` を参照してください。

## 貢献
小さな変更や改善は歓迎します。Issue/PR を送ってください。

## ライセンス
必要に応じて LICENSE ファイルを追加してください。
