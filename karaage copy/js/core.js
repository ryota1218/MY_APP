/* ===== Core Application ===== */

/**
 * セクション定義: html/ フォルダのパーシャルファイルと対応
 * id       — <section> の id 属性 / サイドバーの data-tool 値
 * file     — html/ 内のファイル名
 * default  — 初期表示時に active にするかどうか
 */
const SECTIONS = [
  { id: 'dashboard',    file: 'html/dashboard.html',    default: true },
  { id: 'project',      file: 'html/project.html' },
  { id: 'proposal',     file: 'html/proposal.html' },
  { id: 'requirements', file: 'html/requirements.html' },
  { id: 'architecture', file: 'html/diagram-template.html', prefix: 'arch', appProp: 'architecture' },
  { id: 'uml',          file: 'html/diagram-template.html', prefix: 'uml',  appProp: 'uml' },
  { id: 'screen-transition', file: 'html/diagram-template.html', prefix: 'st', appProp: 'screenTransition' },
  { id: 'layout',       file: 'html/layout.html' },
  { id: 'erdiagram',    file: 'html/erdiagram.html' },
  { id: 'gantt',        file: 'html/gantt.html' },
  { id: 'login',        file: 'html/login.html' },
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
    this.gantt = new GanttTool(); // 起動時にガントデータをロード/保存する
    this.initDashboard();
    this.proposal = new ProposalTool();
    this.requirements = new RequirementsTool();

    // ログイン状態をUIに反映（各セクションのHTMLがロードされた後に実行）
    if (window.Auth) window.Auth.updateUI();

    // グローバルクリックイベント（エクスポートドロップダウンを閉じる用）
    document.addEventListener('click', e => {
      if (!e.target.closest('.export-dropdown')) {
        document.querySelectorAll('.export-dropdown-content').forEach(el => {
          el.style.display = 'none';
        });
      }
    });
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
    document.querySelectorAll('.sidebar nav > a, .sidebar nav > div:not(.nav-has-submenu) a, #auth-action-btn').forEach(el => {
      if (el.closest('.nav-submenu')) return; // サブメニュー内は別途処理
      el.addEventListener('click', () => {
        const tool = el.dataset.tool;
        if (!tool) return;
        this.navigateTo(tool);
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
          this.uml = new DiagramTool('uml', typeDef.components, { paletteMode: 'dropdown', umlType: umlType });
        } else {
          this.uml.swapComponents(typeDef.components, umlType);
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
    console.log('Navigating to:', tool);
    
    // ツール切り替え時、開いている右側パネルを閉じ、左側サイドバーを元の表示に復元する
    document.body.classList.remove('sidebar-collapsed');
    delete document.body.dataset.sidebarCollapsedByUser;
    document.querySelectorAll('.diagram-property-panel, .diagram-ai-chat-panel').forEach(panel => {
      panel.classList.remove('open');
    });

    // サイドバーのリンク状態を更新
    document.querySelectorAll('.sidebar nav a, #auth-action-btn').forEach(x => x.classList.remove('active'));

    // Find and activate the correct sidebar link
    const navLink = document.querySelector(`.sidebar nav a[data-tool="${tool}"]:not(.nav-submenu a)`) ||
                    document.querySelector(`.sidebar nav a[data-tool="${tool}"]`);
    if (navLink) navLink.classList.add('active');
    
    // セクションの表示切り替え
    document.querySelectorAll('.tool-section').forEach(s => {
      s.classList.toggle('active', s.id === tool);
    });
    
    this.currentTool = tool;

    // アイコンの再描画（動的に読み込まれた要素のため）
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Lazy init
    if (tool === 'project' && !this.project) this.project = new ProjectTool();
    if (tool === 'architecture' && !this.architecture) this.architecture = new DiagramTool('arch', archComponents, { paletteMode: 'dropdown' });
    if (tool === 'uml' && !this.uml) this.uml = new DiagramTool('uml', umlComponents, { paletteMode: 'dropdown' });
    if (tool === 'screen-transition' && !this.screenTransition) this.screenTransition = new DiagramTool('st', screenTransitionComponents, { paletteMode: 'dropdown' });
    if (tool === 'layout' && !this.layout) this.layout = new LayoutTool();
    if (tool === 'erdiagram' && !this.erdiagram) this.erdiagram = new ERDiagramTool();
    if (tool === 'gantt' && !this.gantt) this.gantt = new GanttTool();
  }
  async initDashboard() {
    console.log("Dashboard initialized.");
    this.dashboardFilters = { name: '', type: '', date: '', status: '' };
    
    const filterBtn = document.getElementById('diagram-filter-btn');
    if (filterBtn) {
      filterBtn.onclick = () => this.showFilterModal();
    }

    await this.refreshDashboardData();
    this.renderDashboardGantt();
  }

  showFilterModal() {
    const bodyHtml = `
      <div class="form-group">
        <label>図名</label>
        <input type="text" id="filter-name" class="form-input" value="${this.dashboardFilters.name}" placeholder="名前で検索...">
      </div>
      <div class="form-group">
        <label>種類</label>
        <select id="filter-type" class="form-input">
          <option value="">すべて</option>
          <option value="architecture">システム構成図</option>
          <option value="uml">UML図</option>
          <option value="screen-transition">画面遷移図</option>
          <option value="layout">画面レイアウト</option>
          <option value="erdiagram">E-R図</option>
        </select>
      </div>
      <div class="form-group">
        <label>更新日時</label>
        <input type="date" id="filter-date" class="form-input" value="${this.dashboardFilters.date}">
      </div>
      <div class="form-group">
        <label>ステータス</label>
        <select id="filter-status" class="form-input">
          <option value="">すべて</option>
          <option value="creating" ${this.dashboardFilters.status === 'creating' ? 'selected' : ''}>作成中</option>
          <option value="completed" ${this.dashboardFilters.status === 'completed' ? 'selected' : ''}>完了</option>
          <option value="on_hold" ${this.dashboardFilters.status === 'on_hold' ? 'selected' : ''}>保留</option>
        </select>
      </div>
    `;

    showModal('フィルタ設定', bodyHtml, () => {
      this.dashboardFilters = {
        name: document.getElementById('filter-name').value,
        type: document.getElementById('filter-type').value,
        date: document.getElementById('filter-date').value,
        status: document.getElementById('filter-status').value
      };
      this.renderDashboardCards(); // フィルタ適用時は保持しているデータから再描画
      showToast('フィルタを適用しました');
    });
  }

  /**
   * データベース（現在はlocalStorage）から図面データを取得する
   * DB実装時はここをAPIリクエストに置き換えます
   */
  async fetchDiagrams() {
    const keys = [
      { key: 'arch_diagrams', type: 'architecture', label: 'システム構成図' },
      { key: 'uml_diagrams', type: 'uml', label: 'UML図' },
      { key: 'st_diagrams', type: 'screen-transition', label: '画面遷移図' },
      { key: 'layout_screens', type: 'layout', label: '画面レイアウト' },
      { key: 'er_diagrams', type: 'erdiagram', label: 'E-R図' }
    ];

    let allItems = [];
    keys.forEach(k => {
      const data = localStorage.getItem(k.key);
      if (data) {
        const items = JSON.parse(data).map(item => ({ ...item, toolType: k.type, toolLabel: k.label }));
        allItems = [...allItems, ...items];
      }
    });
    return allItems;
  }

  /**
   * ダッシュボードのデータを最新の状態に更新する
   */
  async refreshDashboardData() {
    this.allDiagrams = await this.fetchDiagrams();
    this.updateStats();
    this.renderDashboardCards();
  }

  /**
   * 統計情報（図の総数）を更新する
   */
  updateStats() {
    const totalStatEl = document.getElementById('total-diagrams-stat');
    if (totalStatEl && this.allDiagrams) {
      totalStatEl.textContent = this.allDiagrams.length;
    }
  }

  renderDashboardCards() {
    const container = document.getElementById('dashboard-cards');
    if (!container || !this.allDiagrams) return;

    const filtered = this.allDiagrams.filter(item => {
      const matchName = !this.dashboardFilters.name || item.title?.toLowerCase().includes(this.dashboardFilters.name.toLowerCase());
      const matchType = !this.dashboardFilters.type || item.toolType === this.dashboardFilters.type;
      const matchDate = !this.dashboardFilters.date || item.updated_at?.startsWith(this.dashboardFilters.date);
      const matchStatus = !this.dashboardFilters.status || item.status === this.dashboardFilters.status;
      return matchName && matchType && matchDate && matchStatus;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">該当する図面が見つかりません</div>';
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="card diagram-card" onclick="window.app.navigateTo('${item.toolType}')">
        <div class="diagram-type-tag">${item.toolLabel}</div>
        <h3>${item.title || '無題の図面'}</h3>
        <div class="diagram-meta">
          <span><i data-lucide="calendar" class="icon-xs"></i> ${item.updated_at ? item.updated_at.split(' ')[0] : '-'}</span>
          <span class="status-badge status-${item.status || 'creating'}">${this.getStatusLabel(item.status)}</span>
        </div>
      </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  getStatusLabel(status) {
    const labels = { creating: '作成中', completed: '完了', on_hold: '保留' };
    return labels[status] || '作成中';
  }

  /**
   * ダッシュボードに直近1週間の簡易ガントチャートを表示
   */
  renderDashboardGantt() {
    const container = document.getElementById('dashboard-gantt-preview');
    if (!container) return;

    // 厳密にUTCで日付を処理するためのヘルパー
    const parseDate = (dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    };
    const formatDate = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const getDayNumber = (dateStr) => {
      const d = parseDate(dateStr);
      return Math.floor(d.getTime() / 86400000);
    };

    const saved = localStorage.getItem('gantt_tasks');
    const allTasks = saved ? JSON.parse(saved) : [];
    const tasks = allTasks; // フェーズも含めて取得

    const miniDayWidth = 40; // 1日あたりの幅を広げて、日付と曜日が折り返さないように調整
    const numDaysToShow = 7; // Always show 7 days

    const now = new Date();
    const miniStartDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); // 今日から開始
    const miniEndDate = new Date(miniStartDate);
    miniEndDate.setUTCDate(miniEndDate.getUTCDate() + numDaysToShow - 1);

    const miniStartDayNum = getDayNumber(formatDate(miniStartDate));

    // Header (days) generation
    let daysHtml = '';
    for (let i = 0; i < numDaysToShow; i++) {
      const d = new Date(miniStartDate);
      d.setUTCDate(d.getUTCDate() + i);
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
      daysHtml += `<div class="mini-day-cell ${isWeekend ? 'weekend' : ''}" style="width: ${miniDayWidth}px;">${d.getUTCDate()}&nbsp;<span>${['日', '月', '火', '水', '木', '金', '土'][d.getUTCDay()]}</span></div>`;
    }

    // 表示期間に含まれるフェーズと、未完了のタスクを抽出
    const filteredTasks = tasks.filter(t => {
      // タスク（フェーズ以外）の場合、完了済みは表示しない
      if (!t.phase && t.actualEnd) return false;

      const startNum = getDayNumber(t.start);
      const endNum = getDayNumber(t.end);
      const viewEndNum = miniStartDayNum + numDaysToShow - 1;

      // 「今日以降に終了する」かつ「1週間以内に開始する（または継続中）」タスクのみ
      return endNum >= miniStartDayNum && startNum <= viewEndNum;
    }).sort((a, b) => {
      const diff = getDayNumber(a.start) - getDayNumber(b.start);
      if (diff !== 0) return diff;
      // 開始日が同じならフェーズを先に表示する
      return (b.phase ? 1 : 0) - (a.phase ? 1 : 0);
    });

    let rowsHtml = '';

    filteredTasks.forEach(t => {
      const taskStartDayNum = getDayNumber(t.start);
      const taskEndDayNum = getDayNumber(t.end);

      // Calculate bar position and width relative to the miniStartDate
      let startOffsetDays = taskStartDayNum - miniStartDayNum;
      let durationDays = (taskEndDayNum - taskStartDayNum) + 1;

      // Adjust if task starts before the view window
      if (startOffsetDays < 0) {
        durationDays += startOffsetDays; // Reduce duration by the amount it's outside
        startOffsetDays = 0; // Start at the beginning of the view window
      }
      // Adjust if task ends after the view window
      if (startOffsetDays + durationDays > numDaysToShow) {
        durationDays = numDaysToShow - startOffsetDays;
      }

      const left = startOffsetDays * miniDayWidth;
      const width = durationDays * miniDayWidth;

      const barColor = t.color || '#7c3aed';
      const strokeColor = t.actualEnd ? barColor : (t.actualStart ? '#f59e0b' : barColor);

      // フェーズ行の場合はバーを表示せず、見出しとしての役割に限定する
      // もしフェーズの期間も視覚化したい場合は、barHtml を生成するように変更可能です
      const barHtml = t.phase ? '' : 
        `<div class="mini-gantt-bar" style="left:${left}px; width:${width}px; background:linear-gradient(135deg, ${barColor}, ${barColor}cc); border-left:2px solid ${strokeColor}; opacity:${t.actualEnd ? 0.6 : 1};"></div>`;

      rowsHtml += `
        <div class="mini-gantt-row ${t.phase ? 'phase-row' : ''}">
          <div class="mini-task-label">${t.phase ? '<strong>' + t.name + '</strong>' : t.name}</div>
          <div class="mini-timeline-area" style="width: ${numDaysToShow * miniDayWidth}px; background-size: ${miniDayWidth}px 100%;">
            ${barHtml}
          </div>
        </div>`;
    });

    // The overall width of the timeline content (days header and bars)
    const timelineContentWidth = numDaysToShow * miniDayWidth;

    container.innerHTML = `
      <div class="mini-gantt-wrapper">
        <div class="mini-gantt-header-row">
          <div class="mini-task-label header">タスク名</div>
          <div class="mini-days-header-content" style="width: ${timelineContentWidth}px;">${daysHtml}</div>
        </div>
        <div class="mini-gantt-body-content">
          ${rowsHtml || '<div style="grid-column: 1 / -1; text-align:center;color:#9ca3af;font-size:0.8rem; padding: 20px;">今週の予定はありません</div>'}
        </div>
      </div>`;
  }
}

// 全画面共通のボタンアクション処理 (data-actionを持つ要素をクリックした際の処理)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.dataset.action === 'showUserProfile') return; // プロフィールはprofile.jsで個別処理

  const action = btn.dataset.action;
  const toolId = window.app?.currentTool;
  if (!toolId) return;

  // ツールIDからインスタンス名へのマッピング (例: screen-transition -> screenTransition)
  const mapping = { 'screen-transition': 'screenTransition', 'erdiagram': 'erdiagram', 'architecture': 'architecture', 'uml': 'uml', 'gantt': 'gantt', 'layout': 'layout' };
  const instance = window.app[mapping[toolId] || toolId];

  if (instance && typeof instance[action] === 'function') {
    instance[action]();
  }
});

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}

function showModal(title, bodyHtml, onConfirm) {
  const container = document.getElementById('modal-container');
  container.style.display = 'block';
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
  const close = () => { container.innerHTML = ''; container.style.display = 'none'; };
  container.querySelector('#modal-cancel').onclick = close;
  container.querySelector('#modal-confirm').onclick = () => { if(onConfirm) onConfirm(); close(); };
  container.querySelector('.modal-overlay').addEventListener('click', e => { if(e.target === e.currentTarget) close(); });
}

function installInstantTooltips() {
  if (document.getElementById('instant-label-tooltip')) return;

  const tooltip = document.createElement('div');
  tooltip.id = 'instant-label-tooltip';
  tooltip.className = 'instant-label-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  document.body.appendChild(tooltip);

  let activeTarget = null;

  const getLabel = (target) => target?.dataset?.label || target?.getAttribute('title') || '';

  const positionTooltip = () => {
    if (!activeTarget || tooltip.classList.contains('is-hidden')) return;
    const rect = activeTarget.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 8;
    let top = rect.top - tooltipRect.height - margin;
    if (top < margin) top = rect.bottom + margin;
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  const show = (target) => {
    const label = getLabel(target);
    if (!label) return;
    activeTarget = target;
    tooltip.textContent = label;
    tooltip.classList.remove('is-hidden');
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
    requestAnimationFrame(() => {
      if (activeTarget !== target) return;
      positionTooltip();
      tooltip.style.visibility = 'visible';
      tooltip.style.opacity = '1';
    });
  };

  const hide = () => {
    activeTarget = null;
    tooltip.classList.add('is-hidden');
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
  };

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-label], [title]');
    if (!target || target === tooltip) return;
    show(target);
  });

  document.addEventListener('mousemove', () => {
    if (activeTarget) positionTooltip();
  });

  document.addEventListener('mouseout', (e) => {
    if (!activeTarget) return;
    const related = e.relatedTarget;
    if (related && (activeTarget.contains(related) || tooltip.contains(related))) return;
    const target = e.target.closest('[data-label], [title]');
    if (target && target === activeTarget) hide();
  });

  window.addEventListener('scroll', hide, true);
  window.addEventListener('blur', hide);
}



// --- Hamburger menu toggle (mobile) ---
document.addEventListener('DOMContentLoaded', async () => {
  installInstantTooltips();

  // instantiate app & load HTML partials
  if (!(window.app instanceof App)) {
    const existingApp = window.app || {};
    window.app = new App();
    Object.assign(window.app, existingApp);
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

  // Floating Sidebar toggle handle click event
  const toggleHandle = document.getElementById('sidebar-toggle-handle');
  if (toggleHandle) {
    toggleHandle.addEventListener('click', () => {
      const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
      if (isCollapsed) {
        document.body.dataset.sidebarCollapsedByUser = 'true';
      } else {
        document.body.dataset.sidebarCollapsedByUser = 'false';
      }
    });
  }

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
