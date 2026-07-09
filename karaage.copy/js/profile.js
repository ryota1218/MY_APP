/**
 * プロフィール管理クラス
 */
class ProfileManager {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="showUserProfile"]')) {
        this.showModal();
      }
      if (e.target.closest('#account-settings-btn')) {
        this.showAccountSettings();
      }
    });
  }

  escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  showModal() {
    const user = Auth.currentUser || { name: 'ゲスト', id: '' };
    const modalContainer = document.getElementById('modal-container');
    
    modalContainer.style.display = 'block';
    modalContainer.innerHTML = `
      <div class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:10000;">
        <div class="modal-content" style="background:var(--bg-card); padding:30px; border-radius:12px; width:100%; max-width:400px; border:1px solid var(--border); color:var(--text);">
          <h2 style="margin-bottom:20px; color:var(--accent);">プロフィール設定</h2>
          <div style="text-align:center; margin-bottom:20px;">
            <div id="modal-avatar-preview" style="width:80px; height:80px; background:var(--bg-secondary); border-radius:50%; margin:0 auto 10px; overflow:hidden; display:flex; align-items:center; justify-content:center; border:2px solid var(--accent);">
              ${user.avatar ? `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover;">` : '<i data-lucide="user" style="width:40px; height:40px;"></i>'}
            </div>
            <input type="file" id="avatar-input" accept="image/*" style="display:none">
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('avatar-input').click()">画像を選択</button>
          </div>
          <div class="form-group">
            <label>表示名</label>
            <input type="text" id="profile-name-input" class="form-input" value="${this.escapeHTML(user.name)}" style="width:100%">
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:20px; margin-bottom:14px; flex-wrap:wrap;">
            <button id="profile-logout-btn" class="btn btn-secondary" style="padding: 8px 14px; width:auto;">ログアウト</button>
            <div style="display:flex; gap:10px; margin-left:auto; flex-wrap:wrap;">
              <button class="btn btn-secondary" onclick="document.getElementById('modal-container').style.display='none'">キャンセル</button>
              <button id="save-profile-btn" class="btn btn-primary">保存する</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    if (window.lucide) lucide.createIcons();

    let tempAvatar = user.avatar || null;
    let selectedFile = null;

    const avatarInput = document.getElementById('avatar-input');
    avatarInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
          tempAvatar = ev.target.result;
          document.getElementById('modal-avatar-preview').innerHTML = `<img src="${tempAvatar}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
      }
    };

    document.getElementById('save-profile-btn').onclick = async () => {
      const newName = document.getElementById('profile-name-input').value.trim();
      if (!newName) return;

      const saveBtn = document.getElementById('save-profile-btn');
      saveBtn.disabled = true;
      saveBtn.textContent = '保存中...';

      try {
        let finalAvatarUrl = tempAvatar;

        if (selectedFile && user.id) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          
          const uploadRes = await fetch('/api/db/upload-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: tempAvatar,
              fileName: fileName,
              mimeType: selectedFile.type
            })
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
          
          finalAvatarUrl = uploadData.publicUrl;
        }

        await this.saveProfile(newName, finalAvatarUrl);
      } catch (err) {
        console.error('[Profile] Profile update/upload failed:', err);
        if (window.showToast) showToast(`保存エラー: ${err.message}`, 'danger');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '保存する';
      }
    };

    const profileLogoutBtn = document.getElementById('profile-logout-btn');
    if (profileLogoutBtn) {
      profileLogoutBtn.onclick = async () => {
        await Auth.logout();
      };
    }
  }

  async showAccountSettings() {
    if (window.Auth?.ready) {
      try {
        await window.Auth.ready;
      } catch (err) {
        console.warn('[Profile] Auth init wait failed:', err);
      }
    }

    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('upstream_user') || 'null');
      } catch (err) {
        return null;
      }
    })();

    const user = Auth.currentUser || storedUser || { name: 'ゲスト', email: '', id: '' };
    if (!user.email) {
      if (window.showToast) showToast('エラー：ユーザー情報が見つかりません');
      return;
    }

    const modalContainer = document.getElementById('modal-container');
    modalContainer.style.display = 'block';
    modalContainer.innerHTML = `
      <div class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:10000;">
        <div class="modal-content" style="background:var(--bg-card); padding:30px; border-radius:12px; width:100%; max-width:400px; border:1px solid var(--border); color:var(--text);">
          <h2 style="margin-bottom:18px; color:var(--accent);">本人確認</h2>
          <p style="margin-bottom:20px; color:var(--text-muted); font-size:0.9rem;">設定を変更するには現在のパスワードを入力してください。</p>
          <div class="form-group">
            <label>現在のパスワード</label>
            <input type="password" id="reauth-password" class="form-input" style="width:100%" placeholder="パスワードを入力">
          </div>
          <div id="reauth-error" style="color:var(--danger); font-size:0.8rem; margin-top:8px; min-height:1.2rem;"></div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button class="btn btn-secondary" onclick="document.getElementById('modal-container').style.display='none'">キャンセル</button>
            <button id="verify-reauth-btn" class="btn btn-primary">認証する</button>
          </div>
        </div>
      </div>
    `;

    // 認証ボタンに対するロジックを追加
    const verifyBtn = document.getElementById('verify-reauth-btn');
    const passwordInput = document.getElementById('reauth-password');
    const errorDiv = document.getElementById('reauth-error');

    // Enterキーで認証ボタンが発火するようにする
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!verifyBtn.disabled) verifyBtn.click();
      }
    });

    // モーダル表示時に入力欄へフォーカス
    passwordInput.focus();

    verifyBtn.onclick = async () => {
      const password = passwordInput.value;
      if (!password) {
        errorDiv.textContent = 'パスワードを入力してください。';
        return;
      }

      verifyBtn.disabled = true;
      verifyBtn.textContent = '認証中...';
      errorDiv.textContent = '';
    this.renderFullAccountSettings(user);
  }

  async renderFullAccountSettings(user) {
    const flyout = document.getElementById('account-settings-flyout');
    const modalContainer = document.getElementById('modal-container');
    if (!flyout) {
      modalContainer.style.display = 'block';
      modalContainer.innerHTML = '<div style="padding:12px; color:var(--text-dim);">アカウント設定を表示できません。</div>';
      return;
    }

    const closeFlyout = () => {
      flyout.style.display = 'none';
      flyout.innerHTML = '';
    };

    flyout.style.display = 'block';
    flyout.innerHTML = `
      <div style="background:var(--bg-card); padding:14px; border-radius:18px; border:1px solid var(--border); color:var(--text); box-sizing:border-box; box-shadow:0 20px 50px rgba(0,0,0,0.35); backdrop-filter: blur(8px); min-width:320px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px;">
          <h2 style="margin:0; color:var(--accent); font-size:1rem;">アカウント設定</h2>
        </div>

        <div style="display:grid; gap:8px;">
          <button type="button" class="account-setting-row" data-panel="account-theme-panel" style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,0.05); color:var(--text); cursor:pointer; text-align:left;">
            <span style="display:flex; align-items:center; gap:10px; font-weight:600;">
              <i data-lucide="palette" style="width:14px; height:14px; color:var(--text-muted);"></i>
              テーマ変更
            </span>
            <span style="color:var(--text-muted); font-size:0.8rem;">開く</span>
          </button>
          <div id="account-theme-panel" style="display:none; padding:10px 12px 12px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,0.03);">
            <div id="account-theme-section"></div>
          </div>

          <button type="button" class="account-setting-row" data-panel="account-security-panel" style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,0.05); color:var(--text); cursor:pointer; text-align:left;">
            <span style="display:flex; align-items:center; gap:10px; font-weight:600;">
              <i data-lucide="shield" style="width:14px; height:14px; color:var(--text-muted);"></i>
              セキュリティ
            </span>
            <span style="color:var(--text-muted); font-size:0.8rem;">開く</span>
          </button>
          <div id="account-security-panel" style="display:none; padding:10px 12px 12px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,0.03); color:var(--text-dim); font-size:0.82rem; line-height:1.6;">
            <div id="account-security-gate">
              <div style="margin-bottom:8px;">本人確認のため、現在のパスワードを入力してください。</div>
              <div style="display:grid; gap:8px; margin-bottom:10px;">
                <div>
                  <label style="display:block; margin-bottom:4px; color:var(--text-muted); font-size:0.75rem;">現在のパスワード</label>
                  <input type="password" id="account-current-password" class="form-input" placeholder="現在のパスワード" style="width:100%; padding:8px 10px; font-size:0.85rem;">
                </div>
              </div>
              <div style="display:flex; gap:8px; justify-content:flex-end; margin-bottom:8px;">
                <button id="verify-security-btn" class="btn btn-primary btn-sm" style="padding:7px 12px;">認証して開く</button>
              </div>
            </div>
            <div id="account-security-content" style="display:none;">
              <div style="margin-bottom:8px;">2段階認証は未設定です。</div>
              <div style="display:grid; gap:8px; margin-bottom:10px;">
                <div>
                  <label style="display:block; margin-bottom:4px; color:var(--text-muted); font-size:0.75rem;">新しいパスワード</label>
                  <input type="password" id="account-password" class="form-input" placeholder="8文字以上" style="width:100%; padding:8px 10px; font-size:0.85rem;">
                </div>
                <div>
                  <label style="display:block; margin-bottom:4px; color:var(--text-muted); font-size:0.75rem;">パスワード再入力</label>
                  <input type="password" id="account-password-confirm" class="form-input" placeholder="再入力" style="width:100%; padding:8px 10px; font-size:0.85rem;">
                </div>
              </div>
              <div style="display:flex; gap:8px; justify-content:flex-end; margin-bottom:10px;">
                <button id="save-account-settings-btn" class="btn btn-primary btn-sm" style="padding:7px 12px;">変更を保存</button>
              </div>
              <a href="#" id="send-security-tips" style="color: var(--accent); text-decoration: underline;">セキュリティのヒントを見る</a>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:10px; margin-top:12px;">
          <span id="account-settings-feedback" style="color:var(--text-muted); font-size:0.8rem; text-align:right;"></span>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    if (window.themeManager) {
      window.themeManager.renderThemeSection(document.getElementById('account-theme-section'));
    }

    const rows = Array.from(flyout.querySelectorAll('.account-setting-row'));
    const panels = Array.from(flyout.querySelectorAll('[id$="-panel"]'));
    const collapseAll = () => {
      panels.forEach((panel) => { panel.style.display = 'none'; });
    };

    rows.forEach((row) => {
      row.addEventListener('click', () => {
        const panelId = row.dataset.panel;
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const isOpen = panel.style.display !== 'none';
        collapseAll();
        panel.style.display = isOpen ? 'none' : 'block';
      });
    });

    const securityGate = document.getElementById('account-security-gate');
    const securityContent = document.getElementById('account-security-content');
    const verifySecurityBtn = document.getElementById('verify-security-btn');
    const currentPasswordInput = document.getElementById('account-current-password');
    let securityVerified = false;

    const closeButtons = [];
    closeButtons.forEach((button) => {
      button.onclick = closeFlyout;
    });

    verifySecurityBtn?.addEventListener('click', async () => {
      const feedback = document.getElementById('account-settings-feedback');
      const currentPassword = currentPasswordInput.value;
      if (!currentPassword) {
        feedback.textContent = '現在のパスワードを入力してください。';
        return;
      }

      verifySecurityBtn.disabled = true;
      verifySecurityBtn.textContent = '認証中...';
      feedback.textContent = '';

      const result = await Auth.signInWithPassword(user.email, currentPassword);
      if (result.error) {
        feedback.textContent = result.error.message || '本人確認に失敗しました。';
        verifySecurityBtn.disabled = false;
        verifySecurityBtn.textContent = '認証して開く';
        return;
      }

      securityVerified = true;
      securityGate.style.display = 'none';
      securityContent.style.display = 'block';
      verifySecurityBtn.disabled = false;
      verifySecurityBtn.textContent = '認証して開く';
      currentPasswordInput.value = '';
      feedback.textContent = '本人確認が完了しました。';
    });

    document.getElementById('save-account-settings-btn').onclick = async () => {
      if (!securityVerified) {
        const feedback = document.getElementById('account-settings-feedback');
        feedback.textContent = '先に本人確認を完了してください。';
        return;
      }

      const password = document.getElementById('account-password').value;
      const passwordConfirm = document.getElementById('account-password-confirm').value;
      const feedback = document.getElementById('account-settings-feedback');
      feedback.textContent = '';
      if (!password || !passwordConfirm) {
        feedback.textContent = '新しいパスワードを入力してください。';
        return;
      }
      if (password !== passwordConfirm) {
        feedback.textContent = 'パスワードが一致しません。';
        return;
      }

      if (password.length < 8) {
        feedback.textContent = 'パスワードは8文字以上で入力してください。';
        return;
      }

      feedback.textContent = '更新中...';
      const result = await Auth.updatePassword(password);
      if (result.error) {
        feedback.textContent = result.error.message || 'パスワードの更新に失敗しました。';
        return;
      }

      document.getElementById('account-password').value = '';
      document.getElementById('account-password-confirm').value = '';
      feedback.textContent = 'パスワードを更新しました。';
    };

    document.addEventListener('click', function handleOutsideClick(e) {
      if (!flyout.contains(e.target) && !e.target.closest('#account-settings-btn')) {
        closeFlyout();
        document.removeEventListener('click', handleOutsideClick, true);
      }
    }, true);
  }

  async saveProfile(name, avatar) {
    if (!Auth.currentUser) {
      if (window.showToast) showToast('ログインしていません', 'warning');
      return;
    }
    
    try {
      const res = await fetch('/api/db/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, icon: avatar })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.error || 'Failed to update profile');
      }
    } catch (dbErr) {
      console.error('[ProfileManager] DBのプロフィール更新に失敗しました:', dbErr);
      throw new Error(`データベース保存に失敗しました: ${dbErr.message}`);
    }

    Auth.currentUser.name = name;
    Auth.currentUser.avatar = avatar;
    
    localStorage.setItem('upstream_user', JSON.stringify(Auth.currentUser));
    Auth.updateUI();
    
    document.getElementById('modal-container').style.display = 'none';
    if (window.showToast) showToast('プロフィールを更新しました');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = window.app || {};
  window.app.profile = new ProfileManager();
});