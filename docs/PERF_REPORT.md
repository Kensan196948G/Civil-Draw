# ⚡ CivilDraw パフォーマンスレポート (PERF-001 成果物)

> **関連 Issue**: [#10 PERF-001: 10,000図形での60fps実測・ボトルネック特定](https://github.com/Kensan196948G/Civil-Draw/issues/10)
> **マイルストーン**: M2 (2026-06-23 期限)
> **レポート日**: 2026-04-23 (Loop 11)

---

## 🎯 背景

仕様書 CAD-REQ-2026-001 §3 非機能要件より:

> **描画レスポンス**: 60fps 以上を維持（10,000 図形要素まで）

この要件を達成するため、以下の基盤と最適化を M2 で実装した。実機ベンチマーク (Chrome on Windows/Edge) はアプリ経由で実施可能な状態。

---

## 🧰 実装した計測基盤

| コンポーネント | 役割 |
|---------------|------|
| `src/utils/perfHarness.ts` | 決定論的な N 図形ジェネレータ (seed 指定で再現可能) |
| `src/components/FPSMeter.tsx` | requestAnimationFrame 60 サンプル移動平均 + 最小 FPS |
| `src/components/BenchmarkPanel.tsx` | Toolbar から 1K/5K/10K ボタンで即投入 |
| StatusBar の「図形: N」「FPS X」表示 | 常時可視化 |

### 使い方 (開発者)

```bash
npm run dev                      # 開発サーバー起動
# ツールバー右の「⚡ Bench」ボタンを押下
# 「1K」「5K」「10K」のいずれかを押下で図形を生成
# StatusBar の FPS 表示と Chrome DevTools Performance を併用で計測
```

`BenchmarkPanel` は生成時間 (ms) を console にも出力:

```
[Benchmark] Generated 10000 shapes in 127.3ms
```

---

## ⚙️ 適用した最適化

### 1. ShapeRenderer の React.memo 化
カスタム比較関数で `shape` の参照・`isSelected`・`isPreview`・layer の visual props のみ比較。親再レンダー時の無駄な再構築を抑制。

### 2. Konva レベル最適化
```typescript
const commonProps = {
  shadowForStrokeEnabled: false,  // ストロークの影描画を無効化
  perfectDrawEnabled: false,      // 完全描画をオフ (視覚的影響なし)
  // ...
}
```

### 3. レイヤーソートの集約
Canvas の `[...layers].sort(...)` を毎フレーム実行していたのを廃止し、`layerStore.reorderLayer` で `order` を常に昇順に保つ設計に変更。

### 4. ビューポート・カリング
`src/utils/viewportCulling.ts` を新規実装。

```typescript
const cullingEnabled = shouldCull(shapes.length)   // 500+ で自動オン
const visibleShapes = cullingEnabled
  ? shapes.filter((s) => isInViewport(s, viewport))
  : shapes
```

- **500 図形未満**: 通常描画 (culling オーバーヘッドゼロ)
- **500 図形以上**: ビューポート外を BBox ベースでスキップ
- StatusBar に `(cull)` インジケータ表示

### 5. 遅延 import によるバンドル削減
DXF 関連 (dxfExporter, dxfImporter) を dynamic import 化済み (Loop 4)。初期バンドルは **489KB** (gzip 153KB)。

---

## 📊 実測準備

以下のシナリオを Chrome DevTools Performance で記録するのが推奨フロー:

| シナリオ | 手順 | 目標 FPS |
|----------|------|----------|
| **S1: 静止状態 (10K)** | 10K 投入 → 1 秒待機 | ≥ 60 |
| **S2: ズーム (10K)** | マウスホイールで連続ズーム | ≥ 30 |
| **S3: パン (10K)** | Space+ドラッグで水平パン | ≥ 30 |
| **S4: 図形追加 (10K)** | 線分ツールで 5 本追加 | 追加遅延 < 100ms |
| **S5: 選択 (10K)** | 矩形範囲選択 (画面全体) | ≤ 500ms 応答 |

### 計測チェックリスト

- [ ] Chrome 最新バージョンで計測
- [ ] DevTools Performance タブで「Record」→ 5 秒操作 → 停止
- [ ] 主要メトリクス: FPS / Scripting / Rendering / GPU の時間配分
- [ ] **Long Task (>50ms) の有無**
- [ ] ヒープスナップショットで **メモリリークなし** の確認

---

## 🚧 今後の改善候補 (M2 残 / M3 移行)

| 候補 | 効果 | 実装難度 |
|------|------|----------|
| Konva FastLayer 化 | 大量シェイプ向け最適化レイヤー | 中 |
| シンボル・ハッチの `layer.cache()` | 複雑図形の再描画コスト削減 | 低 |
| Level-of-Detail (LOD): ズームアウト時の簡略化 | 遠方表示で効率化 | 中 |
| Web Worker でのスナップ計算 | 10K 時のスナップ応答改善 | 高 |
| ~~Canvas 分割 (static / dynamic layer)~~ | ✅ PERF-002 で実施済 (本レポート下部) | — |

---

## ✅ PERF-001 完了判定

- [x] ベンチマーク用図形ジェネレータ実装
- [x] FPS 計測 UI 実装
- [x] 1K/5K/10K シナリオ即実行可能 (Bench ボタン)
- [x] ボトルネック候補の特定と最適化 5 件適用
- [x] 実測計測ガイド (本レポート) 提供
- [ ] ⏳ **実機 Chrome での実測値記録** (次セッション / 運用側で実施)
- [ ] ⏳ 必要ならさらなる最適化の実施

---

*レポート作成: 2026-04-23 / 次回更新: 実測値取得後に追記*

---

# ⚡ PERF-002 追加レポート — Konva Layer 分離 + Shape-by-Layer Map グルーピング

> **関連 Issue**: [#19 PERF-002: Konva Layer 分離 + shape-by-layer Map グルーピング](https://github.com/Kensan196948G/Civil-Draw/issues/19)
> **対象ファイル**: `src/components/Canvas/CanvasArea.tsx`
> **実施日**: 2026-04-24 (Cron セッション継続)

## 🎯 目的

PERF-001 で「静的図形の再描画回避」を M2 後半候補として列挙。マウス移動で毎フレーム更新されるプレビュー図形・選択矩形・スナップマーカーが、10,000 図形の静的レイヤーを巻き込んで再 `batchDraw` を起こす構造を解消する。

## 🧱 変更点

### 1. Konva Layer の 3 分割

| Layer | 内容 | listening | 再描画トリガ |
|-------|------|-----------|---------------|
| `gridLayer` | グリッド線 | true | zoom / pan / scale / gridVisible |
| **static layer** | 全シェイプ (レイヤーごとにグループ化) | true | shapes / layers / selectedIds 変更 |
| **dynamic layer** | previewShape / selectionRect / snapMarker | **false** | マウス移動のたび |

**効果**: マウス移動時の Konva dirty invalidation が dynamic layer に限定される。Static layer は shapes/layers/selectedIds の React 再レンダーが起きるまで再 `batchDraw` されない。

### 2. Shape-by-Layer Map グルーピング (O(L×S) → O(L+S))

改善前は `layers.map((l) => shapes.filter((s) => s.layerId === l.id))` の二重ループで O(L×S) (10K shapes × 10 layers = 100K 比較)。

改善後は `useMemo` で `Map<layerId, shapes[]>` を 1 パス構築し、レイヤー描画ループで O(1) lookup。

```typescript
const shapesByLayer = useMemo(() => {
  const map = new Map<string, typeof visibleShapes>()
  for (const s of visibleShapes) {
    const arr = map.get(s.layerId)
    if (arr) arr.push(s); else map.set(s.layerId, [s])
  }
  return map
}, [visibleShapes])
```

描画順序はレイヤーの既存 order を保つため `layers.flatMap` で走査。

### 3. Set 化による O(1) 選択判定

`selectedIds.includes(s.id)` (O(N)) → `selectedIdSet.has(s.id)` (O(1))。選択図形 100 件 × 図形 10,000 件なら差が大きい。

### 4. ResizeObserver 導入で React ルール違反も解消

副次効果として、PERF-001 時代から混入していた `react-hooks/refs` lint エラー (render 中の `containerRef.current.offsetWidth` 参照) を `useState<{w,h}>` + `ResizeObserver` 構造に置換。ウィンドウリサイズ時の追従も自動化。

## 📊 計測シナリオ (実機検証用)

| シナリオ | 手順 | 期待 FPS (PERF-001) | 期待 FPS (PERF-002) |
|----------|------|---------------------|---------------------|
| S6: プレビュー描画 (10K 背景) | 線分ツール選択 → 10K 投入 → マウス移動 | 30 以下 (static巻込み) | **≥ 60** (dynamic分離) |
| S7: 範囲選択矩形 (10K 背景) | 10K 投入 → 画面全体をドラッグ選択 | 30 以下 | **≥ 60** |
| S8: スナップマーカー追従 (10K) | スナップ有効状態でマウス移動 | カクつき | **滑らか** |

※ ローカル WASM OOM (Issue #16 CI-002) のため vitest ベンチは GitHub Actions で実行。ブラウザ実測は運用者側で BenchmarkPanel + Chrome DevTools Performance を使用。

## ✅ PERF-002 完了判定

- [x] Konva Layer を static / dynamic に分離
- [x] dynamic layer に `listening={false}` 設定
- [x] Shape-by-Layer Map グルーピング実装 (useMemo)
- [x] selectedIds を Set 化
- [x] tsc / eslint on changed file / build 全 green
- [x] 副次改善: `react-hooks/refs` 違反解消 (ResizeObserver 移行)
- [ ] ⏳ GitHub Actions での vitest 再現
- [ ] ⏳ ブラウザ実機での S6/S7/S8 計測値記録 (運用側)

---

*PERF-002 追記: 2026-04-24*
