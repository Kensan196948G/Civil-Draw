# CivilDraw

建設土木業向け Web ベース 2D CAD ツール — Construction Civil Engineering Web CAD

> **社内限ドキュメント番号**: CAD-REQ-2026-001 v1.0 | ITシステム運用管理部

## 概要

AutoCAD 等の高価な商用 CAD に代わる、建設土木業に特化した内製 Web CAD ツールです。ブラウザのみで動作し、社内 9 拠点への展開を目的としています。

- 仮設計画・土工計画・施工ヤード配置・道路舗装計画の平面図作成
- DXF R2010 出力（AutoCAD 2010+ / JW-CAD 互換）
- オフライン完全動作（外部サーバー通信なし）
- ISO 27001・J-SOX 準拠設計

## Tech Stack

| 区分 | 技術 |
|------|------|
| フレームワーク | React 18 + TypeScript 5 |
| ビルド | Vite 5 |
| 描画エンジン | Konva.js 9 + react-konva |
| 状態管理 | Zustand 4 |
| DXF 出力 | dxf-writer |
| スタイル | Tailwind CSS 3 |
| テスト | Vitest + Testing Library |

## Getting Started

```bash
git clone https://github.com/Kensan196948G/Civil-Draw.git
cd Civil-Draw
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

## 主なコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド (dist/)
npm run test     # テスト実行
npm run lint     # ESLint + 型チェック
```

## 対応ブラウザ

- Google Chrome（最新 2 バージョン）
- Microsoft Edge（最新 2 バージョン・社内標準）

## 主要機能

| フェーズ | 機能 |
|---------|------|
| Phase 1 MVP | キャンバス操作 (ズーム/パン/グリッド/スナップ)・基本図形 (線/矩形/円/ポリライン/テキスト/寸法線)・レイヤー管理・DXF 出力・JSON 保存 |
| Phase 2 | ハッチング・建設土木シンボルライブラリ・PDF 出力・テンプレート |
| Phase 3 | DXF 読込・Entra ID 認証連携・9 拠点 Web 展開 |

## 開発フェーズ

```
Phase 1 MVP (2〜3週間)  →  Phase 2 実用化 (2〜3週間)  →  Phase 3 拡張 (2〜3週間)
```

Phase 1 完了条件: DXF 出力を AutoCAD で読込確認・基本操作 60fps 維持

## ライセンス・取り扱い

本ツールは社内限ドキュメントに基づき開発されています。図面データは外部サーバーに送信されず、すべてローカルで処理されます。

---

*© 2026 ITシステム運用管理部*
