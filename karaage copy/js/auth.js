/**
 * Supabase 認証管理モジュール
 */
const Auth = {
  currentUser: null,

  async init() {
    // Supabaseから現在のセッション（ログイン状態）を取得
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (session) {
      this.currentUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.email.split('@')[0]
      };
      localStorage.setItem('isLoggedIn', 'true');
      
      // ログイン画面にいる場合はプロジェクト選択を促すためにプロジェクト管理画面へリダイレクト
      if (window.location.pathname.includes('login.html')) {
        window.location.href = '../index.html?tool=project';
      }
    } else {
      this.currentUser = null;
      localStorage.removeItem('isLoggedIn');
      
      // メイン画面（index.html または ルートパス）にいてセッションが無い場合はログイン画面へリダイレクト
      const isMainPage = window.location.pathname.endsWith('index.html') || 
                         window.location.pathname === '/' || 
                         window.location.pathname.endsWith('/');
      if (isMainPage) {
        window.location.href = 'html/login.html' + window.location.search;
      }
    }

    // グローバルに公開
    window.Auth = this;

    this.updateUI();

    // イベント委譲でフォーム送信をキャッチ
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

    // Supabaseの認証状態の変更を監視（別タブでログアウトした場合など）
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        localStorage.removeItem('isLoggedIn');
        this.updateUI();
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
          window.location.href = 'html/login.html';
        }
      }
    });
  },

  async handleLogin() {
    const email = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    errorEl.textContent = 'ログイン中...';
    errorEl.style.color = '#8b5cf6';

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error) {
      console.error('Login error:', error.message);
      errorEl.style.color = '#ef4444';
      errorEl.textContent = 'ログインに失敗しました。メールアドレスかパスワードが間違っています。';
      return;
    }

    // ログイン成功
    this.currentUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.email.split('@')[0]
    };
    
    localStorage.setItem('isLoggedIn', 'true');
    this.updateUI();

    // ログイン画面にいる場合はプロジェクト管理画面へ（新規プロジェクトの選択・作成を促すため）
    if (window.location.pathname.includes('login.html')) {
      window.location.href = '../index.html?tool=project';
    } else {
      errorEl.textContent = 'ログイン成功！';
      
      // 画面の切り替えやリロードを少し遅延させて実行
      setTimeout(() => {
        if (window.app) {
          window.app.navigateTo('project');
        } else {
          location.reload();
        }
      }, 500);
    }
  },


  async handleRegister() {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('register-error');

    if (!email || !pass || pass.length < 6) {
      errorEl.textContent = '有効なメールアドレスと6文字以上のパスワードを入力してください。';
      return;
    }

    errorEl.textContent = 'アカウント作成中...';
    errorEl.style.color = '#8b5cf6';

    const { data, error } = await window.supabaseClient.auth.signUp({
      email: email,
      password: pass,
    });

    if (error) {
      console.error('Register error:', error.message);
      errorEl.style.color = '#ef4444';
      if (error.message.includes('already registered')) {
        errorEl.textContent = 'このメールアドレスは既に登録されています。';
      } else {
        errorEl.textContent = '登録エラー: ' + error.message;
      }
      return;
    }

    // 登録成功（メール確認が必要ない設定の場合、そのままログイン状態になることが多い）
    // DBの public.users にもレコードを作っておく
    if (data?.user) {
      const { error: dbError } = await window.supabaseClient
        .from('users')
        .insert([
          { id: data.user.id, name: email.split('@')[0] }
        ]);
        
      if (dbError) {
        console.warn('Profile creation failed:', dbError);
      }
    }

    alert('アカウント作成が完了しました！');
    
    // 自動的にログインフォームへ切り替える
    document.getElementById('show-login').click();
  },

  async logout() {
    await window.supabaseClient.auth.signOut();
    this.currentUser = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('upstream_user');
    this.updateUI();
    location.reload();
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
      // ログアウト状態
      if (nameDisplay) nameDisplay.textContent = 'ゲスト';
      if (dashNameDisplay) dashNameDisplay.textContent = 'ゲスト';
      if (authBtn) {
        authBtn.textContent = 'ログイン';
        authBtn.setAttribute('data-tool', 'login');
      }
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());