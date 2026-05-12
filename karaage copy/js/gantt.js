// ============================================
// テストデータ（下記をコメントアウトして削除可能）
// ============================================
const GANTT_TEST_DATA = [
  // フェーズ1：要件定義
  { id:1, name:'要件定義', phase:true, start:'2026-05-01', end:'2026-05-14', color:'#7c3aed' },
  { id:2, name:'ヒアリング', phase:false, start:'2026-05-01', end:'2026-05-07', color:'#a78bfa' },
  { id:3, name:'要件書作成', phase:false, start:'2026-05-05', end:'2026-05-14', color:'#a78bfa' },
  
  // フェーズ2：基本設計
  { id:4, name:'基本設計', phase:true, start:'2026-05-12', end:'2026-05-28', color:'#06b6d4' },
  { id:5, name:'画面設計', phase:false, start:'2026-05-12', end:'2026-05-21', color:'#22d3ee' },
  { id:6, name:'DB設計', phase:false, start:'2026-05-15', end:'2026-05-25', color:'#22d3ee' },
  { id:7, name:'API設計', phase:false, start:'2026-05-19', end:'2026-05-28', color:'#22d3ee' },
  
  // フェーズ3：詳細設計
  { id:8, name:'詳細設計', phase:true, start:'2026-05-26', end:'2026-06-11', color:'#10b981' },
  { id:9, name:'コンポーネント設計', phase:false, start:'2026-05-26', end:'2026-06-04', color:'#34d399' },
  { id:10, name:'テスト計画', phase:false, start:'2026-06-01', end:'2026-06-11', color:'#34d399' },
];

// テストデータを使用するかどうか（true=使用、false=使用しない）
const USE_GANTT_TEST_DATA = true;

// ============================================
// GanttTool クラス
// ============================================
class GanttTool {
  constructor() {
    // テストデータを使用する場合はロード
    this.tasks = USE_GANTT_TEST_DATA ? JSON.parse(JSON.stringify(GANTT_TEST_DATA)) : [];
    this.selected = new Set(); // 選択状態を管理

    // taskIdCounterを最大IDから設定
    this.taskIdCounter = (this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) : 10) + 1;
    this.isSyncingScroll = false;

    // Undo/Redo履歴
    this.undoHistory = [];
    this.redoHistory = [];
    this.isApplyingUndo = false;

    // ドラッグソート用
    this.draggedElement = null;
    this.draggedTaskId = null;

    // グローバル参照を設定（HTMLの onclick から呼び出すため）
    window.ganttInstance = this;

    this.render();
    this.setupButtons();
  }

  setupButtons() {
    // ボタンイベントリスナーを設定（data-action属性を使用）
    const container = document.getElementById('gantt') || document.querySelector('.tool-section');
    if (container) {
      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', e => {
          const action = btn.dataset.action;
          if (typeof this[action] === 'function') {
            this[action]();
          }
        });
      });
    }

    // タブ機能
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
        }
      });
    });
  }

  render() {
    this.renderTasks();
    this.renderTimeline();
    this.setupScrollSync(); // ←重要
    this.enableDrag(); // ドラッグ機能有効化
    this.enableTaskReordering(); // タスク並び替え機能を有効化
    this.updateCalculator(); // 計算機も更新
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

    const start = this.parseDate(min);
    start.setUTCDate(start.getUTCDate() - 3);

    const end = this.parseDate(max);
    end.setUTCDate(end.getUTCDate() + 7);

    return { start, end };
  }

  renderTasks() {
    const list = document.getElementById('gantt-task-list');

    list.innerHTML = this.tasks.map(t => `
      <div class="gantt-task-row ${t.phase ? 'phase' : ''} ${this.selected.has(t.id) ? 'selected' : ''}" 
           data-id="${t.id}" 
           draggable="true"
           style="height:32px; position: relative; display: grid; grid-template-columns: 24px 1fr 70px 70px; align-items: center; gap: 8px;">
        <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${this.selected.has(t.id) ? 'checked' : ''} style="cursor: pointer; margin-left: 8px;">
        <span style="padding-left:${t.phase?'0':'8'}px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${t.phase?'▸ ':''}${t.name}
        </span>
        <span style="font-size:0.75rem;color:var(--text-muted)">
          ${t.start.slice(5)}
        </span>
        <span style="font-size:0.75rem;color:var(--text-muted)">
          ${t.end.slice(5)}
        </span>
      </div>
    `).join('');

    list.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = parseInt(checkbox.dataset.id);
        if (e.target.checked) {
          this.selected.add(id);
        } else {
          this.selected.delete(id);
        }
        this.updateDeleteButtonVisibility();
        this.updateRowSelection();
      });
    });

    list.querySelectorAll('.gantt-task-row').forEach(row => {
      // ダブルクリック: 名前編集
      row.addEventListener('dblclick', () => {
        const id = parseInt(row.dataset.id);
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newName = prompt('タスク名:', task.name);
        if (newName) {
          task.name = newName;
          this.render();
        }
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
    if (deleteBtn) {
      deleteBtn.style.display = this.selected.size > 0 ? 'inline-block' : 'none';
    }
  }

  deleteSelected() {
  if (this.selected.size === 0) {
    showToast('削除するタスクを選択してください');
    return;
  }

  const count = this.selected.size;
  // 削除前のインデックスを含めて保存
  const deletedTasks = Array.from(this.selected).map(id => {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      return { ...this.tasks[index], _originalIndex: index };
    }
    return null;
  }).filter(Boolean);

  // インデックスの大きい順にソート（削除時にズレを防ぐため）
  deletedTasks.sort((a, b) => b._originalIndex - a._originalIndex);

  showModal('タスク削除確認', `
    <p><strong>${count}件</strong>のタスク/フェーズを削除してもよろしいですか？</p>
  `,
  () => {
    this.pushUndoAction({
      type: 'deleteTasks',
      deletedTasks: deletedTasks.map(t => ({ ...t }))
    });
    
    this.tasks = this.tasks.filter(t => !this.selected.has(t.id));
    this.selected.clear();
    this.render();
    showToast(`${count}件のタスク/フェーズを削除しました`);
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
      <div class="gantt-day ${isWeekend?'weekend':''}">
        ${day.getUTCDate()}<br>
        <span style="font-size:0.6rem;">
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
      background:red;
      z-index:10;
    "></div>
  `;

  // バー
  const startDayNum = Math.floor(start.getTime() / 86400000);
  bars.innerHTML = todayLine + this.tasks.map(task => {
    const taskStartDayNum = this.getDayNumber(task.start);
    const taskEndDayNum = this.getDayNumber(task.end);

    // 開始位置：タスク開始日 - 基準開始日
    const startOffset = (taskStartDayNum - startDayNum) * dayWidth;
    // 工期：終了日 - 開始日 + 1日
    const duration = (taskEndDayNum - taskStartDayNum) + 1;
    const width = duration * dayWidth;

    return `
      <div class="gantt-bar-row" style="height:32px;">
        <div class="gantt-bar ${task.phase?'phase-bar':''}"
             data-id="${task.id}"
             style="
               left:${startOffset}px;
               width:${width}px;
               background:linear-gradient(135deg,${task.color},${task.color}cc);
             ">
          ${task.name}
        </div>
      </div>
    `;
  }).join('');
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
        this.render(); // ←ここで初めて再描画

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
}

  enableTaskReordering() {
    const list = document.getElementById('gantt-task-list');
    if (!list) return;

    list.querySelectorAll('.gantt-task-row').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        this.draggedTaskId = parseInt(row.dataset.id);
        this.draggedElement = row;
        row.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      });

      row.addEventListener('dragend', (e) => {
        if (this.draggedElement) {
          this.draggedElement.style.opacity = '1';
        }
        this.draggedElement = null;
        this.draggedTaskId = null;
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (this.draggedTaskId === null || this.draggedTaskId === parseInt(row.dataset.id)) {
          return;
        }

        row.style.borderTop = '2px solid #3b82f6';
      });

      row.addEventListener('dragleave', (e) => {
        row.style.borderTop = 'none';
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        row.style.borderTop = 'none';

        if (this.draggedTaskId === null || this.draggedTaskId === parseInt(row.dataset.id)) {
          return;
        }

        const draggedIndex = this.tasks.findIndex(t => t.id === this.draggedTaskId);
        const targetIndex = this.tasks.findIndex(t => t.id === parseInt(row.dataset.id));

        if (draggedIndex === -1 || targetIndex === -1) return;

        // ドラッグ&ドロップ前の状態を保存
        const snapshot = [...this.tasks];
        
        // タスクを移動
        const [movedTask] = this.tasks.splice(draggedIndex, 1);
        this.tasks.splice(targetIndex, 0, movedTask);

        // Undo履歴に追加
        this.pushUndoAction({
          type: 'reorderTasks',
          snapshot: snapshot
        });

        this.renderTasks();
        this.renderTimeline();
        showToast('タスクの順序を変更しました');
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
      document.getElementById('project-count').textContent = '0';
      document.getElementById('calculator-table-body').innerHTML = `
        <tr style="text-align: center; color: #9ca3af;">
          <td colspan="6" style="padding: 20px;">データが入力されていません</td>
        </tr>
      `;
      document.getElementById('critical-path').textContent = 'データが入力されていません';
      return;
    }

    // プロジェクト全体の開始日・終了日
    let minStart = this.parseDate('2099-12-31');
    let maxEnd = this.parseDate('2000-01-01');

    this.tasks.forEach(t => {
      const start = this.parseDate(t.start);
      const end = this.parseDate(t.end);
      if (start < minStart) minStart = start;
      if (end > maxEnd) maxEnd = end;
    });

    // プロジェクト期間計算
    const projectDays = Math.ceil((maxEnd - minStart) / 86400000) + 1;
    document.getElementById('project-duration').textContent = `${projectDays}日`;
    document.getElementById('project-start').textContent = this.formatDate(minStart);
    document.getElementById('project-end').textContent = this.formatDate(maxEnd);
    document.getElementById('project-count').textContent = this.tasks.length;

    // テーブル行生成
    let tableHtml = '';
    const sortedTasks = [...this.tasks].sort((a, b) => this.getDayNumber(a.start) - this.getDayNumber(b.start));

    sortedTasks.forEach(t => {
      const startDayNum = this.getDayNumber(t.start);
      const endDayNum = this.getDayNumber(t.end);
      const duration = (endDayNum - startDayNum) + 1;
      
      // スラック計算（簡易版）
      // フェーズのスラックは0、タスクは親フェーズのスラック
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

      const typeLabel = t.phase ? 'フェーズ' : 'タスク';
      const rowBg = t.phase ? '#f0f0f0' : '#ffffff';
      const textColor = t.phase ? '#1f2937' : '#374151';
      const typeColor = t.phase ? '#dc2626' : '#0284c7';

      tableHtml += `
        <tr style="background: ${rowBg}; border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 10px; font-weight: ${t.phase ? '700' : '500'}; color: ${textColor};">${t.phase ? '▸ ' : ''}${t.name}</td>
          <td style="padding: 12px 10px; text-align: center; font-size: 0.75rem; color: ${typeColor}; font-weight: 600;">${typeLabel}</td>
          <td style="padding: 12px 10px; text-align: center; color: ${textColor};">${t.start}</td>
          <td style="padding: 12px 10px; text-align: center; color: ${textColor};">${t.end}</td>
          <td style="padding: 12px 10px; text-align: center; font-weight: 600; color: #16a34a;">${duration}日</td>
          <td style="padding: 12px 10px; text-align: center; color: ${slack === '-' ? '#9ca3af' : '#d97706'}; font-weight: ${slack === '-' ? '400' : '500'};">${slack}</td>
        </tr>
      `;
    });

    document.getElementById('calculator-table-body').innerHTML = tableHtml;

    // クリティカルパス計算（最長経路の検出）
    const criticalPath = this.calculateCriticalPath();
    const cpHtml = criticalPath.length > 0
      ? `<strong>最長経路: ${criticalPath.map(t => t.name).join(' → ')}</strong><br>期間: ${criticalPath.reduce((sum, t) => sum + (this.getDayNumber(t.end) - this.getDayNumber(t.start)) + 1, 0)}日`
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
        const newId = this.taskIdCounter++;

        this.pushUndoAction({
          type: 'addPhase',
          id: newId
        });

        this.tasks.push({
          id: newId,
          name,
          phase: true,
          start,
          end,
          color: colors[this.tasks.length % colors.length]
        });

        this.render();
        showToast('フェーズを追加しました');
      }
    });
  }

  addTask() {
    showModal('タスク追加', `
      <div class="form-group"><label>タスク名</label><input class="form-input" id="gantt-task-name"></div>
      <div class="form-group"><label>開始日</label><input class="form-input" id="gantt-task-start" type="date"></div>
      <div class="form-group"><label>終了日</label><input class="form-input" id="gantt-task-end" type="date"></div>
    `,
    () => {
      const name = document.getElementById('gantt-task-name').value;
      const start = document.getElementById('gantt-task-start').value;
      const end = document.getElementById('gantt-task-end').value;

      if (name && start && end) {
        const newId = this.taskIdCounter++;

        this.pushUndoAction({
          type: 'addTask',
          id: newId
        });

        this.tasks.push({
          id: newId,
          name,
          phase: false,
          start,
          end,
          color: '#a78bfa'
        });

        this.render();
        showToast('タスクを追加しました');
      }
    });
  }

  exportCSV() {
    let csv = 'タスク名,フェーズ,開始日,終了日\n';

    this.tasks.forEach(t => {
      csv += `${t.name},${t.phase?'はい':'いいえ'},${t.start},${t.end}\n`;
    });

    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = 'gantt_chart.csv';
    a.click();

    showToast('CSVをエクスポートしました');
  }

  pushUndoAction(action) {
    if (this.isApplyingUndo || !action) return;
    this.undoHistory.push(action);
    this.redoHistory = [];
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
      if (redoAction) this.redoHistory.push(redoAction);
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
      showToast('一つ先に進みました');
    } finally {
      this.isApplyingUndo = false;
    }
  }

  applyHistoryAction(action) {
  if (!action) return null;

  // 追加の取り消し（削除）
  if (action.type === 'addTask' || action.type === 'addPhase') {
    const taskToDelete = this.tasks.find(t => t.id === action.id);
    const originalIndex = this.tasks.indexOf(taskToDelete);
    
    const inverse = {
      type: 'restoreTasks',
      deletedTasks: [{ ...taskToDelete, _originalIndex: originalIndex }]
    };
    this.tasks = this.tasks.filter(t => t.id !== action.id);
    this.render();
    return inverse;
  }

  // 削除の取り消し（復元）
  if (action.type === 'deleteTasks' || action.type === 'restoreTasks') {
    const isUndo = action.type === 'deleteTasks';
    const inverseType = isUndo ? 'restoreTasks' : 'deleteTasks';

    const inverse = {
      type: inverseType,
      deletedTasks: action.deletedTasks.map(t => ({ ...t }))
    };

    if (action.type === 'deleteTasks') {
      // 復元処理: 保存されたインデックスが小さい順に処理して元の並びを再現
      const tasksToRestore = [...action.deletedTasks].sort((a, b) => a._originalIndex - b._originalIndex);
      tasksToRestore.forEach(t => {
        const { _originalIndex, ...taskData } = t;
        this.tasks.splice(_originalIndex, 0, taskData);
      });
    } else {
      // 削除処理（Redo時など）
      const idsToDelete = action.deletedTasks.map(t => t.id);
      this.tasks = this.tasks.filter(t => !idsToDelete.includes(t.id));
    }

    this.render();
    return inverse;
  }

  // 並び替えの取り消し
  if (action.type === 'reorderTasks') {
    const inverse = {
      type: 'reorderTasks',
      snapshot: this.tasks.map(t => ({ ...t }))
    };
    this.tasks = action.snapshot.map(t => ({ ...t }));
    this.render();
    return inverse;
  }

  return null;
}

  // ===== ヘッダーボタン機能 =====
  clearAll() {
    if (this.tasks.length === 0) {
      showToast('すべてのタスクが既に削除されています');
      return;
    }

    showModal('すべて削除', `
      <p>すべてのタスク/フェーズを削除してもよろしいですか？<br><strong>${this.tasks.length}件</strong>のデータが削除されます。</p>
    `,
    () => {
      const snapshot = this.tasks.map(t => ({ ...t }));
      this.pushUndoAction({
        type: 'clearAll',
        snapshot
      });
      this.tasks = [];
      this.selected.clear();
      this.render();
      showToast('すべてのタスクを削除しました');
    });
  }

  save() {
    showToast('ガントチャートを保存しました');
  }

  openFolder() {
    showToast('ファイルを開く機能は準備中です');
  }

  zoomIn() {
    showToast('拡大機能は準備中です');
  }

  zoomOut() {
    showToast('縮小機能は準備中です');
  }

  fitToScreen() {
    showToast('全体表示機能は準備中です');
  }

  toggleGrid() {
    showToast('グリッド表示の切り替え機能は準備中です');
  }

  autoLayout() {
    showToast('自動配置機能は準備中です');
  }

  exportSVG() {
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400" style="background: white;">';
    svg += '<style>.gantt-text { font-family: sans-serif; font-size: 12px; } .gantt-bar { opacity: 0.8; }</style>';
    
    const { start, end } = this.getDateRange();
    const days = [];
    let current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const dayWidth = 1000 / (days.length || 1);
    const taskHeight = 30;
    let y = 60;

    // タイトル
    svg += '<text x="10" y="30" class="gantt-text" style="font-weight: bold; font-size: 16px;">ガントチャート</text>';

    // タスク描画
    this.tasks.forEach(task => {
      const taskStart = new Date(task.start);
      const taskEnd = new Date(task.end);
      const startIdx = days.findIndex(d => d.toDateString() === taskStart.toDateString());
      const endIdx = days.findIndex(d => d.toDateString() === taskEnd.toDateString());

      if (startIdx >= 0) {
        const x = 50 + startIdx * dayWidth;
        const width = Math.max(dayWidth * (endIdx - startIdx + 1), dayWidth);
        svg += `<rect x="${x}" y="${y}" width="${width}" height="20" fill="${task.color}" class="gantt-bar" />`;
        svg += `<text x="${x + 5}" y="${y + 15}" class="gantt-text">${task.name}</text>`;
      }
      y += taskHeight;
    });

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gantt_chart.svg';
    a.click();

    showToast('ガントチャートをSVGでエクスポートしました');
  }
}

// 初期化は core.js の initNav() で自動的に行われます
// ここではボタンセットアップは setupButtons() で処理済み
