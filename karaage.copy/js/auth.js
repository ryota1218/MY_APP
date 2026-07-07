/**
 * Supabase 認証管理モジュール
 */
const Auth = {
  currentUser: null,

  async init() {
    let sessionUser = null;
    let sessionProfile = null;

    try {
      // Node.js API からセッション（ログイン状態）を取得
      const res = await fetch('/api/auth?action=session');
      if (res.ok) {
        const data = await res.json();
        sessionUser = data.user;
        sessionProfile = data.profile;
      }
    } catch (e) {
      console.warn('Session check failed', e);
    }
    
    if (sessionUser) {
      this.currentUser = {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionProfile?.name || sessionUser.email.split('@')[0],
        avatar: sessionProfile?.icon || null
      };

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('upstream_user', JSON.stringify(this.currentUser));
      
      if (window.location.pathname.includes('login.html')) {
        window.location.href = '../index.html?tool=project';
      }
    } else {
      this.currentUser = null;
      localStorage.removeItem('isLoggedIn');
      
      const isMainPage = window.location.pathname.endsWith('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/');
      if (isMainPage) {
        window.location.href = 'html/login.html' + window.location.search;
      }
    }

    window.Auth = this;

    this.updateUI();

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'login-form') {
        e.preventDefault();
        this.handleLogin();
      } else if (e.target.id === 'register-form') {
        e.preventDefault();
        this.handleRegister();
      }
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#auth-action-btn');
      if (btn && this.currentUser) {
        this.logout();
      }
    });
  },

  async handleLogin() {
    const email = document.getElementById('username').value.trim().toLowerCase();
    const pass = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    const lockout = this.isLoginLockedOut(email);
    if (lockout.locked) {
      errorEl.textContent = `ログイン試行回数が上限に達しました。あと ${this.formatLockoutTime(lockout.remaining)} で再試行できます。`;
      errorEl.style.color = '#ef4444';
      return;
    }

    errorEl.textContent = 'ログイン中...';
    errorEl.style.color = '#8b5cf6';

    let data, error;
    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const resData = await res.json();
      if (!res.ok) {
        error = { message: resData.error || 'Login failed' };
      } else {
        data = resData;
      }
    } catch (e) {
      error = { message: e.message };
    }

    if (error) {
      console.error('Login error:', error.message);
      this.recordLoginAttempt(email, false);
      const attemptsLeft = Math.max(0, 5 - this.getLoginAttempts(email));
      errorEl.style.color = '#ef4444';
      if (attemptsLeft === 0) {
        errorEl.textContent = 'ログイン試行回数が上限に達しました。5分後に再試行してください。';
      } else {
        errorEl.textContent = `ログインに失敗しました。残り ${attemptsLeft} 回です。`;
      }
      return;
    }
    
    this.clearLoginAttempts(email);
    // ログイン成功
    this.currentUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.profile?.name || data.user.email.split('@')[0],
      avatar: data.profile?.icon || null
    };
    // ログインイベントを記録
    if (typeof this.recordLoginEvent === 'function') {
      this.recordLoginEvent(data.user.id, data.user.email);
    }
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('upstream_user', JSON.stringify(this.currentUser));
    this.updateUI();
    if (window.location.pathname.includes('login.html')) {
      window.location.href = '../index.html?tool=project';
    } else {
      errorEl.textContent = 'ログイン成功！';
      
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

    const strength = this.getPasswordStrength(pass);
    if (!email || !pass || strength.score < 3) {
      errorEl.textContent = 'パスワードは8文字以上で、英大小文字・数字・記号を含めると安全です。';
      return;
    }

    errorEl.textContent = 'アカウント作成中...';
    errorEl.style.color = '#8b5cf6';

    let data, error;
    try {
      const res = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const resData = await res.json();
      if (!res.ok) {
        error = { message: resData.error || 'Registration failed' };
      } else {
        data = resData;
      }
    } catch (e) {
      error = { message: e.message };
    }

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

    if (data?.user) {
      try {
        await fetch('/api/db/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: email.split('@')[0] })
        });
      } catch (dbError) {
        console.warn('Profile creation failed via API:', dbError);
      }
    }

    alert('アカウント作成が完了しました！');
    document.getElementById('show-login').click();
  },

  async logout() {
    try {
      await fetch('/api/auth?action=logout', { method: 'POST' });
    } catch(e) {
      console.warn("Logout error", e);
    }
    this.currentUser = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('upstream_user');
    this.updateUI();
    location.reload();
  },

  getPasswordStrength(password) {
    if (!password || password.length === 0) {
      return { score: 0, label: 'なし' };
    }
    const result = { score: 0, label: '弱い' };
    if (password.length >= 8) result.score += 1;
    if (/[A-Z]/.test(password)) result.score += 1;
    if (/[a-z]/.test(password)) result.score += 1;
    if (/[0-9]/.test(password)) result.score += 1;
    if (/[^A-Za-z0-9]/.test(password)) result.score += 1;
    const labels = ['弱い', 'やや弱い', '普通', '強い', 'とても強い'];
    if (result.score <= 0) {
      result.label = 'なし';
    } else {
      result.label = labels[Math.min(result.score - 1, labels.length - 1)];
    }
    return result;
  },

  // ★ 修正箇所: 本人確認モーダルから呼び出される再認証メソッドを新設
  async signInWithPassword(email, password) {
    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const resData = await res.json();
      
      if (!res.ok) {
        return { error: { message: resData.error || 'パスワードが正しくありません。' } };
      }
      return { data: resData, error: null };
    } catch (e) {
      return { error: { message: e.message } };
    }
  },

  async updatePassword(newPassword) {
    if (!this.currentUser) {
      return { error: { message: 'ログインしてください。' } };
    }

    try {
      const res = await fetch('/api/auth?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const resData = await res.json();
      if (!res.ok) return { error: { message: resData.error || 'Password update failed' } };
      return { data: resData, error: null };
    } catch (e) {
      return { error: { message: e.message } };
    }
  },

  getLoginAttemptState(email) {
    const normalized = String(email || '').trim().toLowerCase();
    const key = `login_attempts_${encodeURIComponent(normalized)}`;
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  },

  setLoginAttemptState(email, state) {
    const normalized = String(email || '').trim().toLowerCase();
    const key = `login_attempts_${encodeURIComponent(normalized)}`;
    localStorage.setItem(key, JSON.stringify(state));
  },

  clearLoginAttempts(email) {
    const normalized = String(email || '').trim().toLowerCase();
    const key = `login_attempts_${encodeURIComponent(normalized)}`;
    localStorage.removeItem(key);
  },

  getLoginAttempts(email) {
    const state = this.getLoginAttemptState(email);
    return state.count || 0;
  },

  isLoginLockedOut(email) {
    const state = this.getLoginAttemptState(email);
    const now = Date.now();
    if (state.lockoutUntil && now < state.lockoutUntil) {
      return { locked: true, remaining: Math.ceil((state.lockoutUntil - now) / 1000) };
    }
    return { locked: false, remaining: 0 };
  },

  formatLockoutTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    }
    return `${secs}秒`;
  },

  recordLoginAttempt(email, success) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return;
    if (success) {
      this.clearLoginAttempts(normalized);
      return;
    }

    const state = this.getLoginAttemptState(normalized);
    state.count = (state.count || 0) + 1;
    if (state.count >= 5) {
      state.lockoutUntil = Date.now() + 5 * 60 * 1000;
    }
    this.setLoginAttemptState(normalized, state);
  },

  async updateEmail(newEmail) {
    if (!this.currentUser) {
      return { error: { message: 'ログインしてください。' } };
    }
    if (!newEmail || !newEmail.includes('@')) {
      return { error: { message: '有効なメールアドレスを入力してください。' } };
    }

    try {
      const res = await fetch('/api/auth?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      const resData = await res.json();
      if (!res.ok) return { error: { message: resData.error || 'Email update failed' } };
      
      this.currentUser.email = newEmail;
      this.currentUser.name = newEmail.split('@')[0];
      return { data: resData, error: null };
    } catch (e) {
      return { error: { message: e.message } };
    }
  },

  async deleteAccount() {
    if (!this.currentUser) {
      return { error: { message: 'ログインしてください。' } };
    }
    try {
      const res = await fetch('/api/auth?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteUser: true })
      });
      if (res.ok) {
        this.currentUser = null;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('upstream_user');
        return { data: await res.json(), error: null };
      }
      return { error: { message: 'サーバーでのアカウント削除に失敗しました。' } };
    } catch (e) {
      return { error: { message: e.message } };
    }
  },

  recordLoginEvent(userId, email) {
    try {
      const historyKey = `login_history_${userId}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.unshift({
        date: new Date().toISOString(),
        email,
        userAgent: navigator.userAgent,
      });
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 20)));
    } catch (err) {
      console.warn('Login history save failed:', err);
    }
  },

  getLoginHistory(userId) {
    try {
      const historyKey = `login_history_${userId}`;
      return JSON.parse(localStorage.getItem(historyKey) || '[]');
    } catch (err) {
      return [];
    }
  },

  updateUI() {
    const nameDisplay = document.getElementById('display-user-name');
    const dashNameDisplay = document.getElementById('dashboard-user-name');
    const authBtn = document.getElementById('auth-action-btn');

    if (this.currentUser) {
      if (nameDisplay) nameDisplay.textContent = this.currentUser.name;
      if (dashNameDisplay) dashNameDisplay.textContent = this.currentUser.name;
      if (authBtn) {
        authBtn.style.display = 'none';
        authBtn.removeAttribute('data-tool');
      }
      const avatarEl = document.getElementById('user-avatar-display');
      if (avatarEl && this.currentUser.avatar) {
        avatarEl.innerHTML = `<img src="${this.currentUser.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      }
    } else {
      if (nameDisplay) nameDisplay.textContent = 'ゲスト';
      if (dashNameDisplay) dashNameDisplay.textContent = 'ゲスト';
      if (authBtn) {
        authBtn.style.display = '';
        authBtn.textContent = 'ログイン';
        authBtn.setAttribute('data-tool', 'login');
      }
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());