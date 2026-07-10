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

  // ★ 修正箇所: 本人確認モーダルのボタン処理を追加
  async showAccountSettings() {
    const user = Auth.currentUser || { name: 'ゲスト', email: '', id: '' };
    if (!user.email) {
      if (window.showToast) showToast('エラー：ユーザー情報が見つかりません');
      return;
    }

    this.renderFullAccountSettings(user);
  }


      try {
        // 他のメソッドで Auth クラスが利用されているため、
        // SupabaseやカスタムAuthの再認証（ログイン確認）メソッドを呼び出します。
        // ※プロジェクトのAuth仕様に合わせて、適切なメソッド（signInWithPassword等）に変更してください。
        const result = await Auth.signInWithPassword(user.email, password);

        if (result && result.error) {
          throw new Error(result.error.message || 'パスワードが正しくありません。');
        }

        // 認証に成功したら、本来のアカウント設定画面へ遷移
        if (window.showToast) showToast('本人確認が完了しました');
        this.renderFullAccountSettings(user);

      } catch (err) {
        console.error('[Profile] Re-authentication failed:', err);
        errorDiv.textContent = err.message || '認証に失敗しました。';
        verifyBtn.disabled = false;
        verifyBtn.textContent = '認証する';
      }
    };
  }

  async renderFullAccountSettings(user) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.style.display = 'block';
    modalContainer.innerHTML = `
      <div class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:10000;">
        <div class="modal-content" style="background:var(--bg-card); padding:20px; border-radius:12px; width:min(100%,520px); max-width:520px; max-height:88vh; overflow-y:auto; border:1px solid var(--border); color:var(--text); box-sizing:border-box;">
          <h2 style="margin-bottom:18px; color:var(--accent);">アカウント設定</h2>
          <div style="display:grid; gap:14px; margin-bottom:18px;">
            <div class="form-group">
              <label>現在のメールアドレス</label>
              <input type="text" class="form-input" value="${this.escapeHTML(user.email || '')}" disabled>
            </div>
            <div class="form-group">
              <label>新しいメールアドレス</label>
              <input type="email" id="account-email" class="form-input" value="${this.escapeHTML(user.email || '')}" placeholder="example@domain.com">
            </div>
            <div class="form-group">
              <label>新しいパスワード</label>
              <input type="password" id="account-password" class="form-input" placeholder="6文字以上">
              <div class="password-strength" style="margin-top:8px; font-size:0.85rem; color:var(--text-dim); display:flex; align-items:center; gap:8px;">
                <span>強度: <strong id="account-password-strength-label">なし</strong></span>
                <div class="password-strength-bar" style="flex:1; height:8px; border-radius:999px; background:rgba(148,163,184,0.16); overflow:hidden;">
                  <div id="account-password-strength-fill" class="password-strength-fill" style="height:100%; width:0%; border-radius:999px; background:transparent; transition: width 0.2s ease, background 0.2s ease;"></div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>パスワード再入力</label>
              <input type="password" id="account-password-confirm" class="form-input" placeholder="再入力">
            </div>
            <div class="form-group">
              <label>テーマ設定</label>
              <div id="account-theme-section"></div>
            </div>
            <div class="form-group">
              <label>セキュリティ</label>
              <div style="padding: 12px; background: var(--bg-glass); border-radius: 8px; color: var(--text-dim);">
                <p style="margin:0 0 8px;">2段階認証は未設定です。セキュリティを強化したい場合は外部認証サービスと連携してください。</p>
                <a href="#" id="send-security-tips" style="color: var(--accent); text-decoration: underline;">セキュリティのヒントを見る</a>
              </div>
            </div>
            <div class="form-group">
              <label>ログイン履歴</label>
              <div id="account-login-history" style="max-height: 180px; overflow:auto; background: var(--bg-glass); border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: var(--text-dim); font-size: 0.9rem;"></div>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:18px; margin-bottom:12px; flex-wrap:wrap;">
            <button id="account-delete-btn" class="btn btn-danger btn-sm" style="padding: 8px 14px; width:auto;">アカウントを削除</button>
            <div style="display:flex; gap:10px; margin-left:auto; flex-wrap:wrap;">
              <button class="btn btn-secondary" onclick="document.getElementById('modal-container').style.display='none'">閉じる</button>
              <button id="save-account-settings-btn" class="btn btn-primary">変更を保存</button>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
            <span id="account-settings-feedback" style="color:var(--text-muted); font-size:0.9rem;"></span>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    if (window.themeManager) {
      window.themeManager.renderThemeSection(document.getElementById('account-theme-section'));
    }

    const renderHistory = () => {
      const historyContainer = document.getElementById('account-login-history');
      if (!historyContainer) return;
      const history = Auth.getLoginHistory(user.id);
      if (!history.length) {
        historyContainer.innerHTML = '<div>ログイン履歴はありません。</div>';
        return;
      }
      historyContainer.innerHTML = history.slice(0, 10).map(item => {
        const date = new Date(item.date);
        const label = date.toLocaleString('ja-JP', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
        return `<div style="margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
          <div style="font-weight:600;">${this.escapeHTML(label)}</div>
          <div style="font-size:0.82rem; color:var(--text-muted);">${this.escapeHTML(item.email)} ・ ${this.escapeHTML(item.userAgent.substring(0, 60))}…</div>
        </div>`;
      }).join('');
    };

    const updateAccountPasswordStrength = () => {
      const password = document.getElementById('account-password');
      const label = document.getElementById('account-password-strength-label');
      const fill = document.getElementById('account-password-strength-fill');
      if (!password || !label || !fill) return;

      const strength = Auth.getPasswordStrength(password.value || '');
      const colors = ['var(--danger)', '#f59e0b', '#eab308', '#22c55e', 'var(--accent)'];
      const score = Math.max(0, Math.min(strength.score, 5));
      const index = score > 0 ? Math.min(score - 1, colors.length - 1) : 0;
      label.textContent = strength.label;
      label.style.color = score === 0 ? 'var(--text-dim)' : colors[index];
      fill.style.width = score === 0 ? '0%' : `${(score / 5) * 100}%`;
      fill.style.background = score === 0 ? 'transparent' : colors[index];
    };

    document.getElementById('account-password').addEventListener('input', updateAccountPasswordStrength);
    updateAccountPasswordStrength();

    renderHistory();

    const saveBtn = document.getElementById('save-account-settings-btn');

    // Enterキー押下で変更を保存ボタンをクリックする処理
    const handleEnterToSave = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveBtn.click();
      }
    };
    document.getElementById('account-email').addEventListener('keydown', handleEnterToSave);
    document.getElementById('account-password').addEventListener('keydown', handleEnterToSave);
    document.getElementById('account-password-confirm').addEventListener('keydown', handleEnterToSave);

    saveBtn.onclick = async () => {
      const newEmail = document.getElementById('account-email').value.trim();
      const password = document.getElementById('account-password').value;
      const passwordConfirm = document.getElementById('account-password-confirm').value;
      const feedback = document.getElementById('account-settings-feedback');
      feedback.textContent = '';
      let updated = false;

      if (newEmail && newEmail !== user.email) {
        const emailResult = await Auth.updateEmail(newEmail);
        if (emailResult.error) {
          feedback.textContent = emailResult.error.message || 'メールアドレスの更新に失敗しました。';
          return;
        }
        user.email = newEmail;
        updated = true;
        feedback.textContent = 'メールアドレスを更新しました。';
        renderHistory();
      }

      if (password || passwordConfirm) {
        if (password !== passwordConfirm) {
          feedback.textContent = 'パスワードが一致しません。';
          return;
        }
        if (password.length < 6) {
          feedback.textContent = 'パスワードは8文字以上で入力してください。';
          return;
        }

        const passResult = await Auth.updatePassword(password);
        if (passResult.error) {
          feedback.textContent = passResult.error.message || 'パスワードの更新に失敗しました。';
          return;
        }
        updated = true;
        feedback.textContent = 'パスワードを更新しました。';
        document.getElementById('account-password').value = '';
        document.getElementById('account-password-confirm').value = '';
      }

      if (!updated) {
        feedback.textContent = '変更がありませんでした。';
      }
    };

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