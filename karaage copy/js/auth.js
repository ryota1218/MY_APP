/**
 * 擬似ログイン管理モジュール
 */
const Auth = {
  currentUser: null,

  init() {
    // 他のスクリプトからアクセスできるようにグローバルに公開
    window.Auth = this;

    // 保存されたユーザー情報を復元
    const savedUser = localStorage.getItem('upstream_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }

    this.updateUI();

    // イベント委譲でログインフォームの送信をキャッチ
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'login-form') {
        e.preventDefault();
        this.handleLogin();
      } else if (e.target.id === 'register-form') {
        e.preventDefault();
        this.handleRegister();
      }
    });

    // ログアウトボタンの処理
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#auth-action-btn');
      if (btn && this.currentUser) {
        this.logout();
      }
    });
  },

  handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    // 登録済みユーザーリストをlocalStorageから取得してチェック
    const users = JSON.parse(localStorage.getItem('upstream_registered_users') || '[]');
    const registeredUser = users.find(u => u.email === user && u.password === pass);
    
    console.log('Login attempt:', user); // デバッグ用

    // 擬似的な認証チェック
    if ((user === 'admin@example.com' && pass === 'password') || registeredUser) {
      console.log('Login success');
      this.currentUser = registeredUser ? 
        { name: registeredUser.email.split('@')[0], id: registeredUser.email } : 
        { name: '管理者ユーザー', id: 'admin@example.com' };
      localStorage.setItem('upstream_user', JSON.stringify(this.currentUser));

      // index.html の認証ガード用フラグをセット
      localStorage.setItem('isLoggedIn', 'true');
      
      // 先にUIを更新
      this.updateUI();
      
      // 少し遅延させて確実に遷移させる（DOM更新の競合回避）
      setTimeout(() => {
        if (window.app && typeof window.app.navigateTo === 'function') {
          window.app.navigateTo('dashboard');
        } else {
          // login.html から直接ログインした場合はトップページへ遷移
          window.location.href = '../index.html';
        }
      }, 100);
    } else {
      errorEl.textContent = 'ユーザー名またはパスワードが正しくありません。';
    }
  },

  handleRegister() {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('register-error');

    // 簡易バリデーション
    if (!email || !pass || pass.length < 4) {
      errorEl.textContent = '有効なメールアドレスと4文字以上のパスワードを入力してください。';
      return;
    }

    // 既存ユーザーの重複チェック
    const users = JSON.parse(localStorage.getItem('upstream_registered_users') || '[]');
    
    if (email === 'admin@example.com' || users.find(u => u.email === email)) {
      errorEl.textContent = 'このメールアドレスは既に登録されています。';
      return;
    }

    // ユーザー追加（JSON形式で配列に保存）
    users.push({ email: email, password: pass });
    localStorage.setItem('upstream_registered_users', JSON.stringify(users));

    alert('登録が完了しました。ログイン画面からログインしてください。');
    // ログインフォームへ自動切り替え
    document.getElementById('show-login').click();
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('upstream_user');
    this.updateUI();
    location.reload(); // 状態をクリアするためリロード
  },

  updateUI() {
    const nameDisplay = document.getElementById('display-user-name');
    const dashNameDisplay = document.getElementById('dashboard-user-name');
    const authBtn = document.getElementById('auth-action-btn');

    if (this.currentUser) {
      // ログイン中
      if (nameDisplay) nameDisplay.textContent = this.currentUser.name;
      if (dashNameDisplay) dashNameDisplay.textContent = this.currentUser.name;
      if (authBtn) {
        authBtn.textContent = 'ログアウト';
        authBtn.removeAttribute('data-tool'); 
      }
      // アバターの反映（存在する場合）
      const avatarEl = document.getElementById('user-avatar-display');
      if (avatarEl && this.currentUser.avatar) {
        avatarEl.innerHTML = `<img src="${this.currentUser.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      }
    } else {
      // ログアウト/ゲスト状態
      if (nameDisplay) nameDisplay.textContent = 'ゲスト';
      if (dashNameDisplay) dashNameDisplay.textContent = 'ゲスト';
      if (authBtn) {
        authBtn.textContent = 'ログイン';
        authBtn.setAttribute('data-tool', 'login');
      }
    }

    // アイコンを再描画
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());