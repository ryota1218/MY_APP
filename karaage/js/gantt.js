/* ===== Gantt Chart Tool ===== */
class GanttTool {
  constructor() {
    this.tasks = [
      { id:1, name:'要件定義', phase:true, start:'2026-06-01', end:'2026-06-14', color:'#7c3aed' },
      { id:2, name:'ヒアリング', phase:false, start:'2026-06-01', end:'2026-06-07', color:'#a78bfa' },
      { id:3, name:'要件書作成', phase:false, start:'2026-06-05', end:'2026-06-14', color:'#a78bfa' },
      { id:4, name:'基本設計', phase:true, start:'2026-06-12', end:'2026-06-28', color:'#06b6d4' },
      { id:5, name:'画面設計', phase:false, start:'2026-06-12', end:'2026-06-21', color:'#22d3ee' },
      { id:6, name:'DB設計', phase:false, start:'2026-06-15', end:'2026-06-25', color:'#22d3ee' },
      { id:7, name:'API設計', phase:false, start:'2026-06-19', end:'2026-06-28', color:'#22d3ee' },
      { id:8, name:'詳細設計', phase:true, start:'2026-06-26', end:'2026-07-11', color:'#10b981' },
      { id:9, name:'コンポーネント設計', phase:false, start:'2026-06-26', end:'2026-07-04', color:'#34d399' },
      { id:10, name:'テスト計画', phase:false, start:'2026-07-01', end:'2026-07-11', color:'#34d399' },
    ];
    this.taskIdCounter = 11;
    this.selectedTaskId = null;
    this.render();
  }
  render() {
    this.renderTasks();
    this.renderTimeline();
    this.updateCalculator();
    this.syncScroll();
    this.updateButtonVisibility();
  }
  syncScroll() {
    const tasksSide = document.getElementById('gantt-tasks');
    const timelineSide = document.getElementById('gantt-timeline');
    if (!tasksSide || !timelineSide) return;

    // 左側のスクロールを右側に同期
    tasksSide.onscroll = () => {
      timelineSide.scrollTop = tasksSide.scrollTop;
    };
    // 右側のスクロールを左側に同期
    timelineSide.onscroll = () => {
      tasksSide.scrollTop = timelineSide.scrollTop;
    };
  }
  getDateRange() {
    let min = '2099-12-31', max = '2000-01-01';
    this.tasks.forEach(t => {
      if (t.start < min) min = t.start;
      if (t.end > max) max = t.end;
    });
    const start = new Date(min);
    start.setDate(start.getDate() - 3);
    const end = new Date(max);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }
  renderTasks() {
    const list = document.getElementById('gantt-task-list');
    list.innerHTML = this.tasks.map(t => `
      <div class="gantt-task-row ${t.phase ? 'phase' : ''} ${this.selectedTaskId === t.id ? 'selected' : ''}" data-id="${t.id}">
        <span class="phase-toggle-btn" style="text-align: center;">${t.phase ? '▸' : ''}</span>
        <input type="checkbox" class="task-checkbox" ${this.selectedTaskId === t.id ? 'checked' : ''} style="cursor: pointer;" onclick="event.stopPropagation();">
        <span style="padding-left:${t.phase ? '0' : '8'}px">${t.name}</span>
        <span style="font-size:0.75rem;color:var(--text-muted);text-align:center;">${t.start.slice(5)}</span>
        <span style="font-size:0.75rem;color:var(--text-muted);text-align:center;">${t.end.slice(5)}</span>
        <span style="font-size:0.75rem;color:var(--accent2);text-align:center;">${t.actualStart ? t.actualStart.slice(5) : '-'}</span>
        <span style="font-size:0.75rem;color:var(--accent2);text-align:center;">${t.actualEnd ? t.actualEnd.slice(5) : '-'}</span>
      </div>
    `).join('');
    list.querySelectorAll('.gantt-task-row').forEach(row => {
      row.addEventListener('dblclick', () => {
        const id = parseInt(row.dataset.id);
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        const newName = prompt('タスク名:', task.name);
        if (newName) { task.name = newName; this.render(); }
      });
      row.addEventListener('click', () => {
        const id = parseInt(row.dataset.id);
        this.selectedTaskId = (this.selectedTaskId === id) ? null : id;
        this.renderTasks();
        this.updateButtonVisibility();
      });
    });
  }
  updateButtonVisibility() {
    const actualBtn = document.getElementById('input-actual-btn');
    const deleteBtn = document.getElementById('delete-selected-btn');
    const isSelected = this.selectedTaskId !== null;

    if (actualBtn) actualBtn.style.display = isSelected ? 'inline-flex' : 'none';
    if (deleteBtn) deleteBtn.style.display = isSelected ? 'inline-flex' : 'none';
  }
  renderTimeline() {
    const { start, end } = this.getDateRange();
    const header = document.getElementById('gantt-header');
    const bars = document.getElementById('gantt-bars');
    const days = [];
    const d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    const dayWidth = 36;
    header.innerHTML = days.map(day => {
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      return `<div class="gantt-day ${isWeekend?'weekend':''}">${day.getDate()}<br><span style="font-size:0.6rem;">${['日','月','火','水','木','金','土'][day.getDay()]}</span></div>`;
    }).join('');
    bars.style.width = days.length * dayWidth + 'px';
    bars.innerHTML = this.tasks.map(task => {
      const taskStart = new Date(task.start);
      const taskEnd = new Date(task.end);
      const startOffset = Math.round((taskStart - start) / 86400000);
      const duration = Math.round((taskEnd - taskStart) / 86400000) + 1;
      const left = startOffset * dayWidth;
      const width = duration * dayWidth;

      let actualBar = '';
      if (task.actualStart && task.actualEnd) {
        const aStart = new Date(task.actualStart);
        const aEnd = new Date(task.actualEnd);
        const aOffset = Math.round((aStart - start) / 86400000);
        const aDur = Math.round((aEnd - aStart) / 86400000) + 1;
        actualBar = `<div class="gantt-bar actual-bar" style="left:${aOffset * dayWidth}px;width:${aDur * dayWidth}px;"></div>`;
      }

      return `<div class="gantt-bar-row">
        <div class="gantt-bar ${task.phase?'phase-bar':''}" style="left:${left}px;width:${width}px;background:linear-gradient(135deg,${task.color},${task.color}cc);">
          ${task.phase?'':task.name}
        </div>
        ${actualBar}
      </div>`;
    }).join('');
  }

  updateCalculator() {
    const tbody = document.getElementById('calculator-table-body');
    if (!tbody || this.tasks.length === 0) return;

    let minDate = this.tasks[0].start;
    let maxDate = this.tasks[0].end;
    this.tasks.forEach(t => {
      if (t.start < minDate) minDate = t.start;
      if (t.end > maxDate) maxDate = t.end;
    });

    const diffDays = Math.ceil((new Date(maxDate) - new Date(minDate)) / 86400000) + 1;

    document.getElementById('project-duration').textContent = `${diffDays} 日間`;
    document.getElementById('project-start').textContent = minDate;
    document.getElementById('project-end').textContent = maxDate;
    document.getElementById('project-count').textContent = `${this.tasks.length} 件`;

    tbody.innerHTML = this.tasks.map(t => {
      const dur = Math.ceil((new Date(t.end) - new Date(t.start)) / 86400000) + 1;
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 10px;">${t.name}</td>
          <td style="padding: 12px 10px; text-align: center;">${t.phase ? 'フェーズ' : 'タスク'}</td>
          <td style="padding: 12px 10px; text-align: center;">${t.start}</td>
          <td style="padding: 12px 10px; text-align: center;">${t.end}</td>
          <td style="padding: 12px 10px; text-align: center;">${dur}日</td>
          <td style="padding: 12px 10px; text-align: center;">-</td>
        </tr>`;
    }).join('');
  }

  addPhase() {
    showModal('フェーズ追加', `
      <div class="form-group"><label>フェーズ名</label><input class="form-input" id="gantt-phase-name"></div>
      <div class="form-group"><label>開始日</label><input class="form-input" id="gantt-phase-start" type="date"></div>
      <div class="form-group"><label>終了日</label><input class="form-input" id="gantt-phase-end" type="date"></div>`,
      () => {
        const name = document.getElementById('gantt-phase-name').value;
        const start = document.getElementById('gantt-phase-start').value;
        const end = document.getElementById('gantt-phase-end').value;
        if (name && start && end) {
          const colors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ec4899','#6366f1'];
          this.tasks.push({ id: this.taskIdCounter++, name, phase:true, start, end, color: colors[this.tasks.length%colors.length] });
          this.render();
          showToast('フェーズを追加しました');
        }
      }
    );
  }
  addTask() {
    showModal('タスク追加', `
      <div class="form-group"><label>タスク名</label><input class="form-input" id="gantt-task-name"></div>
      <div class="form-group"><label>開始日</label><input class="form-input" id="gantt-task-start" type="date"></div>
      <div class="form-group"><label>終了日</label><input class="form-input" id="gantt-task-end" type="date"></div>`,
      () => {
        const name = document.getElementById('gantt-task-name').value;
        const start = document.getElementById('gantt-task-start').value;
        const end = document.getElementById('gantt-task-end').value;
        if (name && start && end) {
          this.tasks.push({ id: this.taskIdCounter++, name, phase:false, start, end, color:'#a78bfa' });
          this.render();
          showToast('タスクを追加しました');
        }
      }
    );
  }
  inputActual() {
    const task = this.tasks.find(t => t.id === this.selectedTaskId);
    if (!task) {
      showToast('行を選択してください');
      return;
    }
    showModal(`実績入力: ${task.name}`, `
      <div class="form-group"><label>実績開始日</label><input class="form-input" id="actual-start" type="date" value="${task.actualStart || ''}"></div>
      <div class="form-group"><label>実績終了日</label><input class="form-input" id="actual-end" type="date" value="${task.actualEnd || ''}"></div>`,
      () => {
        const start = document.getElementById('actual-start').value;
        const end = document.getElementById('actual-end').value;
        if (start && end) {
          task.actualStart = start;
          task.actualEnd = end;
          this.render();
          showToast('実績を保存しました');
        }
      }
    );
  }
  exportCSV() {
    let csv = 'タスク名,フェーズ,開始日,終了日\n';
    this.tasks.forEach(t => { csv += `${t.name},${t.phase?'はい':'いいえ'},${t.start},${t.end}\n`; });
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'gantt_chart.csv'; a.click();
    showToast('CSVをエクスポートしました');
  }
}

/* ===== App Controller ===== */
class App {
  constructor() {
    this.gantt = new GanttTool();
    this.initTabs();
    this.initEvents();
  }
  initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isCalc = tab.dataset.tab === 'calculator';
        document.getElementById('edit-panel').style.display = isCalc ? 'none' : 'flex';
        document.getElementById('edit-content').style.display = isCalc ? 'none' : 'flex';
        document.getElementById('calculator-content').style.display = isCalc ? 'block' : 'none';
        if (isCalc) this.gantt.updateCalculator();
      });
    });
  }
  initEvents() {
    document.getElementById('add-phase-btn').onclick = () => this.gantt.addPhase();
    document.getElementById('add-task-btn').onclick = () => this.gantt.addTask();
    document.getElementById('input-actual-btn').onclick = () => this.gantt.inputActual();
    document.getElementById('export-csv-btn').onclick = () => this.gantt.exportCSV();
  }
}

/* ===== Initialize App ===== */
let app;
document.addEventListener('DOMContentLoaded', () => { app = new App(); });
