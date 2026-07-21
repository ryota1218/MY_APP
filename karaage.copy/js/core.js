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
    this.initGlobalShortcuts();
    this.gantt = new GanttTool(); // 起動時にガントデータをロード/保存する
    this.initDashboard();

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

    // --- Embedded tool links outside sidebar ---
    document.querySelectorAll('[data-tool]').forEach(el => {
      if (el.closest('.sidebar nav')) return;
      if (el.closest('#uml-submenu')) return;
      if (el.id === 'auth-action-btn') return;
      el.addEventListener('click', (e) => {
        const tool = el.dataset.tool;
        if (!tool) return;
        e.preventDefault();
        this.navigateTo(tool);
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
          // テーマカラーを即時反映（JSによる動的配置のため直接指定）
          umlSubmenu.style.background = 'var(--nav-submenu-bg)';
          umlSubmenu.style.borderColor = 'var(--nav-submenu-border)';
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

        // すでに同じUMLタイプの場合は、キャンバスをクリアせずに単に遷移するだけ
        if (this.currentUmlType === umlType) {
          this.navigateTo('uml');
          umlTrigger?.classList.add('active');
          document.querySelectorAll('#uml-submenu a').forEach(x => x.classList.remove('active'));
          item.classList.add('active');
          umlSubmenuContainer.classList.remove('open');
          return;
        }

        const proceedWithSwitch = () => {
          // Navigate to UML section
          this.navigateTo('uml');
          // Also mark trigger as active
          umlTrigger?.classList.add('active');

          if (this.uml) this.uml.clearAll(true);

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
        };

        // 別の図からUML図に遷移した時は確認ダイアログを出さない（現在UMLツールを開いている時のみ）
        // かつ、図に未保存の変更（差分）がある場合のみダイアログを出す
        if (this.currentTool === 'uml' && this.uml && this.uml.isDirty) {
          showConfirm(
            '未保存の変更',
            '図の種類を変更すると現在の作業領域がクリアされます。<br>現在の内容を保存して移動しますか？<br><small style="color:var(--text-muted);">(背景をクリックするとキャンセルします)</small>',
            () => {
              if (typeof this.uml.saveDiagram === 'function') {
                this.uml.saveDiagram().then((saved) => {
                  if (saved) proceedWithSwitch();
                });
              } else {
                proceedWithSwitch();
              }
            },
            '保存して移動',
            '保存せず移動',
            () => {
              proceedWithSwitch();
            }
          );
        } else {
          proceedWithSwitch();
        }
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

    // 現在のツール情報をbodyに反映（CSSでツールごとのテーマを制御可能にする）
    document.body.dataset.activeTool = tool;

    if (tool === 'uml') {
      if (this.currentUmlType) {
        document.body.dataset.activeUmlType = this.currentUmlType;
        // サブメニューのアクティブ状態を現在のタイプに同期
        document.querySelectorAll('#uml-submenu a').forEach(item => {
          item.classList.toggle('active', item.dataset.umlType === this.currentUmlType);
        });
      }
    } else {
      // UML以外のツールに移動した場合はUML固有のデータ属性をクリア
      delete document.body.dataset.activeUmlType;
    }

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

    if (tool === 'dashboard') {
      this.refreshDashboardData();
      this.renderDashboardGantt();
    }

    // 各タブ遷移時にデータを最新化（再読み込み）
    if (tool === 'project' && this.project) {
      this.project.refreshProjects();
    }
    if (tool === 'gantt' && this.gantt) {
      this.gantt.loadGanttData();
    }
  }

  initGlobalShortcuts() {

  if (this.shortcutsInitialized) return;
  this.shortcutsInitialized = true;

  document.addEventListener('keydown', (e) => {

    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable
    ) {
      return;
    }

    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;

    const activeTool = this.getActiveToolInstance();

    if (!activeTool) return;

    switch (e.key.toLowerCase()) {

      case 'z':
        e.preventDefault();

        if (e.shiftKey) {
          activeTool.redoLastAction?.();
        } else {
          activeTool.undoLastAction?.();
        }
        break;

      case 'y':
        e.preventDefault();
        activeTool.redoLastAction?.();
        break;

      case 'c':
        e.preventDefault();
        activeTool.copySelected?.();
        break;

      case 'x':
        e.preventDefault();
        activeTool.cutSelected?.();
        break;

      case 'v':
        e.preventDefault();
        activeTool.pasteSelected?.();
        break;
    }
  });
}

getActiveToolInstance() {

  switch (this.currentTool) {

    case 'architecture':
      return this.architecture;

    case 'uml':
      return this.uml;

    case 'screen-transition':
      return this.screenTransition;

    case 'layout':
      return this.layout;

    case 'erdiagram':
      return this.erdiagram;

    case 'gantt':
      return this.gantt;

    default:
      return null;
  }
}
  async initDashboard() {
    console.log("Dashboard initialized.");
    this.dashboardFilters = { name: '', type: '', date: '', status: '' };
    
    const filterBtn = document.getElementById('diagram-filter-btn');
    if (filterBtn) {
      filterBtn.onclick = () => this.showFilterModal();
    }

    // プロジェクトの選択状態を復元表示
    const currentProjName = localStorage.getItem('current_project_name') || '未選択';
    const displayEl = document.getElementById('current-project-display');
    if (displayEl) {
      displayEl.textContent = currentProjName;
    }

    await this.refreshDashboardData();
    this.renderDashboardGantt();

    // リサイズ時にガントを再描画（デバウンス）
    if (!this._ganttResizeHandlerAdded) {
      this._ganttResizeHandlerAdded = true;
      window.addEventListener('resize', () => {
        clearTimeout(this._ganttResizeTimer);
        this._ganttResizeTimer = setTimeout(() => this.renderDashboardGantt(), 150);
      });
    }
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
    });
  }

  /**
   * Supabaseのimagesテーブルから現在選択中のプロジェクトに属する図面データを取得する
   */
  async fetchDiagrams() {
    const projectId = localStorage.getItem('current_project_id');
    if (!projectId) return [];

    try {
      const res = await fetch(`/api/db/images?projectId=${projectId}`);
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch diagrams');
      const data = resData.data;
      if (!data) return [];

      const jpTypeToToolType = {
        'システム構成図': 'architecture',
        'UML図': 'uml',
        '画面遷移図': 'screen-transition',
        '画面レイアウト': 'layout',
        'E-R図': 'erdiagram',
        'ユースケース図': 'uml',
        'アクティビティ図': 'uml',
        'ステートマシン図': 'uml',
        '配置図': 'uml',
        'コンポーネント図': 'uml',
        'クラス図': 'uml',
        'オブジェクト図': 'uml',
        'パッケージ図': 'uml',
        '複合構造図': 'uml',
        'コミュニケーション図': 'uml',
        'シーケンス図': 'uml',
        '相互作用図': 'uml',
        'タイミング図': 'uml'
      };

      return data.map(item => {
        const toolType = jpTypeToToolType[item.chart_type] || 'uml';
        const statsMap = { '作成中': 'creating', '完了': 'completed', '保留': 'on_hold' };
        const mappedStatus = statsMap[item.stats] || 'creating';
        return {
          id: item.id,
          title: item.name,
          status: mappedStatus,
          toolType: toolType,
          toolLabel: item.chart_type,
          updated_at: item.update_att ? item.update_att.replace('T', ' ').substring(0, 19) : '-'
        };
      });
    } catch (err) {
      console.error('[App] Failed to fetch diagrams from DB:', err);
      return [];
    }
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
    const tableBody = document.getElementById('dashboard-table-body');
    if (!tableBody || !this.allDiagrams) return;

    const filtered = this.allDiagrams.filter(item => {
      const matchName = !this.dashboardFilters.name || item.title?.toLowerCase().includes(this.dashboardFilters.name.toLowerCase());
      const matchType = !this.dashboardFilters.type || item.toolType === this.dashboardFilters.type;
      const matchDate = !this.dashboardFilters.date || item.updated_at?.startsWith(this.dashboardFilters.date);
      const matchStatus = !this.dashboardFilters.status || item.status === this.dashboardFilters.status;
      return matchName && matchType && matchDate && matchStatus;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-muted);">該当する図面が見つかりません</td></tr>';
      return;
    }
// テーブルビューのレンダリング
    tableBody.innerHTML = filtered.map(item => `
      <tr class="dashboard-table-row" onclick="window.app.loadDiagramAndNavigate('${item.toolType}', '${item.id}', '${item.toolLabel}')">
        <td class="dashboard-table-cell title-cell">${item.title || '無題の図面'}</td>
        <td class="dashboard-table-cell type-cell">
          ${item.toolLabel}
        </td>
        <td class="dashboard-table-cell">
          <span class="status-badge status-${item.status || 'creating'}">${this.getStatusLabel(item.status)}</span>
        </td>
        <td class="dashboard-table-cell muted-cell">
          <span><i data-lucide="calendar" class="icon-xs"></i>${item.updated_at}</span>
        </td>
        <td class="dashboard-table-cell" style="text-align: center;">
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); window.app.deleteDiagram('${item.id}', '${item.title || '無題の図面'}')" title="削除" style="padding: 4px 8px; font-size: 0.8rem; display: inline-flex; align-items: center; justify-content: center;">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        </td>
      </tr>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  getStatusLabel(status) {
    const labels = { creating: '作成中', completed: '完了', on_hold: '保留' };
    return labels[status] || '作成中';
  }

  async deleteDiagram(id, title) {
    showConfirm(
      '図面の削除',
      `図面「${title}」を削除しますか？`,
      async () => {
        try {
          if (window.DBIO) {
            await window.DBIO.deleteDiagram(id);
            if (window.showToast) showToast('図面を削除しました');
            // DB側の反映を少し待つ（Supabase等の遅延対策）
            await new Promise(resolve => setTimeout(resolve, 500));
            // 再取得して再描画
            await this.refreshDashboardData();
          }
        } catch (e) {
          console.error(e);
          if (window.showToast) showToast('削除に失敗しました', 'danger');
        }
      }
    );
  }

  /**
   * ダッシュボードから選択した図をDBからロードし、該当のツール画面へ遷移させる
   */
  async loadDiagramAndNavigate(toolType, id, toolLabel) {
    // 1. UML図の場合、サブタイプの設定を行う
    let umlType = null;
    if (toolType === 'uml') {
      const labelToUmlType = {
        'クラス図': 'class',
        'オブジェクト図': 'object',
        'パッケージ図': 'package',
        'コンポーネント図': 'component',
        '配置図': 'deployment',
        'コンポジット構造図': 'composite',
        'アクティビティ図': 'activity',
        'ステートマシン図': 'state',
        'ユースケース図': 'usecase',
        'コミュニケーション図': 'communication',
        'シーケンス図': 'sequence',
        '相互作用図': 'interaction',
        'タイミング図': 'timing'
      };
      umlType = labelToUmlType[toolLabel] || 'class';
    }

    // 2. 該当ツールセクションへのナビゲーション実行
    this.navigateTo(toolType);

    // 3. ツールインスタンスの特定
    let toolInstance = null;
    if (toolType === 'architecture') {
      toolInstance = this.architecture;
    } else if (toolType === 'uml') {
      // UML図のタイプをスワップする
      const typeDef = umlDiagramTypes[umlType];
      if (typeDef) {
        if (!this.uml) {
          this.uml = new DiagramTool('uml', typeDef.components, { paletteMode: 'dropdown', umlType: umlType });
        } else {
          this.uml.swapComponents(typeDef.components, umlType);
        }
        this.currentUmlType = umlType;

        // UI表示の更新
        const umlSection = document.getElementById('uml');
        const h1 = umlSection?.querySelector('.section-header h1');
        const desc = umlSection?.querySelector('.section-header p');
        if (h1) h1.textContent = `UML図 - ${typeDef.label}`;
        if (desc) desc.textContent = `${typeDef.label}を作成・編集します`;

        // サイドバーのサブメニューハイライト
        document.querySelectorAll('#uml-submenu a').forEach(x => x.classList.remove('active'));
        const activeSubmenuItem = document.querySelector(`#uml-submenu a[data-uml-type="${umlType}"]`);
        if (activeSubmenuItem) activeSubmenuItem.classList.add('active');
      }
      toolInstance = this.uml;
    } else if (toolType === 'screen-transition') {
      toolInstance = this.screenTransition;
    } else if (toolType === 'layout') {
      toolInstance = this.layout;
    } else if (toolType === 'erdiagram') {
      toolInstance = this.erdiagram;
    }

    if (!toolInstance) {
      console.error('[App] Target tool instance not found for:', toolType);
      return;
    }

    // 4. DBIOに読み込みコールバックを設定して、DBからデータを取得・流し込む
    if (window.DBIO) {
      window.DBIO.pendingLoadCallback = (chartData, loadId, name, status) => {
        if (typeof toolInstance.restoreSnapshot === 'function') {
          toolInstance.restoreSnapshot(chartData);
          showToast(`${name} を読み込みました`);
        } else {
          console.error('[App] restoreSnapshot method not found on toolInstance');
        }
      };

      // 実際のロードを実行
      await window.DBIO.executeLoad(id, '', '');
    } else {
      showToast('データベース連携モジュールが見つかりません', 'danger');
    }
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

    // Start timeline from today and extend forward until it fills the visible area
    const now = new Date();
    const miniStartDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); // 今日から開始

    // Calculate available width and determine how many days fit
    const containerWidth = container.clientWidth || container.offsetWidth || window.innerWidth;
    const labelColumnWidth = 220; // estimate for task label column
    const minDayWidth = 36; // per-day minimum width for readability — increased so dates fit
    const availableTimelineWidth = Math.max(containerWidth - labelColumnWidth, minDayWidth);
    let numDaysToShow = Math.max(1, Math.floor(availableTimelineWidth / minDayWidth));
    // Recompute exact per-day width so the timeline fills the area without leftover gap
    const miniDayWidth = Math.max(minDayWidth, Math.floor(availableTimelineWidth / numDaysToShow));

    const miniEndDate = new Date(miniStartDate);
    miniEndDate.setUTCDate(miniEndDate.getUTCDate() + numDaysToShow - 1);

    const miniStartDayNum = getDayNumber(formatDate(miniStartDate));

    // Header (days) generation: dynamically adjust font-size and spacing so labels fit
    let daysHtml = '';
    // Compute font size based on per-day width (clamped between 10 and 16px)
    const fontSize = Math.max(10, Math.min(16, Math.floor(miniDayWidth * 0.28)));
    // If cells are narrow, show labels every `showEvery` days to avoid unreadable overlap
    const showEvery = miniDayWidth < 28 ? Math.ceil(28 / miniDayWidth) : 1;
    for (let i = 0; i < numDaysToShow; i++) {
      const d = new Date(miniStartDate);
      d.setUTCDate(d.getUTCDate() + i);
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
      const showLabel = (i % showEvery) === 0;
      const dayNum = showLabel ? d.getUTCDate() : '';
      const weekLbl = showLabel ? `<span style="margin-left:2px;">${['日', '月', '火', '水', '木', '金', '土'][d.getUTCDay()]}</span>` : '';
      const cellStyle = `width: ${miniDayWidth}px; font-size:${fontSize}px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; box-sizing:border-box; padding:2px; display:flex; align-items:center; justify-content:center;`;
      daysHtml += `<div class="mini-day-cell ${isWeekend ? 'weekend' : ''}" style="${cellStyle}">${dayNum}${weekLbl}</div>`;
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

  if (action === 'toggleToolbarCollapse') {
    if (typeof window.initToolbarCollapse === 'function') {
      window.toggleToolbarCollapseState();
    }
    return;
  }

  const toolId = window.app?.currentTool;
  if (!toolId) return;

  // ツールIDからインスタンス名へのマッピング (例: screen-transition -> screenTransition)
  const mapping = { 'screen-transition': 'screenTransition', 'erdiagram': 'erdiagram', 'architecture': 'architecture', 'uml': 'uml', 'gantt': 'gantt', 'layout': 'layout' };
  const instance = window.app[mapping[toolId] || toolId];

  if (instance && typeof instance[action] === 'function') {
    if (action === 'setMode') {
      instance[action](btn.dataset.mode);
    } else {
      instance[action]();
    }
  }
});

// グローバルなキーボードショートカット (キャンバス操作モード切替)
document.addEventListener('keydown', (e) => {
  // 入力フィールドでのタイピング時は無視
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
  // 修飾キー(Ctrl/Cmd/Alt)が押されている場合は無視 (他のショートカットと競合させないため)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const key = e.key.toLowerCase();
  if (['v', 'c', 'd'].includes(key)) {
    const toolId = window.app?.currentTool;
    if (!toolId) return;
    const mapping = { 'screen-transition': 'screenTransition', 'erdiagram': 'erdiagram', 'architecture': 'architecture', 'uml': 'uml', 'gantt': 'gantt', 'layout': 'layout' };
    const instance = window.app[mapping[toolId] || toolId];

    if (instance && typeof instance.setMode === 'function') {
      if (key === 'v') instance.setMode('select');
      if (key === 'c') instance.setMode('connect');
      if (key === 'd') instance.setMode('erase');
    }
  }
});

function showToast(msg, duration = 8000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-message">${msg}</span><button type="button" class="toast-close" aria-label="閉じる">×</button>`;
  const closeBtn = t.querySelector('.toast-close');

  const removeToast = () => {
    if (!t.parentNode) return;
    t.style.opacity = '0';
    setTimeout(() => {
      if (t.parentNode) t.remove();
    }, 250);
  };

  const autoRemoveTimer = setTimeout(removeToast, duration);
  t.dataset.toastTimer = String(autoRemoveTimer);

  closeBtn.addEventListener('click', () => {
    clearTimeout(autoRemoveTimer);
    removeToast();
  });

  container.appendChild(t);

  if (container.children.length > 5) {
    const oldest = container.firstElementChild;
    if (oldest && oldest !== t) {
      const oldestTimerId = Number(oldest.dataset.toastTimer);
      if (!Number.isNaN(oldestTimerId)) clearTimeout(oldestTimerId);
      oldest.style.opacity = '0';
      setTimeout(() => {
        if (oldest.parentNode) oldest.remove();
      }, 250);
    }
  }
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

function showConfirm(title, bodyHtml, onConfirm, confirmText = 'はい', cancelText = 'いいえ', onCancel = null) {
  const container = document.getElementById('modal-container');
  container.style.display = 'block';
  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal" style="max-width: 400px;">
        <h2>${title}</h2>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
          <button class="btn btn-primary" id="modal-confirm">${confirmText}</button>
        </div>
      </div>
    </div>`;
  const close = () => { container.innerHTML = ''; container.style.display = 'none'; };
  container.querySelector('#modal-cancel').onclick = () => { if(onCancel) onCancel(); close(); };
  container.querySelector('#modal-confirm').onclick = () => { if(onConfirm) onConfirm(); close(); };
  container.querySelector('.modal-overlay').addEventListener('click', e => { if(e.target === e.currentTarget) close(); });
}

function installInstantTooltips() {
  if (document.getElementById('instant-label-tooltip')) return;

  const tooltip = document.createElement('div');
  tooltip.id = 'instant-label-tooltip';
  tooltip.className = 'instant-label-tooltip is-hidden';
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
  if (typeof window.initToolbarCollapse === 'function') window.initToolbarCollapse();

  const ham = document.getElementById('hamburger');
  const overlay = document.getElementById('menu-overlay');
  const toggleHandle = document.getElementById('sidebar-toggle-handle');

  const closeMenu = () => {
    if (window.innerWidth <= 1024) {
      document.body.classList.remove('menu-open');
      if (ham) ham.setAttribute('aria-expanded', 'false');
    }
  };

  const toggleMenu = () => {
    if (window.innerWidth <= 1024) {
      const isOpen = document.body.classList.toggle('menu-open');
      if (ham) ham.setAttribute('aria-expanded', String(isOpen));
    } else {
      const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
      document.body.dataset.sidebarCollapsedByUser = isCollapsed ? 'true' : 'false';
      if (ham) ham.setAttribute('aria-expanded', 'false');
    }
  };

  const syncMenuState = () => {
    if (window.innerWidth > 1024) {
      document.body.classList.remove('menu-open');
      if (ham) ham.setAttribute('aria-expanded', 'false');
    }
  };

  if (ham) {
    ham.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMenu();
    });
  }
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Floating Sidebar toggle handle click event
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

  window.addEventListener('resize', syncMenuState);

  // instantiate app & load HTML partials
  if (!(window.app instanceof App)) {
    const existingApp = window.app || {};
    window.app = new App();
    Object.assign(window.app, existingApp);
    try {
      await window.app.init();
    } catch (error) {
      console.error('[App] Initialization failed:', error);
    }
  }

  // Initialize Lucide icons after HTML partials are loaded
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
// --- Toolbar Collapse Feature ---
window.initToolbarCollapse = function() {
  const isCollapsed = localStorage.getItem('karaage_toolbar_collapsed') === 'true';
  if (isCollapsed) {
    applyToolbarCollapseState(true);
  }
};

window.toggleToolbarCollapseState = function() {
  const isCurrentlyCollapsed = localStorage.getItem('karaage_toolbar_collapsed') === 'true';
  const newState = !isCurrentlyCollapsed;
  localStorage.setItem('karaage_toolbar_collapsed', newState);
  applyToolbarCollapseState(newState);
};

function applyToolbarCollapseState(isCollapsed) {
  // 全ダイアグラムツールバー（arch/uml/st など）を一括操作
  const allToolbars = document.querySelectorAll('.toolbar[id$="-toolbar-row2"]');
  const allBtns = document.querySelectorAll('.toolbar-collapse-btn');
  const allHeaders = document.querySelectorAll('.editor-header');

  allToolbars.forEach(toolbarRow2 => {
    if (isCollapsed) {
      toolbarRow2.classList.add('toolbar-collapsed');
    } else {
      toolbarRow2.classList.remove('toolbar-collapsed');
    }
  });

  allHeaders.forEach(header => {
    if (isCollapsed) {
      header.classList.add('header-toolbar-collapsed');
    } else {
      header.classList.remove('header-toolbar-collapsed');
    }
  });

  allBtns.forEach(btn => {
    btn.setAttribute('aria-expanded', String(!isCollapsed));
    if (isCollapsed) {
      btn.classList.add('collapsed');
    } else {
      btn.classList.remove('collapsed');
    }
  });
}
