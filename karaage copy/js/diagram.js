/* ===== Diagram Tool (Architecture + UML) ===== */
const archComponents = [
  // ── サーバー / コンピュート ──
  { icon: '<i data-lucide="globe" class="node-lucide-icon"></i>', label: 'Webブラウザ', color: '#7c3aed' },
  { icon: '<i data-lucide="server" class="node-lucide-icon"></i>', label: 'サーバー', color: '#10b981' },
  { icon: '<i data-lucide="monitor" class="node-lucide-icon"></i>', label: 'アプリサーバー', color: '#3b82f6' },
  { icon: '<i data-lucide="zap" class="node-lucide-icon"></i>', label: 'Lambda/Function', color: '#f59e0b' },
  { icon: '<i data-lucide="container" class="node-lucide-icon"></i>', label: 'コンテナ', color: '#06b6d4' },
  // ── グループ / 境界 ──
  { icon: '<i data-lucide="rectangle-horizontal" class="node-lucide-icon"></i>', label: 'グループ境界', color: '#64748b', nodeType: 'group-boundary' },
  // ── データ / ストレージ ──
  { icon: '<i data-lucide="database" class="node-lucide-icon"></i>', label: 'データベース', color: '#06b6d4' },
  { icon: '<i data-lucide="hard-drive" class="node-lucide-icon"></i>', label: 'ストレージ', color: '#6366f1' },
  { icon: '<i data-lucide="box" class="node-lucide-icon"></i>', label: 'キャッシュ(Redis)', color: '#ef4444' },
  { icon: '<i data-lucide="search" class="node-lucide-icon"></i>', label: '検索エンジン', color: '#f97316' },
  // ── ネットワーク / セキュリティ ──
  { icon: '<i data-lucide="network" class="node-lucide-icon"></i>', label: 'ロードバランサー', color: '#f97316' },
  { icon: '<i data-lucide="cloud" class="node-lucide-icon"></i>', label: 'CDN', color: '#8b5cf6' },
  { icon: '<i data-lucide="shield-check" class="node-lucide-icon"></i>', label: 'ファイアウォール', color: '#ef4444' },
  { icon: '<i data-lucide="lock" class="node-lucide-icon"></i>', label: '認証/認可', color: '#ec4899' },
  { icon: '<i data-lucide="waypoints" class="node-lucide-icon"></i>', label: 'APIゲートウェイ', color: '#14b8a6' },
  { icon: '<i data-lucide="at-sign" class="node-lucide-icon"></i>', label: 'DNS', color: '#64748b' },
  { icon: '<i data-lucide="shield" class="node-lucide-icon"></i>', label: 'WAF', color: '#dc2626' },
  { icon: '<i data-lucide="key-round" class="node-lucide-icon"></i>', label: 'VPN', color: '#7c3aed' },
  { icon: '<i data-lucide="arrow-left-right" class="node-lucide-icon"></i>', label: 'リバースプロキシ', color: '#0ea5e9' },
  // ── メッセージング / 非同期 ──
  { icon: '<i data-lucide="mail" class="node-lucide-icon"></i>', label: 'メッセージキュー', color: '#ec4899' },
  { icon: '<i data-lucide="webhook" class="node-lucide-icon"></i>', label: 'Webhook', color: '#a855f7' },
  { icon: '<i data-lucide="clock" class="node-lucide-icon"></i>', label: 'バッチ/Cron', color: '#64748b' },
  // ── 監視 / ログ ──
  { icon: '<i data-lucide="activity" class="node-lucide-icon"></i>', label: '監視/APM', color: '#14b8a6' },
  { icon: '<i data-lucide="file-text" class="node-lucide-icon"></i>', label: 'ログ収集', color: '#6366f1' },
  // ── CI/CD / 開発ツール ──
  { icon: '<i data-lucide="git-branch" class="node-lucide-icon"></i>', label: 'CI/CDパイプライン', color: '#f59e0b' },
  // ── 外部連携 / クライアント ──
  { icon: '<i data-lucide="plug" class="node-lucide-icon"></i>', label: '外部API', color: '#0ea5e9' },
  { icon: '<i data-lucide="bell" class="node-lucide-icon"></i>', label: '通知サービス', color: '#f43f5e' },
  { icon: '<i data-lucide="user" class="node-lucide-icon"></i>', label: 'クライアント', color: '#64748b' },
  { icon: '<i data-lucide="smartphone" class="node-lucide-icon"></i>', label: 'モバイル', color: '#a855f7' },
  { icon: '<i data-lucide="layout-dashboard" class="node-lucide-icon"></i>', label: '管理画面', color: '#3b82f6' },
];
const umlComponents = [
  { icon: '<i data-lucide="box" class="node-lucide-icon"></i>', label: 'クラス', color: '#7c3aed' },
  { icon: '<i data-lucide="diamond" class="node-lucide-icon"></i>', label: 'インターフェース', color: '#3b82f6' },
  { icon: '<i data-lucide="folder" class="node-lucide-icon"></i>', label: 'パッケージ', color: '#06b6d4' },
  { icon: '<i data-lucide="user" class="node-lucide-icon"></i>', label: 'アクター', color: '#10b981' },
  { icon: '<i data-lucide="circle" class="node-lucide-icon"></i>', label: 'ユースケース', color: '#f59e0b' },
  { icon: '<i data-lucide="file-text" class="node-lucide-icon"></i>', label: 'ノート', color: '#8b5cf6' },
  { icon: '<i data-lucide="square" class="node-lucide-icon"></i>', label: 'オブジェクト', color: '#14b8a6' },
  { icon: '<i data-lucide="git-branch" class="node-lucide-icon"></i>', label: 'ステート', color: '#6366f1' },
  { icon: '<i data-lucide="play" class="node-lucide-icon"></i>', label: 'アクティビティ', color: '#ec4899' },
  { icon: '<i data-lucide="mail" class="node-lucide-icon"></i>', label: 'メッセージ', color: '#f97316' },
];

/* ===== UML Diagram Sub-Types ===== */
const umlDiagramTypes = {
  class: {
    label: 'クラス図',
    components: [
      {
        icon: '<i data-lucide="box" class="node-lucide-icon"></i>', label: 'クラス', color: '#7c3aed', nodeType: 'class-box',
        defaults: { stereotype: '', attributes: ['-属性1 : 型'], methods: ['+操作1() : 戻り値型'] }
      },
      {
        icon: '<i data-lucide="diamond" class="node-lucide-icon"></i>', label: 'インターフェース', color: '#3b82f6', nodeType: 'class-box',
        defaults: { stereotype: '«interface»', attributes: [], methods: ['+操作1() : 戻り値型'] }
      },
      {
        icon: '<i data-lucide="box" class="node-lucide-icon"></i>', label: '抽象クラス', color: '#8b5cf6', nodeType: 'class-box',
        defaults: { stereotype: '«abstract»', attributes: ['-属性1 : 型'], methods: ['+操作1() : 戻り値型'] }
      },
      {
        icon: '<i data-lucide="list" class="node-lucide-icon"></i>', label: '列挙型', color: '#06b6d4', nodeType: 'class-box',
        defaults: { stereotype: '«enum»', attributes: ['VALUE_1', 'VALUE_2', 'VALUE_3'], methods: [] }
      },
      { icon: '<i data-lucide="folder" class="node-lucide-icon"></i>', label: 'パッケージ', color: '#f59e0b' },
      { icon: '<i data-lucide="file-text" class="node-lucide-icon"></i>', label: 'ノート', color: '#64748b' },
    ],
  },
  object: {
    label: 'オブジェクト図',
    components: [
      { icon: '<i data-lucide="square" class="node-lucide-icon"></i>', label: 'オブジェクト', color: '#14b8a6' },
      { icon: '<i data-lucide="link-2" class="node-lucide-icon"></i>', label: 'リンク', color: '#7c3aed' },
      { icon: '<i data-lucide="box" class="node-lucide-icon"></i>', label: 'クラス', color: '#3b82f6' },
      { icon: '<i data-lucide="file-text" class="node-lucide-icon"></i>', label: 'ノート', color: '#64748b' },
    ],
  },
  package: {
    label: 'パッケージ図',
    components: [
      {
        icon: `
          <div class="uml-tool uml-package-tool" style="width:24px; height:18px; position:relative; display:inline-block; margin-top:2px;">
            <div style="width:12px; height:4px; background:#06b6d4; border-radius:2px 2px 0 0; position:absolute; top:0; left:0;"></div>
            <div style="width:24px; height:14px; background:#06b6d4; border-radius:0 2px 2px 2px; position:absolute; bottom:0; left:0;"></div>
          </div>
        `,
        label: 'パッケージ',
        color: '#06b6d4',
        nodeType: 'uml-package',
        defaults: { stereotype: '' },
        size: { w: 240, h: 180 }
      },
      {
        icon: '<i data-lucide="box" class="node-lucide-icon"></i>',
        label: 'クラス',
        color: '#7c3aed',
        nodeType: 'class-box',
        defaults: { stereotype: '', attributes: ['+ attribute1: type'], methods: ['+ operation1()'] },
        size: { w: 180, h: 120 }
      },
      {
        icon: '<i data-lucide="component" class="node-lucide-icon"></i>',
        label: 'コンポーネント',
        color: '#10b981',
        nodeType: 'component',
        size: { w: 180, h: 100 }
      },
      {
        icon: `
          <div class="uml-tool uml-interface-tool">
            <div class="uml-lollipop"></div>
          </div>
        `,
        label: 'インターフェース',
        color: '#3b82f6',
        nodeType: 'interface',
        size: { w: 26, h: 26 }
      },
      {
        icon: `
          <div class="uml-tool uml-collaboration-tool" style="width: 20px; height: 20px; border: 1.5px solid #f59e0b; display:inline-block; margin-top:2px; transform: rotate(45deg);"></div>
        `,
        label: 'N項アソシエーション',
        color: '#f59e0b',
        nodeType: 'n-ary-association',
        size: { w: 80, h: 80 }
      },
      {
        icon: '<i data-lucide="type" class="node-lucide-icon"></i>',
        label: 'テキスト',
        color: '#e5e7eb',
        nodeType: 'text-node',
        defaults: { stereotype: '', label: 'text' },
        size: { w: 80, h: 30 }
      },
      {
        icon: `
          <div class="uml-tool uml-note-tool">
            <div class="uml-note">
              <div class="fold"></div>
            </div>
          </div>
        `,
        label: 'ノート',
        color: '#64748b',
        nodeType: 'note',
        size: { w: 160, h: 80 }
      },
    ],
  },
  composite: {
    label: 'コンポジット構造図',
    components: [
      {
        icon: `
          <div class="uml-tool uml-component-tool">
            <div class="uml-mini-component">
              <div class="tabs">
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        `,
        label: '構造化クラス',
        color: '#7c3aed',
        nodeType: 'composite-class',
        defaults: { stereotype: '«structured class»' },
        size: { w: 320, h: 220 }
      },
      {
        icon: `
          <div class="uml-tool uml-port-tool">
            <div class="uml-port-box"></div>
          </div>
        `,
        label: 'ポート',
        color: '#10b981',
        nodeType: 'port',
        size: { w: 26, h: 26 }
      },
      {
        icon: '<i data-lucide="square" class="node-lucide-icon"></i>',
        label: 'パート',
        color: '#06b6d4',
        nodeType: 'composite-part',
        defaults: { stereotype: '' },
        size: { w: 180, h: 100 }
      },
      {
        icon: `
          <div class="uml-tool uml-collaboration-tool" style="width: 24px; height: 14px; border: 1.5px dashed #f59e0b; border-radius: 50%; display:inline-block; margin-top:2px;"></div>
        `,
        label: 'コラボレーション',
        color: '#f59e0b',
        nodeType: 'composite-collaboration',
        defaults: { stereotype: '' },
        size: { w: 200, h: 100 }
      },
      {
        icon: `
          <div class="uml-tool uml-interface-tool">
            <div class="uml-lollipop"></div>
          </div>
        `,
        label: 'インターフェース',
        color: '#3b82f6',
        nodeType: 'interface',
        size: { w: 26, h: 26 }
      },
      {
        icon: `
          <div class="uml-tool uml-note-tool">
            <div class="uml-note">
              <div class="fold"></div>
            </div>
          </div>
        `,
        label: 'ノート',
        color: '#64748b',
        nodeType: 'note',
        size: { w: 160, h: 80 }
      },
      {
        icon: '<i data-lucide="layout" class="node-lucide-icon"></i>',
        label: 'フレーム(枠)',
        color: '#8b5cf6',
        nodeType: 'composite-frame',
        defaults: { stereotype: '' },
        size: { w: 320, h: 220 }
      },
      {
        icon: '<i data-lucide="type" class="node-lucide-icon"></i>',
        label: 'テキスト',
        color: '#e5e7eb',
        nodeType: 'text-node',
        defaults: { stereotype: '', label: 'テキスト' },
        size: { w: 100, h: 40 }
      },
    ],
  },
  component: {
    label: 'コンポーネント図',

  // ─────────────────────────────────────────────
  // ★ コンポーネント図 サイズ設定 (ここで一括管理)
  //   w = 幅(px), h = 高さ(px)
  //   サイズを変えたいときはここの数値だけ編集すればOK
  // ─────────────────────────────────────────────
  sizes: {
    component:    { w: 165, h: 60 },  // UML コンポーネント
    interface:    { w:  26, h:  26 },  // インターフェース (円形)
    port:         { w:  26, h:  26 },  // ポート (正方形)
    package:      { w: 165, h: 80 },  // パッケージ
    subsystem:    { w: 360, h: 260 },  // サブシステム
    server:       { w: 240, h: 120 },  // サーバー
    database:     { w: 240, h: 130 },  // データベース
    messaging:    { w: 220, h: 120 },  // メッセージング
    auth:         { w: 220, h: 120 },  // 認証/認可
    search:       { w: 220, h: 120 },  // 検索/キャッシュ
    business:     { w: 240, h: 120 },  // ビジネス機能
    note:         { w: 260, h: 180 },  // ノート
  },

  get components() {
    const s = this.sizes;
    return [

    // =========================================
    // UML コンポーネント
    // =========================================
    {
      icon: `
        <div class="uml-tool uml-component-tool">
          <div class="uml-mini-component">
            <div class="tabs">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `,
      label:'コンポーネント',
      color:'#8b5cf6',
      nodeType:'component',
      size: s.component
    },

    // =========================================
    // インターフェース
    // =========================================
    {
      icon: `
        <div class="uml-tool uml-interface-tool">
          <div class="uml-lollipop"></div>
        </div>
      `,
      label:'インターフェース',
      color:'#3b82f6',
      nodeType:'interface',
      size: s.interface
    },

    // =========================================
    // ポート
    // =========================================
    {
      icon: `
        <div class="uml-tool uml-port-tool">
          <div class="uml-port-box"></div>
        </div>
      `,
      label:'ポート',
      color:'#10b981',
      nodeType:'port',
      size: s.port
    },

    // =========================================
    // パッケージ
    // =========================================
    {
      icon: `
        <div class="uml-tool uml-package-tool">
          <div class="uml-folder">
            <div class="folder-tab"></div>
          </div>
        </div>
      `,
      label:'パッケージ',
      color:'#06b6d4',
      nodeType:'package',
      size: s.package
    },

    // =========================================
    // サブシステム
    // =========================================
    {
      icon: `
        <div class="uml-tool uml-subsystem-tool">
          <div class="uml-subsystem-mini">
            <div class="tabs">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `,
      label:'サブシステム',
      color:'#64748b',
      nodeType:'subsystem',
      behaviorType:'compositeState',
      size: s.subsystem
    },

    // =========================================
    // サーバー
    // =========================================
    {
      icon:'<i data-lucide="server-cog" class="uml-lucide large"></i>',
      label:'サーバー',
      color:'#10b981',
      nodeType:'component',
      size: s.server
    },

    // =========================================
    // データベース
    // =========================================
    {
      icon:'<i data-lucide="database" class="uml-lucide large"></i>',
      label:'データベース',
      color:'#2563eb',
      nodeType:'component',
      size: s.database
    },

    // =========================================
    // メッセージング
    // =========================================
    {
      icon:'<i data-lucide="mail" class="uml-lucide"></i>',
      label:'メッセージング',
      color:'#ef4444',
      nodeType:'component',
      size: s.messaging
    },

    // =========================================
    // 認証
    // =========================================
    {
      icon:'<i data-lucide="shield-check" class="uml-lucide"></i>',
      label:'認証/認可',
      color:'#8b5cf6',
      nodeType:'component',
      size: s.auth
    },

    // =========================================
    // 検索
    // =========================================
    {
      icon:'<i data-lucide="search" class="uml-lucide"></i>',
      label:'検索/キャッシュ',
      color:'#f59e0b',
      nodeType:'component',
      size: s.search
    },

    // =========================================
    // ビジネス機能
    // =========================================
    {
      icon:'<i data-lucide="shopping-cart" class="uml-lucide"></i>',
      label:'ビジネス機能',
      color:'#14b8a6',
      nodeType:'component',
      size: s.business
    },

    // =========================================
    // ノート
    // =========================================
    {
      icon: `
        <div class="uml-tool uml-note-tool">
          <div class="uml-note">
            <div class="fold"></div>
          </div>
        </div>
      `,
      label:'ノート',
      color:'#94a3b8',
      nodeType:'note',
      size: s.note
    },
    ];
  },
  },
  deployment: {
    label: '配置図',
    components: [
      {
        icon: '<i data-lucide="monitor" class="node-lucide-icon"></i>',
        label: 'ノード',
        color: '#7c3aed',
        nodeType: 'deployment-node',
        defaults: { stereotype: '«node»' },
        size: { w: 200, h: 120 }
      },
      {
        icon: '<i data-lucide="smartphone" class="node-lucide-icon"></i>',
        label: 'デバイス',
        color: '#a855f7',
        nodeType: 'deployment-device',
        defaults: { stereotype: '«device»' },
        size: { w: 200, h: 120 }
      },
      {
        icon: '<i data-lucide="cloud" class="node-lucide-icon"></i>',
        label: '実行環境',
        color: '#06b6d4',
        nodeType: 'deployment-env',
        defaults: { stereotype: '«executionEnvironment»' },
        size: { w: 240, h: 160 }
      },
      {
        icon: `
          <div class="uml-tool uml-component-tool">
            <div class="uml-mini-component">
              <div class="tabs">
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        `,
        label: 'コンポーネント',
        color: '#10b981',
        nodeType: 'component',
        size: { w: 160, h: 60 }
      },
      {
        icon: '<i data-lucide="hard-drive" class="node-lucide-icon"></i>',
        label: '成果物',
        color: '#f59e0b',
        nodeType: 'deployment-artifact',
        defaults: { stereotype: '«artifact»' },
        size: { w: 140, h: 80 }
      },
      {
        icon: `
          <div class="uml-tool uml-note-tool">
            <div class="uml-note">
              <div class="fold"></div>
            </div>
          </div>
        `,
        label: 'ノート',
        color: '#64748b',
        nodeType: 'note',
        size: { w: 160, h: 80 }
      },
    ],
  },
  usecase: {
    label: 'ユースケース図',
    get components() {
      return window.BehaviorDiagramLibrary?.usecase?.getDefaultComponents?.() || [];
    }
  },
  activity: {
    label: 'アクティビティ図',
    get components() {
      return window.BehaviorDiagramLibrary?.activity?.getDefaultComponents?.() || [];
    }
  },
  state: {
    label: 'ステートマシン図',
    get components() {
      return window.BehaviorDiagramLibrary?.state?.getDefaultComponents?.() || [];
    }
  },
  sequence: {
    label: 'シーケンス図',
    get components() {
      return window.SequenceDiagramLibrary?.getDefaultComponents?.() || [];
    }
  },
  communication: {
    label: 'コミュニケーション図',
    components: [
      { icon: '<i data-lucide="square" class="node-lucide-icon"></i>', label: 'オブジェクト', color: '#14b8a6', nodeType: 'uml-object' },
      { icon: '<i data-lucide="user" class="node-lucide-icon"></i>', label: 'アクター', color: '#f59e0b', nodeType: 'actor' },
      { icon: '<i data-lucide="file-text" class="node-lucide-icon"></i>', label: 'ノート', color: '#64748b', nodeType: 'note' },
      { icon: '<i data-lucide="type" class="node-lucide-icon"></i>', label: 'テキスト', color: '#38bdf8', nodeType: 'text-node', size: { w: 80, h: 30 } },
    ],
  },
  timing: {
    label: 'タイミング図',
    get components() {
      return window.TimingDiagramLibrary?.getDefaultComponents?.() || [];
    }
  },
  interaction: {
    label: '相互作用図',
    components: [
      { icon: '<i data-lucide="square" class="node-lucide-icon"></i>', label: '相互作用', color: '#7c3aed' },
      { icon: '<i data-lucide="user" class="node-lucide-icon"></i>', label: 'ライフライン', color: '#3b82f6' },
      { icon: '<i data-lucide="mail" class="node-lucide-icon"></i>', label: 'メッセージ', color: '#06b6d4' },
      { icon: '<i data-lucide="play" class="node-lucide-icon"></i>', label: '制御フロー', color: '#10b981' },
      { icon: '<i data-lucide="file-text" class="node-lucide-icon"></i>', label: 'ノート', color: '#64748b' },
    ],
  },
};
const screenTransitionComponents = [
  { icon: '<i data-lucide="monitor" class="node-lucide-icon"></i>', label: '画面', color: '#7c3aed' },
  { icon: '<i data-lucide="play-circle" class="node-lucide-icon"></i>', label: '開始', color: '#10b981' },
  { icon: '<i data-lucide="stop-circle" class="node-lucide-icon"></i>', label: '終了', color: '#ef4444' },
  { icon: '<i data-lucide="git-branch" class="node-lucide-icon"></i>', label: '分岐', color: '#f59e0b' },
  { icon: '<i data-lucide="form" class="node-lucide-icon"></i>', label: 'フォーム', color: '#06b6d4' },
  { icon: '<i data-lucide="layers" class="node-lucide-icon"></i>', label: 'モーダル', color: '#8b5cf6' },
  { icon: '<i data-lucide="bar-chart-3" class="node-lucide-icon"></i>', label: 'ダッシュボード', color: '#14b8a6' },
  { icon: '<i data-lucide="settings" class="node-lucide-icon"></i>', label: '設定画面', color: '#6366f1' },
  { icon: '<i data-lucide="bell" class="node-lucide-icon"></i>', label: '通知/アラート', color: '#ec4899' },
  { icon: '<i data-lucide="lock" class="node-lucide-icon"></i>', label: '認証画面', color: '#ef4444' },
  { icon: '<i data-lucide="edit-3" class="node-lucide-icon"></i>', label: '入力画面', color: '#f97316' },
  { icon: '<i data-lucide="list" class="node-lucide-icon"></i>', label: '一覧画面', color: '#64748b' },
];

/* UMLクラス図の接続タイプ定義 */
const CLASS_CONNECTION_TYPES = [
  { key: 'association', label: '関連', icon: '━━' },
  { key: 'aggregation', label: '集約', icon: '◇━' },
  { key: 'composition', label: 'コンポジット', icon: '◆━' },
  { key: 'dependency', label: '依存', icon: '- -▸' },
  { key: 'generalization', label: '汎化', icon: '━▷' },
  { key: 'realization', label: '実現', icon: '- -▷' },
  { key: 'navigable', label: '誘導可能性', icon: '✕━▸' },
];

/* UMLコンポーネント図の接続タイプ定義 */
const COMPONENT_CONNECTION_TYPES = [
  { key: 'provided', label: '提供インターフェース', icon: '○━' },
  { key: 'required', label: '要求インターフェース', icon: ')━' },
  { key: 'dependency', label: '依存', icon: '- -▸' },
  { key: 'association', label: 'コネクタ', icon: '━━' },
];

/* UML配置図の接続タイプ定義 */
const DEPLOYMENT_CONNECTION_TYPES = [
  { key: 'association', label: '通信パス', icon: '━━' },
  { key: 'deploy', label: 'デプロイ', icon: '- -▸ «deploy»' },
  { key: 'manifest', label: 'マニフェスト', icon: '- -▸ «manifest»' },
  { key: 'dependency', label: '依存', icon: '- -▸' },
];

/* UMLコンポジット構造図の接続タイプ定義 */
const COMPOSITE_CONNECTION_TYPES = [
  { key: 'association', label: 'コネクタ', icon: '━━' },
  { key: 'dependency', label: '依存', icon: '- -▸' },
  { key: 'provided', label: '提供インターフェース', icon: '○━' },
  { key: 'required', label: '要求インターフェース', icon: ')━' },
];

/* UMLパッケージ図の接続タイプ定義 */
const PACKAGE_CONNECTION_TYPES = [
  { key: 'dependency', label: '依存', icon: '- -▸' },
  { key: 'import', label: 'インポート', icon: '- -▸ «import»' },
  { key: 'access', label: 'アクセス', icon: '- -▸ «access»' },
  { key: 'generalization', label: '汎化', icon: '━━▷' },
  { key: 'association', label: '関連', icon: '━━' },
];

/* UMLコミュニケーション図の接続タイプ定義 */
const COMMUNICATION_CONNECTION_TYPES = [
  { key: 'sync-msg', label: '同期メッセージ', icon: '━━▶' },
  { key: 'async-msg', label: '非同期メッセージ', icon: '━━▷' },
  { key: 'reply-msg', label: '応答メッセージ', icon: '- - ▷' },
];

class DiagramTool {
  constructor(prefix, components, options = {}) {
    this.prefix = prefix;
    this.components = components;
    this.options = options;
    this.zoomLevel = 1.0;
    this.isGridVisible = true;
    this.clipboard = null;

    this.isDropdownPalette = this.options.paletteMode === 'dropdown';
    this.umlType = this.options.umlType || null;
    this.connectMode = false;
    this.activeConnType = 'association'; // デフォルト接続タイプ
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.selectedConnection = null;
    this.connectingFrom = null;
    this.undoHistory = [];
    this.redoHistory = [];
    this.isApplyingUndo = false;
    this.nodeIdCounter = 0;
    this.connIdCounter = 0;
    this.quickAddCounter = 0;
    this.defaultTextStyle = { fontSize: 14, color: 'var(--text)' };
    this.inlineShapeLimit = Number.isFinite(options.inlineShapeLimit)
      ? Math.max(1, options.inlineShapeLimit)
      : 8;
    this.selectedTextColor = '';
    this.textColorOptions = [
      { label: '自動', color: '' },
      { label: '黒', color: '#111111' },
      { label: '赤', color: '#ef4444' },
      { label: 'オレンジ', color: '#f59e0b' },
      { label: '黄', color: '#eab308' },
      { label: '緑', color: '#22c55e' },
      { label: '青緑', color: '#06b6d4' },
      { label: '青', color: '#3b82f6' },
      { label: '紫', color: '#8b5cf6' },
      { label: '濃い赤', color: '#dc2626' },
      { label: 'ピンク', color: '#f43f5e' },
      { label: 'レモン', color: '#facc15' },
      { label: '黄緑', color: '#84cc16' },
      { label: '緑青', color: '#14b8a6' },
      { label: '空色', color: '#0ea5e9' },
      { label: '紺青', color: '#1d4ed8' },
      { label: 'バイオレット', color: '#7c3aed' },
    ];

    this.timingConfig = {
      axes: [],
      0: { name: 'Object A', states: ['State 5', 'State 4', 'State 3', 'State 2', 'State 1'] },
      1: { name: 'Object B', states: ['State 5', 'State 4', 'State 3', 'State 2', 'State 1'] }
    };

    this.canvas = document.getElementById(prefix + '-canvas');
    this.svg = document.getElementById(prefix + '-svg');

    if (!this.canvas || !this.svg) {
      const tryInit = () => {
        this.canvas = document.getElementById(prefix + '-canvas');
        this.svg = document.getElementById(prefix + '-svg');
        if (this.canvas && this.svg) {
          this.initPalette();
          this.initCanvasEvents();
          this.initTextStyleControls();
        } else {
          setTimeout(tryInit, 50);
        }
      };
      tryInit();
    } else {
      this.initPalette();
      this.initCanvasEvents();
      this.initTextStyleControls();
      this.initPropertyPanel();
    }
    this.applyUmlMode();
  }

  /** クラス図モード時に文字スタイルコントロールを非表示にする */
  applyUmlMode() {
    const section = this.canvas?.closest('.tool-section');
    if (!section) return;
    const styleControls = section.querySelector('.diagram-style-controls');
    if (styleControls) {
      styleControls.style.display = this.umlType === 'class' ? 'none' : '';
    }
    // セパレータも非表示
    const sep = styleControls?.nextElementSibling;
    if (sep && sep.classList.contains('toolbar-sep')) {
      sep.style.display = this.umlType === 'class' ? 'none' : '';
    }

    // タイミング図の場合のみ上下二分割のガイドとドットオーバーレイを表示
    if (this.canvas) {
      const isTiming = this.umlType === 'timing';
      this.canvas.classList.toggle('timing-split-view', isTiming);

      // 既存のオーバーレイを一旦削除して最新の状態に更新
      this.canvas.querySelector('.timing-dots-overlay')?.remove();
      this.canvas.querySelector('.timing-labels-overlay')?.remove();
      this.canvas.querySelector('.timing-time-axis')?.remove();
      this.canvas.querySelector('.timing-wave-svg')?.remove();

      if (isTiming) {
        // ドットオーバーレイの生成（DOM要素として個別の点を配置）
        const dotsOverlay = document.createElement('div');
        dotsOverlay.className = 'timing-dots-overlay';

        // SVGレイヤー（波形線の描画用）
        let waveSvg = this.canvas.querySelector('.timing-wave-svg');
        if (!waveSvg) {
          waveSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          waveSvg.classList.add('timing-wave-svg');
          this.canvas.appendChild(waveSvg);
        }

        // 50列 × 12行のグリッドに点を配置
        const cols = 50;
        const rows = 12;
        for (let row = 1; row < rows; row++) {
          // 0行目と6行目（エリア境界）はスキップ
          if (row === 6) continue;
          const areaIdx = row < 6 ? 0 : 1; // Object A or B
          for (let col = 0; col <= cols; col++) {
            const dot = document.createElement('div');
            dot.className = 'timing-dot';
            dot.style.left = `${(col / cols) * 100}%`;
            dot.style.top = `${(row / rows) * 100}%`;
            dot.dataset.col = col;
            dot.dataset.row = row;
            dot.dataset.area = areaIdx;

            dot.addEventListener('click', (e) => {
              e.stopPropagation();
              if (!this.connectMode || this.umlType !== 'timing') return;
              this._handleTimingDotClick(dot, waveSvg);
            });

            dotsOverlay.appendChild(dot);
          }
        }
        this.canvas.prepend(dotsOverlay);

        // 時間軸（タイムルーラー）の生成: 全axesを描画
        const timeAxis = document.createElement('div');
        timeAxis.className = 'timing-time-axis';

        const allAxes = this.timingConfig.axes || [];
        if (allAxes.length > 0) {
          allAxes.forEach(axisCfg => {
            const startIdx = parseInt(axisCfg.start, 10) || 0;
            const intervals = axisCfg.intervals || [];
            intervals.forEach((val, i) => {
              const lineIdx = startIdx + i;
              if (lineIdx > 50) return;
              const label = document.createElement('span');
              label.className = 'timing-time-label';
              label.style.left = `calc(${lineIdx} * 100% / 50)`;
              label.innerText = `${val}${axisCfg.unit}`;
              timeAxis.appendChild(label);
            });
          });
        } else {
          // デフォルト: 5軸刻みで均等目盛り
          for (let i = 0; i <= 50; i += 5) {
            const label = document.createElement('span');
            label.className = 'timing-time-label';
            label.style.left = `calc(${i} * 100% / 50)`;
            label.innerText = `${i}s`;
            timeAxis.appendChild(label);
          }
        }

        timeAxis.style.pointerEvents = 'auto';
        timeAxis.style.cursor = 'pointer';
        timeAxis.title = 'クリックして新規メモリを追加';
        timeAxis.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openTimingAxisModal();
        });
        this.canvas.prepend(timeAxis);

        // ラベルオーバーレイの生成
        const labelsOverlay = document.createElement('div');
        labelsOverlay.className = 'timing-labels-overlay';

        // 12分割のうち、内側の5本ずつ（計10本）にラベルを配置
        const lineIndices = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
        lineIndices.forEach(i => {
          const span = document.createElement('span');
          span.className = 'timing-grid-label';
          span.style.top = `calc(${i} * 100% / 12)`;

          const isAreaB = i > 6;
          const configIdx = isAreaB ? 1 : 0;
          const stateIdx = isAreaB ? i - 7 : i - 1;
          span.innerText = this.timingConfig[configIdx].states[stateIdx];

          span.style.pointerEvents = 'auto';
          span.style.cursor = 'pointer';
          span.title = 'クリックして編集';
          span.onclick = (e) => {
            e.stopPropagation();
            this.openTimingConfigModal(configIdx);
          };

          labelsOverlay.appendChild(span);
        });

        // Objectラベルを追加 (State 3のさらに左側に配置)
        [3, 9].forEach((i, idx) => {
          const objSpan = document.createElement('span');
          objSpan.className = 'timing-object-label';
          objSpan.style.top = `calc(${i} * 100% / 12)`;
          objSpan.innerText = this.timingConfig[idx].name;

          objSpan.style.pointerEvents = 'auto';
          objSpan.style.cursor = 'pointer';
          objSpan.title = 'クリックして編集';
          objSpan.onclick = (e) => {
            e.stopPropagation();
            this.openTimingConfigModal(idx);
          };

          labelsOverlay.appendChild(objSpan);
        });

        this.canvas.prepend(labelsOverlay);
      }
    }
  }
  initPalette() {
    // 以前の接続タイプセレクタをクリーンアップ
    const oldConnGroup = document.getElementById(this.prefix + '-conn-group');
    if (oldConnGroup) oldConnGroup.remove();
    const oldConnBtn = document.getElementById(this.prefix + '-connect-mode');
    if (oldConnBtn) { oldConnBtn.style.display = ''; oldConnBtn.replaceWith(oldConnBtn.cloneNode(true)); }

    const palette = document.getElementById(this.prefix + '-palette');
    if (this.isDropdownPalette) {
      palette.innerHTML = `
        <div class="palette-dropdown">
          <button type="button" class="palette-dropdown-btn" id="${this.prefix}-shape-toggle">◽ 図形を追加</button>
          <div class="palette-dropdown-menu" id="${this.prefix}-shape-menu">
            ${this.components.map((c, i) => `<button type="button" class="shape-option" draggable="true" data-idx="${i}" data-label="${c.label}" aria-label="${c.label}">${c.icon}</button>`).join('')}
          </div>
        </div>
        <button type="button" class="palette-action-btn sidebar-toggle-btn" id="${this.prefix}-sidebar-toggle" title="サイドバー表示切替">☰</button>
        <button type="button" class="palette-action-btn" id="${this.prefix}-connect-mode">🔗 接続モード</button>`;

      const toggleButton = document.getElementById(this.prefix + '-shape-toggle');
      const shapeMenu = document.getElementById(this.prefix + '-shape-menu');
      toggleButton.addEventListener('click', e => {
        e.stopPropagation();
        shapeMenu.classList.toggle('open');
      });
      this.openPaletteMenu = () => {
        shapeMenu.classList.toggle('open');
      };
      // Move the dropdown menu to the inline shapes group
      toggleButton.remove();
      const container = this.canvas.closest('.tool-section');
      const inlineGroup = container ? container.querySelector('.toolbar-inline-shapes-group') : null;
      if (inlineGroup) inlineGroup.appendChild(shapeMenu);
      shapeMenu.querySelectorAll('.shape-option').forEach(option => {
        option.addEventListener('click', () => {
          const idx = parseInt(option.dataset.idx, 10);
          if (isNaN(idx)) return;
          this.addNodeFromPalette(idx);
          shapeMenu.classList.remove('open');
        });
        option.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', option.dataset.idx);
        });
      });
      // Close menu only when clicking outside palette, menu, and toolbar button
      const toolbarBtnId = this.prefix + '-shape-add-btn';
      document.addEventListener('click', e => {
        const toolbarBtn = document.getElementById(toolbarBtnId);
        const isOutsidePalette = !palette.contains(e.target);
        const isOutsideMenu = !shapeMenu.contains(e.target);
        const isOutsideBtn = !toolbarBtn || !toolbarBtn.contains(e.target);
        if (isOutsidePalette && isOutsideMenu && isOutsideBtn) {
          shapeMenu.classList.remove('open');
        }
      });
    } else {
      palette.innerHTML = '<div class="palette-title">コンポーネント</div>' +
        this.components.map((c, i) => `
          <div class="palette-item" draggable="true" data-idx="${i}">
            <span class="p-icon">${c.icon}</span><span>${c.label}</span>
          </div>`).join('') +
        '<div class="palette-title" style="margin-top:16px;">操作</div>' +
        '<div class="palette-item" style="cursor:pointer;" id="' + this.prefix + '-connect-mode">🔗 接続モード</div>';

      palette.querySelectorAll('.palette-item[draggable]').forEach(item => {
        item.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', item.dataset.idx);
        });
      });
    }

    const connectButton = document.getElementById(this.prefix + '-connect-mode');

    // クラス図、コンポーネント図、配置図、コンポジット構造図、パッケージ図、またはコミュニケーション図モードの場合: 接続タイプセレクタを生成
    if (this.umlType === 'class' || this.umlType === 'erdiagram' || this.prefix === 'er' || this.umlType === 'component' || this.umlType === 'deployment' || this.umlType === 'composite' || this.umlType === 'package' || this.umlType === 'communication') {
      connectButton.innerHTML = '';
      connectButton.textContent = '';
      connectButton.style.display = 'none';

      let connTypes = CLASS_CONNECTION_TYPES;
      if (this.umlType === 'component') {
        connTypes = COMPONENT_CONNECTION_TYPES;
      } else if (this.umlType === 'erdiagram' || this.prefix === 'er') {
        connTypes = [{ key: 'association', label: 'リレーション', icon: '━━' }];
      } else if (this.umlType === 'deployment') {
        connTypes = DEPLOYMENT_CONNECTION_TYPES;
      } else if (this.umlType === 'composite') {
        connTypes = COMPOSITE_CONNECTION_TYPES;
      } else if (this.umlType === 'package') {
        connTypes = PACKAGE_CONNECTION_TYPES;
      } else if (this.umlType === 'communication') {
        connTypes = COMMUNICATION_CONNECTION_TYPES;
      }
      
      // デフォルトの接続タイプを配列の先頭にする
      this.activeConnType = connTypes[0].key;

      // 接続タイプセレクタをパレット領域に追加
      const connGroup = document.createElement('div');
      connGroup.className = 'uml-conn-group';
      connGroup.id = this.prefix + '-conn-group';
      connGroup.innerHTML = `
        <select class="uml-conn-select" id="${this.prefix}-conn-select">
          ${connTypes.map(t => `<option value="${t.key}">${t.icon}  ${t.label}</option>`).join('')}
        </select>
        <button type="button" class="palette-action-btn" id="${this.prefix}-connect-toggle">🔗 接続</button>`;
      connectButton.parentNode.insertBefore(connGroup, connectButton);

      const connSelect = document.getElementById(this.prefix + '-conn-select');
      const connToggle = document.getElementById(this.prefix + '-connect-toggle');
      connSelect.addEventListener('change', () => {
        this.activeConnType = connSelect.value;
      });

      this.updateConnectButton = () => {
        connToggle.classList.toggle('active', this.connectMode);
        connToggle.textContent = `🔗 接続 ${this.connectMode ? 'ON' : 'OFF'}`;
      };
      this.updateConnectButton();
      connToggle.addEventListener('click', () => {
        this.connectMode = !this.connectMode;
        this.updateConnectButton();
        this.canvas.style.cursor = this.connectMode ? 'crosshair' : 'default';
        // タイミング図の場合、ドットを拡大表示するクラスを切り替え
        if (this.umlType === 'timing') {
          this.canvas.classList.toggle('timing-connect-active', this.connectMode);
          this._timingDotFrom = null;
        }
        const typeDef = connTypes.find(t => t.key === this.activeConnType);
        showToast(this.connectMode ? `接続モード: ON (${typeDef?.label || '関連'})` : '接続モード: OFF');
      });
    } else {
      this.updateConnectButton = () => {
        connectButton.classList.toggle('active', this.connectMode);
        connectButton.textContent = `🔗 接続モード ${this.connectMode ? 'ON' : 'OFF'}`;
        if (!this.isDropdownPalette) {
          // let css handle the active state style
        }
      };
      this.updateConnectButton();
      connectButton.addEventListener('click', () => {
        this.connectMode = !this.connectMode;
        this.updateConnectButton();
        this.canvas.style.cursor = this.connectMode ? 'crosshair' : 'default';
        // タイミング図の場合、ドットを拡大表示するクラスを切り替え
        if (this.umlType === 'timing') {
          this.canvas.classList.toggle('timing-connect-active', this.connectMode);
          this._timingDotFrom = null;
        }
        showToast(this.connectMode ? '接続モード: ONー ノードをクリックして接続' : '接続モード: OFF');
      });
    }

    // タイミング図専用: メモリ設定 & メモリ一覧ボタン
    const existingAxisBtn = document.getElementById(this.prefix + '-timing-axis-btn');
    if (existingAxisBtn) existingAxisBtn.remove();
    const existingListBtn = document.getElementById(this.prefix + '-timing-axes-list-btn');
    if (existingListBtn) existingListBtn.remove();
    if (this.umlType === 'timing') {
      const parentEl = connectButton.parentNode;
      // メモリ追加ボタン
      const axisBtn = document.createElement('button');
      axisBtn.type = 'button';
      axisBtn.className = 'palette-action-btn';
      axisBtn.id = this.prefix + '-timing-axis-btn';
      axisBtn.textContent = '📐 メモリ追加';
      axisBtn.addEventListener('click', () => this.openTimingAxisModal());
      if (parentEl) parentEl.insertBefore(axisBtn, connectButton.nextSibling);
      // メモリ一覧ボタン
      const listBtn = document.createElement('button');
      listBtn.type = 'button';
      listBtn.className = 'palette-action-btn';
      listBtn.id = this.prefix + '-timing-axes-list-btn';
      listBtn.textContent = '📋 メモリ一覧';
      listBtn.addEventListener('click', () => this.openTimingAxesListModal());
      if (parentEl) parentEl.insertBefore(listBtn, axisBtn.nextSibling);
    }
    // Sidebar toggle button
    const sidebarToggle = document.getElementById(this.prefix + '-sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
        if (isCollapsed) {
          document.body.dataset.sidebarCollapsedByUser = 'true';
        } else {
          document.body.dataset.sidebarCollapsedByUser = 'false';
        }
      });
    }

    // Inline shape strip — show component icons directly in toolbar when space allows
    const inlineStrip = document.getElementById(this.prefix + '-inline-shapes');
    if (inlineStrip) {
      const visibleComponents = this.components.slice(0, this.inlineShapeLimit);
      inlineStrip.innerHTML = visibleComponents.map((c, i) =>
        `<button type="button" class="inline-shape-btn" draggable="true" data-idx="${i}" data-label="${c.label}" aria-label="${c.label}"><span class="inline-shape-icon">${c.icon}</span></button>`
      ).join('');
      inlineStrip.querySelectorAll('.inline-shape-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (!isNaN(idx)) this.addNodeFromPalette(idx);
        });
        btn.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', btn.dataset.idx);
        });
      });
    }
    if (window.lucide) {
      if (palette) lucide.createIcons({ root: palette });
      const container = this.canvas.closest('.tool-section');
      const inlineGroup = container ? container.querySelector('.toolbar-inline-shapes-group') : null;
      if (inlineGroup) {
        lucide.createIcons({ root: inlineGroup });
      } else if (inlineStrip) {
        lucide.createIcons({ root: inlineStrip });
      }
    }
  }
  addNodeFromPalette(idx) {
    const comp = this.components[idx];
    if (!comp) return;
    const quickAddCounterBefore = this.quickAddCounter;
    const canvasWidth = this.canvas.clientWidth;
    const canvasHeight = this.canvas.clientHeight;
    const col = this.quickAddCounter % 4;
    const row = Math.floor(this.quickAddCounter / 4);
    const x = Math.min(80 + col * 140, Math.max(20, canvasWidth - 180));
    const y = Math.min(90 + row * 90, Math.max(20, canvasHeight - 80));
    this.quickAddCounter++;
    this.addNode(comp, x, y, { quickAddCounterBefore });
  }
  initCanvasEvents() {
    this.canvas.addEventListener('dragover', e => e.preventDefault());
    this.canvas.addEventListener('drop', e => {
      e.preventDefault();
      const idx = parseInt(e.dataTransfer.getData('text/plain'));
      if (isNaN(idx)) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.zoomLevel - 60;
      const y = (e.clientY - rect.top) / this.zoomLevel - 20;
      this.addNode(this.components[idx], x, y);
    });
    this.canvas.addEventListener('click', e => {
      if (e.target === this.canvas || e.target === this.svg) {
        this.deselectAll();
        this.closePropertyPanel();
      }
    });

    // UIボタンのイベントバインディング
    // tool-sectionが見つからない場合は、さらに上の階層まで探す（ヘッダーとキャンバスが離れている場合のため）
    const container = this.canvas.closest('.tool-section') || this.canvas.closest('.editor-header')?.parentElement || this.canvas.parentElement;
    if (container) {
      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', e => {
          const action = btn.dataset.action;
          if (typeof this[action] === 'function') {
            e.stopPropagation();
            this[action]();
          }
        });
      });
    }

    document.addEventListener('keydown', e => {
      const target = e.target;
      const isEditingField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') { if(!isEditingField) { e.preventDefault(); this.copySelected(); } }
        if (e.key === 'v') { if(!isEditingField) { e.preventDefault(); this.pasteSelected(); } }
      }

      if (isEditingField) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      console.debug('[DiagramTool] keydown', e.key, 'selectedNode=', this.selectedNode?.id, 'selectedConn=', this.selectedConnection?.id);
      if (!this.selectedNode && !this.selectedConnection) return;
      e.preventDefault();
      this.deleteSelected();
    });
  }

  initPropertyPanel() {
    this.propertyPanelNode = null;
    const panel = document.getElementById(this.prefix + '-property-panel');
    if (!panel) return;

    const bindInput = (suffix, prop, parser = String) => {
      const el = document.getElementById(this.prefix + '-prop-' + suffix);
      if (el) {
        el.addEventListener('input', (e) => {
          if (this.propertyPanelNode) {
            this.propertyPanelNode[prop] = parser(e.target.value);
            if (this.propertyPanelNode.from !== undefined) {
              this.drawConnections();
            } else {
              this.updateNodeDOM(this.propertyPanelNode);
            }
          }
        });
      }
    };
    bindInput('label', 'label');
    bindInput('x', 'x', Number);
    bindInput('y', 'y', Number);
    bindInput('fontsize', 'textSize', Number);
    bindInput('routing', 'routing');
    bindInput('linestyle', 'lineStyle');
    bindInput('fragtype', 'fragmentType');
    bindInput('fraglabel', 'fragmentLabel');
    bindInput('timingval', 'timingValue');
    bindInput('timingtext', 'timingValue');
    bindInput('multFrom', 'multiplicityFrom');
    bindInput('multTo', 'multiplicityTo');
    bindInput('subtexttop', 'subtextTop');
    bindInput('subtextbottom', 'subtextBottom');
    bindInput('arrowdir', 'arrowDirection');

    // プロパティパネルのカラーピッカー初期化
    this.initPropertyPanelColorPicker('textcolor', 'textColor');
    this.initPropertyPanelColorPicker('color', 'color');
  }

  initPropertyPanelColorPicker(suffix, nodeProp) {
    const pickerEl = document.getElementById(this.prefix + '-prop-' + suffix + '-picker');
    const menuEl = document.getElementById(this.prefix + '-prop-' + suffix + '-menu');
    const themeRowEl = document.getElementById(this.prefix + '-prop-' + suffix + '-theme-row');
    const shadeGridEl = document.getElementById(this.prefix + '-prop-' + suffix + '-shade-grid');
    const standardRowEl = document.getElementById(this.prefix + '-prop-' + suffix + '-standard-row');
    const otherBtn = document.getElementById(this.prefix + '-prop-' + suffix + '-other-btn');
    const sampleEl = document.getElementById(this.prefix + '-prop-' + suffix + '-sample');
    const textEl = document.getElementById(this.prefix + '-prop-' + suffix + '-text');

    if (!pickerEl || !menuEl) return;

    // カラーパレット構築
    const themeColors = [
      { label: '黒', color: '#111111', shades: ['#f3f4f6', '#d1d5db', '#6b7280', '#111111'] },
      { label: '赤', color: '#ef4444', shades: ['#fee2e2', '#fca5a5', '#ef4444', '#991b1b'] },
      { label: '灰', color: '#9ca3af', shades: ['#f3f4f6', '#d1d5db', '#9ca3af', '#4b5563'] },
      { label: '青', color: '#3b82f6', shades: ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'] },
      { label: '水色', color: '#60a5fa', shades: ['#dbeafe', '#bfdbfe', '#60a5fa', '#2563eb'] },
      { label: '橙', color: '#f97316', shades: ['#ffedd5', '#fdba74', '#f97316', '#c2410c'] },
      { label: '銀', color: '#a3a3a3', shades: ['#f5f5f5', '#e5e7eb', '#a3a3a3', '#525252'] },
      { label: '黄', color: '#facc15', shades: ['#fef9c3', '#fde68a', '#facc15', '#ca8a04'] },
      { label: '青系', color: '#60a5fa', shades: ['#eff6ff', '#dbeafe', '#60a5fa', '#1d4ed8'] },
      { label: '緑', color: '#84cc16', shades: ['#ecfccb', '#bef264', '#84cc16', '#3f6212'] },
    ];
    const standardColors = ['#dc2626', '#ff0000', '#f59e0b', '#ffea00', '#84cc16', '#10b981', '#06b6d4', '#0284c7', '#1d4ed8', '#7c3aed'];

    if (themeRowEl) {
      themeRowEl.innerHTML = themeColors.map(item => `
        <button type="button" class="diagram-color-option" data-color="${item.color}" data-label="${item.label}">
          <span class="diagram-color-option-swatch" style="background:${item.color}"></span>
        </button>
      `).join('');
    }

    if (shadeGridEl) {
      shadeGridEl.innerHTML = themeColors.map(item => `
        <div class="diagram-color-shade-column" data-label="${item.label}">
          ${item.shades.map((shade, index) => `<button type="button" class="diagram-color-shade-option" data-color="${shade}" data-label="${item.label} ${index + 1}" style="background:${shade}"></button>`).join('')}
        </div>
      `).join('');
    }

    if (standardRowEl) {
      standardRowEl.innerHTML = standardColors.map((color, index) => `
        <button type="button" class="diagram-color-option" data-color="${color}" data-label="標準 ${index + 1}">
          <span class="diagram-color-option-swatch" style="background:${color}"></span>
        </button>
      `).join('');
    }

    // カラー選択イベント
    menuEl.addEventListener('click', e => {
      const option = e.target.closest('[data-color]');
      if (!option) return;
      const selectedColor = option.dataset.color || '';
      if (!this.propertyPanelNode) return;
      this.propertyPanelNode[nodeProp] = selectedColor;
      this.updateNodeDOM(this.propertyPanelNode);
      this.refreshPropertyPanelColorButton(suffix, nodeProp);
      pickerEl.open = false;
    });

  // その他の色ボタン（カラーピッカーの続き）
  if(otherBtn) {
    const inputId = this.prefix + '-native-' + suffix;
    let nativeColorInput = document.getElementById(inputId);

    if (!nativeColorInput) {
      nativeColorInput = document.createElement('input');
      nativeColorInput.id = inputId;
      nativeColorInput.type = 'color';
      nativeColorInput.value = '#e5e7eb';
      nativeColorInput.style.display = 'none';
      document.body.appendChild(nativeColorInput);
    }

    otherBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      nativeColorInput.value = this.propertyPanelNode && this.propertyPanelNode[nodeProp] ? this.propertyPanelNode[nodeProp] : '#e5e7eb';
      nativeColorInput.click();
    });

    nativeColorInput.addEventListener('change', () => {
      const selectedColor = nativeColorInput.value;
      if (!this.propertyPanelNode) return;
      this.propertyPanelNode[nodeProp] = selectedColor;
      this.updateNodeDOM(this.propertyPanelNode);
      this.refreshPropertyPanelColorButton(suffix, nodeProp);
      pickerEl.open = false;
    });
  }

    // 外部クリックで閉じる
    document.addEventListener('click', e => {
    if (!pickerEl.contains(e.target)) {
  pickerEl.open = false;
}
    });
  }

refreshPropertyPanelColorButton(suffix, nodeProp) {
  const sampleEl = document.getElementById(this.prefix + '-prop-' + suffix + '-sample');
  const textEl = document.getElementById(this.prefix + '-prop-' + suffix + '-text');
  const menuEl = document.getElementById(this.prefix + '-prop-' + suffix + '-menu');

  if (!this.propertyPanelNode || !sampleEl || !textEl) return;

  const color = this.propertyPanelNode[nodeProp] || '';
  const isAuto = !color;
  const displayColor = isAuto ? '#e5e7eb' : color;

  sampleEl.style.background = displayColor;

  if (menuEl) {
    const activeOption = isAuto ? menuEl.querySelector('.diagram-color-auto-row') : menuEl.querySelector(`.diagram-color-option[data-color="${color}"]`);
    textEl.textContent = activeOption?.dataset.label || (isAuto ? '自動' : color);
  }
}

openPropertyPanel(node) {
  this.propertyPanelNode = node;
  const isConn = node && node.from !== undefined;
  const isNode = node && node.from === undefined;

  // パネル項目の表示切り替え（タイミング図などの設定）
  const routingGroup = document.getElementById(this.prefix + '-prop-group-routing');
  if (routingGroup) routingGroup.style.display = isConn ? '' : 'none';
  const linestyleGroup = document.getElementById(this.prefix + '-prop-group-linestyle');
  if (linestyleGroup) linestyleGroup.style.display = isConn ? '' : 'none';
  const multFromGroup = document.getElementById(this.prefix + '-prop-group-multFrom');
  if (multFromGroup) multFromGroup.style.display = isConn ? '' : 'none';
  const multToGroup = document.getElementById(this.prefix + '-prop-group-multTo');
  if (multToGroup) multToGroup.style.display = isConn ? '' : 'none';
  const fragmentGroup = document.getElementById(this.prefix + '-prop-group-fragment');
  if (fragmentGroup) fragmentGroup.style.display = (node && node.behaviorType === 'fragment') ? '' : 'none';
  const timingGroup = document.getElementById(this.prefix + '-prop-group-timing');
  if (timingGroup) timingGroup.style.display = (node && (node.behaviorType === 'stateTimeline' || node.behaviorType === 'valueTimeline')) ? '' : 'none';
  
  const nodeOnlyGroup = document.getElementById(this.prefix + '-prop-group-node-only');
  if (nodeOnlyGroup) nodeOnlyGroup.style.display = isNode ? '' : 'none';
  const connOnlyGroup = document.getElementById(this.prefix + '-prop-group-conn-only');
  if (connOnlyGroup) connOnlyGroup.style.display = isConn ? '' : 'none';

  const panel = document.getElementById(this.prefix + '-property-panel');
  if (panel) panel.classList.add('open');

  // 押し出し式連動: 右のプロパティが開いたら左のサイドバーを隠し、右のチャットも閉じる
  document.body.classList.add('sidebar-collapsed');
  const aiPanel = document.getElementById(this.prefix + '-ai-chat-panel');
  if (aiPanel) aiPanel.classList.remove('open');

  // Populate fields
  const setVal = (suffix, val) => {
    const el = document.getElementById(this.prefix + '-prop-' + suffix);
    if (el) el.value = val;
  };

  if (isNode) {
    setVal('label', node.label || '');
    setVal('subtexttop', node.subtextTop || '');
    setVal('subtextbottom', node.subtextBottom || '');

    // アクティビティ図専用のUI調整
    const isActivity = this.umlType === 'activity';
    const topGroup = document.getElementById(this.prefix + '-prop-subtexttop')?.closest('.property-group');
    const bottomGroup = document.getElementById(this.prefix + '-prop-subtextbottom')?.closest('.property-group');
    if (topGroup) topGroup.style.display = isActivity ? 'none' : '';
    if (bottomGroup) bottomGroup.style.display = isActivity ? 'none' : '';

    const labelInput = document.getElementById(this.prefix + '-prop-label');
    if (labelInput) {
      const labelTextEl = labelInput.closest('.property-group')?.querySelector('label');
      if (isActivity && (node.behaviorType === 'decision' || node.behaviorType === 'merge')) {
        if (labelTextEl) labelTextEl.textContent = "判定条件 (メイン名)";
        labelInput.placeholder = "例: 休日か";
      } else {
        if (labelTextEl) labelTextEl.textContent = "名前 (メイン名)";
        labelInput.placeholder = "";
      }
    }
    setVal('x', node.x);
    setVal('y', node.y);
    setVal('fontsize', node.textSize || this.defaultTextStyle.fontSize);

    // カラーボタンの表示を更新（新方式）
    this.refreshPropertyPanelColorButton('textcolor', 'textColor');
    this.refreshPropertyPanelColorButton('color', 'color');

    // タイミング図やフラグメント専用の設定
    if (node.behaviorType === 'fragment') {
      setVal('fragtype', node.fragmentType || 'alt');
      setVal('fraglabel', node.fragmentLabel || '');
    }
    if (node.behaviorType === 'stateTimeline' || node.behaviorType === 'valueTimeline') {
      const val = node.timingValue || 'High';
      setVal('timingval', (val === 'High' || val === 'Low') ? val : 'Other');
      setVal('timingtext', val);
    }
  } else if (isConn) {
    // 線（コネクション）を選択した場合
    setVal('label', node.label || '');
    setVal('arrowdir', node.arrowDirection || 'one-way');
    setVal('routing', node.routing || 'straight');
    setVal('linestyle', node.lineStyle || 'solid');
    setVal('multFrom', node.multiplicityFrom || '');
    setVal('multTo', node.multiplicityTo || '');

    // ポートモード初期化
    if (!node.portMode) {
      node.portMode = node.portFrom || node.portTo ? 'dual' : 'single';
    }

    const singleView = document.getElementById(this.prefix + '-prop-port-single-view');
    const dualView = document.getElementById(this.prefix + '-prop-port-dual-view');
    
    const updatePortModeUI = () => {
      if (singleView) singleView.style.display = node.portMode === 'single' ? 'block' : 'none';
      if (dualView) dualView.style.display = node.portMode === 'dual' ? 'block' : 'none';
    };

    updatePortModeUI();

    // 値をセット
    const inputCenter = document.getElementById(this.prefix + '-prop-port-center');
    const inputFrom = document.getElementById(this.prefix + '-prop-port-from');
    const inputTo = document.getElementById(this.prefix + '-prop-port-to');

    if (inputCenter) inputCenter.value = node.portProtocol || '';
    if (inputFrom) inputFrom.value = node.portFrom || '';
    if (inputTo) inputTo.value = node.portTo || '';

    // イベントリスナー (蓄積を防ぐためcloneNode)
    const setupInput = (el, propName) => {
      if (!el) return;
      const newEl = el.cloneNode(true);
      el.parentNode.replaceChild(newEl, el);
      newEl.addEventListener('input', (e) => {
        node[propName] = e.target.value;
        this.drawConnections();
      });
    };

    setupInput(inputCenter, 'portProtocol');
    setupInput(inputFrom, 'portFrom');
    setupInput(inputTo, 'portTo');

    // モード切り替えボタン
    const switchDualBtn = document.getElementById(this.prefix + '-prop-switch-dual-btn');
    if (switchDualBtn) {
      const newBtn = switchDualBtn.cloneNode(true);
      switchDualBtn.parentNode.replaceChild(newBtn, switchDualBtn);
      newBtn.addEventListener('click', () => {
        node.portMode = 'dual';
        if (node.portProtocol && !node.portTo) {
          node.portTo = node.portProtocol;
          const toEl = document.getElementById(this.prefix + '-prop-port-to');
          if (toEl) toEl.value = node.portTo;
        }
        updatePortModeUI();
        this.drawConnections();
      });
    }

    const switchSingleBtn = document.getElementById(this.prefix + '-prop-switch-single-btn');
    if (switchSingleBtn) {
      const newBtn = switchSingleBtn.cloneNode(true);
      switchSingleBtn.parentNode.replaceChild(newBtn, switchSingleBtn);
      newBtn.addEventListener('click', () => {
        node.portMode = 'single';
        updatePortModeUI();
        this.drawConnections();
      });
    }

    updatePortModeUI();
    setupAddBtn('center');
    setupAddBtn('from');
    setupAddBtn('to');

    // 線の場合の色更新（線の色変更用）
    this.refreshPropertyPanelColorButton('color', 'color');
  }


  // --- クラスボックス専用フィールドの動的生成 ---
  const panelBody = panel?.querySelector('.property-panel-body');
  // 以前の動的フィールドを削除
  panelBody?.querySelectorAll('.uml-class-prop-group').forEach(g => g.remove());

  // class-box の場合: フォントサイズ・文字色フィールドを非表示にする
  const fontsizeGroup = document.getElementById(this.prefix + '-prop-fontsize')?.closest('.property-group');
  const textcolorGroup = document.getElementById(this.prefix + '-prop-textcolor')?.closest('.property-group');
  if (fontsizeGroup) fontsizeGroup.style.display = node.nodeType === 'class-box' ? 'none' : '';
  if (textcolorGroup) textcolorGroup.style.display = node.nodeType === 'class-box' ? 'none' : '';

  if (node.nodeType === 'class-box' && panelBody) {
    const deleteBtn = panelBody.querySelector('[data-action="deleteSelectedNode"]');

    // ステレオタイプ
    const stereoGroup = document.createElement('div');
    stereoGroup.className = 'property-group uml-class-prop-group';
    stereoGroup.innerHTML = `<label>ステレオタイプ</label>
        <input type="text" class="property-input" value="${this.escapeHtml(node.stereotype || '')}" placeholder="例: «interface»">`;
    panelBody.insertBefore(stereoGroup, deleteBtn);
    stereoGroup.querySelector('input').addEventListener('input', e => {
      if (!this.propertyPanelNode) return;
      this.propertyPanelNode.stereotype = e.target.value;
      this.updateNodeDOM(this.propertyPanelNode);
    });

    // 属性
    const attrGroup = document.createElement('div');
    attrGroup.className = 'property-group uml-class-prop-group';
    attrGroup.innerHTML = `<label>属性 <span class="prop-hint">(1行1属性)</span></label>
        <textarea class="property-input property-textarea" rows="4" placeholder="-属性名 : 型">${(node.attributes || []).join('\n')}</textarea>`;
    panelBody.insertBefore(attrGroup, deleteBtn);
    attrGroup.querySelector('textarea').addEventListener('input', e => {
      if (!this.propertyPanelNode) return;
      this.propertyPanelNode.attributes = e.target.value.split('\n').filter(l => l.trim() !== '');
      this.updateNodeDOM(this.propertyPanelNode);
    });

    // 操作
    const methodGroup = document.createElement('div');
    methodGroup.className = 'property-group uml-class-prop-group';
    methodGroup.innerHTML = `<label>操作 <span class="prop-hint">(1行1操作)</span></label>
        <textarea class="property-input property-textarea" rows="4" placeholder="+操作名() : 戻り値型">${(node.methods || []).join('\n')}</textarea>`;
    panelBody.insertBefore(methodGroup, deleteBtn);
    methodGroup.querySelector('textarea').addEventListener('input', e => {
      if (!this.propertyPanelNode) return;
      this.propertyPanelNode.methods = e.target.value.split('\n').filter(l => l.trim() !== '');
      this.updateNodeDOM(this.propertyPanelNode);
    });
  }

  // Focus and select the label input
  setTimeout(() => {
    const labelInput = document.getElementById(this.prefix + '-prop-label');
    if (labelInput) {
      labelInput.focus({ preventScroll: true });
      labelInput.select();
      
      // アクティビティ図の判定ノードで、デフォルト名なら自動クリアして即座に入力可能にする
      const isActivity = this.umlType === 'activity';
      const isDecisionNode = node && (node.behaviorType === 'decision' || node.behaviorType === 'merge');
      if (isActivity && isDecisionNode && (labelInput.value === '判定/分岐' || labelInput.value === '合流')) {
        labelInput.value = '';
        labelInput.dispatchEvent(new Event('input'));
      }
    }
  }, 300);
}

closePropertyPanel() {
  this.propertyPanelNode = null;
  const panel = document.getElementById(this.prefix + '-property-panel');
  if (panel) panel.classList.remove('open');

  // 押し出し式連動: チャットパネルも閉じていれば、左のサイドバーを復元する
  const aiPanel = document.getElementById(this.prefix + '-ai-chat-panel');
  const isAIChatOpen = aiPanel && aiPanel.classList.contains('open');
  if (!isAIChatOpen) {
    if (document.body.dataset.sidebarCollapsedByUser !== 'true') {
      document.body.classList.remove('sidebar-collapsed');
    }
  }
}

updateNodeDOM(node) {
  if (node && node.from !== undefined) {
    this.drawConnections();
    return;
  }
  const el = document.getElementById(node.id);
  if (!el) return;
  el.style.left = node.x + 'px';
  el.style.top = node.y + 'px';

  const isContainer = node.nodeType === 'subsystem' || node.behaviorType === 'systemBoundary' || node.behaviorType === 'compositeState' ||
                      node.nodeType === 'deployment-node' || node.nodeType === 'deployment-device' || node.nodeType === 'deployment-env' ||
                      node.nodeType === 'composite-class' || node.nodeType === 'composite-part' || node.nodeType === 'composite-frame' || node.nodeType === 'uml-package' ||
                      node.nodeType === 'group-boundary';
  const defaultZ = isContainer ? 1 : 10;
  el.style.zIndex = node.zIndex || defaultZ;

  if (node.nodeType === 'class-box') {
    el.style.borderColor = (node.color || '#e5e7eb') + '80';
    // クラス名
    const labelEl = el.querySelector('.uml-class-name');
    if (labelEl) labelEl.textContent = node.label;
    // ステレオタイプ
    const headerEl = el.querySelector('.uml-class-header');
    if (headerEl) {
      let stereoEl = headerEl.querySelector('.uml-class-stereotype');
      if (node.stereotype) {
        if (!stereoEl) {
          stereoEl = document.createElement('div');
          stereoEl.className = 'uml-class-stereotype';
          headerEl.insertBefore(stereoEl, headerEl.firstChild);
        }
        stereoEl.textContent = node.stereotype;
      } else if (stereoEl) {
        stereoEl.remove();
      }
    }
    // 属性セクション
    const attrsEl = el.querySelector('.uml-class-attrs');
    if (attrsEl) {
      attrsEl.innerHTML = (node.attributes || []).map(a =>
        `<div class="uml-class-row">${this.escapeHtml(a)}</div>`
      ).join('') || '<div class="uml-class-row uml-class-empty"></div>';
    }
    // 操作セクション
    const methodsEl = el.querySelector('.uml-class-methods');
    if (methodsEl) {
      methodsEl.innerHTML = (node.methods || []).map(m =>
        `<div class="uml-class-row">${this.escapeHtml(m)}</div>`
      ).join('') || '<div class="uml-class-row uml-class-empty"></div>';
    }
  } else {
    el.style.borderColor = (node.color || '#e5e7eb') + '60';
    const labelEl = el.querySelector('.node-label');
    if (labelEl) {
      labelEl.textContent = node.label;
      this.applyNodeTextStyle(node, labelEl);
    }
    const updateSubtext = (className, propName, position) => {
      let subEl = el.querySelector(`.node-subtext.${className}`);
      if (node[propName]) {
        if (!subEl) {
          subEl = document.createElement('span');
          subEl.className = `node-subtext ${className}`;
          const contentEl = el.querySelector('.diagram-node-content');
          if (contentEl) {
            if (position === 'top') {
              contentEl.insertBefore(subEl, contentEl.firstChild);
            } else {
              contentEl.appendChild(subEl);
            }
          } else {
            if (position === 'top') {
              el.insertBefore(subEl, el.firstChild);
            } else {
              el.appendChild(subEl);
            }
          }
        }
        subEl.textContent = node[propName];
      } else if (subEl) {
        subEl.remove();
      }
    };
    updateSubtext('top', 'subtextTop', 'top');
    updateSubtext('bottom', 'subtextBottom', 'bottom');
  }
  this.drawConnections();
}

/* ===== 追加された機能の実装 ===== */

zoomIn() {
  this.zoomLevel = Math.min(2.0, this.zoomLevel + 0.1);
  this.applyZoom();
}

zoomOut() {
  this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1);
  this.applyZoom();
}

resetZoom() {
  this.zoomLevel = 1.0;
  this.applyZoom();
}

applyZoom() {
  this.canvas.style.transform = `scale(${this.zoomLevel})`;
  this.canvas.style.transformOrigin = '0 0';
  showToast(`ズーム: ${Math.round(this.zoomLevel * 100)}%`);
}

toggleGrid() {
  this.isGridVisible = !this.isGridVisible;
  this.canvas.classList.toggle('grid-active', this.isGridVisible);
  showToast(this.isGridVisible ? 'グリッドを表示しました' : 'グリッドを非表示にしました');
}

copySelected() {
  if (this.selectedNode) {
    this.clipboard = { type: 'node', data: { ...this.selectedNode } };
    showToast('コピーしました');
  } else if (this.selectedConnection) {
    showToast('接続線のコピーには対応していません');
  }
}

pasteSelected() {
  if (!this.clipboard) return;
  if (this.clipboard.type === 'node') {
    const source = this.clipboard.data;
    // 貼り付け位置を少しずらす
    const x = source.x + 40;
    const y = source.y + 40;
    
    // 元のコンポーネント定義を探す（アイコンなどを引き継ぐため）
    const comp = this.components.find(c => c.label === source.label) || this.components[0];
    this._createNode(comp, x, y, {}, { ...source, id: undefined });
    showToast('貼り付けました');
  }
}

async saveDiagram() {
  const data = {
    nodes: this.nodes,
    connections: this.connections,
    nodeIdCounter: this.nodeIdCounter,
    connIdCounter: this.connIdCounter,
    umlType: this.umlType
  };
  const typeKey = `${this.prefix}_${this.umlType || 'main'}`;

  if (window.DBIO) {
    await window.DBIO.saveDiagramToDB(typeKey, data);
  } else {
    showToast('データベース連携モジュールが見つかりません', 'danger');
  }
}

async openDiagramModal() {
  const typeKey = `${this.prefix}_${this.umlType || 'main'}`;
  if (window.DBIO) {
    await window.DBIO.showOpenModal(typeKey, (data, id, name, status) => {
      this.restoreSnapshot(data);
      showToast(`${name} を読み込みました`);
    });
  } else {
    showToast('データベース連携モジュールが見つかりません', 'danger');
  }
}

async loadDiagram(forceWithoutConfirm = false) {
  // DB保存への一本化に伴い、自動ロード（プロジェクト切り替え時）は常に空のキャンバスで初期化します
  this.nodes = [];
  this.connections = [];
  this.nodeIdCounter = 0;
  this.quickAddCounter = 0;
  if (this.canvas) {
    this.canvas.querySelectorAll('.diagram-node').forEach(n => n.remove());
  }
  if (this.svg) {
    this.svg.innerHTML = '';
  }
  if (window.DBIO) window.DBIO.resetCurrentDiagram();
}

showHelp() {
  alert('【UpStream ヘルプ】\n・左のパレットから図形をドラッグ＆ドロップして配置\n・接続モードをONにしてノード間をクリックで接続\n・図形をダブルクリックでプロパティ編集\n・AIボタンで自動レイアウトが可能');
}

showSettings() {
  showToast('設定パネルを開きます');
  if (window.themeManager) window.themeManager.toggleModal();
}

showUserProfile() {
  const user = JSON.parse(localStorage.getItem('upstream_user') || '{}');
  alert(`ユーザー情報:\n名前: ${user.display_name || 'ゲスト'}\nメール: ${user.email || '未設定'}`);
}

/* ===== ER図専用メソッド ===== */

addEntity() {
  // ER図用のデフォルトコンポーネント定義
  const entityComp = {
    label: '新規テーブル',
    color: '#10b981',
    nodeType: 'class-box', // クラス図の枠を利用
    defaults: {
      stereotype: '«table»',
      attributes: ['id : INT (PK)', 'name : VARCHAR(255)'],
      methods: []
    }
  };
  
  // キャンバス中央付近に配置
  const x = (this.canvas.clientWidth / 2 - 80) / this.zoomLevel;
  const y = (this.canvas.clientHeight / 2 - 60) / this.zoomLevel;
  
  this.showClassBoxForm(entityComp, x, y);
  showToast('エンティティを追加しました');
}

addRelation() {
  this.connectMode = !this.connectMode;
  if (typeof this.updateConnectButton === 'function') this.updateConnectButton();
  this.canvas.style.cursor = this.connectMode ? 'crosshair' : 'default';
  
  // ER図の場合、デフォルトの接続タイプをリレーションに設定
  this.activeConnType = 'association';
  showToast(this.connectMode ? 'リレーション作成モード: ON' : 'リレーション作成モード: OFF');
}

toggleNameView() {
  this.isPhysicalView = !this.isPhysicalView;
  const btn = document.getElementById(this.prefix + '-toggle-name-btn');
  if (btn) {
    btn.textContent = this.isPhysicalView ? '🌐 物理名を表示中' : '🌐 論理名を表示中';
  }
  showToast(this.isPhysicalView ? '物理名（テーブル名）表示' : '論理名表示');
  // 必要に応じてノードの再描画処理を追加
}

exportSQL() {
  let sql = `-- UpStream Export: ${new Date().toLocaleString()}\n\n`;
  this.nodes.forEach(node => {
    if (node.nodeType === 'class-box') {
      sql += `CREATE TABLE ${node.label} (\n`;
      const cols = (node.attributes || []).map(a => `  ${a.replace(':', '')}`).join(',\n');
      sql += cols + `\n);\n\n`;
    }
  });
  
  // 簡易的にコンソールとアラートで表示
  console.log(sql);
  alert("DDLを生成しました（詳細はコンソールを確認してください）:\n\n" + sql.substring(0, 200) + "...");
}

toggleSidebar() {
  document.body.classList.toggle('sidebar-collapsed');
}

/* ================================ */

addNode(comp, x, y, options = {}) {
  // クラス図ノードの場合はフォームを表示
  if (comp.nodeType === 'class-box') {
    this.showClassBoxForm(comp, x, y, options);
    return;
  }
  this._createNode(comp, x, y, options);
}

_createNode(comp, x, y, options = {}, overrides = {}) {
  const id = this.prefix + '_node_' + (this.nodeIdCounter++);
  let defaultLabel = comp.label;
  if (comp.nodeType === 'port' || comp.nodeType === 'interface') {
    defaultLabel = '';
  }
  // サイズ定義の統一: パッケージ図形 (uml-package)、グループ境界(group-boundary) およびテキストなし図形(ポート/インターフェース)のみ強制サイズを適用し、他はテキスト自動フィット
  const shouldApplySize = comp.nodeType === 'uml-package' || comp.nodeType === 'port' || comp.nodeType === 'interface' || comp.nodeType === 'group-boundary';
  const resolvedWidth = shouldApplySize ? (comp.width || comp.size?.w || (comp.nodeType === 'group-boundary' ? 320 : undefined)) : undefined;
  const resolvedHeight = shouldApplySize ? (comp.height || comp.size?.h || (comp.nodeType === 'group-boundary' ? 200 : undefined)) : undefined;
  const node = {
    id,
    icon: comp.icon,
    label: overrides.label !== undefined ? overrides.label : defaultLabel,
    color: comp.color,
    x,
    y,
    textColor: this.defaultTextStyle.color,
    textSize: this.defaultTextStyle.fontSize,
    behaviorType: comp.behaviorType,
    nodeType: comp.nodeType,
    width: resolvedWidth,
    height: resolvedHeight,
  };
  if (comp.nodeType === 'class-box') {
    node.nodeType = 'class-box';
    node.stereotype = overrides.stereotype ?? (comp.defaults?.stereotype || '');
    node.attributes = overrides.attributes || (comp.defaults?.attributes ? [...comp.defaults.attributes] : []);
    node.methods = overrides.methods || (comp.defaults?.methods ? [...comp.defaults.methods] : []);
  }
  this.nodes.push(node);
  this.renderNode(node);
  this.pushUndoAction({
    type: 'removeNode',
    nodeId: node.id,
    quickAddCounter: typeof options.quickAddCounterBefore === 'number' ? options.quickAddCounterBefore : this.quickAddCounter,
  });
}

/** クラスボックス作成フォーム */
showClassBoxForm(comp, x, y, options) {
  const d = comp.defaults || {};
  const container = document.getElementById('modal-container');
  if (!container) { this._createNode(comp, x, y, options); return; }

  container.style.display = 'block';
  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal uml-class-modal">
        <h2>${this.escapeHtml(comp.label)}を作成</h2>

        <div class="form-group">
          <label>クラス名</label>
          <input type="text" class="form-input" id="uml-form-name" value="${this.escapeHtml(comp.label)}" autofocus>
        </div>

        <div class="form-group" id="uml-form-stereo-group" style="${d.stereotype ? '' : 'display:none'}">
          <label>ステレオタイプ</label>
          <input type="text" class="form-input" id="uml-form-stereo" value="${this.escapeHtml(d.stereotype || '')}">
        </div>

        <div class="form-group">
          <label>属性 <span class="prop-hint">(名前と型を入力 → 可視性は左のボタンで選択)</span></label>
          <div id="uml-form-attrs" class="uml-form-rows"></div>
          <button type="button" class="btn btn-sm btn-secondary uml-form-add-btn" id="uml-form-add-attr">＋ 属性を追加</button>
        </div>

        <div class="form-group">
          <label>操作 <span class="prop-hint">(名前と戻り値型を入力 → () は自動挿入)</span></label>
          <div id="uml-form-methods" class="uml-form-rows"></div>
          <button type="button" class="btn btn-sm btn-secondary uml-form-add-btn" id="uml-form-add-method">＋ 操作を追加</button>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" id="uml-form-cancel">キャンセル</button>
          <button class="btn btn-primary" id="uml-form-confirm">作成</button>
        </div>
      </div>
    </div>`;

  const visibilityOptions = [
    { symbol: '-', label: 'private' },
    { symbol: '+', label: 'public' },
    { symbol: '#', label: 'protected' },
    { symbol: '~', label: 'package' },
  ];

  const createRow = (containerId, type) => {
    const rowsContainer = container.querySelector('#' + containerId);
    const row = document.createElement('div');
    row.className = 'uml-form-row';

    // 可視性ボタン
    const visBtn = document.createElement('button');
    visBtn.type = 'button';
    visBtn.className = 'uml-form-vis-btn';
    visBtn.dataset.vis = type === 'attr' ? '-' : '+';
    visBtn.textContent = visBtn.dataset.vis;
    visBtn.title = type === 'attr' ? 'private' : 'public';
    visBtn.addEventListener('click', () => {
      const currentIdx = visibilityOptions.findIndex(v => v.symbol === visBtn.dataset.vis);
      const nextIdx = (currentIdx + 1) % visibilityOptions.length;
      visBtn.dataset.vis = visibilityOptions[nextIdx].symbol;
      visBtn.textContent = visibilityOptions[nextIdx].symbol;
      visBtn.title = visibilityOptions[nextIdx].label;
    });

    // 名前入力
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'form-input uml-form-name-input';
    nameInput.placeholder = type === 'attr' ? '属性名' : '操作名';

    // 型入力
    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.className = 'form-input uml-form-type-input';
    typeInput.placeholder = type === 'attr' ? '型' : '戻り値型';

    // 削除ボタン
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'uml-form-del-btn';
    delBtn.textContent = '×';
    delBtn.addEventListener('click', () => row.remove());

    row.appendChild(visBtn);
    row.appendChild(nameInput);
    if (type === 'method') {
      const parens = document.createElement('span');
      parens.className = 'uml-form-parens';
      parens.textContent = '()';
      row.appendChild(parens);
    }
    const colon = document.createElement('span');
    colon.className = 'uml-form-colon';
    colon.textContent = ':';
    row.appendChild(colon);
    row.appendChild(typeInput);
    row.appendChild(delBtn);
    rowsContainer.appendChild(row);
    nameInput.focus();
  };

  // 初期行を追加
  createRow('uml-form-attrs', 'attr');
  createRow('uml-form-methods', 'method');

  // 追加ボタン
  container.querySelector('#uml-form-add-attr').addEventListener('click', () => createRow('uml-form-attrs', 'attr'));
  container.querySelector('#uml-form-add-method').addEventListener('click', () => createRow('uml-form-methods', 'method'));

  // キャンセル
  const close = () => container.innerHTML = '';
  container.querySelector('#uml-form-cancel').addEventListener('click', close);
  container.querySelector('.modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });

  // 確定
  container.querySelector('#uml-form-confirm').addEventListener('click', () => {
    const name = container.querySelector('#uml-form-name').value.trim() || comp.label;
    const stereo = container.querySelector('#uml-form-stereo')?.value.trim() || d.stereotype || '';

    // 属性を収集
    const attrs = [];
    container.querySelectorAll('#uml-form-attrs .uml-form-row').forEach(row => {
      const vis = row.querySelector('.uml-form-vis-btn').dataset.vis;
      const attrName = row.querySelector('.uml-form-name-input').value.trim();
      const attrType = row.querySelector('.uml-form-type-input').value.trim();
      if (attrName) {
        attrs.push(attrType ? `${vis}${attrName} : ${attrType}` : `${vis}${attrName}`);
      }
    });

    // 操作を収集
    const methods = [];
    container.querySelectorAll('#uml-form-methods .uml-form-row').forEach(row => {
      const vis = row.querySelector('.uml-form-vis-btn').dataset.vis;
      const methodName = row.querySelector('.uml-form-name-input').value.trim();
      const retType = row.querySelector('.uml-form-type-input').value.trim();
      if (methodName) {
        methods.push(retType ? `${vis}${methodName}() : ${retType}` : `${vis}${methodName}()`);
      }
    });

    close();
    this._createNode(comp, x, y, options, { label: name, stereotype: stereo, attributes: attrs, methods: methods });
  });

  // Enter キーで確定
  container.querySelector('#uml-form-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') container.querySelector('#uml-form-confirm').click();
  });
  // フォーカスを名前入力へ
  setTimeout(() => container.querySelector('#uml-form-name')?.select(), 100);
}

openTimingConfigModal(idx) {
  const config = this.timingConfig[idx];
  const container = document.getElementById('modal-container');
  if (!container) return;

  let bodyHtml = `
      <div style="margin-bottom: 16px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold; color:var(--text-main);">オブジェクト名</label>
        <input type="text" id="timing-object-name" class="property-input" value="${this.escapeHtml(config.name)}" style="width: 100%; box-sizing: border-box;">
      </div>
      <div>
        <label style="display:block; margin-bottom:4px; font-weight:bold; color:var(--text-main);">各状態名 (上から順)</label>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${config.states.map((s, i) => `
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:0.8rem; color:var(--text-muted); width:20px; text-align:right;">${5 - i}.</span>
              <input type="text" class="property-input timing-state-input" data-index="${i}" value="${this.escapeHtml(s)}" style="flex:1;">
            </div>
          `).join('')}
        </div>
      </div>
    `;

  container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal uml-class-modal" style="width: 400px;">
          <div class="modal-header">
            <h3>タイミング図設定 (${idx === 0 ? '上段' : '下段'})</h3>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          <div class="modal-actions" style="margin-top: 16px;">
            <button class="btn btn-secondary" id="timing-form-cancel">キャンセル</button>
            <button class="btn btn-primary" id="timing-form-confirm">確定</button>
          </div>
        </div>
      </div>
    `;

  const close = () => container.innerHTML = '';
  container.querySelector('#timing-form-cancel').addEventListener('click', close);
  container.querySelector('.modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });

  container.querySelector('#timing-form-confirm').addEventListener('click', () => {
    config.name = container.querySelector('#timing-object-name').value.trim() || `Object ${String.fromCharCode(65 + idx)}`;
    container.querySelectorAll('.timing-state-input').forEach(input => {
      const i = parseInt(input.dataset.index, 10);
      config.states[i] = input.value.trim() || `State ${5 - i}`;
    });
    close();
    this.applyUmlMode();
  });

  setTimeout(() => container.querySelector('#timing-object-name')?.select(), 100);
}

openTimingAxisModal() {
  // 常に新規作成フォームを表示
  this._openTimingAxisForm(null);
}

_openTimingAxisForm(editIndex) {
  const container = document.getElementById('modal-container');
  if (!container) return;
  const isEdit = editIndex !== null && editIndex !== undefined;
  const existing = isEdit ? this.timingConfig.axes[editIndex] : null;

  const startVal = existing ? existing.start : 0;
  const endVal = existing ? existing.end : 50;
  const unitVal = existing ? existing.unit : 's';
  const intervalsVal = existing && existing.intervals.length > 0 ? existing.intervals.join(', ') : '';

  let bodyHtml = `
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold; color:var(--text-main);">開始地点 <span style="font-size:0.75rem; color:var(--text-muted);">(軸の番号 0〜50)</span></label>
        <input type="number" id="timing-axis-start" class="property-input" value="${startVal}" style="width:100%; box-sizing:border-box;" min="0" max="50">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold; color:var(--text-main);">終了地点 <span style="font-size:0.75rem; color:var(--text-muted);">(軸の番号 0〜50)</span></label>
        <input type="number" id="timing-axis-end" class="property-input" value="${endVal}" style="width:100%; box-sizing:border-box;" min="0" max="50">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold; color:var(--text-main);">区間値 <span style="font-size:0.75rem; color:var(--text-muted);">(カンマ区切り、最大50個)</span></label>
        <textarea id="timing-axis-intervals" class="property-input property-textarea" rows="3" placeholder="例: 0, 0.1, 0.5, 1.5, 2, 3.5" style="width:100%; box-sizing:border-box; font-family:monospace;">${this.escapeHtml(intervalsVal)}</textarea>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:4px;">各値は開始地点の垂直線から順に配置されます。</div>
      </div>
      <div>
        <label style="display:block; margin-bottom:4px; font-weight:bold; color:var(--text-main);">単位</label>
        <input type="text" id="timing-axis-unit" class="property-input" value="${this.escapeHtml(unitVal)}" placeholder="例: s, ms, clk" style="width:100%; box-sizing:border-box;">
      </div>
    `;

  container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal uml-class-modal" style="width: 400px;">
          <div class="modal-header">
            <h3>${isEdit ? 'メモリ編集' : '新規メモリ追加'}</h3>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          <div class="modal-actions" style="margin-top: 16px;">
            <button class="btn btn-secondary" id="timing-axis-cancel">キャンセル</button>
            ${isEdit ? '<button class="btn" id="timing-axis-delete" style="background:rgba(239,68,68,0.2);color:#ef4444;">削除</button>' : ''}
            <button class="btn btn-primary" id="timing-axis-confirm">${isEdit ? '更新' : '追加'}</button>
          </div>
        </div>
      </div>
    `;

  const close = () => container.innerHTML = '';
  container.querySelector('#timing-axis-cancel').addEventListener('click', close);
  container.querySelector('.modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });

  if (isEdit) {
    container.querySelector('#timing-axis-delete')?.addEventListener('click', () => {
      this.timingConfig.axes.splice(editIndex, 1);
      close();
      this.applyUmlMode();
      showToast('メモリを削除しました');
    });
  }

  container.querySelector('#timing-axis-confirm').addEventListener('click', () => {
    const s = parseFloat(container.querySelector('#timing-axis-start').value);
    const e = parseFloat(container.querySelector('#timing-axis-end').value);
    const u = container.querySelector('#timing-axis-unit').value.trim() || 's';
    const intervalsText = container.querySelector('#timing-axis-intervals').value.trim();
    let intervals = [];
    if (intervalsText) {
      intervals = intervalsText
        .split(/[,、\s]+/)
        .map(v => v.trim())
        .filter(v => v !== '')
        .slice(0, 50);
    }

    const entry = {
      start: isNaN(s) ? 0 : s,
      end: isNaN(e) ? 50 : e,
      unit: u,
      intervals: intervals
    };

    if (isEdit) {
      this.timingConfig.axes[editIndex] = entry;
    } else {
      this.timingConfig.axes.push(entry);
    }

    close();
    this.applyUmlMode();
    showToast(isEdit ? 'メモリを更新しました' : 'メモリを追加しました');
  });

  setTimeout(() => container.querySelector('#timing-axis-start')?.focus(), 100);
}

openTimingAxesListModal() {
  const container = document.getElementById('modal-container');
  if (!container) return;
  const axes = this.timingConfig.axes || [];

  let listHtml;
  if (axes.length === 0) {
    listHtml = '<div style="text-align:center; color:var(--text-muted); padding:20px 0;">メモリがまだありません。<br>「📏 メモリ追加」で作成してください。</div>';
  } else {
    listHtml = '<div style="display:flex; flex-direction:column; gap:8px;">' +
      axes.map((ax, i) => {
        const preview = (ax.intervals || []).slice(0, 3).join(', ');
        const more = (ax.intervals || []).length > 3 ? '...' : '';
        return `<div class="timing-axes-list-item" data-idx="${i}" style="padding:10px 14px; border-radius:8px; background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); cursor:pointer; transition:background 0.15s;">
            <div style="font-weight:bold; color:var(--text-main); font-size:0.95rem;">軸 ${ax.start} 〜 ${ax.end} <span style="font-size:0.8rem; color:var(--text-muted);">(${ax.unit})</span></div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">区間値: ${preview || 'なし'}${more}</div>
          </div>`;
      }).join('') + '</div>';
  }

  container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal uml-class-modal" style="width: 400px;">
          <div class="modal-header">
            <h3>メモリ一覧 (${axes.length}件)</h3>
          </div>
          <div class="modal-body" style="max-height:400px; overflow-y:auto;">${listHtml}</div>
          <div class="modal-actions" style="margin-top: 16px;">
            <button class="btn btn-secondary" id="timing-axes-list-close">閉じる</button>
            <button class="btn btn-primary" id="timing-axes-list-add">新規追加</button>
          </div>
        </div>
      </div>
    `;

  const close = () => container.innerHTML = '';
  container.querySelector('#timing-axes-list-close').addEventListener('click', close);
  container.querySelector('.modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });
  container.querySelector('#timing-axes-list-add').addEventListener('click', () => {
    close();
    this.openTimingAxisModal();
  });

  container.querySelectorAll('.timing-axes-list-item').forEach(item => {
    item.addEventListener('mouseenter', () => item.style.background = 'rgba(124,58,237,0.18)');
    item.addEventListener('mouseleave', () => item.style.background = 'rgba(124,58,237,0.08)');
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.idx, 10);
      close();
      this._openTimingAxisForm(idx);
    });
  });
}

_handleTimingDotClick(dot, waveSvg) {
  if (!this._timingDotFrom) {
    // 1点目を選択
    this._timingDotFrom = dot;
    dot.classList.add('timing-dot-selected');
    return;
  }

  const fromDot = this._timingDotFrom;
  fromDot.classList.remove('timing-dot-selected');
  this._timingDotFrom = null;

  const fromCol = parseInt(fromDot.dataset.col, 10);
  const fromRow = parseInt(fromDot.dataset.row, 10);
  const fromArea = parseInt(fromDot.dataset.area, 10);
  const toCol = parseInt(dot.dataset.col, 10);
  const toRow = parseInt(dot.dataset.row, 10);
  const toArea = parseInt(dot.dataset.area, 10);

  // 同一点をクリック → キャンセル
  if (fromCol === toCol && fromRow === toRow) return;

  // 同一オブジェクト内：斜めは禁止（水平のみ許可）
  if (fromArea === toArea && fromRow !== toRow) {
    showToast('同一オブジェクト内では水平方向のみ接続できます');
    return;
  }

  // 接続データを保存
  if (!this._timingWaveLines) this._timingWaveLines = [];
  this._timingWaveLines.push({
    fromCol, fromRow, fromArea,
    toCol, toRow, toArea
  });

  this._drawTimingWaveLines(waveSvg);
}

_drawTimingWaveLines(waveSvg) {
  if (!waveSvg || !this._timingWaveLines) return;
  // SVG内をクリア
  waveSvg.innerHTML = '';

  const overlay = this.canvas.querySelector('.timing-dots-overlay');
  if (!overlay) return;
  const overlayRect = overlay.getBoundingClientRect();
  const canvasRect = this.canvas.getBoundingClientRect();
  const offsetX = overlayRect.left - canvasRect.left;
  const offsetY = overlayRect.top - canvasRect.top;
  const w = overlayRect.width;
  const h = overlayRect.height;
  const cols = 50;
  const rows = 12;

  this._timingWaveLines.forEach(seg => {
    const x1 = offsetX + (seg.fromCol / cols) * w;
    const y1 = offsetY + (seg.fromRow / rows) * h;
    const x2 = offsetX + (seg.toCol / cols) * w;
    const y2 = offsetY + (seg.toRow / rows) * h;
    const isCross = seg.fromArea !== seg.toArea;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.classList.add(isCross ? 'timing-line-cross' : 'timing-line-same');
    waveSvg.appendChild(line);
  });
}

renderNode(node) {
  const isContainer = node.nodeType === 'subsystem' || node.behaviorType === 'systemBoundary' || node.behaviorType === 'compositeState' ||
                      node.nodeType === 'deployment-node' || node.nodeType === 'deployment-device' || node.nodeType === 'deployment-env' ||
                      node.nodeType === 'composite-class' || node.nodeType === 'composite-part' || node.nodeType === 'composite-frame' || node.nodeType === 'uml-package' ||
                      node.nodeType === 'group-boundary';
  const defaultZ = isContainer ? 1 : 10;
  const el = document.createElement('div');
  el.id = node.id;
  el.style.left = node.x + 'px';
  el.style.top = node.y + 'px';
  el.style.zIndex = node.zIndex || defaultZ;
  const behaviorPresentation =
    window.TimingDiagramLibrary?.buildNodePresentation?.(node, this.escapeHtml.bind(this)) ||
    window.SequenceDiagramLibrary?.buildNodePresentation?.(node, this.escapeHtml.bind(this)) ||
    window.BehaviorDiagramLibrary?.activity?.buildNodePresentation?.(node, this.escapeHtml.bind(this)) ||
    window.BehaviorDiagramLibrary?.state?.buildNodePresentation?.(node, this.escapeHtml.bind(this)) ||
    window.BehaviorDiagramLibrary?.usecase?.buildNodePresentation?.(node, this.escapeHtml.bind(this));

  if (behaviorPresentation) {
    el.className = behaviorPresentation.className;
    const sizeStyle = [
      behaviorPresentation.style,
      node.width ? `width:${node.width}px;` : '',
      node.height ? `height:${node.height}px;` : '',
    ].join('');
    el.style.cssText = `left:${node.x}px;top:${node.y}px;z-index:${node.zIndex || defaultZ};${sizeStyle}`;
    el.innerHTML = behaviorPresentation.innerHTML;
  } else if (node.nodeType === 'deployment-node' || node.nodeType === 'deployment-device' || node.nodeType === 'deployment-env') {
    // 配置図用 3Dノード / 3Dデバイス / 3D実行環境 (伸縮可能な立体ボックスをSVGで背面に構築)
    el.className = 'diagram-node uml-deployment-node node-type-' + node.nodeType;
    el.style.borderColor = 'transparent';
    el.style.background = 'transparent';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    
    const isEnv = node.nodeType === 'deployment-env';
    const stereoText = isEnv ? '«executionEnvironment»' : (node.nodeType === 'deployment-device' ? '«device»' : '«node»');
    const strokeDash = isEnv ? 'stroke-dasharray="4,4"' : '';
    const color = node.color || '#7c3aed';
    
    el.innerHTML = `
      <svg class="deployment-3d-bg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none;">
        <polygon points="10,0 100,0 90,12 0,12" fill="${color}15" stroke="${color}" stroke-width="1.5" ${strokeDash}/>
        <polygon points="90,12 100,0 100,88 90,100" fill="${color}0a" stroke="${color}" stroke-width="1.5" ${strokeDash}/>
        <rect x="0" y="12" width="90" height="88" fill="var(--bg-card, #111827)" stroke="${color}" stroke-width="1.5" rx="3" ${strokeDash}/>
      </svg>
      <div class="deployment-3d-content" style="position:relative; z-index:2; width:90%; height:88%; margin-top:12%; padding:14px 10px 10px 10px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; text-align:center; gap:4px; box-sizing:border-box;">
        <span class="deployment-stereotype" style="font-size:10px; opacity:0.75; font-family:monospace; color:#e5e7eb; white-space:nowrap;">${stereoText}</span>
        <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
          <span class="node-icon" style="opacity:0.9;">${node.icon}</span>
          <span class="node-label" style="font-weight:600; color:#ffffff;">${this.escapeHtml(node.label)}</span>
        </div>
      </div>
      <span class="node-port port-top" data-port="top" style="top:12% !important;"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right" style="right:10% !important;"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'deployment-artifact') {
    // 配置図用 成果物 (右上折れ曲がり書類)
    el.className = 'diagram-node uml-deployment-artifact node-type-deployment-artifact';
    el.style.borderColor = 'transparent';
    el.style.background = 'transparent';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    const color = node.color || '#f59e0b';
    
    el.innerHTML = `
      <svg class="deployment-artifact-bg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none;">
        <polygon points="0,0 85,0 100,15 100,100 0,100" fill="var(--bg-card, #111827)" stroke="${color}" stroke-width="1.5" rx="3"/>
        <polygon points="85,0 85,15 100,15" fill="${color}25" stroke="${color}" stroke-width="1.5"/>
      </svg>
      <div class="deployment-artifact-content" style="position:relative; z-index:2; width:100%; height:100%; padding:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:4px; box-sizing:border-box;">
        <span class="deployment-stereotype" style="font-size:10px; opacity:0.75; font-family:monospace; color:#e5e7eb;">«artifact»</span>
        <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
          <span class="node-icon" style="opacity:0.9;">${node.icon}</span>
          <span class="node-label" style="font-weight:600; color:#ffffff;">${this.escapeHtml(node.label)}</span>
        </div>
      </div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'composite-class') {
    // コンポジット構造図用 構造化クラス (左上にコンポーネントの2つ突起があるデザイン)
    el.className = 'diagram-node uml-composite-class node-type-composite-class';
    el.style.borderColor = node.color || '#7c3aed';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    
    el.innerHTML = `
      <div class="composite-class-tabs" style="position:absolute; left:12px; top:-8px; display:flex; flex-direction:column; gap:2px; z-index:3;">
        <span style="display:block; width:12px; height:5px; background:var(--bg-card, #111827); border:1.5px solid ${node.color}; border-bottom:none; border-radius:2px 2px 0 0;"></span>
        <span style="display:block; width:12px; height:5px; background:var(--bg-card, #111827); border:1.5px solid ${node.color}; border-bottom:none; border-radius:2px 2px 0 0; margin-top:-2px;"></span>
      </div>
      <div class="composite-class-content" style="position:relative; z-index:2; width:100%; height:100%; padding:14px 10px 10px 10px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; text-align:center; gap:4px; box-sizing:border-box;">
        <span class="composite-stereotype" style="font-size:10px; opacity:0.75; font-family:monospace; color:#e5e7eb;">«structured class»</span>
        <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
          <span class="node-label" style="font-weight:600; color:#ffffff;">${this.escapeHtml(node.label)}</span>
        </div>
      </div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'composite-part') {
    // コンポジット構造図用 パート (実線長方形、文字は中央揃え)
    el.className = 'diagram-node uml-composite-part node-type-composite-part';
    el.style.borderColor = node.color || '#06b6d4';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    
    el.innerHTML = `
      <div class="composite-part-content" style="position:relative; z-index:2; width:100%; height:100%; padding:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:4px; box-sizing:border-box;">
        <span class="node-label" style="font-weight:600; color:#ffffff;">${this.escapeHtml(node.label)}</span>
      </div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'composite-collaboration') {
    // コンポジット構造図用 コラボレーション (破線の楕円)
    el.className = 'diagram-node uml-composite-collaboration node-type-composite-collaboration';
    el.style.borderColor = node.color || '#f59e0b';
    el.style.borderStyle = 'dashed';
    el.style.borderRadius = '50%';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    
    el.innerHTML = `
      <div class="composite-collaboration-content" style="position:relative; z-index:2; width:100%; height:100%; padding:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:4px; box-sizing:border-box;">
        <span class="node-label" style="font-weight:600; color:#ffffff; font-style:italic;">${this.escapeHtml(node.label)}</span>
      </div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'composite-frame') {
    // 上部に名前帯を持つフレーム
    el.className = 'diagram-node uml-composite-frame node-type-composite-frame';
    el.style.borderColor = node.color || '#8b5cf6';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    
    el.innerHTML = `
      <div class="composite-frame-header" style="width:100%; height:28px; border-bottom:1.5px solid ${node.color || '#8b5cf6'}; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.03); box-sizing:border-box;">
        <span class="node-label" style="font-weight:600; color:#ffffff;">${this.escapeHtml(node.label)}</span>
      </div>
      <div class="composite-frame-content" style="width:100%; height:calc(100% - 28px);"></div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'text-node') {
    // テキスト要素 (背景透過、枠線なし)
    el.className = 'diagram-node uml-text-node node-type-text-node';
    el.style.borderColor = 'transparent';
    el.style.background = 'transparent';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    
    el.innerHTML = `
      <div class="text-node-content" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; text-align:center;">
        <span class="node-label" style="font-weight:600; color:#ffffff;">${this.escapeHtml(node.label)}</span>
      </div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'group-boundary') {
    // グループ境界 (枠線、薄い背景、最背面)
    el.className = 'diagram-node group-boundary-node node-type-group-boundary';
    el.style.borderColor = node.color || '#64748b';
    el.style.borderStyle = 'dashed';
    el.style.borderRadius = '8px';
    const baseColor = node.color || '#64748b';
    el.style.background = baseColor + '0d'; // 5% opacity tint
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    
    el.innerHTML = `
      <div class="group-boundary-header" style="position:absolute; left:12px; top:-10px; padding:2px 8px; background:var(--bg-primary, #0a0e1a); border:1px solid ${baseColor}; border-radius:4px; z-index:3; font-size:11px; font-weight:700; color:${baseColor}; display:flex; align-items:center; gap:6px;">
        <span class="node-icon" style="opacity:0.9; display:inline-flex; align-items:center;">${node.icon}</span>
        <span class="node-label">${this.escapeHtml(node.label)}</span>
      </div>
      <div class="group-boundary-content" style="width:100%; height:100%;"></div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'uml-package') {
    // パッケージ図用 パッケージ (フォルダ形状)
    el.className = 'diagram-node uml-package node-type-uml-package';
    el.style.borderColor = 'transparent';
    el.style.background = 'transparent';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    const color = node.color || '#06b6d4';
    
    el.innerHTML = `
      <div class="uml-package-tab" style="position:absolute; left:0; top:0; height:24px; padding:0 12px; background:var(--bg-card, #111827); border:2px solid ${color}; border-bottom:none; border-radius:6px 6px 0 0; display:flex; align-items:center; z-index:2; box-sizing:border-box;">
        <span class="node-label" style="font-weight:700; font-size:12px; color:#ffffff; white-space:nowrap;">${this.escapeHtml(node.label)}</span>
      </div>
      <div class="uml-package-body" style="position:absolute; left:0; top:22px; width:100%; height:calc(100% - 22px); background:var(--bg-card, #111827); border:2px solid ${color}; border-radius:0 6px 6px 6px; z-index:1; padding:10px; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center;">
      </div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.uml-package-tab .node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'n-ary-association') {
    // パッケージ図用 N項アソシエーション (ひし形ハブ)
    el.className = 'diagram-node uml-n-ary node-type-n-ary';
    el.style.borderColor = 'transparent';
    el.style.background = 'transparent';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    const color = node.color || '#f59e0b';
    
    el.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none;">
        <polygon points="50,0 100,50 50,100 0,50" fill="var(--bg-card, #111827)" stroke="${color}" stroke-width="2"/>
      </svg>
      <div class="n-ary-content" style="position:relative; z-index:2; width:100%; height:100%; display:flex; align-items:center; justify-content:center; text-align:center; padding:10px; box-sizing:border-box;">
        <span class="node-label" style="font-weight:600; color:#ffffff; font-size:12px;">${this.escapeHtml(node.label)}</span>
      </div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'uml-object') {
    // コミュニケーション図用 オブジェクト (実線長方形、テキストにアンダーライン)
    el.className = 'diagram-node uml-object node-type-uml-object';
    el.style.borderColor = node.color || '#14b8a6';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    
    el.innerHTML = `
      <div class="uml-object-content" style="position:relative; z-index:2; width:100%; height:100%; padding:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; box-sizing:border-box;">
        <span class="node-label" style="font-weight:600; color:#ffffff; text-decoration: underline;">${this.escapeHtml(node.label)}</span>
      </div>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>
    `;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  } else if (node.nodeType === 'class-box') {
    // UMLクラス図の3コンパートメントノード
    el.className = 'diagram-node uml-class-box';
    el.style.borderColor = node.color + '80';
    const stereo = node.stereotype ? `<div class="uml-class-stereotype">${node.stereotype}</div>` : '';
    const attrsHtml = (node.attributes || []).map(a => `<div class="uml-class-row">${this.escapeHtml(a)}</div>`).join('');
    const methodsHtml = (node.methods || []).map(m => `<div class="uml-class-row">${this.escapeHtml(m)}</div>`).join('');
    el.innerHTML = `
        <div class="uml-class-header" style="border-bottom-color:${node.color}40">
          ${stereo}
          <div class="uml-class-name node-label">${this.escapeHtml(node.label)}</div>
        </div>
        <div class="uml-class-section uml-class-attrs" style="border-bottom-color:${node.color}40">
          ${attrsHtml || '<div class="uml-class-row uml-class-empty"></div>'}
        </div>
        <div class="uml-class-section uml-class-methods">
          ${methodsHtml || '<div class="uml-class-row uml-class-empty"></div>'}
        </div>
        <span class="node-port port-top" data-port="top"></span>
        <span class="node-port port-bottom" data-port="bottom"></span>
        <span class="node-port port-left" data-port="left"></span>
        <span class="node-port port-right" data-port="right"></span>`;
  } else {
    // 通常のノード
    el.className = 'diagram-node';
    if (node.nodeType) el.classList.add('node-type-' + node.nodeType);
    el.style.borderColor = node.color + '60';
    if (node.width) el.style.width = node.width + 'px';
    if (node.height) el.style.height = node.height + 'px';
    const subtextTopHtml = node.subtextTop ? `<span class="node-subtext top">${this.escapeHtml(node.subtextTop)}</span>` : '';
    const subtextBottomHtml = node.subtextBottom ? `<span class="node-subtext bottom">${this.escapeHtml(node.subtextBottom)}</span>` : '';
    el.innerHTML = `<div class="diagram-node-content">${subtextTopHtml}<span class="node-icon">${node.icon}</span><span class="node-label">${this.escapeHtml(node.label)}</span>${subtextBottomHtml}</div>
        <span class="node-port port-top" data-port="top"></span>
        <span class="node-port port-bottom" data-port="bottom"></span>
        <span class="node-port port-left" data-port="left"></span>
        <span class="node-port port-right" data-port="right"></span>`;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
  }

  const isResizable = node.behaviorType === 'compositeState' || node.behaviorType === 'systemBoundary' || node.behaviorType === 'fragment' || node.behaviorType === 'execSpec' || window.TimingDiagramLibrary?.isTimingNode(node) ||
                      node.nodeType === 'deployment-node' || node.nodeType === 'deployment-device' || node.nodeType === 'deployment-env' || node.nodeType === 'deployment-artifact' ||
                      node.nodeType === 'composite-class' || node.nodeType === 'composite-part' || node.nodeType === 'composite-collaboration' || node.nodeType === 'composite-frame' || node.nodeType === 'text-node' ||
                      node.nodeType === 'uml-package' || node.nodeType === 'n-ary-association' || node.nodeType === 'group-boundary';
  if (isResizable) {
    ['right', 'bottom', 'bottom-right'].forEach(dir => {
      const handle = document.createElement('span');
      handle.className = `node-resize-handle resize-${dir}`;
      handle.title = 'サイズ変更';
      handle.dataset.dir = dir;
      el.appendChild(handle);
    });
  }

  // Drag
  let dragging = false, ox, oy;
  el.addEventListener('mousedown', e => {
    if (this.editingNodeId === node.id) return;
    if (e.target.classList.contains('node-port')) return;
    if (e.target.classList.contains('node-resize-handle')) {
      const dir = e.target.dataset.dir || 'bottom-right';
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = node.width || el.getBoundingClientRect().width;
      const startHeight = node.height || el.getBoundingClientRect().height;
      const isResizable = node.behaviorType === 'compositeState' || node.behaviorType === 'systemBoundary' || node.behaviorType === 'fragment' || node.behaviorType === 'execSpec' || window.TimingDiagramLibrary?.isTimingNode(node) ||
                          node.nodeType === 'deployment-node' || node.nodeType === 'deployment-device' || node.nodeType === 'deployment-env' || node.nodeType === 'deployment-artifact' ||
                          node.nodeType === 'composite-class' || node.nodeType === 'composite-part' || node.nodeType === 'composite-collaboration' || node.nodeType === 'composite-frame' || node.nodeType === 'text-node' ||
                          node.nodeType === 'uml-package' || node.nodeType === 'n-ary-association' || node.nodeType === 'group-boundary';
      let minWidth = 120, minHeight = 80;
      if (node.behaviorType === 'compositeState' || node.behaviorType === 'systemBoundary' || node.nodeType === 'group-boundary') { minWidth = 200; minHeight = 100; }
      else if (node.behaviorType === 'fragment') { minWidth = 150; minHeight = 80; }
      else if (node.behaviorType === 'execSpec') { minWidth = 16; minHeight = 20; }
      else if (node.behaviorType === 'timingLifeline') { minWidth = 200; minHeight = 40; }
      else if (node.behaviorType === 'stateTimeline' || node.behaviorType === 'valueTimeline') { minWidth = 20; minHeight = 20; }
      else if (node.behaviorType === 'timeRuler') { minWidth = 100; minHeight = 20; }

      const onMouseMove = moveEvent => {
        if (dir.includes('right')) {
          node.width = Math.max(minWidth, Math.round(startWidth + (moveEvent.clientX - startX) / this.zoomLevel));
          el.style.width = node.width + 'px';
        }
        if (dir.includes('bottom')) {
          node.height = Math.max(minHeight, Math.round(startHeight + (moveEvent.clientY - startY) / this.zoomLevel));
          el.style.height = node.height + 'px';
        }
        this.drawConnections();
      };
      const onMouseUp = () => {
        this.pushUndoAction({
          type: 'resizeNode',
          nodeId: node.id,
          width: startWidth,
          height: startHeight,
        });
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (this.connectMode) {
      if (!this.connectingFrom) {
        this.connectingFrom = node;
        el.classList.add('selected');
        showToast('接続先ノードをクリックしてください');
      } else if (this.connectingFrom.id !== node.id) {
        let initialLabel = '';
        if (this.activeConnType === 'deploy') initialLabel = '«deploy»';
        else if (this.activeConnType === 'manifest') initialLabel = '«manifest»';

        const newConn = {
          id: this.prefix + '_conn_' + (this.connIdCounter++),
          from: this.connectingFrom.id,
          to: node.id,
          connType: this.activeConnType || 'association',
          routing: 'straight',
          label: initialLabel,
          multiplicityFrom: '',
          multiplicityTo: '',
        };
        this.connections.push(newConn);
        this.drawConnections();
        document.getElementById(this.connectingFrom.id)?.classList.remove('selected');
        this.pushUndoAction({
          type: 'removeConnection',
          from: this.connectingFrom.id,
          to: node.id,
        });
        this.connectingFrom = null;
      }
      return;
    }
    dragging = true;
    this.selectNode(node, el);
    const dragStart = { x: node.x, y: node.y };
    let moved = false;
    ox = (e.clientX / this.zoomLevel) - node.x;
    oy = (e.clientY / this.zoomLevel) - node.y;
    e.preventDefault();
    // Nesting: コンテナノードの場合、内部の子ノードを特定
    const isContainer = node.behaviorType === 'compositeState' || node.behaviorType === 'systemBoundary' || node.behaviorType === 'fragment' || node.nodeType === 'group-boundary';
    // ライフラインの場合、実行仕様・破棄マークを子要素として追従させる
    const isLifeline = window.SequenceDiagramLibrary?.isLifeline?.(node) || window.TimingDiagramLibrary?.isTimingLifeline?.(node);
    let childSnapshots = [];
    if (isContainer) {
      const containerRect = el.getBoundingClientRect();
      childSnapshots = this.nodes.filter(n => {
        if (n.id === node.id) return false;
        const childEl = document.getElementById(n.id);
        if (!childEl) return false;
        const cr = childEl.getBoundingClientRect();
        return cr.left >= containerRect.left && cr.right <= containerRect.right &&
          cr.top >= containerRect.top && cr.bottom <= containerRect.bottom;
      }).map(n => ({ node: n, offsetX: n.x - node.x, offsetY: n.y - node.y }));
    } else if (isLifeline) {
      // ライフラインの子ノードを取得
      let lifeChildren = [];
      if (window.SequenceDiagramLibrary?.isLifeline?.(node)) {
        lifeChildren = window.SequenceDiagramLibrary?.findLifelineChildren?.(node, this.nodes) || [];
      } else if (window.TimingDiagramLibrary?.isTimingLifeline?.(node)) {
        lifeChildren = window.TimingDiagramLibrary?.findLifelineChildren?.(node, this.nodes) || [];
      }
      childSnapshots = lifeChildren.map(n => ({ node: n, offsetX: n.x - node.x, offsetY: n.y - node.y }));
    }
    const onMouseMove = e => {
      if (!dragging) return;
      const nextX = (e.clientX / this.zoomLevel) - ox;
      const nextY = (e.clientY / this.zoomLevel) - oy;
      if (nextX !== node.x || nextY !== node.y) moved = true;
      node.x = nextX;
      node.y = nextY;
      el.style.left = node.x + 'px';
      el.style.top = node.y + 'px';
      // Nesting: 子ノードも一緒に移動
      if (isContainer || isLifeline) {
        childSnapshots.forEach(({ node: child, offsetX, offsetY }) => {
          child.x = node.x + offsetX;
          child.y = isLifeline ? child.y : node.y + offsetY; // ライフラインは横移動のみ
          const childEl = document.getElementById(child.id);
          if (childEl) {
            childEl.style.left = child.x + 'px';
            childEl.style.top = child.y + 'px';
          }
        });
      }
      this.drawConnections();
    };
    const onMouseUp = () => {
      if (dragging && moved) {
        this.pushUndoAction({
          type: 'moveNode',
          nodeId: node.id,
          x: dragStart.x,
          y: dragStart.y,
        });
      }
      dragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
  // Double click to open property panel
  el.addEventListener('dblclick', e => {
    e.preventDefault();
    e.stopPropagation();
    this.selectNode(node, el);
    this.openPropertyPanel(node);
  });
  // Port click for connection
  el.querySelectorAll('.node-port').forEach(port => {
    port.addEventListener('mousedown', e => {
      e.stopPropagation();
      if (!this.connectingFrom) {
        this.connectingFrom = node;
        this.connectMode = true;
        if (typeof this.updateConnectButton === 'function') this.updateConnectButton();
        this.canvas.style.cursor = 'crosshair';
        showToast('接続モード: ONー ノードをクリックして接続');
        el.classList.add('selected');
      }
    });
  });
  this.canvas.appendChild(el);
  if (window.lucide) {
    lucide.createIcons({ root: el });
  }
}
escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
beginInlineRename(node, labelEl) {
  if (!labelEl || this.editingNodeId === node.id) return;
  this.editingNodeId = node.id;
  labelEl.dataset.originalText = labelEl.textContent;
  labelEl.contentEditable = 'true';
  labelEl.spellcheck = false;
  labelEl.classList.add('editing');
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(labelEl);
  selection.removeAllRanges();
  selection.addRange(range);
  labelEl.focus();

  const finish = () => {
    if (this.editingNodeId !== node.id) return;
    const newName = labelEl.textContent.trim();
    const oldName = node.label;
    node.label = newName || labelEl.dataset.originalText || node.label;
    labelEl.textContent = node.label;
    this.applyNodeTextStyle(node, labelEl);
    labelEl.contentEditable = 'false';
    labelEl.classList.remove('editing');
    delete labelEl.dataset.originalText;
    this.editingNodeId = null;
    if (node.label !== oldName) {
      this.pushUndoAction({
        type: 'renameNode',
        nodeId: node.id,
        label: oldName,
      });
    }
    labelEl.removeEventListener('blur', onBlur);
    labelEl.removeEventListener('keydown', onKeyDown);
  };
  const onBlur = () => finish();
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      labelEl.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      labelEl.textContent = labelEl.dataset.originalText || node.label;
      labelEl.blur();
    }
  };
  labelEl.addEventListener('blur', onBlur);
  labelEl.addEventListener('keydown', onKeyDown);
}
selectConnection(conn) {
  this.deselectAll();
  this.selectedConnection = conn;
  this.drawConnections();
  this.openPropertyPanel(conn);
}
selectNode(node, el) {
  this.deselectAll();
  this.selectedNode = node;
  el.classList.add('selected');
  this.syncTextStyleControls(node);
}
deselectAll() {
  this.selectedNode = null;
  this.selectedConnection = null;
  this.canvas.querySelectorAll('.diagram-node').forEach(n => n.classList.remove('selected'));
  this.canvas.querySelectorAll('.diagram-conn-label').forEach(n => n.classList.remove('selected'));
  this.drawConnections();
}
bringToFront() {
  if (!this.selectedNode) return;
  const isContainer = this.selectedNode.nodeType === 'subsystem' || this.selectedNode.behaviorType === 'systemBoundary' || this.selectedNode.behaviorType === 'compositeState' ||
                      this.selectedNode.nodeType === 'deployment-node' || this.selectedNode.nodeType === 'deployment-device' || this.selectedNode.nodeType === 'deployment-env' ||
                      this.selectedNode.nodeType === 'composite-class' || this.selectedNode.nodeType === 'composite-part' || this.selectedNode.nodeType === 'composite-frame' || this.selectedNode.nodeType === 'uml-package' ||
                      this.selectedNode.nodeType === 'group-boundary';

  if (isContainer) {
    const containerNodes = this.nodes.filter(n => n.nodeType === 'subsystem' || n.behaviorType === 'systemBoundary' || n.behaviorType === 'compositeState' ||
                                                  n.nodeType === 'deployment-node' || n.nodeType === 'deployment-device' || n.nodeType === 'deployment-env' ||
                                                  n.nodeType === 'composite-class' || n.nodeType === 'composite-part' || n.nodeType === 'composite-frame' || n.nodeType === 'uml-package' ||
                                                  n.nodeType === 'group-boundary');
    const maxZ = Math.max(...containerNodes.map(n => n.zIndex || 1));
    this.selectedNode.zIndex = Math.min(5, maxZ + 1);
  } else {
    const normalNodes = this.nodes.filter(n => !(n.nodeType === 'subsystem' || n.behaviorType === 'systemBoundary' || n.behaviorType === 'compositeState' ||
                                                  n.nodeType === 'deployment-node' || n.nodeType === 'deployment-device' || n.nodeType === 'deployment-env' ||
                                                  n.nodeType === 'composite-class' || n.nodeType === 'composite-part' || n.nodeType === 'composite-frame' || n.nodeType === 'uml-package' ||
                                                  n.nodeType === 'group-boundary'));
    const maxZ = Math.max(...normalNodes.map(n => n.zIndex || 10));
    this.selectedNode.zIndex = maxZ + 1;
  }
  this.updateNodeDOM(this.selectedNode);
}
sendToBack() {
  if (!this.selectedNode) return;
  const isContainer = this.selectedNode.nodeType === 'subsystem' || this.selectedNode.behaviorType === 'systemBoundary' || this.selectedNode.behaviorType === 'compositeState' ||
                      this.selectedNode.nodeType === 'deployment-node' || this.selectedNode.nodeType === 'deployment-device' || this.selectedNode.nodeType === 'deployment-env' ||
                      this.selectedNode.nodeType === 'composite-class' || this.selectedNode.nodeType === 'composite-part' || this.selectedNode.nodeType === 'composite-frame' || this.selectedNode.nodeType === 'uml-package' ||
                      this.selectedNode.nodeType === 'group-boundary';

  if (isContainer) {
    const containerNodes = this.nodes.filter(n => n.nodeType === 'subsystem' || n.behaviorType === 'systemBoundary' || n.behaviorType === 'compositeState' ||
                                                  n.nodeType === 'deployment-node' || n.nodeType === 'deployment-device' || n.nodeType === 'deployment-env' ||
                                                  n.nodeType === 'composite-class' || n.nodeType === 'composite-part' || n.nodeType === 'composite-frame' || n.nodeType === 'uml-package' ||
                                                  n.nodeType === 'group-boundary');
    const minZ = Math.min(...containerNodes.map(n => n.zIndex || 1));
    this.selectedNode.zIndex = Math.max(1, minZ - 1);
  } else {
    const normalNodes = this.nodes.filter(n => !(n.nodeType === 'subsystem' || n.behaviorType === 'systemBoundary' || n.behaviorType === 'compositeState' ||
                                                  n.nodeType === 'deployment-node' || n.nodeType === 'deployment-device' || n.nodeType === 'deployment-env' ||
                                                  n.nodeType === 'composite-class' || n.nodeType === 'composite-part' || n.nodeType === 'composite-frame' || n.nodeType === 'uml-package' ||
                                                  n.nodeType === 'group-boundary'));
    const minZ = Math.min(...normalNodes.map(n => n.zIndex || 10));
    this.selectedNode.zIndex = Math.max(10, minZ - 1);
  }
  this.updateNodeDOM(this.selectedNode);
}
pushUndoAction(action) {
  if (this.isApplyingUndo || !action) return;
  this.undoHistory.push(action);
  this.redoHistory = [];
}
pushRedoAction(action) {
  if (!action) return;
  this.redoHistory.push(action);
}
getNodeById(nodeId) {
  return this.nodes.find(node => node.id === nodeId) || null;
}
captureSnapshot() {
  return {
    nodes: this.nodes.map(node => ({ ...node })),
    connections: this.connections.map(conn => ({ ...conn })),
    nodeIdCounter: this.nodeIdCounter,
    quickAddCounter: this.quickAddCounter,
  };
}
detachNode(nodeId) {
  const index = this.nodes.findIndex(node => node.id === nodeId);
  if (index < 0) return null;
  const [node] = this.nodes.splice(index, 1);
  const removedConnections = this.connections.filter(conn => conn.from === nodeId || conn.to === nodeId);
  this.connections = this.connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId);
  const el = document.getElementById(nodeId);
  if (el) el.remove();
  if (this.selectedNode && this.selectedNode.id === nodeId) this.selectedNode = null;
  if (this.editingNodeId === nodeId) this.editingNodeId = null;
  if (this.connectingFrom && this.connectingFrom.id === nodeId) {
    this.connectingFrom = null;
    this.connectMode = false;
    if (typeof this.updateConnectButton === 'function') this.updateConnectButton();
    this.canvas.style.cursor = 'default';
  }
  return {
    node,
    connections: removedConnections,
  };
}

deleteSelected() {
  if (this.selectedConnection) {
    const conn = this.selectedConnection;
    this.connections = this.connections.filter(c => c.id !== conn.id);
    this.pushUndoAction({
      type: 'removeConnection',
      from: conn.from,
      to: conn.to,
      connType: conn.connType,
      routing: conn.routing,
      lineStyle: conn.lineStyle,
      label: conn.label,
      multiplicityFrom: conn.multiplicityFrom,
      multiplicityTo: conn.multiplicityTo,
      portProtocol: conn.portProtocol,
      arrowDirection: conn.arrowDirection,
      portMode: conn.portMode,
      portFrom: conn.portFrom,
      portTo: conn.portTo,
    });
    this.deselectAll();
    this.drawConnections();
    if (this.propertyPanelNode && this.propertyPanelNode.id === conn.id) {
      this.closePropertyPanel();
    }
    showToast('選択した線を削除しました');
    return;
  }
  if (!this.selectedNode) return;
  const nodeId = this.selectedNode.id;
  const result = this.detachNode(nodeId);
  if (result) {
    this.pushUndoAction({
      type: 'removeNode',
      nodeId,
      node: result.node,
      connections: result.connections,
    });
    if (this.propertyPanelNode && this.propertyPanelNode.id === nodeId) {
      this.closePropertyPanel();
    }
    this.drawConnections();
  }
}
deleteSelectedNode() {
  this.deleteSelected();
}
restoreNode(node, connections = []) {
  if (!node) return;
  this.nodes.push(node);
  this.renderNode(node);
  connections.forEach(conn => this.connections.push(conn));
  this.drawConnections();
}
restoreSnapshot(snapshot) {
  if (!snapshot) return;
  this.nodes = snapshot.nodes.map(node => ({ ...node }));
  this.connections = snapshot.connections.map(conn => ({ ...conn }));
  this.nodeIdCounter = snapshot.nodeIdCounter;
  this.quickAddCounter = snapshot.quickAddCounter;
  this.selectedNode = null;
  this.connectingFrom = null;
  this.editingNodeId = null;
  this.canvas.querySelectorAll('.diagram-node').forEach(nodeEl => nodeEl.remove());
  this.svg.innerHTML = '';
  this.nodes.forEach(node => this.renderNode(node));
  this.drawConnections();
}
applyHistoryAction(action) {
  if (!action) return null;

  if (action.type === 'removeNode') {
    const removed = this.detachNode(action.nodeId);
    if (!removed) return null;
    return {
      type: 'restoreNode',
      node: { ...removed.node },
      connections: removed.connections.map(conn => ({ ...conn })),
    };
  }

  if (action.type === 'restoreNode') {
    this.restoreNode(action.node, action.connections || []);
    return {
      type: 'removeNode',
      nodeId: action.node.id,
    };
  }

  if (action.type === 'moveNode') {
    const node = this.getNodeById(action.nodeId);
    const el = node ? document.getElementById(node.id) : null;
    if (!node || !el) return null;
    const inverse = { type: 'moveNode', nodeId: action.nodeId, x: node.x, y: node.y };
    node.x = action.x;
    node.y = action.y;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    this.drawConnections();
    return inverse;
  }

  if (action.type === 'removeConnection') {
    const beforeCount = this.connections.length;
    const removedConn = this.connections.find(conn => conn.from === action.from && conn.to === action.to);
    this.connections = this.connections.filter(conn => !(conn.from === action.from && conn.to === action.to));
    if (this.connections.length === beforeCount) return null;
    this.drawConnections();
    return {
      type: 'addConnection',
      from: action.from,
      to: action.to,
      connType: removedConn?.connType || action.connType,
      routing: removedConn?.routing || action.routing,
      lineStyle: removedConn?.lineStyle || action.lineStyle,
      label: removedConn?.label || action.label,
      multiplicityFrom: removedConn?.multiplicityFrom || action.multiplicityFrom,
      multiplicityTo: removedConn?.multiplicityTo || action.multiplicityTo,
      portProtocol: removedConn?.portProtocol || action.portProtocol,
      arrowDirection: removedConn?.arrowDirection || action.arrowDirection,
      portMode: removedConn?.portMode || action.portMode,
      portFrom: removedConn?.portFrom || action.portFrom,
      portTo: removedConn?.portTo || action.portTo,
    };
  }

  if (action.type === 'addConnection') {
    this.connections.push({
      from: action.from,
      to: action.to,
      connType: action.connType,
      routing: action.routing,
      lineStyle: action.lineStyle,
      label: action.label,
      multiplicityFrom: action.multiplicityFrom,
      multiplicityTo: action.multiplicityTo,
      portProtocol: action.portProtocol,
      arrowDirection: action.arrowDirection,
      portMode: action.portMode,
      portFrom: action.portFrom,
      portTo: action.portTo,
    });
    this.drawConnections();
    return {
      type: 'removeConnection',
      from: action.from,
      to: action.to,
    };
  }

  if (action.type === 'renameNode') {
    const node = this.getNodeById(action.nodeId);
    const labelEl = node ? document.getElementById(node.id)?.querySelector('.node-label') : null;
    if (!node || !labelEl) return null;
    const inverse = { type: 'renameNode', nodeId: action.nodeId, label: node.label };
    node.label = action.label;
    labelEl.textContent = action.label;
    this.applyNodeTextStyle(node, labelEl);
    return inverse;
  }

  if (action.type === 'styleNode') {
    const node = this.getNodeById(action.nodeId);
    const labelEl = node ? document.getElementById(node.id)?.querySelector('.node-label') : null;
    if (!node || !labelEl) return null;
    const inverse = {
      type: 'styleNode',
      nodeId: action.nodeId,
      textSize: node.textSize,
      textColor: node.textColor,
    };
    node.textSize = action.textSize;
    node.textColor = action.textColor;
    this.applyNodeTextStyle(node, labelEl);
    if (this.selectedNode && this.selectedNode.id === node.id) this.syncTextStyleControls(node);
    return inverse;
  }

  if (action.type === 'clearAll') {
    this.restoreSnapshot(action.snapshot);
    return { type: 'clearCanvas', snapshot: action.snapshot };
  }

  if (action.type === 'clearCanvas') {
    const snapshot = this.captureSnapshot();
    this.nodes = [];
    this.connections = [];
    this.nodeIdCounter = 0;
    this.quickAddCounter = 0;
    this.canvas.querySelectorAll('.diagram-node').forEach(n => n.remove());
    this.svg.innerHTML = '';
    return { type: 'clearAll', snapshot };
  }

  return null;
}
undoLastAction() {
  const action = this.undoHistory.pop();
  if (!action) {
    showToast('戻せる操作がありません');
    return;
  }

  this.isApplyingUndo = true;
  try {
    const redoAction = this.applyHistoryAction(action);
    if (redoAction) this.pushRedoAction(redoAction);
    showToast('一つ戻しました');
  } finally {
    this.isApplyingUndo = false;
  }
}
redoLastAction() {
  const action = this.redoHistory.pop();
  if (!action) {
    showToast('進められる操作がありません');
    return;
  }

  this.isApplyingUndo = true;
  try {
    const undoAction = this.applyHistoryAction(action);
    if (undoAction) this.undoHistory.push(undoAction);
    showToast('一つ先に戻しました');
  } finally {
    this.isApplyingUndo = false;
  }
}
deleteSelectedNode() {
  const node = this.selectedNode;
  if (!node) {
    console.debug('[DiagramTool] deleteSelectedNode called but no selection');
    showToast('削除する図形を選択してください');
    return;
  }

  console.debug('[DiagramTool] deleting node', node.id);
  const snapshotNode = { ...node };
  const snapshotConnections = this.connections
    .filter(conn => conn.from === node.id || conn.to === node.id)
    .map(conn => ({ ...conn }));
  this.detachNode(node.id);
  this.pushUndoAction({
    type: 'restoreNode',
    node: snapshotNode,
    connections: snapshotConnections,
  });
  this.deselectAll();
  this.drawConnections();
  showToast('選択した図形を削除しました');
}
initTextStyleControls() {
  this.fontSizeControl = document.getElementById(this.prefix + '-font-size');
  this.textColorButton = document.getElementById(this.prefix + '-text-color-btn');
  this.textColorSample = document.getElementById(this.prefix + '-text-color-sample');
  this.textColorText = document.getElementById(this.prefix + '-text-color-text');
  this.textColorMenu = document.getElementById(this.prefix + '-text-color-menu');
  this.themeRow = document.getElementById(this.prefix + '-theme-row');
  this.shadeGrid = document.getElementById(this.prefix + '-shade-grid');
  this.standardRow = document.getElementById(this.prefix + '-standard-row');
  this.otherColorButton = document.getElementById(this.prefix + '-other-color-btn');
  this.textColorPicker = document.getElementById(this.prefix + '-text-color-picker');
  if (!this.fontSizeControl || !this.textColorButton || !this.textColorMenu || !this.textColorPicker) return;

  this.buildColorPalette();

  const applyCurrent = () => {
    const node = this.selectedNode;
    if (!node) return;
    node.textSize = parseInt(this.fontSizeControl.value, 10) || this.defaultTextStyle.fontSize;
    const selectedColor = this.getSelectedTextColor();
    node.textColor = selectedColor || this.defaultTextStyle.color;
    const labelEl = document.getElementById(node.id)?.querySelector('.node-label');
    if (labelEl) this.applyNodeTextStyle(node, labelEl);
    this.refreshTextColorButton(node.textColor);
  };

  this.fontSizeControl.addEventListener('change', applyCurrent);
  this.textColorMenu.addEventListener('click', e => {
    const option = e.target.closest('[data-color]');
    if (!option) return;
    const selectedColor = option.dataset.color || '';
    const node = this.selectedNode;
    const previousState = node ? { textSize: node.textSize, textColor: node.textColor } : null;
    this.setTextColor(selectedColor);
    applyCurrent();
    if (node && previousState) {
      this.pushUndoAction({
        type: 'styleNode',
        nodeId: node.id,
        textSize: previousState.textSize,
        textColor: previousState.textColor,
      });
    }
    this.textColorPicker.open = false;
  });

  // カスタムカラーピッカーの初期化
  this.customColorGradient = document.getElementById(this.prefix + '-color-gradient');
  this.customColorGradientMarker = document.getElementById(this.prefix + '-color-gradient-marker');
  this.customColorHue = document.getElementById(this.prefix + '-color-hue');
  this.customColorHueMarker = document.getElementById(this.prefix + '-color-hue-marker');
  this.customColorHex = document.getElementById(this.prefix + '-color-hex');
  this.customColorPreview = document.getElementById(this.prefix + '-color-preview');

  if (this.customColorGradient && this.customColorHue && this.customColorHex && this.customColorPreview) {
    this.customColorState = this.customColorState || {
      hue: 0,
      saturation: 100,
      lightness: 50,
      dragState: null,
      activeControl: null,
    };

    const syncCustomColorUI = () => {
      const state = this.customColorState;
      this.customColorGradient.style.background = `linear-gradient(to bottom, hsl(${state.hue}, 100%, 100%) 0%, hsl(${state.hue}, 100%, 50%) 50%, hsl(${state.hue}, 100%, 0%) 100%)`;
      const hexColor = this.hslToHex(state.hue, state.saturation, state.lightness);
      this.customColorHex.value = hexColor;
      this.customColorPreview.style.background = hexColor;
      if (this.customColorGradientMarker) {
        this.customColorGradientMarker.style.left = `${state.saturation}%`;
        this.customColorGradientMarker.style.top = `${100 - state.lightness}%`;
      }
      if (this.customColorHueMarker) {
        this.customColorHueMarker.style.top = `${Math.max(0, Math.min(100, (state.hue / 360) * 100))}%`;
      }
      return hexColor;
    };

    const applyCustomColor = () => {
      const hexColor = syncCustomColorUI();
      this.setTextColor(hexColor);
      applyCurrent();
      return hexColor;
    };

    const updateStateFromHex = (hex) => {
      const rgb = this.hexToRgb(hex);
      if (!rgb) return false;
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      this.customColorState.hue = hsl.h;
      this.customColorState.saturation = hsl.s;
      this.customColorState.lightness = hsl.l;
      syncCustomColorUI();
      return true;
    };

    this.syncCustomColorPickerFromHex = (hex) => updateStateFromHex(hex);
    updateStateFromHex(this.selectedTextColor || this.defaultTextStyle.color);

    const beginDrag = (control) => {
      const node = this.selectedNode;
      this.customColorState.dragState = node ? { textSize: node.textSize, textColor: node.textColor } : null;
      this.customColorState.activeControl = control;
    };

    const finishDrag = () => {
      const state = this.customColorState.dragState;
      const node = this.selectedNode;
      if (state && node && (node.textSize !== state.textSize || node.textColor !== state.textColor)) {
        this.pushUndoAction({
          type: 'styleNode',
          nodeId: node.id,
          textSize: state.textSize,
          textColor: state.textColor,
        });
      }
      this.customColorState.dragState = null;
      this.customColorState.activeControl = null;
    };

    const updateFromGradientPoint = (clientX, clientY) => {
      const rect = this.customColorGradient.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      this.customColorState.saturation = Math.round((x / rect.width) * 100);
      this.customColorState.lightness = Math.round(100 - (y / rect.height) * 100);
      applyCustomColor();
    };

    const updateFromHuePoint = (clientY) => {
      const rect = this.customColorHue.getBoundingClientRect();
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const percentage = Math.max(0, Math.min(1, y / rect.height));
      this.customColorState.hue = Math.round(percentage * 360);
      syncCustomColorUI();
      applyCustomColor();
    };

    const onPointerMove = (event) => {
      if (this.customColorState.activeControl === 'gradient') {
        updateFromGradientPoint(event.clientX, event.clientY);
      } else if (this.customColorState.activeControl === 'hue') {
        updateFromHuePoint(event.clientY);
      }
    };

    const endPointerDrag = () => {
      finishDrag();
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', endPointerDrag);
      document.removeEventListener('pointercancel', endPointerDrag);
    };

    const startPointerDrag = (control, event) => {
      event.preventDefault();
      event.stopPropagation();
      beginDrag(control);
      if (control === 'gradient') {
        updateFromGradientPoint(event.clientX, event.clientY);
      } else {
        updateFromHuePoint(event.clientY);
      }
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', endPointerDrag, { once: true });
      document.addEventListener('pointercancel', endPointerDrag, { once: true });
    };

    this.customColorGradient.addEventListener('pointerdown', e => startPointerDrag('gradient', e));
    this.customColorHue.addEventListener('pointerdown', e => startPointerDrag('hue', e));

    this.customColorHex.addEventListener('input', (e) => {
      let hex = e.target.value.trim();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
      if (updateStateFromHex(hex)) {
        this.setTextColor(hex);
        applyCurrent();
      }
    });
  }
  if (this.otherColorButton) {
    const nativeColorInput = document.createElement('input');
    nativeColorInput.type = 'color';
    nativeColorInput.value = '#e5e7eb';
    nativeColorInput.style.display = 'none';
    document.body.appendChild(nativeColorInput);

    this.otherColorButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      nativeColorInput.value = this.selectedTextColor || '#e5e7eb';
      nativeColorInput.click();
    }, true);

    nativeColorInput.addEventListener('change', () => {
      const selectedColor = nativeColorInput.value;
      const node = this.selectedNode;
      const previousState = node ? { textSize: node.textSize, textColor: node.textColor } : null;
      this.setTextColor(selectedColor);
      applyCurrent();
      if (node && previousState) {
        this.pushUndoAction({
          type: 'styleNode',
          nodeId: node.id,
          textSize: previousState.textSize,
          textColor: previousState.textColor,
        });
      }
      this.textColorPicker.open = false;
    });
  }
  document.addEventListener('click', e => {
    if (!this.textColorPicker.contains(e.target)) {
      this.textColorPicker.open = false;
    }
  });
  this.refreshTextColorButton(this.defaultTextStyle.color);
}
setTextColor(color) {
  this.selectedTextColor = color || '';
  this.updatePaletteSelection();
}
getSelectedTextColor() {
  return this.selectedTextColor || '';
}
refreshTextColorButton(color) {
  if (!this.textColorButton || !this.textColorSample || !this.textColorText) return;
  const isAuto = !color || color === this.defaultTextStyle.color;
  const activeColor = isAuto ? this.defaultTextStyle.color : color;
  const activeOption = isAuto ? this.textColorMenu?.querySelector('.diagram-color-auto-row') : this.textColorMenu?.querySelector(`.diagram-color-option[data-color="${activeColor}"]`);
  this.textColorSample.style.background = activeColor;
  this.textColorText.textContent = activeOption?.dataset.label || (isAuto ? '自動' : color);
  this.setTextColor(isAuto ? '' : color);
  if (typeof this.syncCustomColorPickerFromHex === 'function') {
    this.syncCustomColorPickerFromHex(activeColor);
  }
}
hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return this.rgbToHex(r, g, b);
}
buildColorPalette() {
  if (!this.themeRow || !this.shadeGrid || !this.standardRow) return;
  const themeColors = [
    { label: '黒', color: '#111111', shades: ['#f3f4f6', '#d1d5db', '#6b7280', '#111111'] },
    { label: '赤', color: '#ef4444', shades: ['#fee2e2', '#fca5a5', '#ef4444', '#991b1b'] },
    { label: '灰', color: '#9ca3af', shades: ['#f3f4f6', '#d1d5db', '#9ca3af', '#4b5563'] },
    { label: '青', color: '#3b82f6', shades: ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'] },
    { label: '水色', color: '#60a5fa', shades: ['#dbeafe', '#bfdbfe', '#60a5fa', '#2563eb'] },
    { label: '橙', color: '#f97316', shades: ['#ffedd5', '#fdba74', '#f97316', '#c2410c'] },
    { label: '銀', color: '#a3a3a3', shades: ['#f5f5f5', '#e5e7eb', '#a3a3a3', '#525252'] },
    { label: '黄', color: '#facc15', shades: ['#fef9c3', '#fde68a', '#facc15', '#ca8a04'] },
    { label: '青系', color: '#60a5fa', shades: ['#eff6ff', '#dbeafe', '#60a5fa', '#1d4ed8'] },
    { label: '緑', color: '#84cc16', shades: ['#ecfccb', '#bef264', '#84cc16', '#3f6212'] },
  ];
  const standardColors = ['#dc2626', '#ff0000', '#f59e0b', '#ffea00', '#84cc16', '#10b981', '#06b6d4', '#0284c7', '#1d4ed8', '#7c3aed'];

  this.themeRow.innerHTML = themeColors.map(item => `
      <button type="button" class="diagram-color-option" data-color="${item.color}" data-label="${item.label}">
        <span class="diagram-color-option-swatch" style="background:${item.color}"></span>
      </button>
    `).join('');

  this.shadeGrid.innerHTML = themeColors.map(item => `
      <div class="diagram-color-shade-column" data-label="${item.label}">
        ${item.shades.map((shade, index) => `<button type="button" class="diagram-color-shade-option" data-color="${shade}" data-label="${item.label} ${index + 1}" style="background:${shade}"></button>`).join('')}
      </div>
    `).join('');

  this.standardRow.innerHTML = standardColors.map((color, index) => `
      <button type="button" class="diagram-color-option" data-color="${color}" data-label="標準 ${index + 1}">
        <span class="diagram-color-option-swatch" style="background:${color}"></span>
      </button>
    `).join('');
}
updatePaletteSelection() {
  if (!this.textColorMenu) return;
  this.textColorMenu.querySelectorAll('[data-color]').forEach(option => {
    option.classList.toggle('is-active', (option.dataset.color || '') === this.selectedTextColor);
  });
}
applyNodeTextStyle(node, labelEl) {
  if (!node || !labelEl) return;
  labelEl.style.fontSize = `${node.textSize || this.defaultTextStyle.fontSize}px`;
  labelEl.style.color = node.textColor || this.defaultTextStyle.color;
}
syncTextStyleControls(node) {
  if (!node || !this.fontSizeControl || !this.textColorButton) return;
  this.fontSizeControl.value = String(node.textSize || this.defaultTextStyle.fontSize);
  this.refreshTextColorButton(node.textColor || this.defaultTextStyle.color);
}
normalizeColor(color) {
  const fallback = this.defaultTextStyle.color;
  if (!color) return fallback;
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return fallback;
  const toHex = value => Number(value).toString(16).padStart(2, '0');
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}
drawConnections() {
  const p = this.prefix;
  // SVGマーカー定義（各接続タイプ用）
  this.svg.innerHTML = `<defs>
      <marker id="arrow-${p}" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed"/></marker>
      <marker id="arrow-open-${p}" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" style="fill:var(--bg-card, #111827)" stroke="#7c3aed" stroke-width="1.5"/></marker>
      <marker id="arrow-vee-${p}" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto"><path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></marker>
      <marker id="diamond-empty-${p}" markerWidth="14" markerHeight="10" refX="0" refY="5" orient="auto"><polygon points="0 5, 7 0, 14 5, 7 10" style="fill:var(--bg-card, #111827)" stroke="#7c3aed" stroke-width="1.5"/></marker>
      <marker id="lollipop-${p}" markerWidth="14" markerHeight="14" refX="0" refY="7" orient="auto"><circle cx="7" cy="7" r="6" style="fill:var(--bg-card, #111827)" stroke="#7c3aed" stroke-width="1.5"/></marker>
      <marker id="socket-${p}" markerWidth="10" markerHeight="16" refX="8" refY="8" orient="auto"><path d="M 0 1 A 7 7 0 0 1 0 15" fill="none" stroke="#7c3aed" stroke-width="1.5"/></marker>
      <marker id="diamond-fill-${p}" markerWidth="14" markerHeight="10" refX="0" refY="5" orient="auto"><polygon points="0 5, 7 0, 14 5, 7 10" fill="#7c3aed" stroke="#7c3aed" stroke-width="1"/></marker>
      <marker id="triangle-empty-${p}" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto"><polygon points="0 0, 12 5, 0 10" style="fill:var(--bg-card, #111827)" stroke="#7c3aed" stroke-width="1.5"/></marker>
      <marker id="x-mark-${p}" markerWidth="10" markerHeight="10" refX="0" refY="5" orient="auto"><circle cx="5" cy="5" r="4" style="fill:var(--bg-card, #111827)" stroke="none"/><line x1="2" y1="2" x2="8" y2="8" stroke="#7c3aed" stroke-width="2"/><line x1="8" y1="2" x2="2" y2="8" stroke="#7c3aed" stroke-width="2"/></marker>
    </defs>`;

  this.canvas.querySelectorAll('.diagram-conn-label, .diagram-conn-multiplicity, .diagram-conn-port').forEach(el => el.remove());

  // ── 全ノードの接続点分散用: 各面（上下左右）の接続数を事前集計 ──
  const isBarNode = (node) => {
    if (!node) return false;
    const bt = node.behaviorType;
    return bt === 'fork' || bt === 'join' || bt === 'stateFork' || bt === 'stateJoin';
  };

  const nodeSideCounts = {}; 

  this.connections.forEach(conn => {
    const fromNode = this.nodes.find(n => n.id === conn.from);
    const toNode = this.nodes.find(n => n.id === conn.to);
    const fromEl = document.getElementById(conn.from);
    const toEl = document.getElementById(conn.to);
    if (!fromEl || !toEl) return;
    const cr = this.canvas.getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();
    const cx1 = fr.left + fr.width / 2 - cr.left;
    const cy1 = fr.top + fr.height / 2 - cr.top;
    const cx2 = tr.left + tr.width / 2 - cr.left;
    const cy2 = tr.top + tr.height / 2 - cr.top;

    const isHorizontal = Math.abs(cx2 - cx1) > Math.abs(cy2 - cy1);
    
    if (!nodeSideCounts[conn.from]) nodeSideCounts[conn.from] = { top: 0, bottom: 0, left: 0, right: 0, topIdx: 0, bottomIdx: 0, leftIdx: 0, rightIdx: 0 };
    if (!nodeSideCounts[conn.to]) nodeSideCounts[conn.to] = { top: 0, bottom: 0, left: 0, right: 0, topIdx: 0, bottomIdx: 0, leftIdx: 0, rightIdx: 0 };
    
    // from側
    if (isBarNode(fromNode)) {
      if (cy2 >= cy1) nodeSideCounts[conn.from].bottom++;
      else nodeSideCounts[conn.from].top++;
    } else {
      if (isHorizontal) {
        if (cx1 < cx2) nodeSideCounts[conn.from].right++;
        else nodeSideCounts[conn.from].left++;
      } else {
        if (cy1 < cy2) nodeSideCounts[conn.from].bottom++;
        else nodeSideCounts[conn.from].top++;
      }
    }

    // to側
    if (isBarNode(toNode)) {
      if (cy1 <= cy2) nodeSideCounts[conn.to].top++;
      else nodeSideCounts[conn.to].bottom++;
    } else {
      if (isHorizontal) {
        if (cx1 < cx2) nodeSideCounts[conn.to].left++;
        else nodeSideCounts[conn.to].right++;
      } else {
        if (cy1 < cy2) nodeSideCounts[conn.to].top++;
        else nodeSideCounts[conn.to].bottom++;
      }
    }
  });

  const getOffset = (nodeId, side, length, isBar) => {
    const counts = nodeSideCounts[nodeId];
    if (!counts) return 0;
    const total = counts[side];
    if (total <= 1) return 0;
    const idx = counts[side + 'Idx']++;
    
    if (isBar) {
      const margin = length * 0.15;
      const usable = length - margin * 2;
      return margin + usable * (idx + 1) / (total + 1) - (length / 2);
    }
    
    const maxSpread = length * 0.6;
    const spacing = Math.min(24, maxSpread / Math.max(1, total - 1));
    return -(total - 1) * spacing / 2 + idx * spacing;
  };

  this.connections.forEach(conn => {
    if (!conn.id) conn.id = this.prefix + '_conn_' + (this.connIdCounter++);
    const fromEl = document.getElementById(conn.from);
    const toEl = document.getElementById(conn.to);
    if (!fromEl || !toEl) return;
    const cr = this.canvas.getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();
    const cx1 = fr.left + fr.width / 2 - cr.left;
    const cy1 = fr.top + fr.height / 2 - cr.top;
    const cx2 = tr.left + tr.width / 2 - cr.left;
    const cy2 = tr.top + tr.height / 2 - cr.top;

    let x1 = cx1, y1 = cy1, x2 = cx2, y2 = cy2;
    const isHorizontal = Math.abs(cx2 - cx1) > Math.abs(cy2 - cy1);

    // シーケンス図: ライフライン間のメッセージは自動的に水平にする
    const seqLib = window.SequenceDiagramLibrary;
    const fromNode = this.nodes.find(n => n.id === conn.from);
    const toNode = this.nodes.find(n => n.id === conn.to);
    const isSeqMessage = seqLib && this.umlType === 'sequence' &&
      (seqLib.isSequenceNode(fromNode) && seqLib.isSequenceNode(toNode));

    // fromNodeの接続点計算
    if (isBarNode(fromNode)) {
      if (cy2 >= cy1) {
        y1 = cy1 + fr.height / 2;
        x1 += getOffset(conn.from, 'bottom', fr.width, true);
      } else {
        y1 = cy1 - fr.height / 2;
        x1 += getOffset(conn.from, 'top', fr.width, true);
      }
    } else {
      if (isHorizontal) {
        if (cx1 < cx2) {
          x1 = cx1 + fr.width / 2;
          y1 += getOffset(conn.from, 'right', fr.height, false);
        } else {
          x1 = cx1 - fr.width / 2;
          y1 += getOffset(conn.from, 'left', fr.height, false);
        }
      } else {
        if (cy1 < cy2) {
          y1 = cy1 + fr.height / 2;
          x1 += getOffset(conn.from, 'bottom', fr.width, false);
        } else {
          y1 = cy1 - fr.height / 2;
          x1 += getOffset(conn.from, 'top', fr.width, false);
        }
      }
    }

    // toNodeの接続点計算
    if (isBarNode(toNode)) {
      if (cy1 <= cy2) {
        y2 = cy2 - tr.height / 2;
        x2 += getOffset(conn.to, 'top', tr.width, true);
      } else {
        y2 = cy2 + tr.height / 2;
        x2 += getOffset(conn.to, 'bottom', tr.width, true);
      }
    } else {
      if (isHorizontal) {
        if (cx1 < cx2) {
          x2 = cx2 - tr.width / 2;
          y2 += getOffset(conn.to, 'left', tr.height, false);
        } else {
          x2 = cx2 + tr.width / 2;
          y2 += getOffset(conn.to, 'right', tr.height, false);
        }
      } else {
        if (cy1 < cy2) {
          y2 = cy2 - tr.height / 2;
          x2 += getOffset(conn.to, 'top', tr.width, false);
        } else {
          y2 = cy2 + tr.height / 2;
          x2 += getOffset(conn.to, 'bottom', tr.width, false);
        }
      }
    }

    // シーケンス図水平補正: Y座標を揃える
    if (isSeqMessage) {
      y2 = y1;
    }

    // オフセット計算（斜め配置でもベクトル方向に沿って短縮し、マーカーが浮いたりめり込んだりするのを防ぐ）
    if (conn.connType === 'required') {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        x1 += (dx / len) * 8;
        y1 += (dy / len) * 8;
      }
    }

    let dStr = '';
    let midX, midY;
    const routing = conn.routing || 'straight';

    if (conn.from === conn.to) {
      // 自己ループ（同一ノード内のメッセージ呼び出し）
      const nodeW = fr.width || 120;
      const nodeH = fr.height || 60;
      // ノードの上部から出て、上部に戻る「コ」の字型のループ
      const topCenterX = cx1;
      const topCenterY = cy1 - nodeH / 2;
      
      const loopH = 30; // ループの飛び出し高さ
      const loopW = 40; // ループの横幅
      
      const lx1 = topCenterX - loopW / 2;
      const ly1 = topCenterY;
      const lx2 = topCenterX - loopW / 2;
      const ly2 = topCenterY - loopH;
      const lx3 = topCenterX + loopW / 2;
      const ly3 = topCenterY - loopH;
      const lx4 = topCenterX + loopW / 2;
      const ly4 = topCenterY;
      
      dStr = `M ${lx1} ${ly1} L ${lx2} ${ly2} L ${lx3} ${ly3} L ${lx4} ${ly4}`;
      midX = topCenterX;
      midY = topCenterY - loopH - 12; // ラベルをループの上に配置
    } else if (routing === 'orthogonal') {
      // 障害物回避 直交ルーティング
      const PAD = 15; // ノードからの迂回余白
      const STUB = 10; // ノードから出る際の直進距離

      // 接続元・先以外の全ノードの矩形を収集
      const obstacles = [];
      this.nodes.forEach(n => {
        if (n.id === conn.from || n.id === conn.to) return;
        const nEl = document.getElementById(n.id);
        if (!nEl) return;
        const nr = nEl.getBoundingClientRect();
        obstacles.push({
          left: nr.left - cr.left - PAD,
          right: nr.left - cr.left + nr.width + PAD,
          top: nr.top - cr.top - PAD,
          bottom: nr.top - cr.top + nr.height + PAD,
        });
      });

      // 線分が矩形に衝突するか判定
      const segHitsRect = (ax, ay, bx, by, r) => {
        if (ay === by) { // 水平
          const minX = Math.min(ax, bx), maxX = Math.max(ax, bx);
          return ay > r.top && ay < r.bottom && maxX > r.left && minX < r.right;
        }
        if (ax === bx) { // 垂直
          const minY = Math.min(ay, by), maxY = Math.max(ay, by);
          return ax > r.left && ax < r.right && maxY > r.top && minY < r.bottom;
        }
        return false;
      };

      // 経路セグメント群が障害物にヒットした数を返す
      const getHitsCount = (segments) => {
        let count = 0;
        for (const obs of obstacles) {
          for (const seg of segments) {
            if (segHitsRect(seg[0], seg[1], seg[2], seg[3], obs)) {
              count++;
              break;
            }
          }
        }
        return count;
      };

      const toSegments = (wp) => {
        const segs = [];
        for (let i = 0; i < wp.length - 1; i++) {
          segs.push([wp[i][0], wp[i][1], wp[i + 1][0], wp[i + 1][1]]);
        }
        return segs;
      };

      // スタブ（直進区間）の終点を計算
      let s1x = x1, s1y = y1, s2x = x2, s2y = y2;
      if (isHorizontal) {
        const dir1 = cx1 < cx2 ? 1 : -1;
        const dir2 = cx1 < cx2 ? -1 : 1;
        s1x += dir1 * STUB;
        s2x += dir2 * STUB;
      } else {
        const dir1 = cy1 < cy2 ? 1 : -1;
        const dir2 = cy1 < cy2 ? -1 : 1;
        s1y += dir1 * STUB;
        s2y += dir2 * STUB;
      }

      // 基本パスの生成
      const createPath = (start, end, horizontalFirst) => {
        const [x1_s, y1_s] = start;
        const [x2_s, y2_s] = end;
        const res = [[x1, y1], start];
        if (horizontalFirst) {
          const hx = x1_s + (x2_s - x1_s) / 2;
          res.push([hx, y1_s], [hx, y2_s]);
        } else {
          const hy = y1_s + (y2_s - y1_s) / 2;
          res.push([x1_s, hy], [x2_s, hy]);
        }
        res.push(end, [x2, y2]);
        return res;
      };

      let waypoints = createPath([s1x, s1y], [s2x, s2y], isHorizontal);
      let bestHits = getHitsCount(toSegments(waypoints));

      if (obstacles.length > 0 && bestHits > 0) {
        const hitObstacles = obstacles.filter(obs => {
          for (const seg of toSegments(waypoints)) {
            if (segHitsRect(seg[0], seg[1], seg[2], seg[3], obs)) return true;
          }
          return false;
        });

        let bestPath = waypoints;

        // 候補1: L字に近いパスや別軸のZ字を試す
        const altCandidates = [
          createPath([s1x, s1y], [s2x, s2y], !isHorizontal),
          [[x1, y1], [s1x, s1y], [s2x, s1y], [s2x, s2y], [x2, y2]], // L字1ベース
          [[x1, y1], [s1x, s1y], [s1x, s2y], [s2x, s2y], [x2, y2]]  // L字2ベース
        ];

        for (const alt of altCandidates) {
          const hits = getHitsCount(toSegments(alt));
          if (hits < bestHits) {
            bestHits = hits;
            bestPath = alt;
          }
          if (bestHits === 0) break;
        }

        // 候補2: 迂回
        if (bestHits > 0) {
          for (const obs of hitObstacles) {
            const detours = [];
            if (isHorizontal) {
              detours.push([[x1, y1], [s1x, y1], [s1x, obs.top], [s2x, obs.top], [s2x, y2], [x2, y2]]);
              detours.push([[x1, y1], [s1x, y1], [s1x, obs.bottom], [s2x, obs.bottom], [s2x, y2], [x2, y2]]);
            } else {
              detours.push([[x1, y1], [x1, s1y], [obs.left, s1y], [obs.left, s2y], [x2, s2y], [x2, y2]]);
              detours.push([[x1, y1], [x1, s1y], [obs.right, s1y], [obs.right, s2y], [x2, s2y], [x2, y2]]);
            }
            for (const dp of detours) {
              const hits = getHitsCount(toSegments(dp));
              if (hits < bestHits) {
                bestHits = hits;
                bestPath = dp;
              }
              if (bestHits === 0) break;
            }
            if (bestHits === 0) break;
          }
        }
        waypoints = bestPath;
      }

      dStr = 'M ' + waypoints.map(wp => `${wp[0]} ${wp[1]}`).join(' L ');
      const midIdx = Math.floor(waypoints.length / 2);
      const p1 = waypoints[midIdx - 1], p2 = waypoints[midIdx];
      midX = (p1[0] + p2[0]) / 2;
      midY = (p1[1] + p2[1]) / 2;

    } else if (routing === 'curve') {
      if (isHorizontal) {
        const hx = x1 + (x2 - x1) / 2;
        dStr = `M ${x1} ${y1} C ${hx} ${y1}, ${hx} ${y2}, ${x2} ${y2}`;
        midX = hx;
        midY = y1 + (y2 - y1) / 2;
      } else {
        const hy = y1 + (y2 - y1) / 2;
        dStr = `M ${x1} ${y1} C ${x1} ${hy}, ${x2} ${hy}, ${x2} ${y2}`;
        midX = x1 + (x2 - x1) / 2;
        midY = hy;
      }
    } else {
      if (conn.manualMid) {
        // 手動で動かされた中点がある場合、折れ線にする
        const mx = conn.manualMid.x;
        const my = conn.manualMid.y;
        dStr = `M ${x1} ${y1} L ${mx} ${my} L ${x2} ${y2}`;
        midX = mx;
        midY = my;
      } else {
        dStr = `M ${x1} ${y1} L ${x2} ${y2}`;
        midX = (x1 + x2) / 2;
        midY = (y1 + y2) / 2;
      }
    }

    const connType = conn.connType || 'association';
    const isSelected = this.selectedConnection === conn;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', dStr);
    path.setAttribute('stroke', isSelected ? '#f59e0b' : '#7c3aed');
    path.setAttribute('stroke-width', isSelected ? '3' : '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('pointer-events', 'visibleStroke');
    path.setAttribute('opacity', '0.8');
    path.style.cursor = 'pointer';
    path.addEventListener('mousedown', e => {
      e.stopPropagation();
      this.selectConnection(conn);
    });

    const arrowDir = conn.arrowDirection || 'one-way';

    if (arrowDir === 'none') {
      // 矢印なし
    } else if (arrowDir === 'two-way') {
      path.setAttribute('marker-start', `url(#arrow-open-${p})`);
      path.setAttribute('marker-end', `url(#arrow-${p})`);
    } else {
      // one-way
      switch (connType) {
        case 'association':
        case 'link':
          // 実線のみ
          break;
        case 'sync-msg':
          path.setAttribute('marker-end', `url(#arrow-${p})`);
          break;
        case 'async-msg':
          path.setAttribute('marker-end', `url(#arrow-vee-${p})`);
          break;
        case 'reply-msg':
          path.setAttribute('stroke-dasharray', '6 3');
          path.setAttribute('marker-end', `url(#arrow-vee-${p})`);
          break;
        case 'aggregation':
          path.setAttribute('marker-start', `url(#diamond-empty-${p})`);
          break;
        case 'provided':
          path.setAttribute('marker-start', `url(#lollipop-${p})`);
          break;
        case 'required':
          path.setAttribute('marker-start', `url(#socket-${p})`);
          break;
        case 'composition':
          path.setAttribute('marker-start', `url(#diamond-fill-${p})`);
          break;
        case 'dependency':
        case 'deploy':
        case 'manifest':
          path.setAttribute('stroke-dasharray', '6 3');
          path.setAttribute('marker-end', `url(#arrow-open-${p})`);
          break;
        case 'dashed':
          path.setAttribute('stroke-dasharray', '6 3');
          break;
        case 'generalization':
          path.setAttribute('marker-end', `url(#triangle-empty-${p})`);
          break;
        case 'realization':
          path.setAttribute('stroke-dasharray', '6 3');
          path.setAttribute('marker-end', `url(#triangle-empty-${p})`);
          break;
        case 'navigable':
          path.setAttribute('marker-start', `url(#x-mark-${p})`);
          path.setAttribute('marker-end', `url(#arrow-open-${p})`);
          break;
        default:
          path.setAttribute('marker-end', `url(#arrow-${p})`);
      }
    }

    if (conn.lineStyle === 'dashed') {
      path.setAttribute('stroke-dasharray', '5 5');
    }

    this.svg.appendChild(path);

    // ポート・プロトコル表示 (モードに応じた表示)
    const portMode = conn.portMode || 'single';

    if (portMode === 'single') {
      if (conn.portProtocol && conn.portProtocol.trim() !== '') {
        const portDiv = document.createElement('div');
        portDiv.className = 'diagram-conn-port';
        portDiv.textContent = conn.portProtocol;
        let px, py;
        if (conn.manualMid) {
          px = conn.manualMid.x;
          py = conn.manualMid.y;
        } else {
          px = (x1 + x2) / 2;
          py = (y1 + y2) / 2;
        }
        portDiv.style.left = px + 'px';
        portDiv.style.top = py + 'px';
        this.canvas.appendChild(portDiv);
      }
    } else {
      let pxFrom, pyFrom, pxTo, pyTo;
      if (conn.manualMid) {
        const mx = conn.manualMid.x;
        const my = conn.manualMid.y;
        pxFrom = x1 + (mx - x1) * 0.5;
        pyFrom = y1 + (my - y1) * 0.5;
        pxTo = mx + (x2 - mx) * 0.5;
        pyTo = my + (y2 - my) * 0.5;
      } else {
        pxFrom = x1 + (x2 - x1) * 0.25;
        pyFrom = y1 + (y2 - y1) * 0.25;
        pxTo = x1 + (x2 - x1) * 0.75;
        pyTo = y1 + (y2 - y1) * 0.75;
      }

      if (conn.portFrom && conn.portFrom.trim() !== '') {
        const portDiv = document.createElement('div');
        portDiv.className = 'diagram-conn-port';
        portDiv.textContent = conn.portFrom;
        portDiv.style.left = pxFrom + 'px';
        portDiv.style.top = pyFrom + 'px';
        this.canvas.appendChild(portDiv);
      }

      if (conn.portTo && conn.portTo.trim() !== '') {
        const portDiv = document.createElement('div');
        portDiv.className = 'diagram-conn-port';
        portDiv.textContent = conn.portTo;
        portDiv.style.left = pxTo + 'px';
        portDiv.style.top = pyTo + 'px';
        this.canvas.appendChild(portDiv);
      }
    }


    // ラベル表示
    if (conn.label) {
      const labelDiv = document.createElement('div');
      labelDiv.className = 'diagram-conn-label' + (isSelected ? ' selected' : '');
      labelDiv.textContent = conn.label;
      labelDiv.style.left = midX + 'px';
      labelDiv.style.top = midY + 'px';
      labelDiv.addEventListener('mousedown', e => {
        e.stopPropagation();
        this.selectConnection(conn);
      });
      this.canvas.appendChild(labelDiv);
    }

    // 中点ドラッグハンドル (選択中のみ表示)
    if (isSelected && routing === 'straight') {
      const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      handle.setAttribute('cx', midX);
      handle.setAttribute('cy', midY);
      handle.setAttribute('r', '6');
      handle.setAttribute('fill', '#f59e0b');
      handle.setAttribute('stroke', '#fff');
      handle.setAttribute('stroke-width', '2');
      handle.style.cursor = 'move';
      let hDragging = false;
      handle.addEventListener('mousedown', e => {
        e.stopPropagation();
        e.preventDefault();
        hDragging = true;
        const onMouseMove = me => {
          if (!hDragging) return;
          const rect = this.canvas.getBoundingClientRect();
          conn.manualMid = {
            x: me.clientX - rect.left,
            y: me.clientY - rect.top
          };
          this.drawConnections();
        };
        const onMouseUp = () => {
          hDragging = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      this.svg.appendChild(handle);
    }

    // 多重度ラベル (multiplicityFrom / multiplicityTo)
    const multOffset = 18;
    if (conn.multiplicityFrom) {
      const mfDiv = document.createElement('div');
      mfDiv.className = 'diagram-conn-multiplicity';
      mfDiv.textContent = conn.multiplicityFrom;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      mfDiv.style.left = (x1 + Math.cos(angle) * 20 + Math.sin(angle) * multOffset) + 'px';
      mfDiv.style.top = (y1 + Math.sin(angle) * 20 - Math.cos(angle) * multOffset) + 'px';
      this.canvas.appendChild(mfDiv);
    }
    if (conn.multiplicityTo) {
      const mtDiv = document.createElement('div');
      mtDiv.className = 'diagram-conn-multiplicity';
      mtDiv.textContent = conn.multiplicityTo;
      const angle = Math.atan2(y1 - y2, x1 - x2);
      mtDiv.style.left = (x2 + Math.cos(angle) * 20 + Math.sin(angle) * multOffset) + 'px';
      mtDiv.style.top = (y2 + Math.sin(angle) * 20 - Math.cos(angle) * multOffset) + 'px';
      this.canvas.appendChild(mtDiv);
    }
  });
}
clearAll() {
  if (!confirm('キャンバスをクリアします。よろしいですか？')) {
    return;
  }
  const snapshot = this.captureSnapshot();
  this.nodes = []; this.connections = []; this.nodeIdCounter = 0;
  this.quickAddCounter = 0;
  this.canvas.querySelectorAll('.diagram-node').forEach(n => n.remove());
  this.svg.innerHTML = '';
  if (window.DBIO) window.DBIO.resetCurrentDiagram();
  this.pushUndoAction({ type: 'clearAll', snapshot });
  showToast('キャンバスをクリアしました');
}
openPaletteMenu() {
  const menuId = this.prefix + '-shape-menu';
  const toggleId = this.prefix + '-shape-toggle';
  const btnId = this.prefix + '-shape-add-btn';
  const tryOpen = () => {
    const menu = document.getElementById(menuId);
    const toggle = document.getElementById(toggleId);
    const btn = document.getElementById(btnId);
    if (menu) {
      menu.classList.add('open');
      // For architecture, dynamically position menu under the toolbar button
      if (this.prefix === 'arch' && btn) {
        const btnRect = btn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (btnRect.bottom + 8) + 'px';
        menu.style.left = (btnRect.left) + 'px';
        menu.style.width = 'auto';
        menu.style.zIndex = '100';
      }
      return true;
    }
    if (toggle) {
      toggle.click();
      return true;
    }
    return false;
  };
  if (!tryOpen()) {
    // Retry shortly until initPalette has created the DOM
    const retry = () => { if (!tryOpen()) setTimeout(retry, 60); };
    setTimeout(retry, 60);
  }
}

toggleAIChat() {
  const panel = document.getElementById(this.prefix + '-ai-chat-panel');
  if (!panel) return;

  const isOpen = panel.classList.toggle('open');
  if (isOpen) {
    this.closePropertyPanel();
    
    // 押し出し式連動: 右のチャットが開いたら左のサイドバーを隠す
    document.body.classList.add('sidebar-collapsed');
    
    const msgArea = document.getElementById(this.prefix + '-ai-chat-messages');
    if (msgArea) msgArea.scrollTop = msgArea.scrollHeight;
    this.initAIChatListeners();
  } else {
    // 押し出し式連動: チャットが閉じ、かつプロパティも閉じていれば左のサイドバーを復元
    const propPanel = document.getElementById(this.prefix + '-property-panel');
    const isPropOpen = propPanel && propPanel.classList.contains('open');
    if (!isPropOpen) {
      if (document.body.dataset.sidebarCollapsedByUser !== 'true') {
        document.body.classList.remove('sidebar-collapsed');
      }
    }
  }
}

initAIChatListeners() {
  if (this.aiChatListenersInitialized) return;

  const sendBtn = document.getElementById(this.prefix + '-ai-chat-send-btn');
  const input = document.getElementById(this.prefix + '-ai-chat-input');
  if (!sendBtn || !input) return;

  sendBtn.addEventListener('click', () => {
    this.sendAIChatMessage();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendAIChatMessage();
    }
  });

  this.aiChatListenersInitialized = true;
  this.chatHistory = [];
}

async sendAIChatMessage() {
  const input = document.getElementById(this.prefix + '-ai-chat-input');
  const msgArea = document.getElementById(this.prefix + '-ai-chat-messages');
  if (!input || !msgArea) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = '';

  const userMsgDiv = document.createElement('div');
  userMsgDiv.className = 'ai-chat-msg user';
  userMsgDiv.innerHTML = `<div class="ai-chat-bubble">${this.escapeHTML(text)}</div>`;
  msgArea.appendChild(userMsgDiv);
  msgArea.scrollTop = msgArea.scrollHeight;

  const loaderMsgDiv = document.createElement('div');
  loaderMsgDiv.className = 'ai-chat-msg assistant';
  loaderMsgDiv.innerHTML = `
    <div class="ai-chat-bubble" style="color: #9ca3af; display: flex; align-items: center; gap: 8px;">
      <span class="icon-spin" style="display:inline-block; width:12px; height:12px; border:2px solid #a78bfa; border-top-color:transparent; border-radius:50%; animation: spin 1s linear infinite;"></span>
      <span>AIが配置を再計算しています...</span>
    </div>
  `;
  msgArea.appendChild(loaderMsgDiv);
  msgArea.scrollTop = msgArea.scrollHeight;

  let diagramType = 'architecture';
  if (this.prefix === 'st') {
    diagramType = 'screen-transition';
  } else if (this.prefix === 'uml' && this.umlType) {
    diagramType = this.umlType;
  } else if (this.prefix === 'er') {
    diagramType = 'erdiagram';
  }

  const requestBody = {
    diagram_type: diagramType,
    nodes: this.nodes.map(n => ({
      id: n.id,
      label: n.label,
      x: n.x,
      y: n.y,
      width: n.width || 160,
      height: n.height || 50,
    })),
    existing_connections: this.connections.map(c => ({
      from: c.from,
      to: c.to,
      label: c.label || '',
    })),
    // ノード幅(約160px)+ラベル余白分を差し引き、右端のはみ出しを防止する
    canvas_width: (this.canvas.clientWidth || 1200) - 200,
    canvas_height: (this.canvas.clientHeight || 800) - 80,
    user_instruction: text,
    chat_history: this.chatHistory || []
  };

  // ローカル開発中の場合はローカルサーバーを優先的に向き先とし、それ以外はCloud Runの本番環境を見に行くように設定
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
  const apiBaseUrl = isLocal ? 'http://localhost:8000' : 'https://upstream-ai-backend-976977069035.us-central1.run.app';

  try {
    const response = await fetch(`${apiBaseUrl}/api/ai-chat-layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    loaderMsgDiv.remove();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `サーバーエラー (${response.status})`);
    }

    const result = await response.json();

    if (result.nodes && result.nodes.length > 0) {
      const duration = 400;
      const startTime = performance.now();
      const startPositions = {};
      const targetPositions = {};

      result.nodes.forEach(rn => {
        const node = this.nodes.find(n => n.id === rn.id);
        if (node) {
          startPositions[rn.id] = { x: node.x, y: node.y };
          targetPositions[rn.id] = { x: rn.x, y: rn.y };
        }
      });

      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        Object.keys(startPositions).forEach(nodeId => {
          const node = this.nodes.find(n => n.id === nodeId);
          const el = document.getElementById(nodeId);
          if (!node || !el) return;
          const start = startPositions[nodeId];
          const target = targetPositions[nodeId];
          node.x = start.x + (target.x - start.x) * easedProgress;
          node.y = start.y + (target.y - start.y) * easedProgress;
          el.style.left = node.x + 'px';
          el.style.top = node.y + 'px';
        });

        this.drawConnections();
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }

    const assistantMsgDiv = document.createElement('div');
    assistantMsgDiv.className = 'ai-chat-msg assistant';
    
    let adviceHtml = '';
    if (result.advice) {
      adviceHtml = `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.9em; line-height: 1.4;">
          <div style="font-weight: 600; color: #a78bfa; margin-bottom: 4px;">💡 構成の評価・アドバイス:</div>
          <div style="color: #e5e7eb;">${this.escapeHTML(result.advice)}</div>
        </div>
      `;
    }

    assistantMsgDiv.innerHTML = `
      <div class="ai-chat-bubble">
        指示されたレイアウト調整を適用しました！
        <ul>
          <li>指示: <em>「${this.escapeHTML(text)}」</em></li>
          <li>移動されたノード数: <strong>${result.nodes?.length || 0}</strong> 個</li>
        </ul>
        ${adviceHtml}
      </div>
    `;
    msgArea.appendChild(assistantMsgDiv);
    msgArea.scrollTop = msgArea.scrollHeight;

    this.chatHistory.push({ role: 'user', content: text });
    this.chatHistory.push({ role: 'model', content: `指示されたレイアウト調整を適用しました！移動ノード数: ${result.nodes?.length || 0}. アドバイス: ${result.advice || ''}` });

  } catch (error) {
    console.error('[AI Chat Layout] Error:', error);
    loaderMsgDiv.remove();

    const errorMsgDiv = document.createElement('div');
    errorMsgDiv.className = 'ai-chat-msg assistant';
    errorMsgDiv.innerHTML = `
      <div class="ai-chat-bubble" style="border-color: #f87171; background-color: rgba(239, 68, 68, 0.05);">
        <span style="color: #f87171; font-weight: 600;">⚠️ エラーが発生しました</span><br>
        ${this.escapeHTML(error.message)}
      </div>
    `;
    msgArea.appendChild(errorMsgDiv);
    msgArea.scrollTop = msgArea.scrollHeight;
  }
}

escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

autoLayout() {
  const cols = Math.ceil(Math.sqrt(this.nodes.length));
  this.nodes.forEach((n, i) => {
    n.x = 80 + (i % cols) * 200;
    n.y = 60 + Math.floor(i / cols) * 120;
    const el = document.getElementById(n.id);
    if (el) { el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; }
  });
  this.drawConnections();
  showToast('自動配置しました');
}

/**
 * AI自動配置＆自動接続
 * Pythonバックエンド（FastAPI + Gemini API）にノード情報を送信し、
 * AIが計算した最適な配置座標と接続情報を受け取って適用する。
 */
async aiAutoLayout() {
  // ノードがない場合は何もしない
  if (!this.nodes || this.nodes.length === 0) {
    showToast('配置するノードがありません');
    return;
  }

  // 操作前のスナップショットを保存（Undo対応）
  const snapshot = this.captureSnapshot();

  // diagram_type の決定
  let diagramType = 'architecture';
  if (this.prefix === 'st') {
    diagramType = 'screen-transition';
  } else if (this.prefix === 'uml' && this.umlType) {
    diagramType = this.umlType;
  } else if (this.prefix === 'er') {
    diagramType = 'erdiagram';
  }

  // リクエストボディの構築
  const requestBody = {
    diagram_type: diagramType,
    nodes: this.nodes.map(n => ({
      id: n.id,
      label: n.label,
      x: n.x,
      y: n.y,
      width: n.width || 160,
      height: n.height || 50,
    })),
    existing_connections: this.connections.map(c => ({
      from: c.from,
      to: c.to,
      label: c.label || '',
    })),
    // ノード幅(約160px)+ラベル余白分を差し引き、右端のはみ出しを防止する
    canvas_width: (this.canvas.clientWidth || 1200) - 200,
    canvas_height: (this.canvas.clientHeight || 800) - 80,
  };

  // ローディング表示
  showToast('🤖 AIが最適な配置を計算中...');

  try {
    // ローカル開発中の場合はローカルサーバーを優先的に向き先とし、それ以外はCloud Runの本番環境を見に行くように設定
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    const apiBaseUrl = isLocal ? 'http://localhost:8000' : 'https://upstream-ai-backend-976977069035.us-central1.run.app';

    const response = await fetch(`${apiBaseUrl}/api/ai-layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `サーバーエラー (${response.status})`);
    }

    const result = await response.json();

    // ── ノードのアニメーション移動 ──
    if (result.nodes && result.nodes.length > 0) {
      const duration = 400; // アニメーション時間（ms）
      const startTime = performance.now();

      // 各ノードの開始位置を記録
      const startPositions = {};
      const targetPositions = {};
      result.nodes.forEach(rn => {
        const node = this.nodes.find(n => n.id === rn.id);
        if (node) {
          startPositions[rn.id] = { x: node.x, y: node.y };
          targetPositions[rn.id] = { x: rn.x, y: rn.y };
        }
      });

      // イーズアウト関数
      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        // 各ノードの位置を更新
        Object.keys(startPositions).forEach(nodeId => {
          const node = this.nodes.find(n => n.id === nodeId);
          const el = document.getElementById(nodeId);
          if (!node || !el) return;

          const start = startPositions[nodeId];
          const target = targetPositions[nodeId];

          node.x = start.x + (target.x - start.x) * easedProgress;
          node.y = start.y + (target.y - start.y) * easedProgress;
          el.style.left = node.x + 'px';
          el.style.top = node.y + 'px';
        });

        this.drawConnections();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }

    // 適切なデフォルトルーティング（直角か直線か）を判定
    const isOrthogonalPreferred = ['architecture', 'class', 'component', 'deployment', 'activity', 'package', 'erdiagram', 'screen-transition'].includes(diagramType);
    const defaultRouting = isOrthogonalPreferred ? 'orthogonal' : 'straight';

    // 既存のすべての接続に対してもルーティングを自動適用
    this.connections.forEach(c => {
      c.routing = defaultRouting;
    });

    // ── 新しい接続の追加 ──
    if (result.connections && result.connections.length > 0) {
      // 既存の接続のセットを作成（重複チェック用）
      const existingSet = new Set(
        this.connections.map(c => `${c.from}__${c.to}`)
      );

      let addedCount = 0;
      result.connections.forEach(conn => {
        const fromId = conn.from;
        const toId = conn.to;
        const key = `${fromId}__${toId}`;
        const reverseKey = `${toId}__${fromId}`;

        // 重複チェック（順方向・逆方向の両方）
        if (!existingSet.has(key) && !existingSet.has(reverseKey)) {
          // connIdCounter を使って一意のIDを付与
          const connId = this.prefix + '_conn_' + (this.connIdCounter++);
          this.connections.push({
            id: connId,
            from: fromId,
            to: toId,
            label: conn.label || '',
            connType: conn.connType || this.activeConnType || 'association',
            lineStyle: conn.lineStyle || 'solid',
            routing: defaultRouting,
          });
          existingSet.add(key);
          addedCount++;
        }
      });

      // アニメーション完了後に接続を再描画
      setTimeout(() => {
        this.drawConnections();
      }, 450);
    }

    // Undo用のアクションを保存
    this.pushUndoAction({ type: 'clearAll', snapshot });

    showToast(`✨ AI配置完了！ ノード${result.nodes?.length || 0}個配置、接続${result.connections?.length || 0}本追加`);

  } catch (error) {
    console.error('[AI AutoLayout] Error:', error);

    showToast(`⚠️ AIサーバーエラー: ${error.message}`);
  }
}
exportSVG() {
  FileIO.exportSVG(this);
}

exportJSON() {
  FileIO.exportJSON(this);
}

importJSON() {
  FileIO.importJSON(this);
}

importJSONFromText() {
  FileIO.importJSONFromText(this);
}
swapComponents(newComponents, umlType) {
  if (!newComponents || !newComponents.length) return;
  this.components = newComponents;
  this.umlType = umlType || null;
  this.quickAddCounter = 0;

  // 接続モードとカーソルのリセット
  this.connectMode = false;
  if (this.canvas) {
    this.canvas.style.cursor = 'default';
    this.canvas.classList.remove('timing-connect-active');
  }

  // 図の種類に応じたデフォルト接続タイプのリセット
  if (this.umlType === 'component' && typeof COMPONENT_CONNECTION_TYPES !== 'undefined') {
    this.activeConnType = COMPONENT_CONNECTION_TYPES[0].key;
  } else if (this.umlType === 'class' && typeof CLASS_CONNECTION_TYPES !== 'undefined') {
    this.activeConnType = CLASS_CONNECTION_TYPES[0].key;
  } else if (this.umlType === 'deployment' && typeof DEPLOYMENT_CONNECTION_TYPES !== 'undefined') {
    this.activeConnType = DEPLOYMENT_CONNECTION_TYPES[0].key;
  } else if (this.umlType === 'composite' && typeof COMPOSITE_CONNECTION_TYPES !== 'undefined') {
    this.activeConnType = COMPOSITE_CONNECTION_TYPES[0].key;
  } else if (this.umlType === 'package' && typeof PACKAGE_CONNECTION_TYPES !== 'undefined') {
    this.activeConnType = PACKAGE_CONNECTION_TYPES[0].key;
  } else if (this.umlType === 'communication' && typeof COMMUNICATION_CONNECTION_TYPES !== 'undefined') {
    this.activeConnType = COMMUNICATION_CONNECTION_TYPES[0].key;
  } else {
    this.activeConnType = 'association';
  }

  this.initPalette();
  this.applyUmlMode();
}
}
