class GanttTool {
  constructor() {
    this.tasks = [
      { id:1, name:'要件定義', phase:true, start:'2026-05-01', end:'2026-05-14', color:'#7c3aed' },
      { id:2, name:'ヒアリング', phase:false, start:'2026-05-01', end:'2026-05-07', color:'#a78bfa' },
      { id:3, name:'要件書作成', phase:false, start:'2026-05-05', end:'2026-05-14', color:'#a78bfa' },
      { id:4, name:'基本設計', phase:true, start:'2026-05-12', end:'2026-05-28', color:'#06b6d4' },
      { id:5, name:'画面設計', phase:false, start:'2026-05-12', end:'2026-05-21', color:'#22d3ee' },
      { id:6, name:'DB設計', phase:false, start:'2026-05-15', end:'2026-05-25', color:'#22d3ee' },
      { id:7, name:'API設計', phase:false, start:'2026-05-19', end:'2026-05-28', color:'#22d3ee' },
      { id:8, name:'詳細設計', phase:true, start:'2026-05-26', end:'2026-06-11', color:'#10b981' },
      { id:9, name:'コンポーネント設計', phase:false, start:'2026-05-26', end:'2026-06-04', color:'#34d399' },
      { id:10, name:'テスト計画', phase:false, start:'2026-06-01', end:'2026-06-11', color:'#34d399' },
    ];

    this.taskIdCounter = 11;
    this.isSyncingScroll = false;

    this.render();
  }

  render() {
    this.renderTasks();
    this.renderTimeline();
    this.setupScrollSync(); // ←重要
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
      <div class="gantt-task-row ${t.phase ? 'phase' : ''}" 
           data-id="${t.id}" 
           style="height:32px;">
        <span style="padding-left:${t.phase?'0':'16'}px">
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

    list.querySelectorAll('.gantt-task-row').forEach(row => {
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

  // ヘッダー
  header.innerHTML = days.map(day => {
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    return `
      <div class="gantt-day ${isWeekend?'weekend':''}">
        ${day.getDate()}<br>
        <span style="font-size:0.6rem;">
          ${['日','月','火','水','木','金','土'][day.getDay()]}
        </span>
      </div>
    `;
  }).join('');

  bars.style.width = days.length * dayWidth + 'px';

  // ===== 今日ライン =====
  const today = new Date();
  const todayOffset = Math.floor((today - start) / 86400000);

  const todayLine = `
    <div style="
      position:absolute;
      left:${todayOffset * dayWidth}px;
      top:0;
      bottom:0;
      width:2px;
      background:red;
      z-index:10;
    "></div>
  `;

  // バー
  bars.innerHTML = todayLine + this.tasks.map(task => {
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);

    const startOffset = Math.round((taskStart - start) / 86400000);
    const duration = Math.round((taskEnd - taskStart) / 86400000) + 1;

    const left = startOffset * dayWidth;
    const width = duration * dayWidth;

    return `
      <div class="gantt-bar-row" style="height:32px;">
        <div class="gantt-bar ${task.phase?'phase-bar':''}"
             data-id="${task.id}"
             style="
               left:${left}px;
               width:${width}px;
               background:linear-gradient(135deg,${task.color},${task.color}cc);
             ">
          ${task.phase ? '' : task.name}
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

        let startDate = new Date(task.start);
        let endDate = new Date(task.end);

        if (mode === 'move') {
          startDate.setDate(startDate.getDate() + diffDays);
          endDate.setDate(endDate.getDate() + diffDays);
        }

        if (mode === 'resize-left') {
          startDate.setDate(startDate.getDate() + diffDays);
          if (startDate <= endDate) {
            task.start = this.formatDate(startDate);
          }
        }

        if (mode === 'resize-right') {
          endDate.setDate(endDate.getDate() + diffDays);
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
        this.tasks.push({
          id: this.taskIdCounter++,
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
}

/* 初期化 */
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
});
