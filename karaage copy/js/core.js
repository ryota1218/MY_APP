/* ===== Core Application ===== */

/**
 * セクション定義: html/ フォルダのパーシャルファイルと対応
 * id       — <section> の id 属性 / サイドバーの data-tool 値
 * file     — html/ 内のファイル名
 * default  — 初期表示時に active にするかどうか
 */
const SECTIONS = [
  { id: 'dashboard',    file: 'html/dashboard.html',    default: true },
  { id: 'proposal',     file: 'html/proposal.html' },
  { id: 'requirements', file: 'html/requirements.html' },
  { id: 'architecture', file: 'html/diagram-template.html', prefix: 'arch', appProp: 'architecture' },
  { id: 'uml',          file: 'html/diagram-template.html', prefix: 'uml',  appProp: 'uml' },
  { id: 'screen-transition', file: 'html/diagram-template.html', prefix: 'st', appProp: 'screenTransition' },
  { id: 'layout',       file: 'html/layout.html' },
  { id: 'erdiagram',    file: 'html/erdiagram.html' },
  { id: 'gantt',        file: 'html/gantt.html' },
];

class App {
  constructor() {
    this.currentTool = 'dashboard';
  }

  /**
   * HTMLパーシャルを読み込んでから各機能を初期化する
   */
  async init() {
    await this.loadSections();
    this.initNav();
    this.initDashboard();
    this.proposal = new ProposalTool();
    this.requirements = new RequirementsTool();
  }

  /**
   * html/ フォルダのパーシャルファイルを fetch し、
   * <main> 内に <section> として挿入する
   */
  async loadSections() {
    const main = document.getElementById('main-content');
    const results = await Promise.all(
      SECTIONS.map(async (sec) => {
        try {
          const res = await fetch(sec.file);
          if (!res.ok) throw new Error(`${sec.file}: ${res.status}`);
          let html = await res.text();
          if (sec.prefix && sec.appProp) {
            html = html.replaceAll('{{prefix}}', sec.prefix).replaceAll('{{appProp}}', sec.appProp);
          }
          return { ...sec, html };
        } catch (err) {
          console.error(`[loadSections] Failed to load ${sec.file}:`, err);
          return { ...sec, html: `<p style="color:var(--danger);">セクションの読み込みに失敗しました</p>` };
        }
      })
    );

    results.forEach((sec) => {
      const section = document.createElement('section');
      section.id = sec.id;
      section.className = 'tool-section' + (sec.default ? ' active' : '');
      section.innerHTML = sec.html;
      main.appendChild(section);
    });
  }

  initNav() {
    // --- Standard nav links (excluding submenu items) ---
    document.querySelectorAll('.sidebar nav > a, .sidebar nav > div:not(.nav-has-submenu) a').forEach(a => {
      if (a.closest('.nav-submenu')) return; // skip submenu items, handled separately
      a.addEventListener('click', () => {
        const tool = a.dataset.tool;
        if (!tool) return;
        this.navigateTo(tool);
        // Close any open submenus
        document.querySelectorAll('.nav-has-submenu.open').forEach(m => m.classList.remove('open'));
      });
    });

    // --- UML Submenu trigger ---
    const umlTrigger = document.getElementById('uml-nav-trigger');
    const umlSubmenuContainer = umlTrigger?.closest('.nav-has-submenu');
    const umlSubmenu = document.getElementById('uml-submenu');
    if (umlTrigger && umlSubmenuContainer && umlSubmenu) {
      umlTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = umlSubmenuContainer.classList.toggle('open');
        if (isOpen) {
          // Position the submenu next to the trigger
          const rect = umlTrigger.getBoundingClientRect();
          const menuHeight = umlSubmenu.scrollHeight || 400;
          let top = rect.top;
          // Prevent overflow below viewport
          if (top + menuHeight > window.innerHeight) {
            top = Math.max(8, window.innerHeight - menuHeight - 8);
          }
          umlSubmenu.style.left = (rect.right + 6) + 'px';
          umlSubmenu.style.top = top + 'px';
        }
      });
    }

    // --- UML Submenu item clicks ---
    document.querySelectorAll('#uml-submenu a[data-uml-type]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const umlType = item.dataset.umlType;
        const typeDef = umlDiagramTypes[umlType];
        if (!typeDef) return;

        // Navigate to UML section
        this.navigateTo('uml');
        // Also mark trigger as active
        umlTrigger?.classList.add('active');

        // Lazy init then swap components
        if (!this.uml) {
          this.uml = new DiagramTool('uml', typeDef.components, { paletteMode: 'dropdown' });
        } else {
          this.uml.swapComponents(typeDef.components);
        }
        this.currentUmlType = umlType;

        // Update section title
        const umlSection = document.getElementById('uml');
        const h1 = umlSection?.querySelector('.section-header h1');
        const desc = umlSection?.querySelector('.section-header p');
        if (h1) h1.textContent = `UML図 - ${typeDef.label}`;
        if (desc) desc.textContent = `${typeDef.label}を作成・編集します`;

        // Mark active submenu item
        document.querySelectorAll('#uml-submenu a').forEach(x => x.classList.remove('active'));
        item.classList.add('active');

        // Close submenu
        umlSubmenuContainer.classList.remove('open');
        showToast(`${typeDef.label}モードに切り替えました`);
      });
    });
  }

  navigateTo(tool) {
    document.querySelectorAll('.sidebar nav a').forEach(x => x.classList.remove('active'));
    // Find and activate the correct sidebar link
    const navLink = document.querySelector(`.sidebar nav a[data-tool="${tool}"]:not(.nav-submenu a)`) ||
                    document.querySelector(`.sidebar nav a[data-tool="${tool}"]`);
    if (navLink) navLink.classList.add('active');
    document.querySelectorAll('.tool-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(tool);
    if (section) section.classList.add('active');
    this.currentTool = tool;
    // Lazy init
    if (tool === 'architecture' && !this.architecture) this.architecture = new DiagramTool('arch', archComponents, { paletteMode: 'dropdown' });
    if (tool === 'uml' && !this.uml) this.uml = new DiagramTool('uml', umlComponents, { paletteMode: 'dropdown' });
    if (tool === 'screen-transition' && !this.screenTransition) this.screenTransition = new DiagramTool('st', screenTransitionComponents, { paletteMode: 'dropdown' });
    if (tool === 'layout' && !this.layout) this.layout = new LayoutTool();
    if (tool === 'erdiagram' && !this.erdiagram) this.erdiagram = new ERDiagramTool();
    if (tool === 'gantt' && !this.gantt) this.gantt = new GanttTool();
  }
  initDashboard() {
    const features = [
      { id:'proposal', icon:'💡', title:'技術スタック提案', desc:'プロジェクトに最適な言語・フレームワーク・サービスをAIが提案' },
      { id:'requirements', icon:'📋', title:'要件定義書作成', desc:'テンプレートベースで要件定義書を効率的に作成・出力' },
      { id:'architecture', icon:'🏗️', title:'システム構成図', desc:'ドラッグ&ドロップでシステムアーキテクチャを設計' },
      { id:'uml', icon:'📐', title:'UML図', desc:'クラス図・ユースケース図・シーケンス図などのUMLダイアグラムを作成' },
      { id:'screen-transition', icon:'🔄', title:'画面遷移図', desc:'アプリケーションの画面フローとユーザー操作の遷移を設計' },
      { id:'layout', icon:'📐', title:'画面レイアウト', desc:'ワイヤーフレームをドラッグ&ドロップで構築' },
      { id:'erdiagram', icon:'🗃️', title:'E-R図', desc:'エンティティとリレーションシップを直感的に設計' },
      { id:'gantt', icon:'📅', title:'ガントチャート', desc:'プロジェクトスケジュールを視覚的に管理' },
    ];
    const container = document.getElementById('dashboard-cards');
    container.innerHTML = features.map(f => `
      <div class="card feature-card" data-nav="${f.id}">
        <div class="card-icon">${f.icon}</div>
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
        <span class="card-arrow">→</span>
      </div>
    `).join('');
    container.querySelectorAll('.feature-card').forEach(c => {
      c.addEventListener('click', () => {
        document.querySelector(`.sidebar nav a[data-tool="${c.dataset.nav}"]`).click();
      });
    });
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}

function showModal(title, bodyHtml, onConfirm) {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <h2>${title}</h2>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="modal-cancel">キャンセル</button>
          <button class="btn btn-primary" id="modal-confirm">確定</button>
        </div>
      </div>
    </div>`;
  container.querySelector('#modal-cancel').onclick = () => container.innerHTML = '';
  container.querySelector('#modal-confirm').onclick = () => { if(onConfirm) onConfirm(); container.innerHTML = ''; };
  container.querySelector('.modal-overlay').addEventListener('click', e => { if(e.target === e.currentTarget) container.innerHTML = ''; });
}



// --- Hamburger menu toggle (mobile) ---
document.addEventListener('DOMContentLoaded', async () => {
  // instantiate app & load HTML partials
  if (!window.app) {
    window.app = new App();
    await window.app.init();
  }

  // Initialize Lucide icons after HTML partials are loaded
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const ham = document.getElementById('hamburger');
  const overlay = document.getElementById('menu-overlay');

  function closeMenu() { document.body.classList.remove('menu-open'); }
  function toggleMenu() { document.body.classList.toggle('menu-open'); }

  if (ham) ham.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Close menu when navigation link clicked (mobile)
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    a.addEventListener('click', () => { closeMenu(); });
  });

  // Close submenus when clicking outside
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-has-submenu.open').forEach(menu => {
      if (!menu.contains(e.target)) {
        menu.classList.remove('open');
      }
    });
  });
});
