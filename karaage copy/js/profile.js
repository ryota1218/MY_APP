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
      <div class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:10000;">
        <div class="modal-content" style="background:#1e1e1e; padding:30px; border-radius:12px; width:100%; max-width:400px; border:1px solid #333;">
          <h2 style="margin-bottom:20px; color:var(--accent);">プロフィール設定</h2>
          <div style="text-align:center; margin-bottom:20px;">
            <div id="modal-avatar-preview" style="width:80px; height:80px; background:#333; border-radius:50%; margin:0 auto 10px; overflow:hidden; display:flex; align-items:center; justify-content:center; border:2px solid var(--accent);">
              ${user.avatar ? `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover;">` : '<i data-lucide="user" style="width:40px; height:40px;"></i>'}
            </div>
            <input type="file" id="avatar-input" accept="image/*" style="display:none">
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('avatar-input').click()">画像を選択</button>
          </div>
          <div class="form-group">
            <label>表示名</label>
            <input type="text" id="profile-name-input" class="form-input" value="${this.escapeHTML(user.name)}" style="width:100%">
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button class="btn btn-secondary" onclick="document.getElementById('modal-container').style.display='none'">キャンセル</button>
            <button id="save-profile-btn" class="btn btn-primary">保存する</button>
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

        // 画像ファイルが新しく選択されていたら、Supabase Storage にアップロードする
        if (selectedFile && window.supabaseClient && user.id) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${user.id}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
            .from('avatars')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) throw uploadError;

          // 公開URLを取得
          const { data: { publicUrl } } = window.supabaseClient.storage
            .from('avatars')
            .getPublicUrl(filePath);

          finalAvatarUrl = publicUrl;
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
  }
  // 競合相手の新規メソッドを追加
  async showAccountSettings() {
    const user = Auth.currentUser || { name: 'ゲスト', email: '', id: '' };
    if (!user.email) {
      if (window.showToast) showToast('エラー：ユーザー情報が見つかりません');
      return;
    }

    const modalContainer = document.getElementById('modal-container');
    modalContainer.style.display = 'block';
    modalContainer.innerHTML = `
      <!-- 本人確認モーダルHTML... -->
    `;
    // (中略 - メソッド内のコードは全てそのまま残します)
  }

  async renderFullAccountSettings(user) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.style.display = 'block';
    modalContainer.innerHTML = `
      <!-- アカウント設定モーダルHTML... -->
    `;
    // (中略 - メソッド内のコードは全てそのまま残します)
  }

  // アバター画像をアップロードしてDB保存するメソッド（今回作成したもの）
  async saveProfile(name, avatar) {
    if (!Auth.currentUser) {
      if (window.showToast) showToast('ログインしていません', 'warning');
      return;
    }
    
    // Supabaseの public.users テーブルを更新
    if (window.supabaseClient) {
      try {
        const { error } = await window.supabaseClient
          .from('users')
          .upsert({
            id: Auth.currentUser.id,
            name: name,
            icon: avatar,
            update_at: new Date().toISOString()
          });

        if (error) throw error;
      } catch (dbErr) {
        console.error('[ProfileManager] DBのプロフィール更新に失敗しました:', dbErr);
        throw new Error(`データベース保存に失敗しました: ${dbErr.message}`);
      }
    }

    Auth.currentUser.name = name;
    Auth.currentUser.avatar = avatar;
    
    localStorage.setItem('upstream_user', JSON.stringify(Auth.currentUser));
    Auth.updateUI();
    
    document.getElementById('modal-container').style.display = 'none';
    if (window.showToast) showToast('プロフィールを更新しました');
  }

    if (!Auth.currentUser) {
      if (window.showToast) showToast('ログインしていません', 'warning');
      return;
    }
    
    // Supabaseの public.users テーブルを更新
    if (window.supabaseClient) {
      try {
        const { error } = await window.supabaseClient
          .from('users')
          .upsert({
            id: Auth.currentUser.id,
            name: name,
            icon: avatar,
            update_at: new Date().toISOString()
          });

        if (error) throw error;
      } catch (dbErr) {
        console.error('[ProfileManager] DBのプロフィール更新に失敗しました:', dbErr);
        throw new Error(`データベース保存に失敗しました: ${dbErr.message}`);
      }
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