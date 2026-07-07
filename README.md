# プロジェクト概要
このプロジェクトは「UpStream (KFC: Karaage Flow Chart)」という、ブラウザ上で動作する上流工程サポートツール（各種図表エディタ）です。
作業対象パス: `c:\Users\243202\Desktop\MY_APP\karaage.copy`

# 技術スタック
- **フロントエンド**: ピュアな HTML / CSS / JavaScript (Vanilla JS)。ReactやVueなどのフレームワークや、外部UIライブラリは使用していません。
- **描画方式**: Canvas APIではなく、DOM（HTMLの`div`要素）とSVG（ノード同士を線で結ぶため）を組み合わせてキャンバス上の図形を描画・操作する独自実装です。

# 主要なファイルと役割
- `index.html`: 全ツールのメインUI。タブ切り替えで各図表ツールを切り替えて使用します。
- `css/`: `style.css`（UI全般のスタイル）、`diagram.css`（キャンバス周りのスタイル）など。
- `js/core.js`: ツール全体の共通処理。タブ切り替え、`data-action`属性を用いたイベントの委譲、共通モーダル（`showConfirm`, `showModal`等）を管理しています。
- **図表エディタ群**（それぞれが独立したクラスとして状態を持っています）：
  - `js/diagram.js`: アーキテクチャ図・UML図エディタ（`DiagramTool` クラス）
  - `js/layout.js`: UIレイアウトエディタ（`LayoutTool` クラス）
  - `js/erdiagram.js`: E-R図エディタ（`ERDiagramTool` クラス）
  - `js/gantt.js`: ガントチャート（`GanttTool` クラス）
- **データI/O**:
  - `js/db-io.js`: LocalStorage等を活用したデータ保存・読み込み処理。
  - `js/file-io.js`: JSON形式でのインポート/エクスポート、PNG/SVG画像出力処理。

