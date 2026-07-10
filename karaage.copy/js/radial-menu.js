class RadialMenu {
  constructor(canvas, items, onSelect, opts = {}) {
    this.canvas = canvas;
    this.items = items;
    this.onSelect = onSelect;
    this.radius = opts.radius || 80;
    this.isOpen = false;
    this.menuEl = null;

    this.longPressTimer = null;
    this.isSpaceDown = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.longPressThreshold = 500;

    this._initEvents();
  }

  _initEvents() {
    // 右クリック (contextmenu)
    this.canvas.addEventListener('contextmenu', (e) => {
      if (this.isOpen) {
        // すでに開いている状態での再右クリック → 閉じてブラウザ標準メニューを表示させる
        this.close();
        return; // preventDefault しない
      }
      
      e.preventDefault();
      this.open(e.clientX, e.clientY);
    });

    // Spaceキー長押し
    document.addEventListener('keydown', (e) => {
      // 別の入力中なら無視
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
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // タッチデバイスの長押し
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      
      this.longPressTimer = setTimeout(() => {
        if (!this.isOpen) {
          this.open(this.touchStartX, this.touchStartY);
        }
      }, this.longPressThreshold);
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.longPressTimer) return;
      const dx = Math.abs(e.touches[0].clientX - this.touchStartX);
      const dy = Math.abs(e.touches[0].clientY - this.touchStartY);
      if (dx > 10 || dy > 10) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }, { passive: true });

    const clearTouch = () => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    };
    this.canvas.addEventListener('touchend', clearTouch);
    this.canvas.addEventListener('touchcancel', clearTouch);

    // 外部クリックで閉じる
    document.addEventListener('mousedown', (e) => {
      if (this.isOpen && this.menuEl && !this.menuEl.contains(e.target)) {
        this.close();
      }
    });
  }

  open(clientX, clientY) {
    if (this.isOpen) this.close();
    this.isOpen = true;

    this.menuEl = document.createElement('div');
    this.menuEl.className = 'radial-menu-container';
    this.menuEl.style.left = clientX + 'px';
    this.menuEl.style.top = clientY + 'px';
    document.body.appendChild(this.menuEl);

    // B.txtの配置ロジック
    this.items.forEach((it, i) => {
      // 角度(度)→ラジアンに変換
      const angleDeg = it.angle !== undefined ? it.angle : (i * (360 / this.items.length) - 90);
      const rad = angleDeg * Math.PI / 180;
      const x = Math.cos(rad) * this.radius;
      const y = Math.sin(rad) * this.radius;

      const btn = document.createElement('button');
      btn.className = 'radial-menu-btn';
      btn.title = it.label;
      btn.style.setProperty('--target-x', x + 'px');
      btn.style.setProperty('--target-y', y + 'px');
      // アニメーションのディレイを少しずらす
      btn.style.transitionDelay = (i * 0.02) + 's';

      // Lucide icon
      const iconAttr = it.icon.startsWith('ti-') ? `class="ti ${it.icon}"` : `data-lucide="${it.icon}"`;
      btn.innerHTML = `<i ${iconAttr} style="width:20px;height:20px;color:var(--text-primary)"></i>`;

      // クリックアクション
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
        if (this.onSelect) {
          this.onSelect(it);
        }
      });

      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      this.menuEl.appendChild(btn);
    });

    if (window.lucide) {
      lucide.createIcons({ root: this.menuEl });
    }

    // 次のフレームで開くクラスを付与（CSSアニメーション発火）
    requestAnimationFrame(() => {
      if (this.menuEl) {
        this.menuEl.classList.add('open');
      }
    });
  }

  close() {
    if (!this.isOpen || !this.menuEl) return;
    this.isOpen = false;
    this.menuEl.classList.remove('open');
    
    const el = this.menuEl;
    this.menuEl = null;
    
    // アニメーション完了後に削除
    setTimeout(() => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 200);
  }
}

window.RadialMenu = RadialMenu;
