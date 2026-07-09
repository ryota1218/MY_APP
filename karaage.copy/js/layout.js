/* ===== Layout Tool ===== */
class LayoutTool {
  constructor() {
    this.elements = [];
    this.elemIdCounter = 0;
    this.selectedEl = null;
    this.undoHistory = [];
    this.redoHistory = [];
    this.isApplyingUndo = false;
    this.canvasMode = 'free'; // 'free' or preset name
    this.canvasW = 960;
    this.canvasH = 600;
    this.aspectRatio = null; // null = free
    this.zoomLevel = 1.0; // ズーム初期値を追加
    this.isGridVisible = true; // グリッド初期値を追加
    this.clipboard = null; // コピペ用バッファを追加
    this.isDirty = false;

    this.canvas = document.getElementById('layout-canvas');
    this.canvas.classList.add('free-size');
    this.propertyPanelEl = null;

    // AI Chat state
    this.prefix = 'layout';
    this.aiChatListenersInitialized = false;
    this.chatHistory = [];
    
    this.initPalette();
    this.initCanvasEvents();
    this.initActionButtons();
    this.initPropertyPanel();
    this.initCanvasConfig();
    this.initThemeListener();
  }

  initActionButtons() {
    // data-action属性によるイベントバインディング
    const section = this.canvas.closest('.tool-section');
    console.log('[LayoutTool] initActionButtons section:', section);
    if (section) {
      const buttons = section.querySelectorAll('[data-action]');
      console.log('[LayoutTool] found buttons with data-action:', buttons.length);
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = btn.dataset.action;
          console.log('[LayoutTool] button clicked, action:', action);
          if (typeof this[action] === 'function') {
            console.log('[LayoutTool] calling method:', action);
            e.stopPropagation();
            this[action]();
          } else {
            console.error('[LayoutTool] method not found:', action);
          }
        });
      });
      // Lucideアイコンの描画
      if (window.lucide) {
        lucide.createIcons({ root: section });
      }
    }
  }

  captureSnapshot() {
    return {
      elements: this.elements.map(el => ({ ...el })),
      elemIdCounter: this.elemIdCounter,
    };
  }

  saveSnapshot() { this.pushUndoAction({ type: 'clearAll', snapshot: this.captureSnapshot() }); }

  initPalette() {
    const items = [
      { icon:'panel-top', label:'ヘッダー', w:360, h:50, bg:'var(--bg-glass)', color:'#3b82f6' },
      { icon:'panel-left', label:'サイドバー', w:120, h:300, bg:'var(--bg-glass)', color:'#10b981' },
      { icon:'mouse-pointer-2', label:'ボタン', w:120, h:40, bg:'var(--accent)', textColor:'#fff', color:'#f59e0b' },
      { icon:'table', label:'テーブル', w:300, h:180, bg:'var(--bg-card)', color:'#8b5cf6' },
      { icon:'image', label:'画像', w:200, h:150, bg:'var(--bg-glass)', color:'#ec4899' },
      { icon:'type', label:'テキスト', w:200, h:30, bg:'transparent', color:'#f97316' },
      { icon:'text-cursor-input', label:'フォーム', w:280, h:200, bg:'var(--bg-card)', color:'#06b6d4' },
      { icon:'layout-template', label:'カード', w:200, h:140, bg:'var(--bg-card)', color:'#6366f1' },
      { icon:'panel-bottom', label:'フッター', w:360, h:40, bg:'var(--bg-glass)', color:'#14b8a6' },
      { icon:'search', label:'検索バー', w:240, h:36, bg:'var(--bg-card)', color:'#a855f7' },
    ];
    this.paletteItems = items;

    // ドロップダウンUI要素一覧（格子状配置）
    const dropdown = document.getElementById('layout-palette-dropdown');
    if (dropdown) {
      dropdown.innerHTML = `<div class="palette-dropdown-menu" style="background-color: var(--bg-card, #111827); border: 1px solid var(--accent, #7c3aed); box-shadow: 0 8px 32px var(--shadow-color, rgba(0,0,0,0.4)); display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 12px; border-radius: 6px; min-width: 320px;">
        ${items.map((it, i) => `<button type="button" class="shape-option" draggable="true" data-idx="${i}" data-label="${it.label}" aria-label="${it.label}" style="border: 1px solid color-mix(in srgb, ${it.color}, transparent 80%); border-left: 3px solid ${it.color}; color: ${it.color}; background-color: color-mix(in srgb, ${it.color}, transparent 92%); box-shadow: 0 2px 4px color-mix(in srgb, ${it.color}, transparent 96%); border-radius: 4px; padding: 8px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 70px; font-size: 12px;">
          <i data-lucide="${it.icon}" class="palette-icon" style="width: 24px; height: 24px;"></i>${it.label}</button>`).join('')}
      </div>`;
      dropdown.querySelectorAll('.shape-option').forEach(el => {
        el.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', el.dataset.idx));
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.idx);
          if (!isNaN(idx)) {
            this.addElementFromPalette(idx);
            dropdown.classList.remove('open');
            dropdown.style.display = 'none';
          }
        });
      });
    }

    // インラインUI要素ボタン（ツールバーに横並び - 最初の4つのみ）
    const inlineContainer = document.getElementById('layout-inline-shapes');
    if (inlineContainer) {
      const visibleItems = items.slice(0, 4);
      inlineContainer.innerHTML = visibleItems.map((it, i) =>
        `<button type="button" class="inline-shape-btn" draggable="true" data-idx="${i}" data-label="${it.label}" aria-label="${it.label}" style="background-color: color-mix(in srgb, ${it.color}, transparent 90%); border: 1px solid color-mix(in srgb, ${it.color}, transparent 75%); border-radius: 4px;">
          <span class="inline-shape-icon" style="color: ${it.color}"><i data-lucide="${it.icon}" class="palette-icon"></i></span>
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
      const x = (e.clientX - rect.left) / this.zoomLevel;
      const y = (e.clientY - rect.top) / this.zoomLevel;

      const item = this.paletteItems[idx];
      const approxW = item.w || 100;
      const approxH = item.h || 40;
      const maxX = this.canvas.clientWidth - approxW;
      const maxY = this.canvas.clientHeight - approxH;
      if (x < -10 || y < -10 || x > maxX + 10 || y > maxY + 10) {
        if (typeof showToast === 'function') showToast('キャンバスの領域外には配置できません');
        return;
      }
      this.addElement(item, x, y);
    });
    this.canvas.addEventListener('click', e => {
      if (e.target === this.canvas) {
        this.deselectAll();
        this.closePropertyPanel();
      }
    });

    // キーボードによるショートカット処理
    document.addEventListener('keydown', e => {
      const section = this.canvas.closest('.tool-section');
      if (!section || !section.classList.contains('active')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && key === 'c') {
        e.preventDefault();
        this.copySelected();
      } else if (ctrl && key === 'x') {
        e.preventDefault();
        this.cutSelected();
      } else if (ctrl && key === 'v') {
        e.preventDefault();
        this.pasteSelected();
      } else if (key === 'delete' || key === 'backspace') {
        if (this.selectedEl) {
          this.deleteSelected();
        }
      } else if (ctrl && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.redoLastAction();
        else this.undoLastAction();
      } else if (ctrl && key === 'y') {
        e.preventDefault();
        this.redoLastAction();
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
          if (this.propertyPanelEl && this.propertyPanelEl.id === el.id) this.syncPropertyPanel(el);
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

    // ドロップダウン外クリックで閉じる処理
    document.addEventListener('click', e => {
      const dropdown = document.getElementById('layout-palette-dropdown');
      const btn = document.getElementById('layout-shape-add-btn');
      if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  initPropertyPanel() {
    const bindInput = (suffix, updater) => {
      const input = document.getElementById('layout-prop-' + suffix);
      if (!input) return;
      input.addEventListener('input', e => {
        if (!this.propertyPanelEl) return;
        updater(this.propertyPanelEl, e.target.value);
        this.updateElementDOM(this.propertyPanelEl);
        this.syncPropertyPanel(this.propertyPanelEl);
      });
    };

    bindInput('label', (el, value) => { el.label = value; });
    bindInput('x', (el, value) => { el.x = Math.max(0, Number(value) || 0); });
    bindInput('y', (el, value) => { el.y = Math.max(0, Number(value) || 0); });
    bindInput('w', (el, value) => { el.w = Math.max(40, Number(value) || 40); });
    bindInput('h', (el, value) => { el.h = Math.max(30, Number(value) || 30); });
    bindInput('fontsize', (el, value) => { el.fontSize = Math.max(10, Number(value) || 14); });
    bindInput('textcolor', (el, value) => { el.textColor = value; });
    bindInput('bg', (el, value) => { el.bg = value; });
    bindInput('zindex', (el, value) => { el.zIndex = Math.max(0, Number(value) || 0); });

    // Z順序ボタンのイベントリスナー
    const forwardBtn = document.getElementById('layout-zindex-forward');
    const backwardBtn = document.getElementById('layout-zindex-backward');
    if (forwardBtn) {
      forwardBtn.addEventListener('click', () => {
        if (this.propertyPanelEl) this.moveForward(this.propertyPanelEl);
      });
    }
    if (backwardBtn) {
      backwardBtn.addEventListener('click', () => {
        if (this.propertyPanelEl) this.moveBackward(this.propertyPanelEl);
      });
    }
  }

  openPropertyPanel(el) {
    this.propertyPanelEl = el;
    const panel = document.getElementById('layout-property-panel');
    if (panel) panel.classList.add('open');
    this.syncPropertyPanel(el);

    setTimeout(() => {
      const labelInput = document.getElementById('layout-prop-label');
      if (labelInput) {
        labelInput.focus({ preventScroll: true });
        labelInput.select();
      }
    }, 120);
  }

  syncPropertyPanel(el) {
    if (!el) return;
    const setVal = (suffix, value) => {
      const input = document.getElementById('layout-prop-' + suffix);
      if (input) input.value = value;
    };

    setVal('label', el.label || '');
    setVal('x', Math.round(el.x || 0));
    setVal('y', Math.round(el.y || 0));
    setVal('w', Math.round(el.w || 0));
    setVal('h', Math.round(el.h || 0));
    setVal('fontsize', Math.round(el.fontSize || 14));
    setVal('textcolor', this.normalizeHexColor(el.textColor || '#64748b'));
    setVal('bg', this.normalizeHexColor(el.bg || '#f1f5f9'));
    setVal('zindex', el.zIndex || 0);

    const bgInput = document.getElementById('layout-prop-bg');
    if (bgInput) bgInput.disabled = !!el.imageUrl;
  }

  closePropertyPanel() {
    this.propertyPanelEl = null;
    const panel = document.getElementById('layout-property-panel');
    if (panel) panel.classList.remove('open');
  }

  normalizeHexColor(color) {
    if (!color || color === 'transparent') return '#ffffff';
    if (typeof color !== 'string') return '#ffffff';

    if (color.startsWith('#')) {
      if (color.length === 4) {
        const r = color[1];
        const g = color[2];
        const b = color[3];
        return `#${r}${r}${g}${g}${b}${b}`;
      }
      if (color.length === 7) return color;
      if (color.length === 9) return color.slice(0, 7);
    }

    const match = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) {
      const toHex = (n) => Number(n).toString(16).padStart(2, '0');
      return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
    }

    return '#ffffff';
  }

  updateElementDOM(el) {
    const div = document.getElementById(el.id);
    if (!div) return;

    let borderStyle = el.bg === 'transparent' ? 'none' : '2px dashed var(--border)';
    if (el.imageUrl) borderStyle = 'none';

    div.style.left = el.x + 'px';
    div.style.top = el.y + 'px';
    div.style.width = el.w + 'px';
    div.style.height = el.h + 'px';
    div.style.color = el.textColor || '#64748b';
    div.style.fontSize = (el.fontSize || 13) + 'px';
    div.style.border = borderStyle;
    div.style.zIndex = el.zIndex || 0;
    div.style.background = el.imageUrl ? 'transparent' : (el.bg || 'transparent');

    if (el.imageUrl) {
      div.style.backgroundImage = `url(${el.imageUrl})`;
      div.style.backgroundSize = 'contain';
      div.style.backgroundPosition = 'center';
      div.style.backgroundRepeat = 'no-repeat';
    } else {
      div.style.backgroundImage = 'none';
    }

    const labelSpan = div.querySelector('.layout-label');
    if (labelSpan) labelSpan.textContent = el.label || '';
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
    const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
    document.body.classList.toggle('menu-open');
    if (isCollapsed) {
      document.body.dataset.sidebarCollapsedByUser = 'true';
    } else {
      document.body.dataset.sidebarCollapsedByUser = 'false';
    }
  }

  togglePaletteDropdown() {
    const dropdown = document.getElementById('layout-palette-dropdown');
    if (!dropdown) {
      console.error('[LayoutTool] layout-palette-dropdown not found');
      return;
    }
    const isVisible = dropdown.style.display !== 'none' && dropdown.style.display !== '';
    dropdown.style.display = isVisible ? 'none' : 'block';
    console.log('[LayoutTool] togglePaletteDropdown:', isVisible ? 'hidden' : 'shown');
  }

  addElement(item, x, y) {
    const id = 'layout_el_' + (this.elemIdCounter++);
    const el = {
      id,
      label: item.label || '',
      x,
      y,
      w: item.w,
      h: item.h,
      bg: item.bg || 'transparent',
      textColor: item.textColor || '#64748b',
      fontSize: item.fontSize || 14,
      zIndex: this.elements.length,
      imageUrl: item.imageUrl || null,
    };
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
    
    let borderStyle = el.bg === 'transparent' ? 'none' : '2px dashed var(--border)';
    if (el.imageUrl) borderStyle = 'none';
    
    const fontSize = el.fontSize || 14;
    const zIndex = el.zIndex || 0;
    div.style.cssText = `left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;background:${el.bg};color:${el.textColor};border:${borderStyle};font-size:${fontSize}px;z-index:${zIndex}`;
    
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
        ox = (e.clientX / this.zoomLevel) - el.x; oy = (e.clientY / this.zoomLevel) - el.y;
      }
      
      const startState = { x: el.x, y: el.y, w: el.w, h: el.h };
      let moved = false;
      e.preventDefault();

      const onMouseMove = event => {
        if (resizing) {
          const dx = (event.clientX - ox) / this.zoomLevel;
          const dy = (event.clientY - oy) / this.zoomLevel;
          el.w = Math.max(40, ow + dx);
          el.h = Math.max(30, oh + dy);
          div.style.width = el.w + 'px';
          div.style.height = el.h + 'px';
          if (this.propertyPanelEl && this.propertyPanelEl.id === el.id) this.syncPropertyPanel(el);
          moved = true;
        } else if (dragging) {
          const nextX = Math.max(0, (event.clientX / this.zoomLevel) - ox);
          const nextY = Math.max(0, (event.clientY / this.zoomLevel) - oy);
          if (nextX !== el.x || nextY !== el.y) moved = true;
          el.x = nextX;
          el.y = nextY;
          div.style.left = el.x + 'px'; div.style.top = el.y + 'px';
          if (this.propertyPanelEl && this.propertyPanelEl.id === el.id) this.syncPropertyPanel(el);
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
            const maxX = this.canvas.clientWidth - el.w;
            const maxY = this.canvas.clientHeight - el.h;
            if (el.x < -10 || el.y < -10 || el.x > maxX + 10 || el.y > maxY + 10) {
              // スナップバック
              el.x = startState.x;
              el.y = startState.y;
              div.style.left = el.x + 'px';
              div.style.top = el.y + 'px';
              if (this.propertyPanelEl && this.propertyPanelEl.id === el.id) this.syncPropertyPanel(el);
              if (typeof showToast === 'function') showToast('キャンバスの領域外には配置できません');
            } else {
              this.pushUndoAction({
                type: 'moveElement',
                elementId: el.id,
                x: startState.x,
                y: startState.y,
              });
            }
          }
        }
        resizing = false;
        dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    div.addEventListener('dblclick', e => {
      e.preventDefault();
      e.stopPropagation();
      this.selectElement(el, div);
      this.openPropertyPanel(el);
    });
    this.canvas.appendChild(div);
  }

  selectElement(el, div) {
    this.deselectAll();
    this.selectedEl = el;
    div.classList.add('selected');
    const panel = document.getElementById('layout-property-panel');
    if (panel && panel.classList.contains('open')) {
      this.propertyPanelEl = el;
      this.syncPropertyPanel(el);
    }
  }

  deselectAll() {
    this.selectedEl = null;
    this.canvas.querySelectorAll('.layout-element').forEach(e => e.classList.remove('selected'));
  }

  moveForward(el) {
    if (!el) return;
    const currentZ = el.zIndex || 0;
    const nextElement = this.elements.find(e => e.zIndex === currentZ + 1);
    
    if (nextElement) {
      const oldZ = el.zIndex;
      el.zIndex = nextElement.zIndex;
      nextElement.zIndex = oldZ;
      
      this.updateElementDOM(el);
      this.updateElementDOM(nextElement);
    }
    
    this.syncPropertyPanel(el);
    this.pushUndoAction({
      type: 'changeZIndex',
      elementId: el.id,
      oldZIndex: (el.zIndex === currentZ + 1) ? currentZ : el.zIndex,
    });
  }

  moveBackward(el) {
    if (!el) return;
    const currentZ = el.zIndex || 0;
    
    if (currentZ === 0) {
      showToast('これ以上背面に移動できません');
      return;
    }
    
    const prevElement = this.elements.find(e => e.zIndex === currentZ - 1);
    
    if (prevElement) {
      const oldZ = el.zIndex;
      el.zIndex = prevElement.zIndex;
      prevElement.zIndex = oldZ;
      
      this.updateElementDOM(el);
      this.updateElementDOM(prevElement);
    }
    
    this.syncPropertyPanel(el);
    this.pushUndoAction({
      type: 'changeZIndex',
      elementId: el.id,
      oldZIndex: (el.zIndex === currentZ - 1) ? currentZ : el.zIndex,
    });
  }

  deleteSelected() {
    if (!this.selectedEl) return;
    const el = this.selectedEl;
    this.pushUndoAction({
      type: 'restoreElement',
      element: JSON.parse(JSON.stringify(el))
    });
    this.removeElementById(el.id);
    this.closePropertyPanel();
    showToast('削除しました');
  }

  pushUndoAction(action) {
    if (this.isApplyingUndo || !action) return;
    this.undoHistory.push(action);
    this.redoHistory = [];
    this.isDirty = true;
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
    this.elements = (snapshot.elements || []).map(element => ({ ...element }));
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
      showToast('一つ先に進めました');
    } finally {
      this.isApplyingUndo = false;
    }
  }

  pushRedoAction(action) { if (action) this.redoHistory.push(action); }

  applyHistoryAction(action) {
    if (!action) return null;
    if (action.type === 'moveElement') {
      const element = this.getElementById(action.elementId);
      if (!element) return null;
      const inverse = { type: 'moveElement', elementId: action.elementId, x: element.x, y: element.y };
      element.x = action.x; element.y = action.y;
      this.updateElementDOM(element);
      return inverse;
    }
    if (action.type === 'resizeElement') {
      const element = this.getElementById(action.elementId);
      if (!element) return null;
      const inverse = { type: 'resizeElement', elementId: action.elementId, w: element.w, h: element.h };
      element.w = action.w; element.h = action.h;
      this.updateElementDOM(element);
      return inverse;
    }
    if (action.type === 'removeElement') {
      const removed = this.removeElementById(action.elementId);
      if (!removed) return null;
      return { type: 'restoreElement', element: { ...removed } };
    }
    if (action.type === 'restoreElement') {
      this.elements.push(action.element);
      this.renderElement(action.element);
      return { type: 'removeElement', elementId: action.element.id };
    }
    if (action.type === 'clearAll') {
      const current = this.captureSnapshot();
      this.restoreSnapshot(action.snapshot);
      return { type: 'clearAll', snapshot: current };
    }
    if (action.type === 'changeZIndex') {
      const element = this.getElementById(action.elementId);
      if (!element) return null;
      const inverse = { type: 'changeZIndex', elementId: action.elementId, oldZIndex: element.zIndex };
      element.zIndex = action.oldZIndex;
      this.updateElementDOM(element);
      return inverse;
    }
    return null;
  }

  clearAll() {
    const performClear = () => {
      const snapshot = {
        elements: this.elements.map(element => ({ ...element })),
        elemIdCounter: this.elemIdCounter,
      };
      this.elements = []; this.elemIdCounter = 0;
      this.canvas.querySelectorAll('.layout-element').forEach(e => e.remove());
      if (window.DBIO) window.DBIO.resetCurrentDiagram();
      this.pushUndoAction({ type: 'clearAll', snapshot });
      this.isDirty = false;
      this.deselectAll();
      showToast('キャンバスをクリアしました');
    };

    if (this.isDirty) {
      if (typeof showConfirm !== 'undefined') {
        showConfirm(
          '未保存の変更',
          '未保存の変更があります。<br>変更を保存して新規作成しますか？',
          () => {
            if (typeof this.saveDiagram === 'function') {
              this.saveDiagram().then((saved) => { if (saved) performClear(); });
            } else {
              performClear();
            }
          },
          'はい',
          'いいえ'
        );
      } else {
        if (confirm('未保存の変更があります。\n変更を保存し、新規作成しますか？\n(OKで保存後にクリア、キャンセルで保存せずクリア)')) {
          if (typeof this.saveDiagram === 'function') this.saveDiagram().then((saved) => { if (saved) performClear(); });
          else performClear();
        } else {
          performClear();
        }
      }
    } else {
      if (typeof showConfirm !== 'undefined') {
        showConfirm('キャンバスのクリア', 'キャンバスをクリアします。よろしいですか？', performClear, 'はい', 'いいえ');
      } else {
        if (confirm('キャンバスをクリアします。よろしいですか？')) performClear();
      }
    }
  }
  exportSVG() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const bg = document.createElementNS(svgNamespace, "rect");
    bg.setAttribute("width", "100%"); bg.setAttribute("height", "100%");
    bg.setAttribute("fill", getComputedStyle(this.canvas).backgroundColor || "#0a0e1a");
    svg.appendChild(bg);
    this.elements.forEach(el => {
      const g = document.createElementNS(svgNamespace, "g");
      const rect = document.createElementNS(svgNamespace, "rect");
      rect.setAttribute("x", el.x); rect.setAttribute("y", el.y);
      rect.setAttribute("width", el.w); rect.setAttribute("height", el.h);
      rect.setAttribute("fill", el.bg === 'transparent' ? 'none' : el.bg);
      rect.setAttribute("stroke", "rgba(255,255,255,0.2)"); rect.setAttribute("stroke-width", "1");
      g.appendChild(rect);
      if (el.label) {
        const text = document.createElementNS(svgNamespace, "text");
        text.setAttribute("x", el.x + el.w / 2); text.setAttribute("y", el.y + el.h / 2);
        text.setAttribute("fill", el.textColor || "#fff");
        text.setAttribute("font-size", el.fontSize || 14);
        text.setAttribute("text-anchor", "middle"); text.setAttribute("dominant-baseline", "middle");
        text.textContent = el.label;
        g.appendChild(text);
      }
      svg.appendChild(g);
    });
    const serializer = new XMLSerializer();
    const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'layout_export.svg';
    a.click(); URL.revokeObjectURL(url);
    showToast('SVGをエクスポートしました');
  }

  exportJSON() {
    FileIO.exportJSON(this);
  }

  importJSON() {
    FileIO.importJSON(this);
  }

  importJSONFromText() {
    FileIO.importJSONFromText(this);
  }

  /* ===== ズーム機能 ===== */
  zoomIn() {
    this.zoomLevel = Math.min(2.0, this.zoomLevel + 0.1);
    this.applyZoom();
  }

  zoomOut() {
    this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1);
    this.applyZoom();
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.applyZoom();
  }

  applyZoom() {
    this.canvas.style.transform = `scale(${this.zoomLevel})`;
    this.canvas.style.transformOrigin = '0 0';
    showToast(`ズーム: ${Math.round(this.zoomLevel * 100)}%`);
  }

  /* ===== グリッド切り替え ===== */
  toggleGrid() {
    this.isGridVisible = !this.isGridVisible;
    this.canvas.classList.toggle('grid-visible', this.isGridVisible);
    this.canvas.classList.toggle('grid-active', this.isGridVisible);
    showToast(this.isGridVisible ? 'グリッドを表示しました' : 'グリッドを非表示にしました');
  }

  /* ===== コピー＆ペースト機能 ===== */
  copySelected() {
    if (this.selectedEl) {
      this.clipboard = { ...this.selectedEl };
      showToast('コピーしました');
    }
  }

  cutSelected() {
    if (this.selectedEl) {
      this.clipboard = { ...this.selectedEl };
      showToast('切り取りました');
      // 削除メッセージを表示しないように直接削除する
      const el = this.selectedEl;
      this.pushUndoAction({
        type: 'restoreElement',
        element: JSON.parse(JSON.stringify(el))
      });
      this.removeElementById(el.id);
      this.closePropertyPanel();
    }
  }

  pasteSelected() {
    if (!this.clipboard) return;
    const item = { ...this.clipboard };
    this.addElement(item, item.x + 20, item.y + 20);
    showToast('貼り付けました');
  }

  /* ===== ストレージ保存・読み込み ===== */
  async saveDiagram() {
    const data = {
      elements: this.elements,
      elemIdCounter: this.elemIdCounter
    };
    if (window.DBIO) {
      return await window.DBIO.saveDiagramToDB('layout', data);
    } else {
      showToast('データベース連携モジュールが見つかりません', 'danger');
      return false;
    }
  }

  async openDiagramModal() {
    if (window.DBIO) {
      await window.DBIO.showOpenModal('layout', (data, id, name, status) => {
        this.restoreSnapshot(data);
        showToast(`${name} を読み込みました`);
      });
    } else {
      showToast('データベース連携モジュールが見つかりません', 'danger');
    }
  }

  async loadDiagram(forceWithoutConfirm = false) {
    // DB保存への一本化に伴い、自動ロード（プロジェクト切り替え時）は常に空のキャンバスで初期化します
    this.elements = [];
    this.elemIdCounter = 0;
    if (this.canvas) {
      this.canvas.querySelectorAll('.layout-element').forEach(e => e.remove());
    }
    if (window.DBIO) window.DBIO.resetCurrentDiagram();
    this.deselectAll();
  }

  /* ===== ヘルプ・その他モック ===== */
  showHelp() {
    alert('【画面レイアウト ヘルプ】\n・左のUI要素をドラッグして配置\n・要素をダブルクリックでテキスト編集\n・プロパティパネルで色やサイズを調整');
  }

  showSettings() {
    showToast('設定パネルを開きます');
    if (window.themeManager) window.themeManager.toggleModal();
  }

  shareDiagram() {
    showToast('共有機能は現在準備中です', 'info');
  }

  showUserProfile() {
    if (window.app && window.app.profile) window.app.profile.showModal();
  }

  autoLayout() {
    const cols = Math.ceil(Math.sqrt(this.elements.length));
    this.elements.forEach((el, i) => {
      el.x = 40 + (i % cols) * 240;
      el.y = 40 + Math.floor(i / cols) * 160;
      this.updateElementDOM(el);
    });
    showToast('グリッド状に自動配置しました');
  }
  

  exportPNG() {
    showToast('PNGエクスポートは現在モック実装です', 'info');
  }

  initThemeListener() {
    const handler = () => {
      this.initPalette();
      // キャンバス上の要素の色をリセット（テーマ変更時に反映）
      this.elements.forEach(el => this.updateElementDOM(el));

      // プロパティパネル（開閉に関わらず存在すれば）にテーマを反映
      const panel = document.getElementById('layout-property-panel');
      if (panel) {
        // 入力要素の見た目をテーマ変数に合わせる
        const bgSecondary = (getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary') || '').trim();
        const textColor = (getComputedStyle(document.documentElement).getPropertyValue('--text') || '').trim();
        const borderColor = (getComputedStyle(document.documentElement).getPropertyValue('--border') || '').trim() || 'rgba(0,0,0,0.12)';

        const inputs = panel.querySelectorAll('input, select, textarea');
        inputs.forEach(inp => {
          try {
            inp.style.background = bgSecondary || '';
            inp.style.color = textColor || '';
            inp.style.border = `1px solid ${borderColor}`;
          } catch (e) {}
        });

        // ボタン類もテーマに合わせる
        const btns = panel.querySelectorAll('button');
        const accent = (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '').trim();
        btns.forEach(b => {
          try {
            b.style.borderColor = borderColor || '';
            // Primary buttons (btn-primary) use accent
            if (b.classList.contains('btn-primary') || b.classList.contains('btn')) {
              if (accent) {
                b.style.background = accent;
                b.style.color = '#fff';
                b.style.border = 'none';
              }
            }
          } catch (e) {}
        });

        // color input: ensure a visible preview swatch exists and update it
        const colorInputs = panel.querySelectorAll('input[type="color"], .color-input');
        colorInputs.forEach(inp => {
          try {
            let inputEl = inp.tagName === 'INPUT' ? inp : inp;
            // find or create preview element
            let preview = inputEl.nextElementSibling;
            if (!preview || !preview.classList || !preview.classList.contains('color-preview')) {
              preview = document.createElement('span');
              preview.className = 'color-preview';
              inputEl.parentNode.insertBefore(preview, inputEl.nextSibling);
            }

            const setPreview = (val) => {
              try { preview.style.background = val || 'transparent'; } catch (e) {}
            };

            // initial value
            setPreview(inputEl.value || inputEl.getAttribute('value') || 'transparent');

            // update on input change
            inputEl.addEventListener('input', (e) => setPreview(e.target.value));
          } catch (e) {}
        });

        // 値の再同期（プロパティパネルが開かれている場合は入力値を最新にする）
        if (this.propertyPanelEl && panel.classList.contains('open')) {
          this.syncPropertyPanel(this.propertyPanelEl);
          // sync color previews after values updated
          const colorInputs2 = panel.querySelectorAll('input[type="color"], .color-input');
          colorInputs2.forEach(inp => {
            const inputEl = inp.tagName === 'INPUT' ? inp : inp;
            const preview = inputEl.nextElementSibling;
            if (preview && preview.classList && preview.classList.contains('color-preview')) {
              try { preview.style.background = inputEl.value || inputEl.getAttribute('value') || 'transparent'; } catch (e) {}
            }
          });
        }
      }
    };

    document.addEventListener('theme-changed', handler);
    // 初期化時に現在のテーマを反映
    try { handler(); } catch (e) { console.error('[LayoutTool] theme handler failed', e); }
  }

  initCanvasConfig() {
    const section = this.canvas.closest('.tool-section');
    if (!section) return;

    const presets = {
      free:    { ratio: null },
      desktop: { ratio: '16:9' },
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

    window.addEventListener('resize', () => {
      const toolSection = this.canvas.closest('.tool-section');
      if (toolSection && toolSection.classList.contains('active')) {
        this.applyCanvasSize();
      }
    });

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

  async aiAutoLayout() {
    if (!this.elements || this.elements.length === 0) {
      showToast('配置する要素がありません');
      return;
    }

    const requestBody = {
      diagram_type: 'layout',
      nodes: this.elements.map(el => ({
        id: el.id,
        label: el.label || '',
        x: el.x,
        y: el.y,
        width: el.w || 100,
        height: el.h || 100,
      })),
      existing_connections: [],
      canvas_width: (this.canvas.clientWidth || 960),
      canvas_height: (this.canvas.clientHeight || 600),
    };

    showToast('🤖 AIが最適な配置を計算中...');

    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
      const apiBaseUrl = isLocal ? 'http://localhost:8000' : 'https://upstream-ai-backend-976977069035.us-central1.run.app';

      const response = await fetch(`${apiBaseUrl}/api/ai-layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `サーバーエラー (${response.status})`);
      }

      const result = await response.json();

      if (result.nodes && result.nodes.length > 0) {
        const duration = 400;
        const startTime = performance.now();
        const startPositions = {};
        const targetPositions = {};

        result.nodes.forEach(rn => {
          const el = this.elements.find(e => e.id === rn.id);
          if (el) {
            startPositions[rn.id] = { x: el.x, y: el.y };
            targetPositions[rn.id] = { x: rn.x, y: rn.y };
          }
        });

        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);

          Object.keys(startPositions).forEach(nodeId => {
            const elObj = this.elements.find(e => e.id === nodeId);
            const domEl = document.getElementById(nodeId);
            if (!elObj || !domEl) return;
            const start = startPositions[nodeId];
            const target = targetPositions[nodeId];
            elObj.x = start.x + (target.x - start.x) * easedProgress;
            elObj.y = start.y + (target.y - start.y) * easedProgress;
            domEl.style.left = elObj.x + 'px';
            domEl.style.top = elObj.y + 'px';
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            showToast('AIレイアウト最適化が完了しました');
          }
        };
        requestAnimationFrame(animate);
      } else {
        showToast('配置の変更はありませんでした');
      }

      if (result.advice) {
        console.log("AI Advice:", result.advice);
      }
    } catch (error) {
      console.error('[AI Layout] Error:', error);
      showToast(`AI最適化エラー: ${error.message}`, 'danger');
    }
  }

  toggleAIChat() {
    const panel = document.getElementById(this.prefix + '-ai-chat-panel');
    if (!panel) return;

    const isOpen = panel.classList.toggle('open');
    // layout.js uses right property panel differently, but we can assume standard behavior.
    if (isOpen) {
      // this.closePropertyPanel() -> actually in layout.js, deselecting might close property panel.
      if (this.selectedEl) {
        document.getElementById(this.selectedEl.id)?.classList.remove('selected');
        this.selectedEl = null;
        const pp = document.getElementById('layout-property-panel');
        if (pp) pp.style.display = 'none';
      }
      document.body.classList.add('sidebar-collapsed');
      
      const msgArea = document.getElementById(this.prefix + '-ai-chat-messages');
      if (msgArea) msgArea.scrollTop = msgArea.scrollHeight;
      this.initAIChatListeners();
    } else {
      if (document.body.dataset.sidebarCollapsedByUser !== 'true') {
        document.body.classList.remove('sidebar-collapsed');
      }
    }
  }

  initAIChatListeners() {
    if (this.aiChatListenersInitialized) return;

    const sendBtn = document.getElementById(this.prefix + '-ai-chat-send-btn');
    const input = document.getElementById(this.prefix + '-ai-chat-input');
    if (!sendBtn || !input) return;

    sendBtn.addEventListener('click', () => {
      this.sendAIChatMessage();
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendAIChatMessage();
      }
    });

    this.aiChatListenersInitialized = true;
    this.chatHistory = [];
  }

  async sendAIChatMessage() {
    const input = document.getElementById(this.prefix + '-ai-chat-input');
    const msgArea = document.getElementById(this.prefix + '-ai-chat-messages');
    if (!input || !msgArea) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'ai-chat-msg user';
    userMsgDiv.innerHTML = `<div class="ai-chat-bubble">${this.escapeHTML(text)}</div>`;
    msgArea.appendChild(userMsgDiv);
    msgArea.scrollTop = msgArea.scrollHeight;

    const loaderMsgDiv = document.createElement('div');
    loaderMsgDiv.className = 'ai-chat-msg assistant';
    loaderMsgDiv.innerHTML = `
      <div class="ai-chat-bubble" style="color: #9ca3af; display: flex; align-items: center; gap: 8px;">
        <span class="icon-spin" style="display:inline-block; width:12px; height:12px; border:2px solid #a78bfa; border-top-color:transparent; border-radius:50%; animation: spin 1s linear infinite;"></span>
        <span>AIが配置を再計算しています...</span>
      </div>
    `;
    msgArea.appendChild(loaderMsgDiv);
    msgArea.scrollTop = msgArea.scrollHeight;

    const requestBody = {
      diagram_type: 'layout',
      nodes: this.elements.map(el => ({
        id: el.id,
        label: el.label || '',
        x: el.x,
        y: el.y,
        width: el.w || 100,
        height: el.h || 100,
      })),
      existing_connections: [],
      canvas_width: (this.canvas.clientWidth || 960),
      canvas_height: (this.canvas.clientHeight || 600),
      user_instruction: text,
      chat_history: this.chatHistory || []
    };

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    const apiBaseUrl = isLocal ? 'http://localhost:8000' : 'https://upstream-ai-backend-976977069035.us-central1.run.app';

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai-chat-layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      loaderMsgDiv.remove();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `サーバーエラー (${response.status})`);
      }

      const result = await response.json();

      if (result.nodes && result.nodes.length > 0) {
        const duration = 400;
        const startTime = performance.now();
        const startPositions = {};
        const targetPositions = {};

        result.nodes.forEach(rn => {
          const el = this.elements.find(e => e.id === rn.id);
          if (el) {
            startPositions[rn.id] = { x: el.x, y: el.y };
            targetPositions[rn.id] = { x: rn.x, y: rn.y };
          }
        });

        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);

          Object.keys(startPositions).forEach(nodeId => {
            const elObj = this.elements.find(e => e.id === nodeId);
            const domEl = document.getElementById(nodeId);
            if (!elObj || !domEl) return;
            const start = startPositions[nodeId];
            const target = targetPositions[nodeId];
            elObj.x = start.x + (target.x - start.x) * easedProgress;
            elObj.y = start.y + (target.y - start.y) * easedProgress;
            domEl.style.left = elObj.x + 'px';
            domEl.style.top = elObj.y + 'px';
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }

      const assistantMsgDiv = document.createElement('div');
      assistantMsgDiv.className = 'ai-chat-msg assistant';
      
      let adviceHtml = '';
      if (result.advice) {
        adviceHtml = `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.9em; line-height: 1.4;">
            <div style="font-weight: 600; color: #a78bfa; margin-bottom: 4px;">💡 構成の評価・アドバイス:</div>
            <div style="color: #e5e7eb;">${this.escapeHTML(result.advice)}</div>
          </div>
        `;
      }

      assistantMsgDiv.innerHTML = `
        <div class="ai-chat-bubble">
          指示されたレイアウト調整を適用しました！
          <ul>
            <li>指示: <em>「${this.escapeHTML(text)}」</em></li>
            <li>移動されたノード数: <strong>${result.nodes?.length || 0}</strong> 個</li>
          </ul>
          ${adviceHtml}
        </div>
      `;
      msgArea.appendChild(assistantMsgDiv);
      msgArea.scrollTop = msgArea.scrollHeight;

      this.chatHistory.push({ role: 'user', content: text });
      this.chatHistory.push({ role: 'model', content: `指示されたレイアウト調整を適用しました！移動ノード数: ${result.nodes?.length || 0}. アドバイス: ${result.advice || ''}` });

    } catch (error) {
      console.error('[AI Chat Layout] Error:', error);
      loaderMsgDiv.remove();

      const errorMsgDiv = document.createElement('div');
      errorMsgDiv.className = 'ai-chat-msg assistant';
      errorMsgDiv.innerHTML = `
        <div class="ai-chat-bubble" style="border-color: #f87171; background-color: rgba(239, 68, 68, 0.05);">
          <span style="color: #f87171; font-weight: 600;">⚠️ エラーが発生しました</span><br>
          ${this.escapeHTML(error.message)}
        </div>
      `;
      msgArea.appendChild(errorMsgDiv);
      msgArea.scrollTop = msgArea.scrollHeight;
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}