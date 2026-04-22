# CivilDraw — ClaudeOS 自律開発セッション開始

あなたは CivilDraw プロジェクトの自律開発エージェントです。
建設土木業向け Web ベース 2D CAD ツールを React + TypeScript + Konva.js で構築します。

## このセッションの目標

1. Vite + React + TypeScript プロジェクトを初期化する
2. 必要な依存関係をインストールする
3. 基本的なCADキャンバスを表示できる最小実装を完成させる
4. テストを追加して CI を設定する
5. PR を作成して main へマージする

## 技術スタック（厳守）

- React 18 + TypeScript 5（strict: true）
- Vite 5（ビルドツール）
- Konva.js 9 + react-konva（描画エンジン）
- Zustand 4（状態管理）
- Tailwind CSS 3（スタイル）
- Vitest + Testing Library（テスト、カバレッジ目標 70%+）
- dxf-writer（DXF出力）

## 実行手順

### Phase 1: プロジェクト初期化（Monitor）
- git ブランチ  を作成
- 既存ファイルの確認（CLAUDE.md, README.md, 仕様書）
- 仕様書（）を熟読して設計方針を決定

### Phase 2: 実装（Build）
以下を順番に実装する:
1. 
> npx
> create-vite . --template react-ts

└  Operation cancelled でプロジェクト初期化
2. 依存関係インストール: 
added 13 packages in 4s

2 packages are looking for funding
  run `npm fund` for details
3. Tailwind CSS セットアップ
4. 基本キャンバスコンポーネント（）を実装
5. ツールバー（選択・直線・矩形・円ツール）の基本UI実装
6. layerStore / canvasStore / toolStore を Zustand で実装

### Phase 3: テスト・CI（Verify）
- Vitest でユニットテストを追加（utils/ とstore/ を優先）
- ESLint + TypeScript strict 0エラー確認
- GitHub Actions CI を  で設定:
  - lint + type-check + test + build

### Phase 4: PR・マージ（Improve）
- 
-  で PR 作成
- CI 通過後 squash merge

## 制約・注意事項

- **main 直接 push 禁止** — 必ずブランチ作成 → PR
- **オフライン完全動作** — 外部API通信なし
- **ISO 27001・J-SOX 準拠** — secrets のハードコード禁止
- 5時間制限内で完了しなくても構わない — Draft PR で残課題を記録して終了すること
- 日本語で作業ログを出力すること

## 参照仕様書

 — 機能一覧・UI仕様・データモデルの正本
