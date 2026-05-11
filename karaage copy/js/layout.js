/* ===== Layout Tool ===== */
class LayoutTool {
  constructor() {
    this.elements = [];
    this.elemIdCounter = 0;
    this.selectedEl = null;
    this.undoHistory = [];
    this.isApplyingUndo = false;
    this.canvasMode = 'free'; // 'free' or preset name
    this.canvasW = 960;
    this.canvasH = 600;
    this.aspectRatio = null; // null = free
    this.canvas = document.getElementById('layout-canvas');
    this.canvas.classList.add('free-size');
    this.initPalette();
    this.initCanvasEvents();
    this.initActionButtons();
    this.initCanvasConfig();
  }
  initActionButtons() {
    // data-action属性によるイベントバインディング
    const section = this.canvas.closest('.tool-section');
    if (section) {
      section.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (typeof this[action] === 'function') {
            this[action]();
          }
        });
      });
      // Lucideアイコンの描画
      if (window.lucide) {
        lucide.createIcons({ root: section });
      }
    }
  }
  initPalette() {
    const items = [
      { icon:'panel-top', label:'ヘッダー', w:360, h:50, bg:'#e2e8f0' },
      { icon:'panel-left', label:'サイドバー', w:120, h:300, bg:'#f1f5f9' },
      { icon:'mouse-pointer-2', label:'ボタン', w:120, h:40, bg:'#7c3aed', textColor:'#fff' },
      { icon:'table', label:'テーブル', w:300, h:180, bg:'#f8fafc' },
      { icon:'image', label:'画像', w:200, h:150, bg:'#e2e8f0' },
      { icon:'type', label:'テキスト', w:200, h:30, bg:'transparent' },
      { icon:'text-cursor-input', label:'フォーム', w:280, h:200, bg:'#f8fafc' },
      { icon:'layout-template', label:'カード', w:200, h:140, bg:'#fff' },
      { icon:'panel-bottom', label:'フッター', w:360, h:40, bg:'#e2e8f0' },
      { icon:'search', label:'検索バー', w:240, h:36, bg:'#fff' },
    ];
    this.paletteItems = items;

    // インラインUI要素ボタン（ツールバーに横並び）
    const inlineContainer = document.getElementById('layout-inline-shapes');
    if (inlineContainer) {
      inlineContainer.innerHTML = items.map((it, i) =>
        `<button class="inline-shape-btn" draggable="true" data-idx="${i}" title="${it.label}">
          <i data-lucide="${it.icon}" class="palette-icon"></i>
        </button>`
      ).join('');
      inlineContainer.querySelectorAll('.inline-shape-btn').forEach(btn => {
        btn.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', btn.dataset.idx));
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          if (!isNaN(idx)) this.addElementFromPalette(idx);
        });
      });
    }

    // ▼ボタンから出るドロップダウンUI要素一覧
    const dropdown = document.getElementById('layout-palette-dropdown');
    if (dropdown) {
      dropdown.innerHTML = '<div class="palette-title">UI要素</div>' +
        items.map((it, i) => `<div class="palette-item" draggable="true" data-idx="${i}">
          <span class="p-icon"><i data-lucide="${it.icon}" class="palette-icon"></i></span><span>${it.label}</span></div>`).join('');
      dropdown.querySelectorAll('.palette-item').forEach(el => {
        el.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', el.dataset.idx));
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.idx);
          if (!isNaN(idx)) {
            this.addElementFromPalette(idx);
            dropdown.classList.remove('open');
          }
        });
      });
    }
    // アイコンの初期化
    if (window.lucide) lucide.createIcons();
  }
  initCanvasEvents() {
    this.canvas.addEventListener('dragover', e => e.preventDefault());
    this.canvas.addEventListener('drop', e => {
      e.preventDefault();
      const idx = parseInt(e.dataTransfer.getData('text/plain'));
      if (isNaN(idx)) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.addElement(this.paletteItems[idx], x, y);
    });
    this.canvas.addEventListener('click', e => {
      if (e.target === this.canvas) this.deselectAll();
    });

    // キーボードによるショートカット処理
    document.addEventListener('keydown', e => {
      const section = this.canvas.closest('.tool-section');
      if (!section || !section.classList.contains('active')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && key === 'c') {
        if (this.selectedEl) {
          this.clipboardItem = JSON.parse(JSON.stringify(this.selectedEl));
          showToast('コピーしました');
        }
      } else if (ctrl && key === 'v') {
        if (this.clipboardItem) {
          this.clipboardItem.x += 20;
          this.clipboardItem.y += 20;
          this.addElement(this.clipboardItem, this.clipboardItem.x, this.clipboardItem.y);
        }
      } else if (key === 'delete' || key === 'backspace') {
        if (this.selectedEl) {
          this.deleteSelected();
        }
      } else if (ctrl && key === 'z') {
        e.preventDefault();
        this.undoLastAction();
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (this.selectedEl) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const el = this.selectedEl;
          const div = document.getElementById(el.id);
          if (key === 'arrowup') el.y -= step;
          if (key === 'arrowdown') el.y += step;
          if (key === 'arrowleft') el.x -= step;
          if (key === 'arrowright') el.x += step;
          el.x = Math.max(0, el.x);
          el.y = Math.max(0, el.y);
          div.style.left = el.x + 'px';
          div.style.top = el.y + 'px';
        }
      }
    });

    // クリップボードからの画像ペースト処理
    document.addEventListener('paste', e => {
      const section = this.canvas.closest('.tool-section');
      if (!section || !section.classList.contains('active')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const imgUrl = event.target.result;
            const img = new Image();
            img.onload = () => {
              let w = img.width;
              let h = img.height;
              // 画像サイズが大きい場合は適度に縮小
              if (w > 400) {
                h = h * (400 / w);
                w = 400;
              }
              const canvasW = this.canvas.clientWidth || 800;
              const canvasH = this.canvas.clientHeight || 600;
              const x = Math.min(80 + (this.elemIdCounter % 4) * 40, Math.max(20, canvasW - w - 20));
              const y = Math.min(60 + Math.floor(this.elemIdCounter % 4) * 40, Math.max(20, canvasH - h - 20));
              
              const item = { label: '', w: w, h: h, bg: 'transparent', imageUrl: imgUrl };
              this.addElement(item, x, y);
            };
            img.src = imgUrl;
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break; // 最初に見つかった画像のみ処理
        }
      }
    });
  }
  addElementFromPalette(idx) {
    const item = this.paletteItems[idx];
    if (!item) return;
    const canvasW = this.canvas.clientWidth;
    const canvasH = this.canvas.clientHeight;
    const x = Math.min(80 + (this.elemIdCounter % 4) * 140, Math.max(20, canvasW - item.w - 20));
    const y = Math.min(60 + Math.floor(this.elemIdCounter / 4) * 80, Math.max(20, canvasH - item.h - 20));
    this.addElement(item, x, y);
  }
  toggleSidebar() {
    // デスクトップ用の折りたたみとモバイル用のメニュー開閉の両方をトグル
    document.body.classList.toggle('sidebar-collapsed');
    document.body.classList.toggle('menu-open');
  }
  togglePaletteDropdown() {
    const dropdown = document.getElementById('layout-palette-dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('open');
  }
  addElement(item, x, y) {
    const id = 'layout_el_' + (this.elemIdCounter++);
    const el = { id, label: item.label || '', x, y, w: item.w, h: item.h, bg: item.bg || 'transparent', textColor: item.textColor || '#64748b', imageUrl: item.imageUrl || null };
    this.elements.push(el);
    this.renderElement(el);
    this.pushUndoAction({
      type: 'removeElement',
      elementId: el.id,
      elemIdCounter: this.elemIdCounter - 1,
    });
  }
  renderElement(el) {
    const div = document.createElement('div');
    div.className = 'layout-element';
    div.id = el.id;
    
    let borderStyle = el.bg === 'transparent' ? 'none' : '2px dashed #cbd5e1';
    if (el.imageUrl) borderStyle = 'none';
    
    div.style.cssText = `left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;background:${el.bg};color:${el.textColor};border:${borderStyle}`;
    
    if (el.imageUrl) {
      div.style.backgroundImage = `url(${el.imageUrl})`;
      div.style.backgroundSize = 'contain';
      div.style.backgroundPosition = 'center';
      div.style.backgroundRepeat = 'no-repeat';
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'layout-label';
    labelSpan.textContent = el.label;
    div.appendChild(labelSpan);

    // Add resize handle
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    div.appendChild(handle);

    let dragging = false, resizing = false, ox, oy, ow, oh;
    div.addEventListener('mousedown', e => {
      this.selectElement(el, div);
      
      if (e.target.classList.contains('resize-handle')) {
        resizing = true;
        ow = el.w; oh = el.h;
        ox = e.clientX; oy = e.clientY;
      } else {
        dragging = true;
        ox = e.clientX - el.x; oy = e.clientY - el.y;
      }
      
      const startState = { x: el.x, y: el.y, w: el.w, h: el.h };
      let moved = false;
      e.preventDefault();

      const onMouseMove = event => {
        if (resizing) {
          const dx = event.clientX - ox;
          const dy = event.clientY - oy;
          el.w = Math.max(40, ow + dx);
          el.h = Math.max(30, oh + dy);
          div.style.width = el.w + 'px';
          div.style.height = el.h + 'px';
          moved = true;
        } else if (dragging) {
          const nextX = Math.max(0, event.clientX - ox);
          const nextY = Math.max(0, event.clientY - oy);
          if (nextX !== el.x || nextY !== el.y) moved = true;
          el.x = nextX;
          el.y = nextY;
          div.style.left = el.x + 'px'; div.style.top = el.y + 'px';
        }
      };
      const onMouseUp = () => {
        if (moved) {
          if (resizing) {
            this.pushUndoAction({
              type: 'resizeElement',
              elementId: el.id,
              w: startState.w,
              h: startState.h,
            });
          } else if (dragging) {
            this.pushUndoAction({
              type: 'moveElement',
              elementId: el.id,
              x: startState.x,
              y: startState.y,
            });
          }
        }
        dragging = false; resizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    div.addEventListener('dblclick', () => {
      if (el.imageUrl) return; // 画像の場合はラベル編集をスキップ
      const name = prompt('ラベル:', el.label);
      if (name !== null && name !== el.label) {
        const oldLabel = el.label;
        el.label = name;
        const span = div.querySelector('.layout-label');
        if (span) span.textContent = name;
        this.pushUndoAction({
          type: 'renameElement',
          elementId: el.id,
          label: oldLabel,
        });
      }
    });
    this.canvas.appendChild(div);
  }
  selectElement(el, div) {
    this.deselectAll();
    this.selectedEl = el;
    div.classList.add('selected');
  }
  deselectAll() {
    this.selectedEl = null;
    this.canvas.querySelectorAll('.layout-element').forEach(e => e.classList.remove('selected'));
  }
  deleteSelected() {
    if (!this.selectedEl) return;
    const el = this.selectedEl;
    this.pushUndoAction({
      type: 'restoreElement',
      element: JSON.parse(JSON.stringify(el))
    });
    this.removeElementById(el.id);
    showToast('削除しました');
  }
  pushUndoAction(action) {
    if (this.isApplyingUndo || !action) return;
    this.undoHistory.push(action);
  }
  getElementById(elementId) {
    return this.elements.find(element => element.id === elementId) || null;
  }
  removeElementById(elementId) {
    const index = this.elements.findIndex(element => element.id === elementId);
    if (index < 0) return null;
    const [element] = this.elements.splice(index, 1);
    const div = document.getElementById(elementId);
    if (div) div.remove();
    if (this.selectedEl && this.selectedEl.id === elementId) this.selectedEl = null;
    return element;
  }
  restoreSnapshot(snapshot) {
    if (!snapshot) return;
    this.elements = snapshot.elements.map(element => ({ ...element }));
    this.elemIdCounter = snapshot.elemIdCounter;
    this.selectedEl = null;
    this.canvas.querySelectorAll('.layout-element').forEach(element => element.remove());
    this.elements.forEach(element => this.renderElement(element));
  }
  undoLastAction() {
    const action = this.undoHistory.pop();
    if (!action) {
      showToast('戻せる操作がありません');
      return;
    }

    this.isApplyingUndo = true;
    try {
      if (action.type === 'removeElement') {
        this.removeElementById(action.elementId);
        this.elemIdCounter = action.elemIdCounter;
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'moveElement') {
        const element = this.getElementById(action.elementId);
        const div = element ? document.getElementById(element.id) : null;
        if (element && div) {
          element.x = action.x;
          element.y = action.y;
          div.style.left = `${element.x}px`;
          div.style.top = `${element.y}px`;
        }
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'resizeElement') {
        const element = this.getElementById(action.elementId);
        const div = element ? document.getElementById(element.id) : null;
        if (element && div) {
          element.w = action.w;
          element.h = action.h;
          div.style.width = `${element.w}px`;
          div.style.height = `${element.h}px`;
        }
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'renameElement') {
        const element = this.getElementById(action.elementId);
        const div = element ? document.getElementById(element.id) : null;
        if (element && div) {
          element.label = action.label;
          const span = div.querySelector('.layout-label');
          if (span) span.textContent = action.label;
        }
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'clearAll') {
        this.restoreSnapshot(action.snapshot);
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'restoreElement') {
        this.elements.push(action.element);
        this.renderElement(action.element);
        showToast('元に戻しました');
        return;
      }

      showToast('戻し処理に失敗しました');
    } finally {
      this.isApplyingUndo = false;
    }
  }
  clearAll() {
    const snapshot = {
      elements: this.elements.map(element => ({ ...element })),
      elemIdCounter: this.elemIdCounter,
    };
    this.elements = []; this.elemIdCounter = 0;
    this.canvas.querySelectorAll('.layout-element').forEach(e => e.remove());
    this.pushUndoAction({ type: 'clearAll', snapshot });
    showToast('キャンバスをクリアしました');
  }
  exportPNG() {
    showToast('レイアウトデータを保存しました');
  }
  initCanvasConfig() {
    const section = this.canvas.closest('.tool-section');
    if (!section) return;

    const presets = {
      free:    { ratio: null },
      desktop: { ratio: '16:9' },
      laptop:  { ratio: '16:9' },
      tablet:  { ratio: '3:4' },
      mobile:  { ratio: '9:16' },
    };

    // プリセットボタン
    section.querySelectorAll('.statusbar-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        const preset = presets[key];
        if (!preset) return;

        section.querySelectorAll('.statusbar-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.canvasMode = key;

        if (key === 'free') {
          this.aspectRatio = null;
        } else {
          this.aspectRatio = preset.ratio ? this.parseRatio(preset.ratio) : null;
        }
        this.applyCanvasSize();
      });
    });


    // ウィンドウリサイズ時にも再計算
    window.addEventListener('resize', () => {
      const toolSection = this.canvas.closest('.tool-section');
      if (toolSection && toolSection.classList.contains('active')) {
        this.applyCanvasSize();
      }
    });

    // Lucideアイコン初期化（ツールバー全体を対象に）
    const toolbar = section.querySelector('.layout-toolbar');
    if (toolbar && window.lucide) lucide.createIcons({ root: toolbar });
  }
  parseRatio(str) {
    const [a, b] = str.split(':').map(Number);
    return a / b;
  }
  applyCanvasSize() {
    const container = document.getElementById('layout-canvas-container');
    if (!container) return;
    
    if (this.aspectRatio === null) {
      this.canvas.classList.add('free-size');
      this.canvas.style.width = '';
      this.canvas.style.height = '';
    } else {
      this.canvas.classList.remove('free-size');
      // 余白（パディングやスクロールバーを考慮）を引く
      const maxW = container.clientWidth;
      const maxH = container.clientHeight;
      
      let targetW = maxW;
      let targetH = targetW / this.aspectRatio;
      
      if (targetH > maxH) {
        targetH = maxH;
        targetW = targetH * this.aspectRatio;
      }
      
      this.canvas.style.width = Math.round(targetW) + 'px';
      this.canvas.style.height = Math.round(targetH) + 'px';
    }
  }
}
