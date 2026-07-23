# プロジェクト概要
このプロジェクトは「UpStream (KFC: Karaage Flow Chart)」という、ブラウザ上で動作する上流工程サポートツール（各種図表エディタ）です。
作業対象パス: `c:\Users\243202\Desktop\MY_APP\karaage.copy`

# 技術スタック
- フロントエンド: ピュアな HTML / CSS / JavaScript (Vanilla JS)。ReactやVueなどのフレームワークや、外部UIライブラリは使用していません。
- 描画方式: Canvas APIではなく、DOM（HTMLの`div`要素）とSVG（ノード同士を線で結ぶため）を組み合わせてキャンバス上の図形を描画・操作する独自実装です。

# 主要なファイルと役割

## 共通UI・コア処理
- `index.html`: 全ツールのメインUI。タブ切り替えで各図表ツールを切り替えて使用します。
- `css/`: `style.css`（UI全般のスタイル）、`diagram.css`（キャンバス周りのスタイル）など。
- `js/core.js`: ツール全体の共通処理。タブ切り替え、イベントの委譲、共通モーダル等の管理。
- `js/theme.js`: UIテーマ（ライト・ダーク等）の管理。
- `js/property-panel.js`: ノードやUIコンポーネントのプロパティを編集するための右パネル制御。
- `js/radial-menu.js`: ノード操作時に表示されるラジアルメニュー（円形メニュー）の制御。

## 認証・プロジェクト管理
- `js/auth.js`: ユーザー認証に関する処理。
- `js/project.js`: ダッシュボード機能、プロジェクト一覧や保存済み図一覧の管理。
- `js/profile.js`: ユーザーのプロフィール管理。

## 図表エディタ群・データ制御
各エディタは独立したクラスとして状態を持っています。
- `js/diagram.js`: アーキテクチャ図・画面遷移図エディタのコアクラス。汎用ダイアグラムエンジンのベース。
- UML図特化ロジック:
  - `js/activity-diagram.js`, `js/behavior-diagram.js`, `js/sequence-diagram.js`, `js/timing-diagram.js`, `js/usecase-diagram.js`: UMLの各図に特化した描画・操作ロジック。
- `js/connection-routing.js`: ノード同士を結ぶ線（矢印）のルーティング計算。
- `js/layout.js`: UIレイアウトエディタ（`LayoutTool` クラス）。
- `js/erdiagram.js`: E-R図エディタ（`ERDiagramTool` クラス）。
- `js/gantt.js`: ガントチャート（`GanttTool` クラス）。

## データI/O
- `js/db-io.js`: Supabase等を活用したデータベースとの保存・読み込み処理。
- `js/file-io.js`: JSON形式でのインポート/エクスポート、画像出力処理。

