# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CivilDraw** (`civil-draw`) — 建設土木業向け Web ベース 2D CAD ツール。AutoCAD 代替として社内 9 拠点に展開する内製アプリ。

- 仕様書: `建設土木向け平面図CADツール 要件定義・仕様書.md` (doc: CAD-REQ-2026-001 v1.0)
- ロードマップ: `ROADMAP.md` (M1〜M6 月次マイルストーン)
- 対象ブラウザ: Chrome / Edge 最新 2 バージョン
- オフライン完全動作必須（外部サーバー通信禁止 / ISO 27001・J-SOX 準拠）

## 🗓️ プロジェクト期間・リリース制約

| 項目 | 値 |
|------|-----|
| プロジェクト期間 | **6ヶ月 (2026-04-23 〜 2026-10-23)** |
| 本番リリース | 🚀 **2026-10-23 (絶対厳守)** |
| 実行形態 | Linux Cron (Mon–Sat / 5時間 / 約144セッション) |
| フェーズ変更 | CTO 判断で自由に変更可 |
| リリース遅延 | ❌ 認めない — スコープ縮退で期日維持 |

詳細は `ROADMAP.md` を参照。

## Tech Stack

| 区分 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | React + TypeScript | 18.x / 5.x |
| ビルド | Vite | 5.x |
| 描画エンジン | Konva.js + react-konva | 9.x |
| 状態管理 | Zustand | 4.x |
| DXF 出力 | dxf-writer | latest |
| スタイル | Tailwind CSS | 3.x |
| テスト | Vitest + Testing Library | latest |
| パッケージ管理 | npm | 10.x |

## Commands

```bash
npm install          # 依存関係インストール
npm run dev          # Vite 開発サーバー起動
npm run build        # 本番ビルド（dist/）
npm run preview      # ビルド成果物のプレビュー
npm run test         # Vitest 全テスト実行
npm run test -- --run src/utils/snapEngine.test.ts  # 単一テスト実行
npm run lint         # ESLint + 型チェック
```

TypeScript は厳格モード (`strict: true`) 必須。テストカバレッジ目標 70%+。

## Architecture

### ディレクトリ構成

```
src/
├── components/
│   ├── Canvas/          # Konva Stage/Layer のラッパー。描画ループの起点
│   ├── Toolbar/         # 上部: ファイル操作・縮尺・用紙設定
│   ├── ToolPanel/       # 左サイドバー (幅60px): ツール選択パレット
│   ├── LayerPanel/      # 右サイドバー (幅240px): レイヤー管理
│   └── PropertyPanel/   # 右サイドバー下段: 選択図形のプロパティ編集
├── hooks/
│   ├── useCanvas.ts     # ズーム・パン・座標変換
│   ├── useSnap.ts       # スナップ計算のコール
│   └── useTool.ts       # アクティブツールのイベントハンドラ切替
├── store/
│   ├── canvasStore.ts   # ズーム倍率・パン位置・縮尺・用紙設定
│   ├── layerStore.ts    # レイヤー一覧・表示/非表示/ロック・図形データ
│   └── toolStore.ts     # 選択中ツール・描画中の一時ジオメトリ
├── utils/
│   ├── dxfExporter.ts   # DXF R2010 書き出し (dxf-writer ラッパー)
│   ├── snapEngine.ts    # グリッド・端点・中点・交点スナップ計算
│   └── gridRenderer.ts  # グリッド線の Konva 描画
└── types/
    ├── geometry.ts      # 図形型定義 (Line, Rect, Circle, Polyline, Text, Dimension)
    └── layer.ts         # Layer 型定義 (色・線種・ロック状態)
```

### データフロー

```
ユーザー入力 (マウス/キーボード)
  → useSnap でスナップ座標解決
  → useTool がアクティブツールに応じて図形を仮生成
  → 確定時: layerStore に図形追加
  → Canvas コンポーネントが store 変化を購読し Konva 再描画
  → 60fps 維持 (10,000 図形要素まで保証)
```

### 状態管理の注意点

Zustand の store は図形描画パフォーマンスのために購読範囲を最小化すること。Canvas コンポーネントは `layerStore` の全図形を購読するため、`toolStore` の一時ジオメトリと明確に分離する。

## 機能 ID と優先度

| フェーズ | 主な機能 |
|---------|---------|
| Phase 1 MVP | CV-001〜007, DT-001〜007, DT-010, LY-001〜006, IO-001〜003 |
| Phase 2 | DT-008, DT-009, IO-005, IO-006（PDF・ハッチング・シンボル） |
| Phase 3 | IO-004（DXF読込）・Entra ID 認証・9 拠点 Web 展開 |

## 重要な制約

- **DXF 形式**: DXF R2010 (AutoCAD 2010+ / JW-CAD 互換)。DWG 直接出力不可—ODA File Converter で変換する運用
- **初期レイヤー 5 種**: 仮設構造物・土工・既存構造物・寸法・注記
- **縮尺**: 1/50, 1/100, 1/200, 1/500, 1/1000
- **用紙**: A4/A3/A2/A1/A0（縦・横）
- **スナップ**: グリッド・端点・中点・交点の 4 種必須
- **データ**: 図面データは localStorage またはファイルダウンロードのみ。外部送信禁止
- **印刷**: ブラウザ印刷 (PDF 化) はモニター解像度依存。高精細印刷は PDF 経由
