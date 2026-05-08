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
  { icon:'📦', label:'クラス', color:'#7c3aed' },
  { icon:'🔷', label:'インターフェース', color:'#3b82f6' },
  { icon:'📂', label:'パッケージ', color:'#06b6d4' },
  { icon:'👤', label:'アクター', color:'#10b981' },
  { icon:'⭕', label:'ユースケース', color:'#f59e0b' },
  { icon:'📜', label:'ノート', color:'#8b5cf6' },
  { icon:'⬜', label:'オブジェクト', color:'#14b8a6' },
  { icon:'🔄', label:'ステート', color:'#6366f1' },
  { icon:'▶️', label:'アクティビティ', color:'#ec4899' },
  { icon:'📨', label:'メッセージ', color:'#f97316' },
];

/* ===== UML Diagram Sub-Types ===== */
const umlDiagramTypes = {
  class: {
    label: 'クラス図',
    components: [
      { icon:'📦', label:'クラス', color:'#7c3aed' },
      { icon:'🔷', label:'インターフェース', color:'#3b82f6' },
      { icon:'📦', label:'抽象クラス', color:'#8b5cf6' },
      { icon:'📋', label:'列挙型', color:'#06b6d4' },
      { icon:'📂', label:'パッケージ', color:'#f59e0b' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  object: {
    label: 'オブジェクト図',
    components: [
      { icon:'⬜', label:'オブジェクト', color:'#14b8a6' },
      { icon:'🔗', label:'リンク', color:'#7c3aed' },
      { icon:'📦', label:'クラス', color:'#3b82f6' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  package: {
    label: 'パッケージ図',
    components: [
      { icon:'📂', label:'パッケージ', color:'#06b6d4' },
      { icon:'📦', label:'クラス', color:'#7c3aed' },
      { icon:'🔷', label:'インターフェース', color:'#3b82f6' },
      { icon:'📎', label:'依存', color:'#f59e0b' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  composite: {
    label: 'コンポジット構造図',
    components: [
      { icon:'📦', label:'クラス/コンポーネント', color:'#7c3aed' },
      { icon:'🔌', label:'ポート', color:'#10b981' },
      { icon:'🧩', label:'パート', color:'#06b6d4' },
      { icon:'🔷', label:'インターフェース', color:'#3b82f6' },
      { icon:'🔗', label:'コネクタ', color:'#f59e0b' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  component: {
    label: 'コンポーネント図',
    components: [
      { icon:'🧩', label:'コンポーネント', color:'#7c3aed' },
      { icon:'🔷', label:'インターフェース', color:'#3b82f6' },
      { icon:'🔌', label:'ポート', color:'#10b981' },
      { icon:'📂', label:'パッケージ', color:'#06b6d4' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  deployment: {
    label: '配置図',
    components: [
      { icon:'🖥️', label:'ノード', color:'#7c3aed' },
      { icon:'📱', label:'デバイス', color:'#a855f7' },
      { icon:'🌐', label:'実行環境', color:'#06b6d4' },
      { icon:'🧩', label:'コンポーネント', color:'#10b981' },
      { icon:'💾', label:'成果物', color:'#f59e0b' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  usecase: {
    label: 'ユースケース図',
    components: [
      { icon:'👤', label:'アクター', color:'#10b981' },
      { icon:'⭕', label:'ユースケース', color:'#f59e0b' },
      { icon:'🔲', label:'システム境界', color:'#7c3aed' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  activity: {
    label: 'アクティビティ図',
    components: [
      { icon:'▶️', label:'アクション', color:'#06b6d4' },
      { icon:'🔵', label:'開始ノード', color:'#10b981' },
      { icon:'🔴', label:'終了ノード', color:'#ef4444' },
      { icon:'◇', label:'分岐/合流', color:'#f59e0b' },
      { icon:'═', label:'フォーク/ジョイン', color:'#8b5cf6' },
      { icon:'📝', label:'オブジェクトノード', color:'#7c3aed' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  state: {
    label: 'ステートマシン図',
    components: [
      { icon:'🔄', label:'ステート', color:'#6366f1' },
      { icon:'🔵', label:'初期状態', color:'#10b981' },
      { icon:'🔴', label:'終了状態', color:'#ef4444' },
      { icon:'◇', label:'選択', color:'#f59e0b' },
      { icon:'📦', label:'複合ステート', color:'#7c3aed' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  sequence: {
    label: 'シーケンス図',
    components: [
      { icon:'👤', label:'ライフライン', color:'#7c3aed' },
      { icon:'📨', label:'メッセージ', color:'#06b6d4' },
      { icon:'↩️', label:'返信', color:'#10b981' },
      { icon:'🔲', label:'フラグメント', color:'#f59e0b' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  communication: {
    label: 'コミュニケーション図',
    components: [
      { icon:'⬜', label:'オブジェクト', color:'#14b8a6' },
      { icon:'📨', label:'メッセージ', color:'#06b6d4' },
      { icon:'🔗', label:'リンク', color:'#7c3aed' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  timing: {
    label: 'タイミング図',
    components: [
      { icon:'👤', label:'ライフライン', color:'#7c3aed' },
      { icon:'🔄', label:'状態/条件', color:'#6366f1' },
      { icon:'⏱️', label:'時間制約', color:'#f59e0b' },
      { icon:'📨', label:'メッセージ', color:'#06b6d4' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
  interaction: {
    label: '相互作用図',
    components: [
      { icon:'🔲', label:'相互作用', color:'#7c3aed' },
      { icon:'👤', label:'ライフライン', color:'#3b82f6' },
      { icon:'📨', label:'メッセージ', color:'#06b6d4' },
      { icon:'▶️', label:'制御フロー', color:'#10b981' },
      { icon:'📜', label:'ノート', color:'#64748b' },
    ],
  },
};
const screenTransitionComponents = [
  { icon:'🖥️', label:'画面', color:'#7c3aed' },
  { icon:'🔵', label:'開始', color:'#10b981' },
  { icon:'🔴', label:'終了', color:'#ef4444' },
  { icon:'◇', label:'分岐', color:'#f59e0b' },
  { icon:'📋', label:'フォーム', color:'#06b6d4' },
  { icon:'🪟', label:'モーダル', color:'#8b5cf6' },
  { icon:'📊', label:'ダッシュボード', color:'#14b8a6' },
  { icon:'⚙️', label:'設定画面', color:'#6366f1' },
  { icon:'🔔', label:'通知/アラート', color:'#ec4899' },
  { icon:'🔐', label:'認証画面', color:'#ef4444' },
  { icon:'📝', label:'入力画面', color:'#f97316' },
  { icon:'📄', label:'一覧画面', color:'#64748b' },
];

class DiagramTool {
  constructor(prefix, components, options = {}) {
    this.prefix = prefix;
    this.components = components;
    this.options = options;
    this.isDropdownPalette = this.options.paletteMode === 'dropdown';
    // connection mode flag: explicitly initialize to boolean to avoid
    // intermittent truthy/undefined states when UI sync happens.
    this.connectMode = false;
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.connectingFrom = null;
    this.undoHistory = [];
    this.redoHistory = [];
    this.isApplyingUndo = false;
    this.nodeIdCounter = 0;
    this.quickAddCounter = 0;
    this.defaultTextStyle = { fontSize: 14, color: '#e5e7eb' };
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

    // If the partial HTML hasn't been inserted yet, the canvas/svg may be null.
    // Wait until they exist before initializing event handlers and controls.
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
  }
  initPalette() {
    const palette = document.getElementById(this.prefix + '-palette');
    if (this.isDropdownPalette) {
      palette.innerHTML = `
        <div class="palette-dropdown">
          <button type="button" class="palette-dropdown-btn" id="${this.prefix}-shape-toggle">◽ 図形を追加</button>
          <div class="palette-dropdown-menu" id="${this.prefix}-shape-menu">
            ${this.components.map((c, i) => `<button type="button" class="shape-option" draggable="true" data-idx="${i}" data-label="${c.label}" aria-label="${c.label}" title="${c.label}">${c.icon}</button>`).join('')}
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
      inlineStrip.innerHTML = this.components.map((c, i) =>
        `<button type="button" class="inline-shape-btn" draggable="true" data-idx="${i}" title="${c.label}" aria-label="${c.label}"><span class="inline-shape-icon">${c.icon}</span></button>`
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
      console.debug('[DiagramTool] keydown', e.key, 'selectedNode=', this.selectedNode && this.selectedNode.id);
      if (!this.selectedNode) return;
      e.preventDefault();
      this.deleteSelectedNode();
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
          if (!this.propertyPanelNode) return;
          this.propertyPanelNode[prop] = parser(e.target.value);
          this.updateNodeDOM(this.propertyPanelNode);
        });
      }
    };
    bindInput('label', 'label');
    bindInput('x', 'x', Number);
    bindInput('y', 'y', Number);
    bindInput('fontsize', 'textSize', Number);
    bindInput('textcolor', 'textColor');
    bindInput('color', 'color');
  }

  openPropertyPanel(node) {
    this.propertyPanelNode = node;
    const panel = document.getElementById(this.prefix + '-property-panel');
    if (panel) panel.classList.add('open');

    // Populate fields
    const setVal = (suffix, val) => {
      const el = document.getElementById(this.prefix + '-prop-' + suffix);
      if (el) el.value = val;
    };
    setVal('label', node.label);
    setVal('x', node.x);
    setVal('y', node.y);
    setVal('fontsize', node.textSize || this.defaultTextStyle.fontSize);
    
    // color input needs #rrggbb format
    const rgbToHex = (color) => {
      if (!color) return '#e5e7eb';
      if (color.startsWith('#') && color.length === 7) return color;
      return color; // simplified, assuming hex is mostly used
    };
    setVal('textcolor', rgbToHex(node.textColor || this.defaultTextStyle.color));
    setVal('color', rgbToHex(node.color));

    // Focus and select the label input
    setTimeout(() => {
      const labelInput = document.getElementById(this.prefix + '-prop-label');
      if (labelInput) {
        labelInput.focus({ preventScroll: true });
        labelInput.select();
      }
    }, 300); // wait for panel animation to finish to prevent layout shift
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
    el.style.borderColor = (node.color || '#e5e7eb') + '60'; // with alpha
    const labelEl = el.querySelector('.node-label');
    if (labelEl) {
      labelEl.textContent = node.label;
      this.applyNodeTextStyle(node, labelEl);
    }
    this.drawConnections();
  }

  addNode(comp, x, y, options = {}) {
    const id = this.prefix + '_node_' + (this.nodeIdCounter++);
    const node = {
      id,
      icon: comp.icon,
      label: comp.label,
      color: comp.color,
      x,
      y,
      textColor: this.defaultTextStyle.color,
      textSize: this.defaultTextStyle.fontSize,
    };
    this.nodes.push(node);
    this.renderNode(node);
    this.pushUndoAction({
      type: 'removeNode',
      nodeId: node.id,
      quickAddCounter: typeof options.quickAddCounterBefore === 'number' ? options.quickAddCounterBefore : this.quickAddCounter,
    });
  }
  renderNode(node) {
    const el = document.createElement('div');
    el.className = 'diagram-node';
    el.id = node.id;
    el.style.left = node.x + 'px';
    el.style.top = node.y + 'px';
    el.style.borderColor = node.color + '60';
    el.innerHTML = `<span class="node-icon">${node.icon}</span><span class="node-label">${node.label}</span>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>`;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
    // Drag
    let dragging = false, ox, oy;
    el.addEventListener('mousedown', e => {
      if (this.editingNodeId === node.id) return;
      if (e.target.classList.contains('node-port')) return;
      if (this.connectMode) {
        if (!this.connectingFrom) {
          this.connectingFrom = node;
          el.classList.add('selected');
          showToast('接続先ノードをクリックしてください');
        } else if (this.connectingFrom.id !== node.id) {
          this.connections.push({ from: this.connectingFrom.id, to: node.id });
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
    // Double click to open property panel (or rename inline)
    el.addEventListener('dblclick', e => {
      e.preventDefault();
      e.stopPropagation();
      this.selectNode(node, el);
      this.openPropertyPanel(node);
      // Inline rename fallback
      // this.beginInlineRename(node, labelEl);
    });
    // Port click for connection
    el.querySelectorAll('.node-port').forEach(port => {
      port.addEventListener('mousedown', e => {
        e.stopPropagation();
        if (!this.connectingFrom) {
          this.connectingFrom = node;
          this.connectMode = true;
          // keep UI in sync when connect mode is programmatically enabled
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
  selectNode(node, el) {
    this.deselectAll();
    this.selectedNode = node;
    el.classList.add('selected');
    this.syncTextStyleControls(node);
  }
  deselectAll() {
    this.selectedNode = null;
    this.canvas.querySelectorAll('.diagram-node').forEach(n => n.classList.remove('selected'));
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
    this.svg.innerHTML = '<defs><marker id="arrow-'+this.prefix+'" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed"/></marker></defs>';
    this.connections.forEach(conn => {
      const fromEl = document.getElementById(conn.from);
      const toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) return;
      const cr = this.canvas.getBoundingClientRect();
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const x1 = fr.left + fr.width/2 - cr.left;
      const y1 = fr.top + fr.height/2 - cr.top;
      const x2 = tr.left + tr.width/2 - cr.left;
      const y2 = tr.top + tr.height/2 - cr.top;
      const mx = (x1+x2)/2, my = (y1+y2)/2;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',`M${x1},${y1} Q${mx},${y1} ${mx},${my} Q${mx},${y2} ${x2},${y2}`);
      path.setAttribute('fill','none');
      path.setAttribute('stroke','#7c3aed');
      path.setAttribute('stroke-width','2');
      path.setAttribute('marker-end',`url(#arrow-${this.prefix})`);
      path.setAttribute('opacity','0.7');
      this.svg.appendChild(path);
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
  swapComponents(newComponents) {
    if (!newComponents || !newComponents.length) return;
    this.components = newComponents;
    this.quickAddCounter = 0;
    this.initPalette();
  }
}
