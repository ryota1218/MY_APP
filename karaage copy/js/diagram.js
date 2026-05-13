/* ===== Diagram Tool (Architecture + UML) ===== */
const archComponents = [
  // ── サーバー / コンピュート ──
  { icon:'<i data-lucide="globe" class="node-lucide-icon"></i>', label:'Webサーバー', color:'#7c3aed' },
  { icon:'<i data-lucide="server" class="node-lucide-icon"></i>', label:'APIサーバー', color:'#10b981' },
  { icon:'<i data-lucide="monitor" class="node-lucide-icon"></i>', label:'アプリサーバー', color:'#3b82f6' },
  { icon:'<i data-lucide="zap" class="node-lucide-icon"></i>', label:'Lambda/Function', color:'#f59e0b' },
  { icon:'<i data-lucide="container" class="node-lucide-icon"></i>', label:'コンテナ', color:'#06b6d4' },
  // ── データ / ストレージ ──
  { icon:'<i data-lucide="database" class="node-lucide-icon"></i>', label:'データベース', color:'#06b6d4' },
  { icon:'<i data-lucide="hard-drive" class="node-lucide-icon"></i>', label:'ストレージ', color:'#6366f1' },
  { icon:'<i data-lucide="box" class="node-lucide-icon"></i>', label:'キャッシュ(Redis)', color:'#ef4444' },
  { icon:'<i data-lucide="search" class="node-lucide-icon"></i>', label:'検索エンジン', color:'#f97316' },
  // ── ネットワーク / セキュリティ ──
  { icon:'<i data-lucide="network" class="node-lucide-icon"></i>', label:'ロードバランサー', color:'#f97316' },
  { icon:'<i data-lucide="cloud" class="node-lucide-icon"></i>', label:'CDN', color:'#8b5cf6' },
  { icon:'<i data-lucide="shield-check" class="node-lucide-icon"></i>', label:'ファイアウォール', color:'#ef4444' },
  { icon:'<i data-lucide="lock" class="node-lucide-icon"></i>', label:'認証/認可', color:'#ec4899' },
  { icon:'<i data-lucide="waypoints" class="node-lucide-icon"></i>', label:'APIゲートウェイ', color:'#14b8a6' },
  { icon:'<i data-lucide="at-sign" class="node-lucide-icon"></i>', label:'DNS', color:'#64748b' },
  { icon:'<i data-lucide="shield" class="node-lucide-icon"></i>', label:'WAF', color:'#dc2626' },
  { icon:'<i data-lucide="key-round" class="node-lucide-icon"></i>', label:'VPN', color:'#7c3aed' },
  { icon:'<i data-lucide="arrow-left-right" class="node-lucide-icon"></i>', label:'リバースプロキシ', color:'#0ea5e9' },
  // ── メッセージング / 非同期 ──
  { icon:'<i data-lucide="mail" class="node-lucide-icon"></i>', label:'メッセージキュー', color:'#ec4899' },
  { icon:'<i data-lucide="webhook" class="node-lucide-icon"></i>', label:'Webhook', color:'#a855f7' },
  { icon:'<i data-lucide="clock" class="node-lucide-icon"></i>', label:'バッチ/Cron', color:'#64748b' },
  // ── 監視 / ログ ──
  { icon:'<i data-lucide="activity" class="node-lucide-icon"></i>', label:'監視/APM', color:'#14b8a6' },
  { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ログ収集', color:'#6366f1' },
  // ── CI/CD / 開発ツール ──
  { icon:'<i data-lucide="git-branch" class="node-lucide-icon"></i>', label:'CI/CDパイプライン', color:'#f59e0b' },
  // ── 外部連携 / クライアント ──
  { icon:'<i data-lucide="plug" class="node-lucide-icon"></i>', label:'外部API', color:'#0ea5e9' },
  { icon:'<i data-lucide="bell" class="node-lucide-icon"></i>', label:'通知サービス', color:'#f43f5e' },
  { icon:'<i data-lucide="user" class="node-lucide-icon"></i>', label:'クライアント', color:'#64748b' },
  { icon:'<i data-lucide="smartphone" class="node-lucide-icon"></i>', label:'モバイル', color:'#a855f7' },
  { icon:'<i data-lucide="layout-dashboard" class="node-lucide-icon"></i>', label:'管理画面', color:'#3b82f6' },
];
const umlComponents = [
  { icon:'<i data-lucide="box" class="node-lucide-icon"></i>', label:'クラス', color:'#7c3aed' },
  { icon:'<i data-lucide="diamond" class="node-lucide-icon"></i>', label:'インターフェース', color:'#3b82f6' },
  { icon:'<i data-lucide="folder" class="node-lucide-icon"></i>', label:'パッケージ', color:'#06b6d4' },
  { icon:'<i data-lucide="user" class="node-lucide-icon"></i>', label:'アクター', color:'#10b981' },
  { icon:'<i data-lucide="circle" class="node-lucide-icon"></i>', label:'ユースケース', color:'#f59e0b' },
  { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#8b5cf6' },
  { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'オブジェクト', color:'#14b8a6' },
  { icon:'<i data-lucide="git-branch" class="node-lucide-icon"></i>', label:'ステート', color:'#6366f1' },
  { icon:'<i data-lucide="play" class="node-lucide-icon"></i>', label:'アクティビティ', color:'#ec4899' },
  { icon:'<i data-lucide="mail" class="node-lucide-icon"></i>', label:'メッセージ', color:'#f97316' },
];

/* ===== UML Diagram Sub-Types ===== */
const umlDiagramTypes = {
  class: {
    label: 'クラス図',
    get components() {
      return window.BehaviorDiagramLibrary?.structure?.getComponents('class') || [];
    }
  },
  object: {
    label: 'オブジェクト図',
    get components() {
      return window.BehaviorDiagramLibrary?.structure?.getComponents('object') || [];
    }
  },
  package: {
    label: 'パッケージ図',
    get components() {
      return window.BehaviorDiagramLibrary?.structure?.getComponents('package') || [];
    }
  },
  composite: {
    label: 'コンポジット構造図',
    get components() {
      return window.BehaviorDiagramLibrary?.structure?.getComponents('composite') || [];
    }
  },
  component: {
    label: 'コンポーネント図',
    get components() {
      return window.BehaviorDiagramLibrary?.structure?.getComponents('component') || [];
    }
  },
  deployment: {
    label: '配置図',
    get components() {
      return window.BehaviorDiagramLibrary?.structure?.getComponents('deployment') || [];
    }
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
    components: [
      { icon:'<i data-lucide="user" class="node-lucide-icon"></i>', label:'ライフライン', color:'#7c3aed' },
      { icon:'<i data-lucide="mail" class="node-lucide-icon"></i>', label:'メッセージ', color:'#06b6d4' },
      { icon:'<i data-lucide="arrow-left" class="node-lucide-icon"></i>', label:'返信', color:'#10b981' },
      { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'フラグメント', color:'#f59e0b' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
  },
  communication: {
    label: 'コミュニケーション図',
    components: [
      { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'オブジェクト', color:'#14b8a6' },
      { icon:'<i data-lucide="mail" class="node-lucide-icon"></i>', label:'メッセージ', color:'#06b6d4' },
      { icon:'<i data-lucide="link-2" class="node-lucide-icon"></i>', label:'リンク', color:'#7c3aed' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
  },
  timing: {
    label: 'タイミング図',
    components: [
      { icon:'<i data-lucide="user" class="node-lucide-icon"></i>', label:'ライフライン', color:'#7c3aed' },
      { icon:'<i data-lucide="git-branch" class="node-lucide-icon"></i>', label:'状態/条件', color:'#6366f1' },
      { icon:'<i data-lucide="clock" class="node-lucide-icon"></i>', label:'時間制約', color:'#f59e0b' },
      { icon:'<i data-lucide="mail" class="node-lucide-icon"></i>', label:'メッセージ', color:'#06b6d4' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
  },
  interaction: {
    label: '相互作用図',
    components: [
      { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'相互作用', color:'#7c3aed' },
      { icon:'<i data-lucide="user" class="node-lucide-icon"></i>', label:'ライフライン', color:'#3b82f6' },
      { icon:'<i data-lucide="mail" class="node-lucide-icon"></i>', label:'メッセージ', color:'#06b6d4' },
      { icon:'<i data-lucide="play" class="node-lucide-icon"></i>', label:'制御フロー', color:'#10b981' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
  },
};
const screenTransitionComponents = [
  { icon:'<i data-lucide="monitor" class="node-lucide-icon"></i>', label:'画面', color:'#7c3aed' },
  { icon:'<i data-lucide="play-circle" class="node-lucide-icon"></i>', label:'開始', color:'#10b981' },
  { icon:'<i data-lucide="stop-circle" class="node-lucide-icon"></i>', label:'終了', color:'#ef4444' },
  { icon:'<i data-lucide="git-branch" class="node-lucide-icon"></i>', label:'分岐', color:'#f59e0b' },
  { icon:'<i data-lucide="form" class="node-lucide-icon"></i>', label:'フォーム', color:'#06b6d4' },
  { icon:'<i data-lucide="layers" class="node-lucide-icon"></i>', label:'モーダル', color:'#8b5cf6' },
  { icon:'<i data-lucide="bar-chart-3" class="node-lucide-icon"></i>', label:'ダッシュボード', color:'#14b8a6' },
  { icon:'<i data-lucide="settings" class="node-lucide-icon"></i>', label:'設定画面', color:'#6366f1' },
  { icon:'<i data-lucide="bell" class="node-lucide-icon"></i>', label:'通知/アラート', color:'#ec4899' },
  { icon:'<i data-lucide="lock" class="node-lucide-icon"></i>', label:'認証画面', color:'#ef4444' },
  { icon:'<i data-lucide="edit-3" class="node-lucide-icon"></i>', label:'入力画面', color:'#f97316' },
  { icon:'<i data-lucide="list" class="node-lucide-icon"></i>', label:'一覧画面', color:'#64748b' },
];

/* UMLクラス図の接続タイプ定義 */
const UML_CONNECTION_TYPES = [
  { key: 'association',  label: '関連',         icon: '━━' },
  { key: 'aggregation',  label: '集約',         icon: '◇━' },
  { key: 'composition',  label: 'コンポジット', icon: '◆━' },
  { key: 'dependency',   label: '依存',         icon: '- -▸' },
  { key: 'generalization',label: '汎化',         icon: '━▷' },
  { key: 'realization',  label: '実現',         icon: '- -▷' },
  { key: 'navigable',    label: '誘導可能性',   icon: '✕━▸' },
];

class DiagramTool {
  constructor(prefix, components, options = {}) {
    this.prefix = prefix;
    this.components = components;
    this.options = options;
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
    this.defaultTextStyle = { fontSize: 14, color: '#e5e7eb' };
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
        this.components.map((c,i) => `
          <div class="palette-item" draggable="true" data-idx="${i}">
            <span class="p-icon">${c.icon}</span><span>${c.label}</span>
          </div>`).join('') +
        '<div class="palette-title" style="margin-top:16px;">操作</div>' +
        '<div class="palette-item" style="cursor:pointer;" id="'+this.prefix+'-connect-mode">🔗 接続モード</div>';

      palette.querySelectorAll('.palette-item[draggable]').forEach(item => {
        item.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', item.dataset.idx);
        });
      });
    }

    const connectButton = document.getElementById(this.prefix+'-connect-mode');

    // クラス図モードの場合: 接続タイプセレクタを生成
    if (this.umlType === 'class') {
      connectButton.innerHTML = '';
      connectButton.textContent = '';
      connectButton.style.display = 'none';

      // 接続タイプセレクタをパレット領域に追加
      const connGroup = document.createElement('div');
      connGroup.className = 'uml-conn-group';
      connGroup.id = this.prefix + '-conn-group';
      connGroup.innerHTML = `
        <select class="uml-conn-select" id="${this.prefix}-conn-select">
          ${UML_CONNECTION_TYPES.map(t => `<option value="${t.key}">${t.icon}  ${t.label}</option>`).join('')}
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
        const typeDef = UML_CONNECTION_TYPES.find(t => t.key === this.activeConnType);
        showToast(this.connectMode ? `接続モード: ON (${typeDef?.label || '関連'})` : '接続モード: OFF');
      });
    } else {
      this.updateConnectButton = () => {
        connectButton.classList.toggle('active', this.connectMode);
        connectButton.textContent = `🔗 接続モード ${this.connectMode ? 'ON' : 'OFF'}`;
        if (!this.isDropdownPalette) {
          connectButton.style.background = this.connectMode ? 'rgba(124,58,237,0.2)' : '';
        }
      };
      this.updateConnectButton();
      connectButton.addEventListener('click', () => {
        this.connectMode = !this.connectMode;
        this.updateConnectButton();
        this.canvas.style.cursor = this.connectMode ? 'crosshair' : 'default';
        showToast(this.connectMode ? '接続モード: ONー ノードをクリックして接続' : '接続モード: OFF');
      });
    }

    // Sidebar toggle button
    const sidebarToggle = document.getElementById(this.prefix + '-sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
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
      const x = e.clientX - rect.left - 60;
      const y = e.clientY - rect.top - 20;
      this.addNode(this.components[idx], x, y);
    });
    this.canvas.addEventListener('click', e => {
      if (e.target === this.canvas || e.target === this.svg) {
        this.deselectAll();
        this.closePropertyPanel();
      }
    });

    // UIボタンのイベントバインディング
    const container = this.canvas.closest('.tool-section');
    if (container) {
      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', e => {
          const action = btn.dataset.action;
          if (action === 'openPaletteMenu') {
            e.stopPropagation();
          }
          if (typeof this[action] === 'function') {
            this[action]();
          }
        });
      });
    }

    document.addEventListener('keydown', e => {
      const target = e.target;
      const isEditingField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
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
            this.updateNodeDOM(this.propertyPanelNode);
          } else if (this.propertyPanelConn) {
            this.propertyPanelConn[prop] = parser(e.target.value);
            this.drawConnections();
          }
        });
      }
    };
    bindInput('label', 'label');
    bindInput('x', 'x', Number);
    bindInput('y', 'y', Number);
    bindInput('fontsize', 'textSize', Number);
    bindInput('textcolor', 'textColor');
    bindInput('color', 'color');
    bindInput('routing', 'routing');
  }

  openPropertyPanel(node, conn = null) {
    this.propertyPanelNode = node;
    this.propertyPanelConn = conn;
    const panel = document.getElementById(this.prefix + '-property-panel');
    if (panel) panel.classList.add('open');

    const isConn = !!conn;
    const isNode = !!node;

    // Show/hide groups based on selection
    ['x','y','fontsize','textcolor','color'].forEach(k => {
      const g = document.getElementById(this.prefix + '-prop-' + k)?.closest('.property-group');
      if (g) g.style.display = isNode ? '' : 'none';
    });
    const routingGroup = document.getElementById(this.prefix + '-prop-group-routing');
    if (routingGroup) routingGroup.style.display = isConn ? '' : 'none';
    const zindexGroup = document.getElementById(this.prefix + '-prop-group-zindex');
    if (zindexGroup) zindexGroup.style.display = isNode ? '' : 'none';

    // Populate fields
    const setVal = (suffix, val) => {
      const el = document.getElementById(this.prefix + '-prop-' + suffix);
      if (el) el.value = val;
    };

    if (isNode) {
      setVal('label', node.label);
      setVal('x', node.x);
      setVal('y', node.y);
      setVal('fontsize', node.textSize || this.defaultTextStyle.fontSize);
      
      // color input needs #rrggbb format
      const rgbToHex = (color) => {
        if (!color) return '#e5e7eb';
        if (color.startsWith('#') && color.length === 7) return color;
        return color;
      };
      setVal('textcolor', rgbToHex(node.textColor || this.defaultTextStyle.color));
      setVal('color', rgbToHex(node.color));
    } else if (isConn) {
      setVal('label', conn.label || '');
      setVal('routing', conn.routing || 'straight');
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
      const deleteBtn = panelBody.querySelector('[data-action="deleteSelected"]');

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
      }
    }, 300);
  }

  closePropertyPanel() {
    this.propertyPanelNode = null;
    const panel = document.getElementById(this.prefix + '-property-panel');
    if (panel) panel.classList.remove('open');
  }
  
  updateNodeDOM(node) {
    const el = document.getElementById(node.id);
    if (!el) return;
    el.style.left = node.x + 'px';
    el.style.top = node.y + 'px';
    el.style.zIndex = node.zIndex || 10;

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
    }
    this.drawConnections();
  }

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
    const node = {
      id,
      icon: comp.icon,
      label: overrides.label || comp.label,
      color: comp.color,
      behaviorType: comp.behaviorType || null,
      width: overrides.width || comp.width || null,
      height: overrides.height || comp.height || null,
      x,
      y,
      zIndex: 10,
      textColor: this.defaultTextStyle.color,
      textSize: this.defaultTextStyle.fontSize,
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
  renderNode(node) {
    const el = document.createElement('div');
    el.id = node.id;
    el.style.left = node.x + 'px';
    el.style.top = node.y + 'px';
    el.style.zIndex = node.zIndex || 10;

    const behaviorPresentation =
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
      el.style.cssText = `left:${node.x}px;top:${node.y}px;z-index:${node.zIndex || 10};${sizeStyle}`;
      el.innerHTML = behaviorPresentation.innerHTML;
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
      el.style.borderColor = node.color + '60';
      el.innerHTML = `<span class="node-icon">${node.icon}</span><span class="node-label">${node.label}</span>
        <span class="node-port port-top" data-port="top"></span>
        <span class="node-port port-bottom" data-port="bottom"></span>
        <span class="node-port port-left" data-port="left"></span>
        <span class="node-port port-right" data-port="right"></span>`;
      const labelEl = el.querySelector('.node-label');
      this.applyNodeTextStyle(node, labelEl);
    }

    if (node.behaviorType === 'compositeState' || node.behaviorType === 'systemBoundary') {
      const resizeHandle = document.createElement('span');
      resizeHandle.className = 'node-resize-handle';
      resizeHandle.title = 'サイズ変更';
      resizeHandle.style.cssText = 'position:absolute;right:3px;bottom:3px;width:14px;height:14px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;opacity:0.55;cursor:nwse-resize;';
      el.appendChild(resizeHandle);
    }

    // Drag
    let dragging = false, ox, oy;
    el.addEventListener('mousedown', e => {
      if (this.editingNodeId === node.id) return;
      if (e.target.classList.contains('node-port')) return;
      if (e.target.classList.contains('node-resize-handle')) {
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = node.width || el.getBoundingClientRect().width;
        const startHeight = node.height || el.getBoundingClientRect().height;
        const minWidth = (node.behaviorType === 'compositeState' || node.behaviorType === 'systemBoundary') ? 260 : 120;
        const minHeight = (node.behaviorType === 'compositeState' || node.behaviorType === 'systemBoundary') ? 180 : 80;
        const onMouseMove = moveEvent => {
          node.width = Math.max(minWidth, Math.round(startWidth + (moveEvent.clientX - startX)));
          node.height = Math.max(minHeight, Math.round(startHeight + (moveEvent.clientY - startY)));
          el.style.width = node.width + 'px';
          el.style.height = node.height + 'px';
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
        if (node.behaviorType === 'systemBoundary') {
          showToast('システム境界には接続できません');
          return;
        }
        if (!this.connectingFrom) {
          this.connectingFrom = node;
          el.classList.add('selected');
          showToast('接続先ノードをクリックしてください');
        } else if (this.connectingFrom.id !== node.id) {
          const newConn = {
            id: this.prefix + '_conn_' + (this.connIdCounter++),
            from: this.connectingFrom.id,
            to: node.id,
            connType: this.activeConnType || 'association',
            routing: 'straight',
            label: ''
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
      ox = e.clientX - node.x;
      oy = e.clientY - node.y;
      e.preventDefault();
      const onMouseMove = e => {
        if (!dragging) return;
        const nextX = e.clientX - ox;
        const nextY = e.clientY - oy;
        if (nextX !== node.x || nextY !== node.y) moved = true;
        node.x = nextX;
        node.y = nextY;
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
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
        if (node.behaviorType === 'systemBoundary') {
          showToast('システム境界には接続できません');
          return;
        }
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
    this.openPropertyPanel(null, conn);
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
  
  deleteSelectedNode() {
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

    if (action.type === 'resizeNode') {
      const node = this.getNodeById(action.nodeId);
      const el = node ? document.getElementById(node.id) : null;
      if (!node || !el) return null;
      const inverse = {
        type: 'resizeNode',
        nodeId: action.nodeId,
        width: node.width,
        height: node.height,
      };
      node.width = action.width;
      node.height = action.height;
      if (action.width) el.style.width = `${action.width}px`;
      if (action.height) el.style.height = `${action.height}px`;
      this.drawConnections();
      return inverse;
    }

    if (action.type === 'removeConnection') {
      const beforeCount = this.connections.length;
      this.connections = this.connections.filter(conn => !(conn.from === action.from && conn.to === action.to));
      if (this.connections.length === beforeCount) return null;
      this.drawConnections();
      return {
        type: 'addConnection',
        from: action.from,
        to: action.to,
      };
    }

    if (action.type === 'addConnection') {
      this.connections.push({ from: action.from, to: action.to });
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
        label: conn.label
      });
      this.deselectAll();
      this.drawConnections();
      showToast('選択した線を削除しました');
      return;
    }

    const node = this.selectedNode;
    if (!node) {
      showToast('削除する図形または線を選択してください');
      return;
    }

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

  bringToFront() {
    if (!this.selectedNode) return;
    const maxZ = Math.max(...this.nodes.map(n => n.zIndex || 10));
    this.selectedNode.zIndex = maxZ + 1;
    this.updateNodeDOM(this.selectedNode);
  }

  sendToBack() {
    if (!this.selectedNode) return;
    const minZ = Math.min(...this.nodes.map(n => n.zIndex || 10));
    this.selectedNode.zIndex = Math.max(1, minZ - 1);
    this.updateNodeDOM(this.selectedNode);
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
    if (this.otherColorButton) {
      this.nativeColorInput = document.createElement('input');
      this.nativeColorInput.type = 'color';
      this.nativeColorInput.value = '#e5e7eb';
      this.nativeColorInput.style.position = 'fixed';
      this.nativeColorInput.style.left = '-9999px';
      this.nativeColorInput.style.opacity = '0';
      document.body.appendChild(this.nativeColorInput);
      this.otherColorButton.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.nativeColorInput.click();
      });
      this.nativeColorInput.addEventListener('input', () => {
        const selectedColor = this.nativeColorInput.value;
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
  }
  buildColorPalette() {
    if (!this.themeRow || !this.shadeGrid || !this.standardRow) return;
    const themeColors = [
      { label:'黒', color:'#111111', shades:['#f3f4f6','#d1d5db','#6b7280','#111111'] },
      { label:'赤', color:'#ef4444', shades:['#fee2e2','#fca5a5','#ef4444','#991b1b'] },
      { label:'灰', color:'#9ca3af', shades:['#f3f4f6','#d1d5db','#9ca3af','#4b5563'] },
      { label:'青', color:'#3b82f6', shades:['#dbeafe','#93c5fd','#3b82f6','#1d4ed8'] },
      { label:'水色', color:'#60a5fa', shades:['#dbeafe','#bfdbfe','#60a5fa','#2563eb'] },
      { label:'橙', color:'#f97316', shades:['#ffedd5','#fdba74','#f97316','#c2410c'] },
      { label:'銀', color:'#a3a3a3', shades:['#f5f5f5','#e5e7eb','#a3a3a3','#525252'] },
      { label:'黄', color:'#facc15', shades:['#fef9c3','#fde68a','#facc15','#ca8a04'] },
      { label:'青系', color:'#60a5fa', shades:['#eff6ff','#dbeafe','#60a5fa','#1d4ed8'] },
      { label:'緑', color:'#84cc16', shades:['#ecfccb','#bef264','#84cc16','#3f6212'] },
    ];
    const standardColors = ['#dc2626','#ff0000','#f59e0b','#ffea00','#84cc16','#10b981','#06b6d4','#0284c7','#1d4ed8','#7c3aed'];

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
      <marker id="arrow-open-${p}" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polyline points="0 0, 10 3.5, 0 7" fill="none" stroke="#7c3aed" stroke-width="1.5"/></marker>
      <marker id="diamond-empty-${p}" markerWidth="14" markerHeight="10" refX="14" refY="5" orient="auto"><polygon points="0 5, 7 0, 14 5, 7 10" fill="none" stroke="#7c3aed" stroke-width="1.5"/></marker>
      <marker id="diamond-fill-${p}" markerWidth="14" markerHeight="10" refX="14" refY="5" orient="auto"><polygon points="0 5, 7 0, 14 5, 7 10" fill="#7c3aed" stroke="#7c3aed" stroke-width="1"/></marker>
      <marker id="triangle-empty-${p}" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto"><polygon points="0 0, 12 5, 0 10" fill="none" stroke="#7c3aed" stroke-width="1.5"/></marker>
      <marker id="x-mark-${p}" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><line x1="2" y1="2" x2="8" y2="8" stroke="#7c3aed" stroke-width="2"/><line x1="8" y1="2" x2="2" y2="8" stroke="#7c3aed" stroke-width="2"/></marker>
    </defs>`;

    this.canvas.querySelectorAll('.diagram-conn-label').forEach(el => el.remove());

    this.connections.forEach(conn => {
      if (!conn.id) conn.id = this.prefix + '_conn_' + (this.connIdCounter++);
      const fromEl = document.getElementById(conn.from);
      const toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) return;
      const cr = this.canvas.getBoundingClientRect();
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const cx1 = fr.left + fr.width/2 - cr.left;
      const cy1 = fr.top + fr.height/2 - cr.top;
      const cx2 = tr.left + tr.width/2 - cr.left;
      const cy2 = tr.top + tr.height/2 - cr.top;

      let x1 = cx1, y1 = cy1, x2 = cx2, y2 = cy2;
      const isHorizontal = Math.abs(cx2 - cx1) > Math.abs(cy2 - cy1);

      if (isHorizontal) {
        if (cx1 < cx2) {
          x1 = cx1 + fr.width/2; // from right
          x2 = cx2 - tr.width/2; // to left
        } else {
          x1 = cx1 - fr.width/2; // from left
          x2 = cx2 + tr.width/2; // to right
        }
      } else {
        if (cy1 < cy2) {
          y1 = cy1 + fr.height/2; // from bottom
          y2 = cy2 - tr.height/2; // to top
        } else {
          y1 = cy1 - fr.height/2; // from top
          y2 = cy2 + tr.height/2; // to bottom
        }
      }

      let dStr = '';
      let midX, midY;
      const routing = conn.routing || 'straight';
      if (routing === 'orthogonal') {
        if (isHorizontal) {
          const hx = x1 + (x2 - x1) / 2;
          dStr = `M ${x1} ${y1} L ${hx} ${y1} L ${hx} ${y2} L ${x2} ${y2}`;
          midX = hx;
          midY = y1 + (y2 - y1) / 2;
        } else {
          const hy = y1 + (y2 - y1) / 2;
          dStr = `M ${x1} ${y1} L ${x1} ${hy} L ${x2} ${hy} L ${x2} ${y2}`;
          midX = x1 + (x2 - x1) / 2;
          midY = hy;
        }
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
        dStr = `M ${x1} ${y1} L ${x2} ${y2}`;
        midX = (x1 + x2) / 2;
        midY = (y1 + y2) / 2;
      }

      const connType = conn.connType || 'association';
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', dStr);
      const isSelected = this.selectedConnection === conn;
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

      switch (connType) {
        case 'association':
          // 実線のみ
          break;
        case 'aggregation':
          path.setAttribute('marker-start', `url(#diamond-empty-${p})`);
          break;
        case 'composition':
          path.setAttribute('marker-start', `url(#diamond-fill-${p})`);
          break;
        case 'dependency':
          path.setAttribute('stroke-dasharray', '6 3');
          path.setAttribute('marker-end', `url(#arrow-open-${p})`);
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
      this.svg.appendChild(path);

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
    });
  }
  clearAll() {
    const snapshot = this.captureSnapshot();
    this.nodes = []; this.connections = []; this.nodeIdCounter = 0;
    this.quickAddCounter = 0;
    this.canvas.querySelectorAll('.diagram-node').forEach(n => n.remove());
    this.svg.innerHTML = '';
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
  autoLayout() {
    const cols = Math.ceil(Math.sqrt(this.nodes.length));
    this.nodes.forEach((n,i) => {
      n.x = 80 + (i % cols) * 200;
      n.y = 60 + Math.floor(i / cols) * 120;
      const el = document.getElementById(n.id);
      if(el) { el.style.left = n.x+'px'; el.style.top = n.y+'px'; }
    });
    this.drawConnections();
    showToast('自動配置しました');
  }
  exportSVG() {
    const svgClone = this.svg.cloneNode(true);
    const w = this.canvas.offsetWidth, h = this.canvas.offsetHeight;
    svgClone.setAttribute('width', w);
    svgClone.setAttribute('height', h);
    svgClone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    // Add nodes as foreignObject
    this.nodes.forEach(n => {
      const fo = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
      fo.setAttribute('x',n.x); fo.setAttribute('y',n.y);
      fo.setAttribute('width','160'); fo.setAttribute('height','50');
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="background:#1f2937;border:2px solid ${n.color};border-radius:8px;padding:10px;display:flex;align-items:center;gap:8px;font-family:sans-serif;color:#e5e7eb;font-size:14px;">${n.icon} ${n.label}</div>`;
      svgClone.appendChild(fo);
    });
    const blob = new Blob([svgClone.outerHTML], {type:'image/svg+xml'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = this.prefix+'_diagram.svg'; a.click();
    showToast('SVGをエクスポートしました');
  }
  swapComponents(newComponents, umlType) {
    if (!newComponents || !newComponents.length) return;
    this.components = newComponents;
    this.umlType = umlType || null;
    this.quickAddCounter = 0;
    this.initPalette();
    this.applyUmlMode();
  }
}
