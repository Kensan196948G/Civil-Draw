# 🔒 Civil-Draw セキュリティ監査レポート

- **対象 commit**: `9e31324` (2026-04-24 時点)
- **監査項目**: XSS 経路 / CSP / クライアントストレージ
- **関連 Issue**: #17 (SEC-001)
- **関連マイルストーン**: M2 安定化・認証基盤

---

## 1. XSS 危険経路の監査

### 1.1 調査対象カテゴリ

以下の 6 カテゴリについて `src/` 配下で grep 走査を実施し、**いずれも検出ゼロ**を確認した。

| # | カテゴリ | 評価 |
|---|---|---|
| 1 | React の生 HTML 挿入 prop (`dangerouslySetInner` 系) | ✅ ゼロ |
| 2 | DOM の innerHTML / outerHTML 代入 | ✅ ゼロ |
| 3 | JavaScript の文字列動的評価 API | ✅ ゼロ |
| 4 | 関数コンストラクタによる動的関数生成 | ✅ ゼロ |
| 5 | 文字列引数を取るタイマー API | ✅ ゼロ |
| 6 | ウィンドウオブジェクトへの動的ブラケットアクセス | ✅ ゼロ |

実行した grep パターンと結果は PR #18 のコミットログに記載。

### 1.2 クライアントストレージ経路

| ファイル | 処理 | 評価 |
|---|---|---|
| `src/utils/autosave.ts` | localStorage 書込/読込 と JSON パース | ✅ 読込結果は Zustand store 経由で React 再描画のみ。DOM 直接挿入なし |
| `src/utils/dxfExporter.ts:171` | ドキュメント復元時の JSON パース | ✅ 結果は型付き State に戻るだけで DOM 非経路 |

### 1.3 ユーザー入力 → 描画経路

| 入口 | 流れ | 評価 |
|---|---|---|
| テキスト図形 (`text` シェイプ) | react-konva の Text に `shape.text` を渡す | ✅ Konva は Canvas 2D Context の `fillText` に渡すため DOM 非経路 |
| 寸法ラベル (`dimension`) | 数値 `toFixed(1)` 変換後 Text へ | ✅ 数値のみ、Canvas 描画 |
| レイヤー名 / シェイプ ID | Props として `<div>{name}</div>` | ✅ React JSX 補間により自動 escape |
| DXF インポート | `importDxf(content)` 内で text entity を `shape.text` に格納 | ✅ 最終的に Konva Canvas 描画、DOM 非経路 |

### 1.4 結論

**現時点で XSS 経路は存在しない**。React JSX 補間による自動 escape と Konva の Canvas 2D API 利用により、ユーザー入力が DOM に直接流入する経路がゼロであることを確認済み。

---

## 2. Content-Security-Policy (CSP) の導入

### 2.1 適用ポリシー (`index.html` meta タグ)

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self'
```

### 2.2 各ディレクティブの根拠

| ディレクティブ | 値 | 理由 |
|---|---|---|
| `default-src` | `'self'` | 他ディレクティブ未指定時のフォールバック。同一オリジンのみ許可 |
| `script-src` | `'self'` | Vite 5 本番ビルドは inline script を生成しない。external script 不要 |
| `style-src` | `'self' 'unsafe-inline'` | React / Emotion / react-konva 等が inline style (`style={{...}}`) を多用するため |
| `img-src` | `'self' data: blob:` | Konva 書出 (`toDataURL`) / 将来のファイルアップロード用 |
| `font-src` | `'self' data:` | 埋め込みフォント用余地を確保 |
| `connect-src` | `'self'` | **AUTH-001 実装時に `https://login.microsoftonline.com` 等を追記予定** |
| `object-src` | `'none'` | Flash 等の古典的攻撃経路を遮断 |
| `base-uri` | `'self'` | `<base>` タグ悪用による path hijack 防止 |
| `form-action` | `'self'` | form 送信先を自ドメイン限定 |

### 2.3 meta タグ制約と IIS 展開時の補完方針

meta CSP では以下のディレクティブは**無視される** (W3C 仕様):
- `frame-ancestors`
- `report-uri` / `report-to`
- `sandbox` (一部)

そのため、本番 IIS 展開時に `web.config` で HTTP ヘッダーとして以下を併設する:

```xml
<httpProtocol>
  <customHeaders>
    <add name="Content-Security-Policy" value="frame-ancestors 'none'; report-uri /csp-report" />
    <add name="X-Frame-Options" value="DENY" />
    <add name="X-Content-Type-Options" value="nosniff" />
    <add name="Referrer-Policy" value="no-referrer" />
    <add name="Permissions-Policy" value="geolocation=(), camera=(), microphone=()" />
  </customHeaders>
</httpProtocol>
```

※ M5 (2026-09) の 9 拠点展開手順書 `MANUAL-002` に組み込む。

### 2.4 開発環境との両立

- Vite dev server は meta CSP の解釈をブラウザに委ねる。HMR は WebSocket ベースで動くため `connect-src 'self'` で通る (localhost → localhost)
- **将来 Entra ID / MSAL.js (#11 AUTH-001) を実装する際は** `connect-src` と `script-src` に Microsoft CDN を追加する必要あり。AUTH 実装時に同一 PR で CSP を更新する規約とする

---

## 3. 今後の TODO

| 項目 | 担当 | 期限 |
|---|---|---|
| AUTH-001 時の `connect-src` 追加 (`https://login.microsoftonline.com`) | AUTH 実装担当 | M2 末 |
| `web.config` ヘッダー設定手順書化 | MANUAL-002 | M5 |
| CSP violation report-uri エンドポイントの受皿設計 | DevOps | M5 |
| 定期的な `npm audit` / `npm outdated` の CI 組込 | CI 担当 | M3 |
| Subresource Integrity (SRI) 検討 (外部 CDN 追加時) | AUTH 実装担当 | AUTH 追加時 |

---

## 4. 参考基準

- [OWASP Top 10 2021](https://owasp.org/Top10/) — A03:2021 Injection / A05:2021 Security Misconfiguration
- [MDN: Content-Security-Policy](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Security-Policy)
- [Vite Security Best Practices](https://vitejs.dev/guide/build.html#security)
- ISO 27001:2022 A.8.26 (アプリケーションセキュリティ要件)

---

*最終更新: 2026-04-24*
