/**
 * 動的テーマジェネレーター
 * ユーザーが選択したベースカラーから、ダーク/ライトの両方に対応する階調パレットを自動生成します
 */

class ThemeManager {
  constructor() {
    this.defaultTheme = {
      baseColor: '#7c3aed', // デフォルトの紫（hue: 262付近）
      accentColor: '#0ea5e9', // ライトモードに合うアクセント（青系）
      mode: 'light', // デフォルトをライトモードに変更
      mainBgColor: '#ffffff', // 純粋な白背景
      subBgColor: '#ffffff'
    };
    this.currentTheme = { ...this.defaultTheme };
    this.init();
  }

  init() {
    this.loadTheme();
    this.applyTheme();
  }

  async loadTheme() {
    const saved = localStorage.getItem('upstream_theme');
    if (saved) {
      try {
        this.currentTheme = { ...this.defaultTheme, ...JSON.parse(saved) };
      } catch(e) {}
    }

    // Supabaseからプロジェクトカラーを取得して上書き適用する
    const projectId = window.DBIO ? window.DBIO.getCurrentProjectId() : null;
    if (projectId) {
      try {
        const dbColor = await window.DBIO.fetchProjectColor(projectId);
        if (dbColor) {
          this.currentTheme.mainBgColor = dbColor.main;
          this.currentTheme.subBgColor = dbColor.sub;
          this.currentTheme.accentColor = dbColor.accent;
          this.applyTheme();
          this.updateSection(document.getElementById('account-theme-section'));
        }
      } catch (err) {
        console.error('[ThemeManager] DBからのテーマカラー取得に失敗しました:', err);
      }
    }
  }

  async saveTheme() {
    localStorage.setItem('upstream_theme', JSON.stringify(this.currentTheme));
    
    // Supabaseへプロジェクトカラーを同期保存する
    const projectId = window.DBIO ? window.DBIO.getCurrentProjectId() : null;
    if (projectId) {
      try {
        await window.DBIO.saveProjectColor(
          projectId,
          this.currentTheme.mainBgColor,
          this.currentTheme.subBgColor,
          this.currentTheme.accentColor
        );

      } catch (err) {
        console.error('[ThemeManager] DBへのテーマカラー保存に失敗しました:', err);

      }
    }
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
      root.style.setProperty('--grid-dot-color', 'rgba(255,255,255,0.15)');
      root.style.setProperty('--modal-overlay', 'rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow', '0 8px 32px rgba(0,0,0,0.35)');
    } else {
      root.style.setProperty('--text', '#0f172a');
      root.style.setProperty('--text-dim', '#334155');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border', 'rgba(0,0,0,0.15)');
      root.style.setProperty('--bg-glass', 'rgba(0,0,0,0.03)');
      root.style.setProperty('--grid-dot-color', 'rgba(0,0,0,0.1)');
      root.style.setProperty('--modal-overlay', 'rgba(15, 23, 42, 0.18)');
      root.style.setProperty('--shadow', '0 8px 32px rgba(15,23,42,0.12)');
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

    // UMLナビゲーション・サブメニュー用の詳細テーマ変数
    root.style.setProperty('--nav-active-bg', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.15)`);
    root.style.setProperty('--nav-active-text', accentColor);
    root.style.setProperty('--nav-submenu-bg', subBgColor);
    root.style.setProperty('--nav-submenu-border', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)`);

    // 動的なUI要素のスタイル強制適用（CSSファイルが未対応の場合のフォールバック）
    const styleId = 'theme-dynamic-overrides';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      #uml-submenu a.active { background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; font-weight: 600; }
      #uml-submenu a:hover:not(.active) { background: var(--bg-glass); }
      .statusbar-preset.active { background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; border-color: var(--nav-active-text) !important; }
      .layout-element.selected { border: 2px solid var(--accent) !important; box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.3); }
      .layout-element .resize-handle { background: var(--accent); }
      .inline-shape-btn:hover { border-color: var(--accent) !important; background: var(--nav-active-bg) !important; }
      .layout-palette-dropdown { display: none; position: absolute; top: calc(100% + 8px); right: 0; background: var(--nav-submenu-bg) !important; border: 1px solid var(--nav-submenu-border) !important; border-radius: 8px; padding: 8px; min-width: 200px; box-shadow: var(--shadow); z-index: 1000; animation: fadeIn 0.2s ease; }
      .layout-palette-dropdown.open { display: block; }
      .layout-palette-dropdown .palette-title { color: var(--text-muted); font-size: 0.7rem; font-weight: 700; padding: 4px 8px 8px; margin-bottom: 6px; border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: 0.05em; }
      .palette-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; color: var(--text-dim); font-size: 0.9rem; }
      .palette-item:hover { background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; }
      .palette-item .p-icon { color: var(--accent); display: flex; align-items: center; justify-content: center; }
      .palette-item .palette-icon { width: 18px; height: 18px; }
      .inline-shape-btn { background: var(--bg-glass); border: 1px solid var(--border); color: var(--text-muted); transition: all 0.2s; }
      .inline-shape-btn:hover { color: var(--accent) !important; }
      .project-table th { background: var(--bg-secondary) !important; color: var(--text-dim) !important; border-bottom: 2px solid var(--border) !important; }
      .project-table td { border-bottom: 1px solid var(--border) !important; color: var(--text-dim); background: transparent; }
      .project-table tr:hover:not(:first-child) { background: var(--bg-glass); }
      .project-table tr.is-current { background: var(--nav-active-bg) !important; border-left: 3px solid var(--accent) !important; }
      .project-table tr.is-current td { color: var(--text) !important; }
      .project-table, .project-table-container { background: var(--bg-card) !important; } /* テーブルとコンテナの背景色をテーマに合わせる */
      .my-projects-card .btn-primary { background: var(--accent) !important; color: #fff !important; border: none !important; transition: transform 0.2s; }
      .my-projects-card .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.1); }
      .my-projects-card .btn-secondary { background: var(--bg-glass) !important; color: var(--text-dim) !important; border: 1px solid var(--border) !important; }
      .role-badge { background: var(--nav-active-bg); color: var(--nav-active-text); border: 1px solid var(--nav-submenu-border); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
      .role-badge.role-owner { border-color: var(--accent); color: var(--accent); }
      .project-action-card, .my-projects-card { background: var(--bg-card) !important; border: 1px solid var(--border) !important; }
      .my-projects-card .block-header h2 { color: var(--text) !important; border-left: 4px solid var(--accent); padding-left: 12px; }
      .project-form .form-input { background: var(--bg-secondary) !important; color: var(--text) !important; border: 1px solid var(--border) !important; }
      .project-form .form-input::placeholder { color: var(--text-muted); opacity: 0.6; }
      .section-header h1 { color: var(--accent) !important; }
      code { background: var(--nav-active-bg) !important; color: var(--accent-light) !important; padding: 2px 6px; border-radius: 4px; font-family: monospace; border: 1px solid var(--nav-submenu-border); }
    `;

    // 他のモジュール（DiagramToolなど）がテーマ変更を検知できるようにカスタムイベントを発火
    document.dispatchEvent(new CustomEvent('theme-changed', { detail: { mode: this.currentTheme.mode, theme: this.currentTheme } }));

    // 動的に生成された要素（モーダル内やツールバー等）のインラインスタイルを更新して
    // CSS変数の反映漏れを防ぐ
    const updateDynamicElements = () => {
      try {
        const accentGradient = `linear-gradient(135deg, var(--accent), var(--accent-light))`;
        // Primary buttons (including modal save button)
        document.querySelectorAll('.btn-primary, .btn.btn-primary, button.btn-primary, #btn-save-new').forEach(el => {
          try { el.style.background = accentGradient; el.style.color = 'var(--text)'; el.style.border = 'none'; } catch(e){}
        });
        // Secondary buttons
        document.querySelectorAll('.btn-secondary, button.btn-secondary').forEach(el => {
          try { el.style.background = 'var(--bg-glass)'; el.style.color = 'var(--text)'; el.style.border = '1px solid var(--border)'; } catch(e){}
        });
        // Header icon buttons
        document.querySelectorAll('.editor-header-btn').forEach(el => {
          try { el.style.color = 'var(--text-dim)'; el.style.background = 'transparent'; } catch(e){}
        });
        // Status presets
        document.querySelectorAll('.statusbar-preset').forEach(el => {
          try { el.style.background = 'var(--bg-glass)'; el.style.border = '1px solid var(--border)'; el.style.color = 'var(--text-dim)'; } catch(e){}
        });
      } catch (err) {
        console.error('[ThemeManager] Failed to update dynamic elements styles:', err);
      }
    };

    // Initial update
    updateDynamicElements();

    // Observe DOM additions and reapply styles to newly added dynamic elements
    try {
      if (!window.__themeMutationObserver) {
        const obs = new MutationObserver((mutations) => {
          let needUpdate = false;
          for (const m of mutations) {
            if (m.addedNodes && m.addedNodes.length) {
              for (const n of m.addedNodes) {
                if (!(n instanceof HTMLElement)) continue;
                if (n.matches && (n.matches('.btn-primary') || n.matches('#btn-save-new') || n.querySelector && (n.querySelector('.btn-primary') || n.querySelector('#btn-save-new') || n.querySelector('.editor-header-btn')))) {
                  needUpdate = true; break;
                }
              }
            }
            if (needUpdate) break;
          }
          if (needUpdate) updateDynamicElements();
        });
        obs.observe(document.body, { childList: true, subtree: true });
        window.__themeMutationObserver = obs;
      }
    } catch (err) {
      console.error('[ThemeManager] Failed to install MutationObserver for theme updates:', err);
    }
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

  renderThemeSection(container) {
    if (!container) return;

    const sectionHTML = `
      <div style="background: rgba(255,255,255,0.04); padding: 16px; border-radius: 14px; border: 1px solid var(--border); box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);">
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px;">
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 0.8rem; color: var(--text-dim); font-weight: 500;">メイン背景色</label>
            <input type="color" id="theme-main-bg" style="width: 100%; height: 34px; cursor: pointer; border: 1px solid var(--border); padding: 0; border-radius: 6px; background: var(--bg-secondary);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 0.8rem; color: var(--text-dim); font-weight: 500;">サブ背景色</label>
            <input type="color" id="theme-sub-bg" style="width: 100%; height: 34px; cursor: pointer; border: 1px solid var(--border); padding: 0; border-radius: 6px; background: var(--bg-secondary);">
          </div>
          <div style="grid-column: 1 / -1;">
            <label style="display: block; margin-bottom: 6px; font-size: 0.8rem; color: var(--text-dim); font-weight: 500;">アクセント色</label>
            <input type="color" id="theme-accent-color" style="width: 100%; height: 34px; cursor: pointer; border: 1px solid var(--border); padding: 0; border-radius: 6px; background: var(--bg-secondary);">
          </div>
        </div>

        <div style="padding-top: 12px; border-top: 1px solid var(--border);">
          <label style="display: block; margin-bottom: 8px; font-size: 0.8rem; color: var(--text-dim); font-weight: 500;">プリセットから選ぶ</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="preset-dark" style="flex: 1; min-width: 0; padding: 8px 10px; border-radius: 10px;">黒系</button>
            <button class="btn btn-secondary btn-sm" id="preset-karaage" style="flex: 1; min-width: 0; padding: 8px 10px; border-radius: 10px; color: #b45309; border-color: #fde68a; background: #fef3c7;">唐揚げ</button>
            <button class="btn btn-secondary btn-sm" id="preset-light" style="flex: 1; min-width: 0; padding: 8px 10px; border-radius: 10px; background: white; color: black;">白系</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = sectionHTML;

    const mainBg = document.getElementById('theme-main-bg');
    const subBg = document.getElementById('theme-sub-bg');
    const accentColor = document.getElementById('theme-accent-color');

    if (mainBg) {
      mainBg.addEventListener('input', (e) => {
        this.currentTheme.mainBgColor = e.target.value;
        this.applyTheme();
      });
      mainBg.addEventListener('change', () => this.saveTheme());
    }

    if (subBg) {
      subBg.addEventListener('input', (e) => {
        this.currentTheme.subBgColor = e.target.value;
        this.applyTheme();
      });
      subBg.addEventListener('change', () => this.saveTheme());
    }

    if (accentColor) {
      accentColor.addEventListener('input', (e) => {
        this.currentTheme.accentColor = e.target.value;
        this.applyTheme();
      });
      accentColor.addEventListener('change', () => this.saveTheme());
    }

    document.getElementById('preset-dark')?.addEventListener('click', () => {
      this.currentTheme.mainBgColor = '#0a0e1a';
      this.currentTheme.subBgColor = '#111827';
      this.currentTheme.accentColor = '#7c3aed';
      this.applyTheme();
      localStorage.setItem('upstream_theme', JSON.stringify(this.currentTheme));
      this.updateSection(container);
    });
    
    document.getElementById('preset-karaage')?.addEventListener('click', () => {
      this.currentTheme.mainBgColor = '#fffaf0';
      this.currentTheme.subBgColor = '#ffffff';
      this.currentTheme.accentColor = '#d97706';
      this.applyTheme();
      localStorage.setItem('upstream_theme', JSON.stringify(this.currentTheme));
      this.updateSection(container);
    });

    document.getElementById('preset-light')?.addEventListener('click', () => {
      this.currentTheme.mainBgColor = '#f8fafc';
      this.currentTheme.subBgColor = '#ffffff';
      this.currentTheme.accentColor = '#0ea5e9';
      this.applyTheme();
      localStorage.setItem('upstream_theme', JSON.stringify(this.currentTheme));
      this.updateSection(container);
    });

    this.updateSection(container);
  }

  updateSection(container) {
    if (!container) return;
    
    if (!this.currentTheme.mainBgColor) {
      this.currentTheme.mainBgColor = this.currentTheme.mode === 'light' ? '#f8fafc' : '#0a0e1a';
      this.currentTheme.subBgColor = this.currentTheme.mode === 'light' ? '#ffffff' : '#111827';
    }
    
    const mainBg = document.getElementById('theme-main-bg');
    const subBg = document.getElementById('theme-sub-bg');
    const accentColor = document.getElementById('theme-accent-color');
    
    if (mainBg) mainBg.value = this.currentTheme.mainBgColor;
    if (subBg) subBg.value = this.currentTheme.subBgColor;
    if (accentColor) accentColor.value = this.currentTheme.accentColor;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();

  // data-action="showSettings" のボタンは何もしないようにする（または将来削除する）
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="showSettings"]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      // do nothing
    }
  });
});
