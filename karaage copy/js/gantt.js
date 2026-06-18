"use strict";

// ============================================
// テストデータ（下記をコメントアウトして削除可能）
// ============================================
const GANTT_TEST_DATA = [
  // フェーズ1：要件定義
  { id:1, name:'要件定義', phase:true, start:'2026-06-01', end:'2026-06-14', color:'#7c3aed', actualStart:null, actualEnd:null },
  { id:2, name:'ヒアリング', phase:false, start:'2026-06-01', end:'2026-06-07', color:'#a78bfa', actualStart:null, actualEnd:null },
  { id:3, name:'要件書作成', phase:false, start:'2026-06-05', end:'2026-06-14', color:'#a78bfa', actualStart:null, actualEnd:null },
  
  // フェーズ2：基本設計
  { id:4, name:'基本設計', phase:true, start:'2026-06-12', end:'2026-06-28', color:'#06b6d4', actualStart:null, actualEnd:null },
  { id:5, name:'画面設計', phase:false, start:'2026-06-12', end:'2026-06-21', color:'#22d3ee', actualStart:null, actualEnd:null },
  { id:6, name:'DB設計', phase:false, start:'2026-06-15', end:'2026-06-25', color:'#22d3ee', actualStart:null, actualEnd:null },
  { id:7, name:'API設計', phase:false, start:'2026-06-19', end:'2026-06-28', color:'#22d3ee', actualStart:null, actualEnd:null },
  
  // フェーズ3：詳細設計
  { id:8, name:'詳細設計', phase:true, start:'2026-06-26', end:'2026-07-11', color:'#10b981', actualStart:null, actualEnd:null },
  { id:9, name:'コンポーネント設計', phase:false, start:'2026-06-26', end:'2026-07-04', color:'#34d399', actualStart:null, actualEnd:null },
  { id:10, name:'テスト計画', phase:false, start:'2026-07-01', end:'2026-07-11', color:'#34d399', actualStart:null, actualEnd:null },
];

// テストデータを使用するかどうか（true=使用、false=使用しない）
const USE_GANTT_TEST_DATA = true;
const PHASE_COLOR = '#2563eb';

// ============================================
// GanttTool クラス
// ============================================
class GanttTool {
  constructor() {
    this.tasks = [];
    this.selected = new Set(); // 選択状態を管理
    this.expandedPhases = new Set(); // フェーズの展開状態を管理
    this.overallStartOverride = null;
    this.overallEndOverride = null;
    this.taskIdCounter = 11;
    this.isSyncingScroll = false;

    this.setupButtons();
    this.loadGanttData();
  }

  async loadGanttData() {
    const projectId = window.DBIO ? window.DBIO.getCurrentProjectId() : null;
    if (!projectId) {
      this.loadFromLocal();
      this.render();
      return;
    }

    try {
      const jsonStr = await window.DBIO.fetchGanttData(projectId);
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        this.tasks = data.tasks || [];
        this.overallStartOverride = data.overallStartOverride || null;
        this.overallEndOverride = data.overallEndOverride || null;
        this.taskIdCounter = (this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) : 10) + 1;
        this.expandedPhases.clear();
        this.tasks.filter(t => t.phase).forEach(t => this.expandedPhases.add(t.id));
      } else {
        this.tasks = USE_GANTT_TEST_DATA ? JSON.parse(JSON.stringify(GANTT_TEST_DATA)) : [];
        this.overallStartOverride = null;
        this.overallEndOverride = null;
        this.taskIdCounter = (this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) : 10) + 1;
        this.expandedPhases.clear();
        this.tasks.filter(t => t.phase).forEach(t => this.expandedPhases.add(t.id));
      }
      
      // Update localStorage and refresh dashboard preview to keep them in sync
      localStorage.setItem('gantt_tasks', JSON.stringify(this.tasks));
      if (window.app && window.app.renderDashboardGantt) window.app.renderDashboardGantt();
      
      this.render();
    } catch (err) {
      console.error("Failed to load gantt data from DB:", err);
      if (window.showToast) showToast("DBからの読み込みに失敗しました。", "danger");
      this.loadFromLocal();
      this.render();
    }
  }

  loadFromLocal() {
    this.tasks = [];
    try {
      const saved = localStorage.getItem('gantt_tasks');
      if (saved) {
        this.tasks = JSON.parse(saved);
      } else if (USE_GANTT_TEST_DATA) {
        this.tasks = JSON.parse(JSON.stringify(GANTT_TEST_DATA));
      }
    } catch (e) {
      console.error("Failed to load tasks from local storage:", e);
    }
    this.overallStartOverride = null;
    this.overallEndOverride = null;
    this.taskIdCounter = (this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) : 10) + 1;
    this.expandedPhases.clear();
    this.tasks.filter(t => t.phase).forEach(t => this.expandedPhases.add(t.id));
  }

  setupButtons() {
    // ボタンイベントリスナーを設定
    const addPhaseBtn = document.getElementById('add-phase-btn');
    const addTaskBtn = document.getElementById('add-task-btn');
    const inputActualBtn = document.getElementById('input-actual-btn');
    const deleteBtn = document.getElementById('delete-selected-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');

    if (addPhaseBtn) {
      addPhaseBtn.onclick = () => this.addPhase();
    }
    const editDatesBtn = document.getElementById('edit-project-dates-btn');

    if (editDatesBtn) {
      editDatesBtn.onclick = () => this.editProjectDates();
    }
    if (addTaskBtn) {
      addTaskBtn.onclick = () => this.addTask();
    }
    if (inputActualBtn) {
      inputActualBtn.onclick = () => this.inputActual();
    }
    if (deleteBtn) {
      deleteBtn.onclick = () => this.deleteSelected();
    }
    if (exportCsvBtn) {
      exportCsvBtn.onclick = () => this.exportCSV();
    }

    const exportJsonBtn = document.getElementById('export-json-btn');
    if (exportJsonBtn) {
      exportJsonBtn.onclick = () => this.exportJSON();
    }

    // Calculator controls
    this.setupCalculatorControls();
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // パネルの表示切り替え
        const editPanel = document.getElementById('edit-panel');
        const editContent = document.getElementById('edit-content');
        const calculatorContent = document.getElementById('calculator-content');
        const tabType = tab.dataset.tab;

        if (tabType === 'edit') {
          editPanel.style.display = 'flex';
          editContent.style.display = 'flex';
          calculatorContent.style.display = 'none';
        } else if (tabType === 'calculator') {
          editPanel.style.display = 'none';
          editContent.style.display = 'none';
          calculatorContent.style.display = 'block';
          this.updateCalculator();
          this.setupCalculatorControls();
        }
      });
    });
  }

  setupCalculatorControls() {
    const effortBtn = document.getElementById('calc-effort-btn');
    const effortUnitUp = document.getElementById('effort-unit-up');
    const effortUnitDown = document.getElementById('effort-unit-down');
    const effortUnitSelect = document.getElementById('effort-unit');
    const effortUnitDisplay = document.getElementById('effort-unit-display');

    const units = ['hours', 'days', 'months'];
    const unitLabels = { hours: '時間', days: '日', months: '月' };

    const updateUnitDisplay = () => {
      if (!effortUnitSelect || !effortUnitDisplay) return;
      const currentUnit = effortUnitSelect.value;
      effortUnitDisplay.textContent = unitLabels[currentUnit] || '時間';
    };

    if (effortBtn) {
      effortBtn.onclick = () => this.performEffortCalculation();
    }

    // Remove old event listeners and add new ones
    if (effortUnitUp) {
      // Clone and replace to remove old listeners
      const newUpBtn = effortUnitUp.cloneNode(true);
      effortUnitUp.parentNode.replaceChild(newUpBtn, effortUnitUp);
      newUpBtn.onclick = () => {
        if (!effortUnitSelect) return;
        const currentIndex = units.indexOf(effortUnitSelect.value);
        const nextIndex = (currentIndex + 1) % units.length;
        effortUnitSelect.value = units[nextIndex];
        updateUnitDisplay();
      };
    }

    if (effortUnitDown) {
      // Clone and replace to remove old listeners
      const newDownBtn = effortUnitDown.cloneNode(true);
      effortUnitDown.parentNode.replaceChild(newDownBtn, effortUnitDown);
      newDownBtn.onclick = () => {
        if (!effortUnitSelect) return;
        const currentIndex = units.indexOf(effortUnitSelect.value);
        const nextIndex = (currentIndex - 1 + units.length) % units.length;
        effortUnitSelect.value = units[nextIndex];
        updateUnitDisplay();
      };
    }

    updateUnitDisplay();
  }

  performEffortCalculation() {
    const peopleInput = document.getElementById('effort-people');
    const valueInput = document.getElementById('effort-value');
    const unitInput = document.getElementById('effort-unit');
    const summaryText = document.getElementById('effort-summary-text');
    const resultHours = document.getElementById('effort-result-hours');
    const resultPersonDays = document.getElementById('effort-result-person-days');
    const resultPersonMonths = document.getElementById('effort-result-person-months');

    if (!peopleInput || !valueInput || !unitInput || !resultHours || !resultPersonDays || !resultPersonMonths) {
      showToast('工数計算の要素が見つかりません');
      return;
    }

    const people = Number(peopleInput.value);
    const value = Number(valueInput.value);
    const unit = unitInput.value;

    if (!people || !value) {
      showToast('人数と値を正しく入力してください');
      return;
    }

    // 単位に応じた変換
    let totalHours;
    if (unit === 'hours') {
      totalHours = people * value;
    } else if (unit === 'days') {
      totalHours = people * value * 8; // 1日 = 8時間
    } else if (unit === 'months') {
      totalHours = people * value * 20 * 8; // 1月 = 20日 = 160時間
    }

    const personDays = totalHours / 8;
    const personMonths = personDays / 20;

    resultHours.textContent = `${totalHours.toFixed(0)} 時間`;
    resultPersonDays.textContent = `${personDays.toFixed(2)} 人日`;
    resultPersonMonths.textContent = `${personMonths.toFixed(2)} 人月`;

    if (summaryText) {
      summaryText.textContent = `人時: ${totalHours.toFixed(0)}時間 / 人日: ${personDays.toFixed(2)}人日 / 人月: ${personMonths.toFixed(2)}人月`;
    }

    showToast(`工数を計算しました: ${totalHours.toFixed(0)}時間 / ${personDays.toFixed(2)}人日 / ${personMonths.toFixed(2)}人月`);
  }

  render() {
    this.renderTasks();
    this.renderTimeline();
    this.setupScrollSync(); // ←重要
    this.enableDrag(); // ドラッグ機能有効化
    this.updateCalculator(); // 計算機も更新
  }

  // ローカルストレージとデータベースにデータを同期
  async saveTasks() {
    const serialized = JSON.stringify(this.tasks);
    localStorage.setItem('gantt_tasks', serialized);
    if (window.app && window.app.renderDashboardGantt) window.app.renderDashboardGantt();

    const projectId = window.DBIO ? window.DBIO.getCurrentProjectId() : null;
    if (projectId) {
      try {
        const payload = {
          tasks: this.tasks,
          overallStartOverride: this.overallStartOverride,
          overallEndOverride: this.overallEndOverride
        };
        await window.DBIO.saveGanttData(projectId, JSON.stringify(payload));
      } catch (err) {
        console.error("Failed to save gantt data to DB:", err);
        if (window.showToast) showToast("DBへの保存に失敗しました。", "danger");
      }
    }
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // HTMLエスケープ（XSS対策）
  escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // "YYYY-MM-DD" 形式の日付文字列をUTC Dateに変換（タイムゾーン対応）
  parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    // UTCで日付を作成
    return new Date(Date.UTC(year, month - 1, day));
  }

  // 日付を「1970年1月1日からの日数」に変換（日数で正確に計算）
  getDayNumber(dateStr) {
    const d = this.parseDate(dateStr);
    return Math.floor(d.getTime() / 86400000);
  }

  getDateRange() {
    let min = '2099-12-31', max = '2000-01-01';

    this.tasks.forEach(t => {
      if (t.start < min) min = t.start;
      if (t.end > max) max = t.end;
    });

    // タスクが空の場合は今日を基準に
    if (this.tasks.length === 0) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      min = max = `${year}-${month}-${day}`;
    }

    if (this.overallStartOverride) {
      min = this.overallStartOverride;
    }
    if (this.overallEndOverride) {
      max = this.overallEndOverride;
    }

    const start = this.parseDate(min);
    start.setUTCDate(start.getUTCDate() - 3);

    const end = this.parseDate(max);
    end.setUTCDate(end.getUTCDate() + 7);

    return { start, end };
  }

  getProjectBounds() {
    if (this.tasks.length === 0) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return { start: `${year}-${month}-${day}`, end: `${year}-${month}-${day}` };
    }

    let min = '2099-12-31';
    let max = '2000-01-01';
    this.tasks.forEach(t => {
      if (t.start < min) min = t.start;
      if (t.end > max) max = t.end;
    });
    return { start: min, end: max };
  }

  editProjectDates() {
    const bounds = this.getProjectBounds();
    const startValue = this.overallStartOverride || bounds.start;
    const endValue = this.overallEndOverride || bounds.end;

    showModal('プロジェクト期間編集', `
      <div class="form-group"><label>全体開始日</label><input class="form-input" id="project-start-override" type="date" value="${startValue}"></div>
      <div class="form-group"><label>全体終了日</label><input class="form-input" id="project-end-override" type="date" value="${endValue}"></div>
      <div style="margin-top: 12px; font-size: 0.9rem; color: #475569;">設定した全体期間はチャートの表示範囲に反映されます。</div>
    `, () => {
      const start = document.getElementById('project-start-override').value;
      const end = document.getElementById('project-end-override').value;
      if (!start || !end) {
        showToast('開始日と終了日を入力してください');
        return;
      }
      if (start > end) {
        showToast('開始日が終了日より後になっています');
        return;
      }
      this.overallStartOverride = start;
      this.overallEndOverride = end;
      this.saveTasks();
      this.render();
      showToast('全体期間を更新しました');
    });
  }

  renderTasks() {
    const list = document.getElementById('gantt-task-list');

    let tasksHtml = '';
    
    for (const task of this.tasks) {
      if (task.phase) {
        // フェーズ行
        const isExpanded = this.expandedPhases.has(task.id);
        const arrowIcon = isExpanded ? '▼' : '▶';
        
        tasksHtml += `
          <div class="gantt-task-row phase ${this.selected.has(task.id) ? 'selected' : ''}" 
               data-id="${task.id}"
               style="display: grid; grid-template-columns: 24px 30px minmax(140px, 1fr) 70px 70px 70px 70px; align-items: center; gap: 8px;">
            <div style="display:flex; align-items:center; gap:8px; margin-left: 4px;">
              <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${this.selected.has(task.id) ? 'checked' : ''} style="cursor: pointer;">
              <span class="phase-toggle-btn" data-id="${task.id}" style="cursor: pointer; font-size: 1rem; padding-left: 0;">${arrowIcon}</span>
            </div>
            <span></span>
            <span style="font-weight: 600; color: var(--accent); margin-left: 8px;">${this.escapeHTML(task.name)}</span>
            <span style="font-size:0.75rem;color:var(--text-muted)">
              ${task.start.slice(5)}
            </span>
            <span style="font-size:0.75rem;color:var(--text-muted)">
              ${task.end.slice(5)}
            </span>
            <span style="font-size:0.75rem;color:var(--text-muted)">
              ${task.actualStart ? task.actualStart.slice(5) : '-'}
            </span>
            <span style="font-size:0.75rem;color:var(--text-muted)">
              ${task.actualEnd ? task.actualEnd.slice(5) : '-'}
            </span>
          </div>
        `;

        // フェーズが展開されている場合のみ、配下のタスクを表示
        if (isExpanded) {
          const childTasks = this.tasks.filter(t => 
            !t.phase && 
            this.getDayNumber(t.start) >= this.getDayNumber(task.start) &&
            this.getDayNumber(t.end) <= this.getDayNumber(task.end)
          );

          for (const childTask of childTasks) {
            const statusIcon = childTask.actualEnd ? '✓' : '';
            const statusColor = childTask.actualEnd ? 'var(--accent3)' : 'var(--text-muted)';
            
            tasksHtml += `
              <div class="gantt-task-row ${this.selected.has(childTask.id) ? 'selected' : ''}" 
                   data-id="${childTask.id}" 
                   style="height:32px; position: relative; display: grid; grid-template-columns: 24px 30px minmax(140px, 1fr) 70px 70px 70px 70px; align-items: center; gap: 8px; padding-left: 0; background: var(--bg-card); border-left: 3px solid ${childTask.color};">
                <input type="checkbox" class="task-checkbox" data-id="${childTask.id}" ${this.selected.has(childTask.id) ? 'checked' : ''} style="cursor: pointer; margin-left: 8px;">
                <span></span>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 8px;">
                  ${this.escapeHTML(childTask.name)}
                  <span style="color: ${statusColor}; font-size: 0.875rem;">${statusIcon}</span>
                </span>
                <span style="font-size:0.75rem;color:var(--text-muted)">
                  ${childTask.start.slice(5)}
                </span>
                <span style="font-size:0.75rem;color:var(--text-muted)">
                  ${childTask.end.slice(5)}
                </span>
                <span style="font-size:0.75rem;color:var(--text-muted)">
                  ${childTask.actualStart ? childTask.actualStart.slice(5) : '-'}
                </span>
                <span style="font-size:0.75rem;color:var(--text-muted)">
                  ${childTask.actualEnd ? childTask.actualEnd.slice(5) : '-'}
                </span>
              </div>
            `;
          }
        }
      }
    }

    list.innerHTML = tasksHtml;

    // フェーズの展開・収納イベント
    list.querySelectorAll('.phase-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        if (this.expandedPhases.has(id)) {
          this.expandedPhases.delete(id);
        } else {
          this.expandedPhases.add(id);
        }
        this.render();
      });
    });

    // チェックボックスイベント（単一選択）
    list.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        const id = parseInt(checkbox.dataset.id);
        if (e.target.checked) {
          this.selected.clear();
          this.selected.add(id);
        } else {
          this.selected.delete(id);
        }
        this.updateDeleteButtonVisibility();
        this.render();
      });
    });

    // フェーズクリックで展開/収納
    list.querySelectorAll('.gantt-task-row.phase').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.task-checkbox') || e.target.closest('.phase-toggle-btn')) return;
        const id = parseInt(row.dataset.id);
        if (this.expandedPhases.has(id)) {
          this.expandedPhases.delete(id);
        } else {
          this.expandedPhases.add(id);
        }
        this.render();
      });
    });

    // 行ダブルクリック: タスク編集
    list.querySelectorAll('.gantt-task-row').forEach(row => {
      row.addEventListener('dblclick', () => {
        const id = parseInt(row.dataset.id);
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editTask(task);
      });
    });

    this.updateDeleteButtonVisibility();
  }

  updateRowSelection() {
    const list = document.getElementById('gantt-task-list');
    list.querySelectorAll('.gantt-task-row').forEach(row => {
      const id = parseInt(row.dataset.id);
      if (this.selected.has(id)) {
        row.classList.add('selected');
      } else {
        row.classList.remove('selected');
      }
    });
  }

  updateDeleteButtonVisibility() {
    const deleteBtn = document.getElementById('delete-selected-btn');
    const inputActualBtn = document.getElementById('input-actual-btn');
    const hasSelection = this.selected.size > 0;
    if (deleteBtn) {
      deleteBtn.style.display = hasSelection ? 'inline-block' : 'none';
    }
    if (inputActualBtn) {
      inputActualBtn.style.display = hasSelection ? 'inline-block' : 'none';
    }
  }

  editTask(task) {
    showModal('タスク編集', `
      <div class="form-group"><label>タスク名</label><input class="form-input" id="edit-task-name" value="${this.escapeHTML(task.name)}"></div>
      <div class="form-group"><label>計画開始日</label><input class="form-input" id="edit-task-start" type="date" value="${this.escapeHTML(task.start)}"></div>
      <div class="form-group"><label>計画終了日</label><input class="form-input" id="edit-task-end" type="date" value="${this.escapeHTML(task.end)}"></div>
      <div class="form-group"><label>実績開始日</label><input class="form-input" id="edit-actual-start" type="date" value="${this.escapeHTML(task.actualStart || '')}"></div>
      <div class="form-group"><label>実績終了日</label><input class="form-input" id="edit-actual-end" type="date" value="${this.escapeHTML(task.actualEnd || '')}"></div>
    `,
    () => {
      const name = document.getElementById('edit-task-name').value;
      const start = document.getElementById('edit-task-start').value;
      const end = document.getElementById('edit-task-end').value;
      const actualStart = document.getElementById('edit-actual-start').value;
      const actualEnd = document.getElementById('edit-actual-end').value;

      if (!name || !start || !end) {
        showToast('タスク名、計画開始日、計画終了日は必須です');
        return;
      }

      if (name.length > 100) {
        showToast('タスク名は100文字以内で入力してください');
        return;
      }

      if (start > end) {
        showToast('計画開始日が計画終了日より後になっています');
        return;
      }

      if (actualStart && actualEnd && actualStart > actualEnd) {
        showToast('実績開始日が実績終了日より後になっています');
        return;
      }

      task.name = name;
      task.start = start;
      task.end = end;
      task.actualStart = actualStart;
      task.actualEnd = actualEnd;

      this.saveTasks();
      this.render();
      showToast('タスクを更新しました');
    });
  }

  renderTimeline() {
  const { start, end } = this.getDateRange();

  const header = document.getElementById('gantt-header');
  const bars = document.getElementById('gantt-bars');

  const days = [];
  const d = new Date(start);

  while (d <= end) {
    days.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }

  const dayWidth = 36;

  // ヘッダー
  header.innerHTML = days.map(day => {
    const isWeekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
    return `
      <div class="gantt-day ${isWeekend?'weekend':''}" style="background: ${isWeekend ? '#f3f4f6' : '#ffffff'}; border-right: 1px solid #e5e7eb;">
        <span style="font-weight: 600;">${day.getUTCDate()}</span><br>
        <span style="font-size:0.6rem; color: #6b7280;">
          ${['日','月','火','水','木','金','土'][day.getUTCDay()]}
        </span>
      </div>
    `;
  }).join('');

  bars.style.width = days.length * dayWidth + 'px';

  // ===== 今日ライン =====
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const startDayNumber = Math.floor(start.getTime() / 86400000);
  const todayDayNumber = Math.floor(todayUTC.getTime() / 86400000);
  const todayOffset = (todayDayNumber - startDayNumber) * dayWidth;

  const todayLine = `
    <div style="
      position:absolute;
      left:${todayOffset}px;
      top:0;
      bottom:0;
      width:2px;
      background:#ef4444;
      z-index:10;
      box-shadow: 0 0 3px rgba(239,68,68,0.5);
    "></div>
  `;

    // バー
    let barsHtml = todayLine;
    const startDayNum = Math.floor(start.getTime() / 86400000);

    for (const task of this.tasks) {
      if (task.phase) {
        // フェーズ行
        const phaseStartDayNum = this.getDayNumber(task.start);
        const phaseEndDayNum = this.getDayNumber(task.end);
        const phaseOffset = (phaseStartDayNum - startDayNum) * dayWidth;
        const phaseDuration = (phaseEndDayNum - phaseStartDayNum) + 1;
        const phaseWidth = phaseDuration * dayWidth;

        let phaseOpacity = task.actualEnd ? '0.6' : '1';
        let phaseStroke = task.actualEnd ? PHASE_COLOR : (task.actualStart ? '#f59e0b' : PHASE_COLOR);
        let phaseBadge = '';
        if (task.actualEnd) {
          phaseBadge = '<div style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); background: #10b981; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 3px; font-weight: 600;">✓</div>';
        } else if (task.actualStart) {
          phaseBadge = '<div style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); background: #f59e0b; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 3px; font-weight: 600;">進行中</div>';
        }

        let phaseActualBar = '';
        if (task.actualStart) {
          const actualStartDayNum = this.getDayNumber(task.actualStart);
          const actualEndDayNum = task.actualEnd
            ? this.getDayNumber(task.actualEnd)
            : Math.min(Math.floor(todayUTC.getTime() / 86400000), Math.floor(end.getTime() / 86400000));
          const actualLeft = (actualStartDayNum - startDayNum) * dayWidth;
          const actualDuration = Math.max((actualEndDayNum - actualStartDayNum) + 1, 1);
          const actualWidth = actualDuration * dayWidth;

          phaseActualBar = `
            <div style="
              position:absolute;
              left:${actualLeft}px;
              top:10px;
              width:${actualWidth}px;
              height:12px;
              border-radius:6px;
              background: rgba(16,185,129,0.35);
              border: 1px solid rgba(16,185,129,0.65);
              z-index: 1;
            "></div>
          `;
        }

        barsHtml += `
          <div class="gantt-bar-row" style="height:32px; position: relative; background: rgba(0,0,0,0.02);">
            ${phaseActualBar}
            <div class="gantt-bar"
                 data-id="${task.id}"
                 title="${this.escapeHTML(task.name)}"
                 style="
                   position: relative;
                   z-index: 2;
                   left:${phaseOffset}px;
                   width:${phaseWidth}px;
                   background: linear-gradient(135deg, ${PHASE_COLOR}, ${PHASE_COLOR}cc);
                   opacity: ${phaseOpacity};
                   border-left: 3px solid ${phaseStroke};
                   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                 ">
              <span style="display: inline-block; width: calc(100% - 30px); padding: 2px 0 2px 6px; font-size: 0.75rem; font-weight: 500; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${this.escapeHTML(task.name)}
              </span>
              ${phaseBadge}
            </div>
          </div>
        `;

        if (this.expandedPhases.has(task.id)) {
          const childTasks = this.tasks.filter(t =>
            !t.phase &&
            this.getDayNumber(t.start) >= this.getDayNumber(task.start) &&
            this.getDayNumber(t.end) <= this.getDayNumber(task.end)
          );

          for (const childTask of childTasks) {
            const taskStartDayNum = this.getDayNumber(childTask.start);
            const taskEndDayNum = this.getDayNumber(childTask.end);

            // 開始位置：タスク開始日 - 基準開始日
            const startOffset = (taskStartDayNum - startDayNum) * dayWidth;
            // 工期：終了日 - 開始日 + 1日
            const duration = (taskEndDayNum - taskStartDayNum) + 1;
            const width = duration * dayWidth;

            let barColor = childTask.color;
            let barOpacity = childTask.actualEnd ? '0.6' : '1';
            let strokeColor = childTask.actualEnd ? childTask.color : (childTask.actualStart ? '#f59e0b' : childTask.color);
            let statusBadge = '';

            if (childTask.actualEnd) {
              statusBadge = '<div style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); background: #10b981; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 3px; font-weight: 600;">✓</div>';
            } else if (childTask.actualStart) {
              statusBadge = '<div style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); background: #f59e0b; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 3px; font-weight: 600;">進行中</div>';
            }

            let actualBarHtml = '';
            if (childTask.actualStart) {
              const actualStartDayNum = this.getDayNumber(childTask.actualStart);
              const actualEndDayNum = childTask.actualEnd
                ? this.getDayNumber(childTask.actualEnd)
                : Math.min(Math.floor(todayUTC.getTime() / 86400000), Math.floor(end.getTime() / 86400000));
              const actualLeft = (actualStartDayNum - startDayNum) * dayWidth;
              const actualDuration = Math.max((actualEndDayNum - actualStartDayNum) + 1, 1);
              const actualWidth = actualDuration * dayWidth;

              actualBarHtml = `
                <div style="
                  position:absolute;
                  left:${actualLeft}px;
                  top:10px;
                  width:${actualWidth}px;
                  height:12px;
                  border-radius:6px;
                  background: rgba(16,185,129,0.35);
                  border: 1px solid rgba(16,185,129,0.65);
                  z-index: 1;
                "></div>
              `;
            }

            barsHtml += `
              <div class="gantt-bar-row" style="height:32px; position: relative;">
                ${actualBarHtml}
                <div class="gantt-bar"
                     data-id="${childTask.id}"
                   title="${this.escapeHTML(childTask.name)}"
                     style="
                       position: relative;
                       z-index: 2;
                       left:${startOffset}px;
                       width:${width}px;
                       background: linear-gradient(135deg, ${barColor}, ${barColor}cc);
                       opacity: ${barOpacity};
                       border-left: 3px solid ${strokeColor};
                       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                     ">
                  <span style="display: inline-block; width: calc(100% - 30px); padding: 2px 0 2px 6px; font-size: 0.75rem; font-weight: 500; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${this.escapeHTML(childTask.name)}
                  </span>
                  ${statusBadge}
                </div>
              </div>
            `;
          }
        }
      }
    }

    bars.innerHTML = barsHtml;
}

enableDrag() {
  const bars = document.querySelectorAll('.gantt-bar');
  const dayWidth = 36;

  bars.forEach(bar => {
    let startX, startLeft, startWidth, mode;
    let ghost;

    bar.addEventListener('mousedown', (e) => {
      e.preventDefault();

      const rect = bar.getBoundingClientRect();

      startX = e.clientX;
      startLeft = parseInt(bar.style.left);
      startWidth = parseInt(bar.style.width);

      // 判定
      if (e.offsetX < 6) {
        mode = 'resize-left';
      } else if (e.offsetX > rect.width - 6) {
        mode = 'resize-right';
      } else {
        mode = 'move';
      }

      // ===== ゴースト（軽量表示） =====
      ghost = bar.cloneNode(true);
      ghost.style.opacity = '0.6';
      ghost.style.pointerEvents = 'none';
      bar.parentElement.appendChild(ghost);

      const onMouseMove = (e) => {
        const dx = e.clientX - startX;

        // スナップ（1日単位）
        const snapped = Math.round(dx / dayWidth) * dayWidth;

        if (mode === 'move') {
          ghost.style.left = (startLeft + snapped) + 'px';
        }

        if (mode === 'resize-left') {
          ghost.style.left = (startLeft + snapped) + 'px';
          ghost.style.width = (startWidth - snapped) + 'px';
        }

        if (mode === 'resize-right') {
          ghost.style.width = (startWidth + snapped) + 'px';
        }
      };

      const onMouseUp = (e) => {
        const dx = e.clientX - startX;
        const diffDays = Math.round(dx / dayWidth);

        const id = parseInt(bar.dataset.id);
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        let startDate = this.parseDate(task.start);
        let endDate = this.parseDate(task.end);

        if (mode === 'move') {
          startDate.setUTCDate(startDate.getUTCDate() + diffDays);
          endDate.setUTCDate(endDate.getUTCDate() + diffDays);
        }

        if (mode === 'resize-left') {
          startDate.setUTCDate(startDate.getUTCDate() + diffDays);
          if (startDate <= endDate) {
            task.start = this.formatDate(startDate);
          }
        }

        if (mode === 'resize-right') {
          endDate.setUTCDate(endDate.getUTCDate() + diffDays);
          if (endDate >= startDate) {
            task.end = this.formatDate(endDate);
          }
        }

        if (mode === 'move') {
          task.start = this.formatDate(startDate);
          task.end = this.formatDate(endDate);
        }

        ghost.remove();
        this.saveTasks();
        this.render(); // ←ここで初めて再描画

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
}


  /* ===== スクロール同期 ===== */
  setupScrollSync() {
    const tasksEl = document.getElementById('gantt-tasks');
    const timelineEl = document.getElementById('gantt-timeline');

    if (!tasksEl || !timelineEl) return;

    // 多重防止
    tasksEl.onscroll = null;
    timelineEl.onscroll = null;

    tasksEl.addEventListener('scroll', () => {
      if (!this.isSyncingScroll) {
        this.isSyncingScroll = true;
        timelineEl.scrollTop = tasksEl.scrollTop;
        this.isSyncingScroll = false;
      }
    });

    timelineEl.addEventListener('scroll', () => {
      if (!this.isSyncingScroll) {
        this.isSyncingScroll = true;
        tasksEl.scrollTop = timelineEl.scrollTop;
        this.isSyncingScroll = false;
      }
    });
  }

  updateCalculator() {
    if (this.tasks.length === 0) {
      // タスクがない場合
      document.getElementById('project-duration').textContent = '-';
      document.getElementById('project-start').textContent = '-';
      document.getElementById('project-end').textContent = '-';
      document.getElementById('project-remaining-count').textContent = '0';
      document.getElementById('project-progress').textContent = '-';
      document.getElementById('project-progress-detail').textContent = '-';
      document.getElementById('calculator-table-body').innerHTML = `
        <tr style="text-align: center; color: #9ca3af;">
          <td colspan="6" style="padding: 20px;">データが入力されていません</td>
        </tr>
      `;
      document.getElementById('critical-path').textContent = 'データが入力されていません';
      return;
    }

    // プロジェクト全体の開始日・終了日
    const bounds = this.getProjectBounds();
    let minStart = this.parseDate(bounds.start);
    let maxEnd = this.parseDate(bounds.end);

    if (this.overallStartOverride) {
      minStart = this.parseDate(this.overallStartOverride);
    }
    if (this.overallEndOverride) {
      maxEnd = this.parseDate(this.overallEndOverride);
    }

    // プロジェクト期間計算
    const projectDays = Math.ceil((maxEnd - minStart) / 86400000) + 1;
    document.getElementById('project-duration').textContent = `${projectDays}日`;
    document.getElementById('project-start').textContent = this.formatDate(minStart);
    document.getElementById('project-end').textContent = this.formatDate(maxEnd);
    
    // 残りタスク数を計算（実績終了日が入力されていないタスクを集計）
    const allTasks = this.tasks.filter(t => !t.phase);
    const completedTasks = allTasks.filter(t => t.actualEnd);
    const remainingTasks = allTasks.length - completedTasks.length;
    document.getElementById('project-remaining-count').textContent = remainingTasks;

    const totalWork = allTasks.reduce((sum, t) => sum + ((this.getDayNumber(t.end) - this.getDayNumber(t.start)) + 1), 0);
    const completedWork = completedTasks.reduce((sum, t) => sum + ((this.getDayNumber(t.end) - this.getDayNumber(t.start)) + 1), 0);
    const progressRate = totalWork > 0 ? Math.round((completedWork / totalWork) * 100) : 0;
    document.getElementById('project-progress').textContent = totalWork > 0 ? `${progressRate}%` : '-';
    document.getElementById('project-progress-detail').textContent = totalWork > 0 ? `計算式: ${completedWork} ÷ ${totalWork} × 100` : '-';

    // テーブル行生成
    let tableHtml = '';
    const sortedTasks = [...this.tasks].sort((a, b) => this.getDayNumber(a.start) - this.getDayNumber(b.start));

    sortedTasks.forEach(t => {
      const startDayNum = this.getDayNumber(t.start);
      const endDayNum = this.getDayNumber(t.end);
      const duration = (endDayNum - startDayNum) + 1;
      
      // スラック計算（簡易版）
      let slack = '-';
      if (!t.phase) {
        // 親フェーズを探す
        const parentPhase = this.tasks.filter(p => p.phase && this.getDayNumber(p.start) <= startDayNum && this.getDayNumber(p.end) >= endDayNum)[0];
        if (parentPhase) {
          const phaseEndDayNum = this.getDayNumber(parentPhase.end);
          const slackDays = phaseEndDayNum - endDayNum;
          slack = slackDays + '日';
        }
      }

      if (t.phase) {
        // フェーズ行
        const isExpanded = this.expandedPhases.has(t.id);
        const arrowIcon = isExpanded ? '▼' : '▶';
        const typeLabel = 'フェーズ';
        const rowBg = '#f0f0f0';
        const textColor = '#1f2937';
        const typeColor = '#dc2626';

        tableHtml += `
          <tr class="calc-phase-row" data-phase-id="${t.id}" style="background: ${rowBg}; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.2s;">
            <td style="padding: 12px 10px; font-weight: 700; color: ${textColor};">
              <span class="calc-phase-toggle" style="display: inline-block; margin-right: 8px; font-size: 0.875rem;">${arrowIcon}</span>${this.escapeHTML(t.name)}
            </td>
            <td style="padding: 12px 10px; text-align: center; font-size: 0.75rem; color: ${typeColor}; font-weight: 600;">${typeLabel}</td>
            <td style="padding: 12px 10px; text-align: center; color: ${textColor};">${t.start}</td>
            <td style="padding: 12px 10px; text-align: center; color: ${textColor};">${t.end}</td>
            <td style="padding: 12px 10px; text-align: center; font-weight: 600; color: #16a34a;">${duration}日</td>
            <td style="padding: 12px 10px; text-align: center; color: #9ca3af;">-</td>
          </tr>
        `;
      } else {
        // タスク行
        const parentPhase = this.tasks.find(p => p.phase && this.getDayNumber(p.start) <= startDayNum && this.getDayNumber(p.end) >= endDayNum);
        const parentPhaseId = parentPhase ? parentPhase.id : null;
        const isHidden = parentPhaseId && !this.expandedPhases.has(parentPhaseId);
        const typeLabel = 'タスク';
        const rowBg = '#ffffff';
        const textColor = '#374151';
        const typeColor = '#0284c7';

        tableHtml += `
          <tr class="calc-task-row calc-phase-${parentPhaseId}" data-task-id="${t.id}" style="background: ${rowBg}; border-bottom: 1px solid #e5e7eb; display: ${isHidden ? 'none' : 'table-row'};">
            <td style="padding: 12px 10px; font-weight: 500; color: ${textColor}; padding-left: 30px;">${this.escapeHTML(t.name)}</td>
            <td style="padding: 12px 10px; text-align: center; font-size: 0.75rem; color: ${typeColor}; font-weight: 600;">${typeLabel}</td>
            <td style="padding: 12px 10px; text-align: center; color: ${textColor};">${t.start}</td>
            <td style="padding: 12px 10px; text-align: center; color: ${textColor};">${t.end}</td>
            <td style="padding: 12px 10px; text-align: center; font-weight: 600; color: #16a34a;">${duration}日</td>
            <td style="padding: 12px 10px; text-align: center; color: ${slack === '-' ? '#9ca3af' : '#d97706'}; font-weight: ${slack === '-' ? '400' : '500'};">${slack}</td>
          </tr>
        `;
      }
    });

    document.getElementById('calculator-table-body').innerHTML = tableHtml;

    // フェーズ行のクリックイベント
    document.querySelectorAll('.calc-phase-row').forEach(row => {
      row.addEventListener('click', () => {
        const phaseId = parseInt(row.dataset.phaseId);
        if (this.expandedPhases.has(phaseId)) {
          this.expandedPhases.delete(phaseId);
        } else {
          this.expandedPhases.add(phaseId);
        }
        this.updateCalculator();
      });
    });

    // クリティカルパス計算（最長経路の検出）
    const criticalPath = this.calculateCriticalPath();
    const cpHtml = criticalPath.length > 0
      ? `<strong>最長経路: ${criticalPath.map(t => this.escapeHTML(t.name)).join(' → ')}</strong><br>期間: ${criticalPath.reduce((sum, t) => sum + (this.getDayNumber(t.end) - this.getDayNumber(t.start)) + 1, 0)}日`
      : 'クリティカルパスを計算できません';
    document.getElementById('critical-path').innerHTML = cpHtml;
  }

  calculateCriticalPath() {
    if (this.tasks.length === 0) return [];

    // 最長経路を見つける（簡易アルゴリズム）
    let longestPath = [];
    let longestDuration = 0;

    // フェーズごとに最長経路を計算
    const phases = this.tasks.filter(t => t.phase);
    phases.forEach(phase => {
      const phaseStartDayNum = this.getDayNumber(phase.start);
      const phaseEndDayNum = this.getDayNumber(phase.end);

      const tasksInPhase = this.tasks.filter(t => !t.phase && 
        this.getDayNumber(t.start) >= phaseStartDayNum && 
        this.getDayNumber(t.end) <= phaseEndDayNum
      );
      
      const phaseTasks = [phase, ...tasksInPhase];
      const duration = phaseTasks.reduce((sum, t) => sum + (this.getDayNumber(t.end) - this.getDayNumber(t.start)) + 1, 0);
      
      if (duration > longestDuration) {
        longestDuration = duration;
        longestPath = phaseTasks;
      }
    });

    return longestPath;
  }

  calculateEffort() {
    const peopleInput = document.getElementById('effort-people');
    const hoursInput = document.getElementById('effort-hours');
    const resultHours = document.getElementById('effort-result-hours');
    const resultPersonDays = document.getElementById('effort-result-person-days');
    const resultPersonMonths = document.getElementById('effort-result-person-months');

    if (!peopleInput || !hoursInput || !resultHours || !resultPersonDays || !resultPersonMonths) {
      showToast('工数計算の要素が見つかりません');
      return;
    }

    const people = Number(peopleInput.value);
    const hours = Number(hoursInput.value);

    if (!people || !hours) {
      showToast('人数と時間を正しく入力してください');
      return;
    }

    const totalHours = people * hours;
    const personDays = totalHours / 8;
    const personMonths = personDays / 20;

    resultHours.textContent = `${totalHours} 時間`;
    resultPersonDays.textContent = `${personDays.toFixed(2)} 人日`;
    resultPersonMonths.textContent = `${personMonths.toFixed(2)} 人月`;

    showToast(`工数を計算しました: ${totalHours}時間 / ${personDays.toFixed(2)}人日 / ${personMonths.toFixed(2)}人月`);
  }

  calculateProgress() {
    const tasks = this.tasks.filter(t => !t.phase);
    
    if (tasks.length === 0) {
      showToast('タスクが登録されていません');
      return;
    }

    const completedTasks = tasks.filter(t => t.actualEnd);
    const inProgressTasks = tasks.filter(t => t.actualStart && !t.actualEnd);
    const notStartedTasks = tasks.filter(t => !t.actualStart);

    const totalWork = tasks.reduce((sum, t) => sum + ((this.getDayNumber(t.end) - this.getDayNumber(t.start)) + 1), 0);
    const completedWork = completedTasks.reduce((sum, t) => sum + ((this.getDayNumber(t.end) - this.getDayNumber(t.start)) + 1), 0);
    const progressRate = totalWork > 0 ? Math.round((completedWork / totalWork) * 100) : 0;
    
    let detailsHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #d1fae5; padding: 12px; border-radius: 6px; border-left: 4px solid #10b981;">
          <div style="font-size: 0.875rem; color: #047857; margin-bottom: 4px;">完了</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #10b981;">${completedTasks.length}</div>
        </div>
        <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.875rem; color: #92400e; margin-bottom: 4px;">進行中</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #f59e0b;">${inProgressTasks.length}</div>
        </div>
        <div style="background: #fee2e2; padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444;">
          <div style="font-size: 0.875rem; color: #7f1d1d; margin-bottom: 4px;">未開始</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #ef4444;">${notStartedTasks.length}</div>
        </div>
      </div>

      <div style="background: #f0fdf4; padding: 16px; border-radius: 6px; border-left: 4px solid #22c55e; margin-bottom: 16px;">
        <div style="font-size: 0.875rem; color: #166534; margin-bottom: 4px;">進捗率</div>
        <div style="font-size: 2rem; font-weight: bold; color: #22c55e;">${progressRate}%</div>
        <div style="background: #e0e7ff; height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
          <div style="background: #22c55e; height: 100%; width: ${progressRate}%; transition: width 0.3s;"></div>
        </div>
      </div>

      <div style="margin-top: 16px;">
        <h4 style="margin: 0 0 12px 0; color: #374151;">詳細</h4>
        <div style="font-size: 0.9rem; color: #666;">
          <p><strong>合計タスク数</strong>: ${tasks.length}</p>
        </div>
      </div>
    `;

    showModal('進捗率計算結果', detailsHtml, null, false);
  }

  addPhase() {
    showModal('フェーズ追加', `
      <div class="form-group"><label>フェーズ名</label><input class="form-input" id="gantt-phase-name"></div>
      <div class="form-group"><label>開始日</label><input class="form-input" id="gantt-phase-start" type="date"></div>
      <div class="form-group"><label>終了日</label><input class="form-input" id="gantt-phase-end" type="date"></div>
    `,
    () => {
      const name = document.getElementById('gantt-phase-name').value;
      const start = document.getElementById('gantt-phase-start').value;
      const end = document.getElementById('gantt-phase-end').value;

      if (name && start && end) {
        const colors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ec4899','#6366f1'];

        this.tasks.push({
          id: this.taskIdCounter++,
          name,
          phase: true,
          start,
          end,
          color: colors[this.tasks.length % colors.length]
        });

        this.saveTasks();
        this.render();
        showToast('フェーズを追加しました');
      }
    });
  }

  addTask() {
    // 既存のフェーズ一覧をドロップダウン用に取得
    const phases = this.tasks.filter(t => t.phase);
    let phaseOptions = '<option value="">(なし)</option>';
    phases.forEach(p => {
      phaseOptions += `<option value="${p.id}">${p.name}</option>`;
    });

    showModal('タスク追加', `
      <div class="form-group"><label>所属フェーズ</label><select class="form-input" id="gantt-task-phase">${phaseOptions}</select></div>
      <div class="form-group"><label>タスク名</label><input class="form-input" id="gantt-task-name"></div>
      <div class="form-group"><label>計画開始日</label><input class="form-input" id="gantt-task-start" type="date"></div>
      <div class="form-group"><label>計画終了日</label><input class="form-input" id="gantt-task-end" type="date"></div>
      <div class="form-group"><label>実績開始日</label><input class="form-input" id="gantt-task-actual-start" type="date"></div>
      <div class="form-group"><label>実績終了日</label><input class="form-input" id="gantt-task-actual-end" type="date"></div>
    `,
    () => {
      const phaseId = document.getElementById('gantt-task-phase').value;
      const name = document.getElementById('gantt-task-name').value;
      const start = document.getElementById('gantt-task-start').value;
      const end = document.getElementById('gantt-task-end').value;
      const actualStart = document.getElementById('gantt-task-actual-start').value;
      const actualEnd = document.getElementById('gantt-task-actual-end').value;

      if (!name || !start || !end) {
        showToast('タスク名と計画開始・終了日を入力してください');
        return;
      }
      
      let taskColor = '#a78bfa'; // デフォルト色
      // フェーズが選択されている場合、期間がフェーズ内かチェック（日付ベースの階層構造のため）
      if (phaseId) {
        const phase = this.tasks.find(t => t.id === parseInt(phaseId));
        if (phase) {
          if (start < phase.start || end > phase.end) {
            showToast(`期間はフェーズの範囲(${phase.start} 〜 ${phase.end})内で指定してください`);
            return;
          }
          taskColor = phase.color; // 選択されたフェーズの色をタスクに適用
        }
      }

      if (actualStart && actualEnd && actualStart > actualEnd) {
        showToast('実績開始日が実績終了日より後になっています');
        return;
      }

      this.tasks.push({
        id: this.taskIdCounter++,
        name,
        phase: false,
        start,
        end,
        actualStart: actualStart || null,
        actualEnd: actualEnd || null,
        color: taskColor
      });

      this.saveTasks();
      this.render();
      showToast('タスクを追加しました');
    });

    // フェーズ選択時に日付を自動入力するイベントリスナー
    const phaseSelect = document.getElementById('gantt-task-phase');
    if (phaseSelect) {
      phaseSelect.addEventListener('change', () => {
        const pid = phaseSelect.value;
        if (pid) {
          const p = this.tasks.find(t => t.id === parseInt(pid));
          if (p) {
            document.getElementById('gantt-task-start').value = p.start;
            document.getElementById('gantt-task-end').value = p.end;
          }
        }
      });
    }
  }

  inputActual() {
    if (this.selected.size === 0) {
      showToast('タスクを選択してください');
      return;
    }

    const selectedTasks = this.tasks.filter(t => this.selected.has(t.id));
    if (selectedTasks.length === 0) {
      showToast('選択したタスクが見つかりません');
      return;
    }

    if (selectedTasks.length > 1) {
      showToast('1つのタスクのみ選択してください');
      return;
    }

    const task = selectedTasks[0];
    showModal('実績入力', `
      <div class="form-group"><label>タスク名</label><input class="form-input" value="${this.escapeHTML(task.name)}" readonly></div>
      <div class="form-group"><label>計画開始日</label><input class="form-input" value="${task.start}" readonly></div>
      <div class="form-group"><label>計画終了日</label><input class="form-input" value="${task.end}" readonly></div>
      <div class="form-group"><label>実績開始日</label><input class="form-input" id="actual-start" type="date" value="${task.actualStart || ''}"></div>
      <div class="form-group"><label>実績終了日</label><input class="form-input" id="actual-end" type="date" value="${task.actualEnd || ''}"></div>
    `,
    () => {
      const actualStart = document.getElementById('actual-start').value;
      const actualEnd = document.getElementById('actual-end').value;

      if (actualStart && actualEnd) {
        if (actualStart > actualEnd) {
          showToast('実績開始日が実績終了日より後になっています');
          return;
        }
        task.actualStart = actualStart;
        task.actualEnd = actualEnd;
        this.saveTasks();
        this.render();
        showToast('実績を記録しました');
      } else {
        task.actualStart = actualStart;
        task.actualEnd = actualEnd;
        this.render();
        showToast('実績を更新しました');
      }
    });
  }

  deleteSelected() {
    if (this.selected.size === 0) {
      showToast('削除する項目を選択してください');
      return;
    }

    showModal('削除の確認', `選択された ${this.selected.size} 件の項目を削除しますか？`, () => {
      this.tasks = this.tasks.filter(t => !this.selected.has(t.id));
      this.selected.clear();
      this.saveTasks();
      this.render();
      showToast('削除しました');
    });
  }

  exportJSON() {
    try {
      const data = {
        type: 'gantt',
        tasks: this.tasks.map(t => ({
          id: t.id,
          name: t.name,
          phase: t.phase,
          start: t.start,
          end: t.end,
          actualStart: t.actualStart,
          actualEnd: t.actualEnd,
          color: t.color
        }))
      };
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'gantt_chart.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      showToast('JSONをエクスポートしました');
    } catch (e) {
      console.error('JSON Export Error:', e);
      showToast('JSONのエクスポートに失敗しました');
    }
  }

  exportCSV() {
    let csv = '\uFEFFタスク名,フェーズ,開始日,終了日\n'; // BOMを追加してExcelの文字化けを防止

    this.tasks.forEach(t => {
      const escapedName = `"${t.name.replace(/"/g, '""')}"`; // ダブルクオートのエスケープ
      csv += `${escapedName},${t.phase ? 'はい' : 'いいえ'},${t.start},${t.end}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = 'gantt_chart.csv';
    a.click();

    showToast('CSVをエクスポートしました');
  }

  showUserProfile() {
    if (window.app && window.app.profile) {
      window.app.profile.show();
    }
  }
}

// 初期化は core.js の initNav() で自動的に行われます
// ここではボタンセットアップは setupButtons() で処理済み
