/**
 * 動的テーマジェネレーター
 * ユーザーが選択したベースカラーから、ダーク/ライトの両方に対応する階調パレットを自動生成します
 */

class ThemeManager {
  constructor() {
    this.defaultTheme = {
      baseColor: '#7c3aed', // デフォルトの紫（hue: 262付近）
      accentColor: '#06b6d4', // アクセント
      mode: 'dark' // 'dark' or 'light'
    };
    this.currentTheme = { ...this.defaultTheme };
    this.init();
  }

  init() {
    this.loadTheme();
    this.applyTheme();
    this.setupUI();
  }

  loadTheme() {
    const saved = localStorage.getItem('upstream_theme');
    if (saved) {
      try {
        this.currentTheme = { ...this.defaultTheme, ...JSON.parse(saved) };
      } catch(e) {}
    }
  }

  saveTheme() {
    localStorage.setItem('upstream_theme', JSON.stringify(this.currentTheme));
  }

  /**
   * HEX色からHSLへの変換
   */
  hexToHsl(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // grayscale
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  hslToHex({ h, s, l }) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    const toHex = (value) => Math.round((value + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  adjustHsl(hsl, delta) {
    return { h: (hsl.h + delta + 360) % 360, s: hsl.s, l: hsl.l };
  }

  clampLightness(hsl, delta) {
    return { h: hsl.h, s: hsl.s, l: Math.min(100, Math.max(0, hsl.l + delta)) };
  }

  /**
   * HSLからグラデーションパレットを計算してCSS変数に適用
   */
  applyTheme() {
    // 古いデータ構造からの移行対応
    if (!this.currentTheme.mainBgColor) {
      this.currentTheme.mainBgColor = this.currentTheme.mode === 'light' ? '#f8fafc' : '#0a0e1a';
      this.currentTheme.subBgColor = this.currentTheme.mode === 'light' ? '#ffffff' : '#111827';
    }

    const { mainBgColor, subBgColor, accentColor } = this.currentTheme;
    const root = document.documentElement;

    // 背景色をそのまま適用
    root.style.setProperty('--bg-primary', mainBgColor);
    root.style.setProperty('--bg-secondary', subBgColor);
    
    // カード背景はサブ背景色を完全に不透明にして、背景の赤みなどが透けないようにする
    const subHsl = this.hexToHsl(subBgColor);
    root.style.setProperty('--bg-card', `hsla(${subHsl.h}, ${subHsl.s}%, ${subHsl.l}%, 1)`);
    root.style.setProperty('--bg-card-hover', `hsla(${subHsl.h}, ${subHsl.s}%, ${Math.max(0, subHsl.l - 4)}%, 1)`);
    
    // 文字色の自動判定（YIQコントラスト）
    const isDarkBg = this.isDark(mainBgColor);
    if (isDarkBg) {
      root.style.setProperty('--text', '#f8fafc');
      root.style.setProperty('--text-dim', '#cbd5e1');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border', 'rgba(255,255,255,0.15)');
      root.style.setProperty('--bg-glass', 'rgba(255,255,255,0.05)');
    } else {
      root.style.setProperty('--text', '#0f172a');
      root.style.setProperty('--text-dim', '#334155');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border', 'rgba(0,0,0,0.15)');
      root.style.setProperty('--bg-glass', 'rgba(0,0,0,0.03)');
    }

    // アクセントカラーの適用
    const accentHsl = this.hexToHsl(accentColor);
    const accentRgb = this.hexToRgb(accentColor);
    const accentLight = this.hslToHex(this.clampLightness(accentHsl, 18));
    const accent2 = this.hslToHex(this.clampLightness(this.adjustHsl(accentHsl, 120), 10));
    const accent3 = this.hslToHex(this.clampLightness(this.adjustHsl(accentHsl, 210), 10));

    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-light', accentLight);
    root.style.setProperty('--accent2', accent2);
    root.style.setProperty('--accent3', accent3);
    root.style.setProperty('--accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    root.style.setProperty('--accent2-rgb', `${this.hexToRgb(accent2).r}, ${this.hexToRgb(accent2).g}, ${this.hexToRgb(accent2).b}`);
    root.style.setProperty('--accent3-rgb', `${this.hexToRgb(accent3).r}, ${this.hexToRgb(accent3).g}, ${this.hexToRgb(accent3).b}`);
    root.style.setProperty('--warn', '#f59e0b');
    root.style.setProperty('--warn-rgb', '245, 158, 11');
    root.style.setProperty('--danger', '#ef4444');
    root.style.setProperty('--danger-rgb', '239, 68, 68');
    root.style.setProperty('--text-rgb', `${this.hexToRgb(isDarkBg ? '#f8fafc' : '#0f172a').r}, ${this.hexToRgb(isDarkBg ? '#f8fafc' : '#0f172a').g}, ${this.hexToRgb(isDarkBg ? '#f8fafc' : '#0f172a').b}`);
    root.style.setProperty('--border-hover', `hsla(${accentHsl.h}, ${accentHsl.s}%, 50%, 0.5)`);
  }

  isDark(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 128;
  }

  setupUI() {
    if (document.getElementById('settings-modal')) return;

    const modalHTML = `
      <div id="settings-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9998; backdrop-filter: blur(4px);"></div>
      <div id="settings-modal" class="card" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; padding: 20px; z-index: 9999; box-shadow: var(--shadow); background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <h3 style="font-size: 1.1rem; margin: 0; color: var(--text);">テーマ＆表示設定</h3>
          <button id="close-settings" style="background: none; border: none; color: var(--text-dim); cursor: pointer; transition: color 0.2s;"><i data-lucide="x" style="width: 20px; height: 20px;"></i></button>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-dim);">メイン背景色 (外側)</label>
          <input type="color" id="theme-main-bg" style="width: 100%; height: 36px; cursor: pointer; border: none; padding: 0; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-dim);">サブ背景色 (内側・カード)</label>
          <input type="color" id="theme-sub-bg" style="width: 100%; height: 36px; cursor: pointer; border: none; padding: 0; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-dim);">アクセント色 (ボタン等)</label>
          <input type="color" id="theme-accent-color" style="width: 100%; height: 36px; cursor: pointer; border: none; padding: 0; border-radius: 6px;">
        </div>

        <div style="padding-top: 15px; border-top: 1px solid var(--border);">
          <label style="display: block; margin-bottom: 10px; font-size: 0.85rem; color: var(--text-dim);">プリセットから選ぶ</label>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="preset-dark" style="flex: 1; padding: 6px;">黒系</button>
            <button class="btn btn-secondary btn-sm" id="preset-karaage" style="flex: 1; padding: 6px; color: #b45309; border-color: #fde68a; background: #fef3c7;">唐揚げ</button>
            <button class="btn btn-secondary btn-sm" id="preset-light" style="flex: 1; padding: 6px; background: white; color: black;">白系</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    if (window.lucide) {
      window.lucide.createIcons();
    }

    document.getElementById('close-settings').addEventListener('click', () => this.closeModal());
    document.getElementById('settings-overlay').addEventListener('click', () => this.closeModal());

    document.getElementById('theme-main-bg').addEventListener('input', (e) => {
      this.currentTheme.mainBgColor = e.target.value;
      this.applyTheme();
    });
    document.getElementById('theme-main-bg').addEventListener('change', () => this.saveTheme());

    document.getElementById('theme-sub-bg').addEventListener('input', (e) => {
      this.currentTheme.subBgColor = e.target.value;
      this.applyTheme();
    });
    document.getElementById('theme-sub-bg').addEventListener('change', () => this.saveTheme());

    document.getElementById('theme-accent-color').addEventListener('input', (e) => {
      this.currentTheme.accentColor = e.target.value;
      this.applyTheme();
    });
    document.getElementById('theme-accent-color').addEventListener('change', () => this.saveTheme());

    document.getElementById('preset-dark').addEventListener('click', () => {
      this.currentTheme.mainBgColor = '#0a0e1a';
      this.currentTheme.subBgColor = '#111827';
      this.currentTheme.accentColor = '#7c3aed';
      this.applyTheme();
      this.saveTheme();
      this.updateUI();
    });
    
    document.getElementById('preset-karaage').addEventListener('click', () => {
      this.currentTheme.mainBgColor = '#fffaf0'; // 暖かみのあるクリーム白
      this.currentTheme.subBgColor = '#ffffff';  // 内側はクリーンな白
      this.currentTheme.accentColor = '#d97706'; // 唐揚げのようなこんがりとしたオレンジブラウン
      this.applyTheme();
      this.saveTheme();
      this.updateUI();
    });

    document.getElementById('preset-light').addEventListener('click', () => {
      this.currentTheme.mainBgColor = '#f8fafc';
      this.currentTheme.subBgColor = '#ffffff';
      this.currentTheme.accentColor = '#0ea5e9';
      this.applyTheme();
      this.saveTheme();
      this.updateUI();
    });
  }

  updateUI() {
    if (!this.currentTheme.mainBgColor) {
      this.currentTheme.mainBgColor = this.currentTheme.mode === 'light' ? '#f8fafc' : '#0a0e1a';
      this.currentTheme.subBgColor = this.currentTheme.mode === 'light' ? '#ffffff' : '#111827';
    }
    document.getElementById('theme-main-bg').value = this.currentTheme.mainBgColor;
    document.getElementById('theme-sub-bg').value = this.currentTheme.subBgColor;
    document.getElementById('theme-accent-color').value = this.currentTheme.accentColor;
  }

  toggleModal() {
    const modal = document.getElementById('settings-modal');
    const overlay = document.getElementById('settings-overlay');
    if (!modal || !overlay) {
      this.setupUI(); // Ensure it exists
      return this.toggleModal();
    }

    if (modal.style.display === 'none') {
      this.updateUI();
      modal.style.display = 'block';
      overlay.style.display = 'block';
    } else {
      this.closeModal();
    }
  }

  closeModal() {
    const modal = document.getElementById('settings-modal');
    const overlay = document.getElementById('settings-overlay');
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();

  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="showSettings"]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      window.themeManager.toggleModal();
    }
  });
});
