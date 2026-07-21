class RadialMenu {
  constructor(canvas, items, onSelect, opts = {}) {
    this.canvas = canvas;
    this.items = items;
    this.onSelect = onSelect;
    this.radius = opts.radius || 80;
    this.isOpen = false;
    this.menuEl = null;

    // Hub expansion state
    this.menuMode = 'main';
    this.currentPage = 0;
    this.hubShapes = [];
    this.openClientX = 0;
    this.openClientY = 0;
    this._hubBtnEl = null;
    this._hubClientX = 0;
    this._hubClientY = 0;
    this._hubPageBtns = [];

    this.longPressTimer = null;
    this.isSpaceDown = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.longPressThreshold = 500;

    this._initEvents();
  }

  _initEvents() {
    this.canvas.addEventListener('contextmenu', (e) => {
      if (this.isOpen) { this.close(); return; }
      e.preventDefault();
      this.open(e.clientX, e.clientY);
    });

    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
      if (e.code === 'Space' && !this.isSpaceDown && !this.isOpen) {
        this.isSpaceDown = true;
        this.longPressTimer = setTimeout(() => {
          const rect = this.canvas.getBoundingClientRect();
          this.open(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }, this.longPressThreshold);
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isSpaceDown = false;
        if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
      }
      if (e.key === 'Escape' && this.isOpen) { this.close(); }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.longPressTimer = setTimeout(() => {
        if (!this.isOpen) { this.open(this.touchStartX, this.touchStartY); }
      }, this.longPressThreshold);
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.longPressTimer) return;
      const dx = Math.abs(e.touches[0].clientX - this.touchStartX);
      const dy = Math.abs(e.touches[0].clientY - this.touchStartY);
      if (dx > 10 || dy > 10) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
    }, { passive: true });

    const clearTouch = () => {
      if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
    };
    this.canvas.addEventListener('touchend', clearTouch);
    this.canvas.addEventListener('touchcancel', clearTouch);

    document.addEventListener('mousedown', (e) => {
      if (this.isOpen && this.menuEl && !this.menuEl.contains(e.target)) { this.close(); }
    });
  }

  open(clientX, clientY) {
    if (this.isOpen) this.close();
    this.isOpen = true;
    this.menuMode = 'main';
    this.currentPage = 0;
    this.openClientX = clientX;
    this.openClientY = clientY;

    this.menuEl = document.createElement('div');
    this.menuEl.className = 'radial-menu-container';
    this.menuEl.style.left = clientX + 'px';
    this.menuEl.style.top = clientY + 'px';
    document.body.appendChild(this.menuEl);

    this._buildMainButtons();

    requestAnimationFrame(() => {
      if (this.menuEl) this.menuEl.classList.add('open');
    });
  }

  _buildMainButtons() {
    this.items.forEach((it, i) => {
      const angleDeg = it.angle !== undefined ? it.angle : (i * (360 / this.items.length) - 90);
      const rad = angleDeg * Math.PI / 180;
      const x = Math.cos(rad) * this.radius;
      const y = Math.sin(rad) * this.radius;

      const btn = document.createElement('button');
      btn.className = 'radial-menu-btn';
      btn.title = it.label;
      btn.setAttribute('aria-label', it.label);
      btn.style.setProperty('--target-x', x + 'px');
      btn.style.setProperty('--target-y', y + 'px');
      btn.style.transitionDelay = (i * 0.02) + 's';

      const iconAttr = (it.icon && it.icon.startsWith('ti-'))
        ? `class="ti ${it.icon}"`
        : `data-lucide="${it.icon || 'help-circle'}"`;
      btn.innerHTML = `<i ${iconAttr} style="width:20px;height:20px;color:var(--text-primary)"></i>`;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (it.action === 'addShape') {
          const hubX = this.openClientX + x;
          const hubY = this.openClientY + y;
          this._enterHubMode(btn, hubX, hubY);
        } else {
          this.close();
          if (this.onSelect) this.onSelect(it, this.openClientX, this.openClientY);
        }
      });

      btn.addEventListener('contextmenu', (e) => e.preventDefault());
      this.menuEl.appendChild(btn);
    });

    if (window.lucide) lucide.createIcons({ root: this.menuEl });
  }

  _enterHubMode(hubBtnEl, hubClientX, hubClientY) {
    this.menuMode = 'hub';
    this.currentPage = 0;
    this._hubClientX = hubClientX;
    this._hubClientY = hubClientY;

    this.menuEl.querySelectorAll('.radial-menu-btn').forEach(btn => {
      if (btn !== hubBtnEl) {
        btn.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
        btn.style.transform = 'translate(-50%, -50%) scale(0.5)';
        setTimeout(() => { if (btn.parentNode) btn.parentNode.removeChild(btn); }, 160);
      }
    });

    this.menuEl.style.left = hubClientX + 'px';
    this.menuEl.style.top = hubClientY + 'px';
    hubBtnEl.style.setProperty('--target-x', '0px');
    hubBtnEl.style.setProperty('--target-y', '0px');
    hubBtnEl.innerHTML = `<i data-lucide="chevron-right" style="width:20px;height:20px;color:var(--text-primary)"></i>`;
    hubBtnEl.classList.add('radial-menu-hub-btn');
    hubBtnEl.setAttribute('aria-label', '次の図形セットへ');

    const newHubBtn = hubBtnEl.cloneNode(true);
    if (hubBtnEl.parentNode) hubBtnEl.parentNode.replaceChild(newHubBtn, hubBtnEl);
    this._hubBtnEl = newHubBtn;
    if (window.lucide) lucide.createIcons({ root: newHubBtn });

    newHubBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const total = this._calcTotalPages();
      this.currentPage = (this.currentPage + 1) % total;
      this._renderHubPage();
    });
    newHubBtn.addEventListener('contextmenu', e => e.preventDefault());

    setTimeout(() => this._renderHubPage(), 160);
  }

  calcHubExpansion(hubX, hubY) {
    const iconSize = 40;
    const defaultRadius = this.radius;
    const minAcceptableRadius = 48;
    const margin = 10;

    const distTop    = hubY;
    const distBottom = window.innerHeight - hubY;
    const distLeft   = hubX;
    const distRight  = window.innerWidth - hubX;
    const minDist = Math.min(distTop, distBottom, distLeft, distRight);

    const maxRadiusBySpace = minDist - iconSize / 2 - margin;
    const radius = Math.min(defaultRadius, Math.max(maxRadiusBySpace, minAcceptableRadius));

    if (maxRadiusBySpace < minAcceptableRadius) {
      const dirs = [distTop, distBottom, distLeft, distRight];
      const centerAngles = [-90, 90, 180, 0];
      const maxIdx = dirs.indexOf(Math.max(...dirs));
      return { radius: minAcceptableRadius, mode: 'fan', centerAngle: centerAngles[maxIdx], spreadDeg: 180 };
    }
    return { radius, mode: 'full', spreadDeg: 360 };
  }

  _calcItemsPerPage(expansion) {
    const minSpacing = 40 * 1.3;
    const spreadRad = (expansion.spreadDeg * Math.PI) / 180;
    const maxItems = Math.floor((expansion.radius * spreadRad) / minSpacing);
    return Math.max(1, Math.min(maxItems, 8));
  }

  _calcTotalPages() {
    if (!this.hubShapes.length) return 1;
    const expansion = this.calcHubExpansion(this._hubClientX, this._hubClientY);
    const itemsPerPage = this._calcItemsPerPage(expansion);
    return Math.ceil(this.hubShapes.length / itemsPerPage);
  }

  _renderHubPage() {
    this._hubPageBtns.forEach(b => {
      b.style.opacity = '0';
      b.style.transform = 'translate(-50%, -50%) scale(0.5)';
      setTimeout(() => { if (b.parentNode) b.parentNode.removeChild(b); }, 150);
    });
    this._hubPageBtns = [];

    const expansion = this.calcHubExpansion(this._hubClientX, this._hubClientY);
    const itemsPerPage = this._calcItemsPerPage(expansion);
    const start = this.currentPage * itemsPerPage;
    const pageShapes = this.hubShapes.slice(start, start + itemsPerPage);
    const count = pageShapes.length;
    if (count === 0) return;

    const { radius, mode, centerAngle = -90, spreadDeg = 360 } = expansion;

    pageShapes.forEach((shape, i) => {
      let angleDeg;
      if (mode === 'fan') {
        const step = count > 1 ? spreadDeg / (count - 1) : 0;
        angleDeg = (centerAngle - spreadDeg / 2) + i * step;
      } else {
        angleDeg = 180 + (i * (360 / count));
      }
      const rad = angleDeg * Math.PI / 180;
      const x = Math.cos(rad) * radius;
      const y = Math.sin(rad) * radius;

      const btn = document.createElement('button');
      btn.className = 'radial-menu-btn radial-hub-shape-btn';
      btn.title = shape.label;
      btn.setAttribute('aria-label', shape.label);
      btn.style.left = '0px';
      btn.style.top = '0px';
      btn.style.opacity = '0';
      btn.style.transform = 'translate(-50%, -50%) scale(0.5)';
      btn.style.transitionDelay = (i * 0.025) + 's';
      let btnHTML = '';
      if (shape.icon) {
        if (shape.icon.startsWith('<')) {
          btnHTML = shape.icon;
        } else {
          const iconAttr = shape.icon.startsWith('ti-') ? `class="ti ${shape.icon}"` : `data-lucide="${shape.icon}"`;
          btnHTML = `<i ${iconAttr} style="width:20px;height:20px;color:var(--text-primary)"></i>`;
        }
      } else {
        btnHTML = `<span style="font-size:9px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;max-width:36px;text-overflow:ellipsis;display:block;text-align:center;line-height:1.1">${shape.label}</span>`;
      }
      btn.innerHTML = btnHTML;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const savedX = this.openClientX;
        const savedY = this.openClientY;
        this.close();
        if (this.onSelect) this.onSelect(shape, savedX, savedY);
      });
      btn.addEventListener('contextmenu', e => e.preventDefault());
      this.menuEl.appendChild(btn);
      this._hubPageBtns.push(btn);

      if (window.lucide) lucide.createIcons({ root: btn });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          btn.style.left = x + 'px';
          btn.style.top = y + 'px';
          btn.style.opacity = '1';
          btn.style.transform = 'translate(-50%, -50%) scale(1)';
        });
      });
    });
  }

  close() {
    if (!this.isOpen || !this.menuEl) return;
    this.isOpen = false;
    this.menuMode = 'main';
    this.currentPage = 0;
    this._hubBtnEl = null;
    this._hubPageBtns = [];
    this.menuEl.classList.remove('open');
    const el = this.menuEl;
    this.menuEl = null;
    setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 200);
  }
}

window.RadialMenu = RadialMenu;
