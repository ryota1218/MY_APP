/**
 * プロジェクト管理ツール (本番 UUID スキーマ対応版)
 */
class ProjectTool {
  constructor() {
    this.init();
  }

  init() {
    // フォーム送信イベントハンドラの設定
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'create-project-form') {
        e.preventDefault();
        this.handleCreateProject();
      } else if (e.target.id === 'join-project-form') {
        e.preventDefault();
        this.handleJoinProject();
      }
    });

    // 更新ボタンのイベントハンドラ設定
    document.addEventListener('click', (e) => {
      if (e.target.closest('#refresh-projects-btn')) {
        this.refreshProjects();
      }
    });

    // 初回読み込み
    this.refreshProjects();
  }

  /**
   * プロジェクトリストを再読み込みして描画
   */
  async refreshProjects() {
    const listContainer = document.getElementById('my-projects-list');
    if (!listContainer) return;

    listContainer.innerHTML = `
      <tr>
        <td colspan="6" class="text-center" style="color: var(--text-muted); padding: 20px;">
          プロジェクトを読み込み中...
        </td>
      </tr>
    `;

    try {
      // 現在のユーザー情報を取得
      const user = window.Auth?.currentUser;
      if (!user) {
        throw new Error('ユーザーが認証されていません。');
      }

      // Node.js API を経由して所属プロジェクト一覧を取得
      const res = await fetch('/api/db/project-members');
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch projects');
      const memberships = resData.memberships;

      if (!memberships || memberships.length === 0) {
        listContainer.innerHTML = `
          <tr>
            <td colspan="6" class="text-center" style="color: var(--text-muted); padding: 30px;">
              所属しているプロジェクトはありません。上のフォームから作成または参加してください。
            </td>
          </tr>
        `;
        return;
      }

      // 表示用にマッピングしてソート
      const projectList = memberships
        .filter(m => m.projects) // 紐づくプロジェクトが存在するもののみ
        .map(m => ({
          role: m.role,
          joinedAt: m.joined_at,
          id: m.projects.id,
          name: m.projects.name,
          accountId: m.projects.account_id
        }));

      if (projectList.length === 0) {
        listContainer.innerHTML = `
          <tr>
            <td colspan="6" class="text-center" style="color: var(--text-muted); padding: 30px;">
              所属しているプロジェクトはありません。上のフォームから作成または参加してください。
            </td>
          </tr>
        `;
        return;
      }

      listContainer.innerHTML = projectList.map(p => {
        const formattedDate = p.joinedAt ? new Date(p.joinedAt).toLocaleDateString('ja-JP') : '-';
        const isCurrent = localStorage.getItem('current_project_id') === p.id;
        const displayId = p.id.split('-')[0] + '...'; // 短縮表示用
        
        return `
          <tr class="${isCurrent ? 'is-current' : ''}">
            <td><code title="${p.id}">${displayId}</code></td>
            <td><strong style="color: var(--text);">${this.escapeHTML(p.name)}</strong> ${isCurrent ? '<span style="color: var(--accent); font-size: 0.75rem; margin-left: 6px; font-weight: 600;">● 選択中</span>' : ''}</td>
            <td style="color: var(--text-dim); font-size: 0.8rem;">
              オーナー: ${this.escapeHTML(p.accountId.split('-')[0])}...
            </td>
            <td><span class="role-badge role-${p.role.toLowerCase()}">${this.getRoleLabel(p.role)}</span></td>
            <td>${formattedDate}</td>
            <td>
              ${isCurrent ? `
                <button class="btn btn-sm btn-secondary btn-icon-only" disabled>
                  選択済み
                </button>
              ` : `
                <button class="btn btn-sm btn-primary btn-icon-only" onclick="window.app.project.selectProject('${p.id}', '${this.escapeHTML(p.name)}')">
                  切り替え
                </button>
              `}
              <button class="btn btn-sm btn-secondary btn-icon-only" style="margin-left: 4px;" onclick="window.app.project.copyProjectId('${p.id}')" title="プロジェクトIDをコピー">
                IDコピー
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // ダッシュボードの表示などもあれば更新
      this.updateCurrentProjectDisplay();
      if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (err) {
      console.error('Projects refresh error:', err);
      listContainer.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="color: var(--danger); padding: 20px;">
            プロジェクトの読み込みに失敗しました: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  /**
   * プロジェクトを作成する
   */
  async handleCreateProject() {
    const nameEl = document.getElementById('new-project-name');
    const errorEl = document.getElementById('create-project-error');
    
    if (!nameEl || !nameEl.value.trim()) return;
    
    const projectName = nameEl.value.trim();

    errorEl.textContent = '作成中...';
    errorEl.style.color = 'var(--accent)';

    try {
      const user = window.Auth?.currentUser;
      if (!user) throw new Error('ユーザーが認証されていません。');

      // Node.js API を経由してプロジェクトを作成
      const res = await fetch('/api/db/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to create project');
      
      const createdProject = resData.project;

      // 3. 成功！作成したプロジェクトを現在の選択プロジェクトにする
      this.selectProject(createdProject.id, createdProject.name);
      
      // フォームクリア
      nameEl.value = '';
      errorEl.textContent = '';
      
      showToast('プロジェクト「' + projectName + '」を作成しました！');
      this.refreshProjects();

    } catch (err) {
      console.error('Project creation failed:', err);
      errorEl.style.color = 'var(--danger)';
      errorEl.textContent = '作成エラー: ' + err.message;
    }
  }

  /**
   * 既存プロジェクトIDで参加する
   */
  async handleJoinProject() {
    const idEl = document.getElementById('join-project-id');
    const errorEl = document.getElementById('join-project-error');

    if (!idEl || !idEl.value.trim()) return;

    const projectIdStr = idEl.value.trim();

    errorEl.textContent = '参加処理中...';
    errorEl.style.color = 'var(--accent)';

    try {
      const user = window.Auth?.currentUser;
      if (!user) throw new Error('ユーザーが認証されていません。');

      // Node.js API を経由してプロジェクトに参加
      const res = await fetch('/api/db/project-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectIdStr })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to join project');
      
      const targetProj = resData.project;

      // 4. 成功！
      this.selectProject(targetProj.id, targetProj.name);
      
      idEl.value = '';
      errorEl.textContent = '';
      
      showToast('プロジェクト「' + targetProj.name + '」に参加しました！');
      this.refreshProjects();

    } catch (err) {
      console.error('Project join failed:', err);
      errorEl.style.color = 'var(--danger)';
      errorEl.textContent = '参加エラー: ' + err.message;
    }
  }

  /**
   * プロジェクトをカレントとして選択状態にする
   */
  async selectProject(id, name) {
    localStorage.setItem('current_project_id', String(id));
    localStorage.setItem('current_project_name', name);
    
    this.updateCurrentProjectDisplay();
    this.refreshProjects();
    
    showToast('プロジェクト「' + name + '」に切り替えました。');

    // 選択されたプロジェクトに応じたテーマカラーをロード
    if (window.themeManager) {
      await window.themeManager.loadTheme();
    }

    // 選択されたプロジェクトの図データを自動ロード
    if (window.app) {
      const loadPromises = [];
      
      if (window.app.architecture && typeof window.app.architecture.loadDiagram === 'function') {
        loadPromises.push(window.app.architecture.loadDiagram(true));
      }
      if (window.app.uml && typeof window.app.uml.loadDiagram === 'function') {
        loadPromises.push(window.app.uml.loadDiagram(true));
      }
      if (window.app.screenTransition && typeof window.app.screenTransition.loadDiagram === 'function') {
        loadPromises.push(window.app.screenTransition.loadDiagram(true));
      }
      if (window.app.layout && typeof window.app.layout.loadDiagram === 'function') {
        loadPromises.push(window.app.layout.loadDiagram(true));
      }
      if (window.app.erdiagram && typeof window.app.erdiagram.loadDiagram === 'function') {
        loadPromises.push(window.app.erdiagram.loadDiagram(true));
      }
      if (window.app.gantt && typeof window.app.gantt.loadGanttData === 'function') {
        loadPromises.push(window.app.gantt.loadGanttData());
      }

      try {
        await Promise.all(loadPromises);
      } catch (err) {
        console.error('[ProjectTool] 図の自動ロードに失敗しました:', err);
      }
    }
  }

  /**
   * プロジェクトのIDをクリップボードにコピー
   */
  copyProjectId(id) {
    navigator.clipboard.writeText(id).then(() => {
      showToast('プロジェクトIDをコピーしました！');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('プロジェクトID: ' + id);
    });
  }

  /**
   * ヘッダーやダッシュボードの現在のプロジェクト表示を更新
   */
  updateCurrentProjectDisplay() {
    const projName = localStorage.getItem('current_project_name') || '未選択';
    
    // ダッシュボード等にある表示用エレメントを更新
    const displayEl = document.getElementById('current-project-display');
    if (displayEl) {
      displayEl.textContent = projName;
    }
  }

  getRoleLabel(role) {
    const labels = {
      owner: 'オーナー',
      editor: '編集者',
      member: 'メンバー',
      viewer: '閲覧者'
    };
    return labels[role.toLowerCase()] || role;
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}
