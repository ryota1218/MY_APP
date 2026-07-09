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
      
      // カスタムドロップダウンの外側をクリックした時に閉じる
      if (!e.target.closest('.custom-role-dropdown')) {
        document.querySelectorAll('.custom-role-menu.open').forEach(menu => {
          menu.classList.remove('open');
        });
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
            <td>
            <button class="btn btn-sm btn-secondary btn-icon-only" style="margin-left: 2px;" onclick="window.app.project.copyProjectId('${p.id}')" title="プロジェクトIDをコピー">
              ${displayId}
            </button></td>
            <td>
              <span class="project-name-link" onclick="window.app.project.openSettingsDrawer('${p.id}', '${this.escapeHTML(p.name).replace(/'/g, "\\'")}')" title="メンバー管理を開く">
                <strong style="color: var(--text);">${this.escapeHTML(p.name)}</strong>
              </span>
              ${isCurrent ? '<span style="color: var(--accent); font-size: 0.75rem; margin-left: 6px; font-weight: 600;">● 選択中</span>' : ''}
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
        if (typeof window.app.refreshDashboardData === 'function') {
          await window.app.refreshDashboardData();
        }
        if (typeof window.app.renderDashboardGantt === 'function') {
          window.app.renderDashboardGantt();
        }
      } catch (err) {
        console.error('[ProjectTool] 図の自動ロードに失敗しました:', err);
      }
    }
  }

  /**
   * プロジェクト設定ドロワーを開く
   */
  openSettingsDrawer(projectId, projectName) {
    const drawer = document.getElementById('project-settings-drawer');
    const nameEl = document.getElementById('drawer-project-name');
    if (!drawer) return;

    nameEl.textContent = projectName;
    drawer.classList.add('open');

    // 閉じるボタンのイベント
    const closeBtn = document.getElementById('drawer-close-btn');
    closeBtn.onclick = () => this.closeSettingsDrawer();

    // メンバーリストのロード
    this.loadProjectMembers(projectId);
  }

  closeSettingsDrawer() {
    const drawer = document.getElementById('project-settings-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  /**
   * プロジェクトメンバーを取得して表示
   */
  async loadProjectMembers(projectId) {
    try {
      const res = await fetch(`/api/db/project-members?projectId=${projectId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to load members');

      this.renderMembersList(projectId, data.members || []);
    } catch (err) {
      console.error('Failed to load project members:', err);
      showToast('メンバーの読み込みに失敗しました');
    }
  }

  renderMembersList(projectId, members) {
    const currentUser = window.Auth?.currentUser;
    const currentUserId = currentUser ? currentUser.id : null;

    // 自分がオーナーかどうか判定
    const myMember = members.find(m => m.user_id === currentUserId);
    const iAmOwner = myMember && myMember.role.toLowerCase() === 'owner';

    // 役割ごとに分類
    const roles = {
      owner: [],
      editor: [],
      viewer: []
    };

    members.forEach(m => {
      const r = m.role.toLowerCase();
      if (roles[r]) roles[r].push(m);
      else roles.viewer.push(m); // default fallback
    });

    // カウント更新とリスト描画
    ['owner', 'editor', 'viewer'].forEach(role => {
      const countEl = document.getElementById(`count-${role}`);
      const listEl = document.getElementById(`member-list-${role}`);
      
      if (countEl) countEl.textContent = roles[role].length;
      if (listEl) {
        if (roles[role].length === 0) {
          listEl.innerHTML = `<div style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">メンバーがいません</div>`;
          return;
        }

        listEl.innerHTML = roles[role].map(m => {
          const u = m.users || {};
          const name = u.name || 'Unknown User';
          const icon = u.icon || '';
          const date = m.joined_at ? new Date(m.joined_at).toLocaleDateString('ja-JP') : '-';
          
          const isMe = m.user_id === currentUserId;
          const initial = name.charAt(0).toUpperCase();

          // 権限変更プルダウン（自分がオーナーであり、かつ相手が自分以外の場合に変更可能）
          // ※ オーナーが自分自身を降格できる仕様にするかどうかはシステムによるが、今回は自分以外とする
          const canChangeRole = iAmOwner && !isMe;
          
          // 削除ボタン（自分がオーナーであり相手が自分以外、または自分自身の退出）
          const canRemove = (iAmOwner && !isMe) || isMe;
          const removeIcon = isMe ? 'log-out' : 'user-minus';
          const removeTitle = isMe ? '退出する' : '追放する';

          return `
            <div class="member-item">
              <div class="member-info">
                <div class="member-avatar">
                  ${icon ? `<img src="${this.escapeHTML(icon)}" alt="icon">` : initial}
                </div>
                <div class="member-details">
                  <div class="member-name">${this.escapeHTML(name)} ${isMe ? '<span style="color:var(--accent);font-size:0.7rem;margin-left:4px;">(あなた)</span>' : ''}</div>
                  <div class="member-date">参加日: ${date}</div>
                </div>
              </div>
              <div class="member-actions">
                <div class="custom-role-dropdown" id="dropdown-container-${m.user_id}">
                  <button class="custom-role-btn" 
                          onclick="window.app.project.toggleRoleMenu(event, '${m.user_id}')"
                          ${canChangeRole ? '' : 'disabled'}>
                    <span class="role-label">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                    ${canChangeRole ? '<i data-lucide="chevron-down" class="dropdown-icon"></i>' : ''}
                  </button>
                  ${canChangeRole ? `
                  <div class="custom-role-menu" id="role-menu-${m.user_id}">
                    <div class="role-menu-item ${role === 'owner' ? 'active' : ''}" onclick="window.app.project.updateMemberRole('${projectId}', '${m.user_id}', 'owner')">
                      <i data-lucide="crown"></i>
                      <div class="role-menu-text">
                        <strong>Owner</strong>
                        <span>管理権限（設定変更・削除）</span>
                      </div>
                    </div>
                    <div class="role-menu-item ${role === 'editor' ? 'active' : ''}" onclick="window.app.project.updateMemberRole('${projectId}', '${m.user_id}', 'editor')">
                      <i data-lucide="edit-2"></i>
                      <div class="role-menu-text">
                        <strong>Editor</strong>
                        <span>図の編集・保存が可能</span>
                      </div>
                    </div>
                    <div class="role-menu-item ${role === 'viewer' ? 'active' : ''}" onclick="window.app.project.updateMemberRole('${projectId}', '${m.user_id}', 'viewer')">
                      <i data-lucide="eye"></i>
                      <div class="role-menu-text">
                        <strong>Viewer</strong>
                        <span>閲覧のみ（編集不可）</span>
                      </div>
                    </div>
                  </div>
                  ` : ''}
                </div>
                ${canRemove ? `
                  <button class="btn-remove-member" onclick="window.app.project.removeMember('${projectId}', '${m.user_id}', ${isMe})" title="${removeTitle}">
                    <i data-lucide="${removeIcon}"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // 追加：カスタムドロップダウンの開閉処理
  toggleRoleMenu(event, userId) {
    event.stopPropagation();
    
    // 他の開いているメニューをすべて閉じる
    document.querySelectorAll('.custom-role-menu.open').forEach(menu => {
      if (menu.id !== `role-menu-${userId}`) {
        menu.classList.remove('open');
      }
    });

    const menu = document.getElementById(`role-menu-${userId}`);
    if (menu) {
      menu.classList.toggle('open');
    }
  }

  async updateMemberRole(projectId, targetUserId, newRole) {
    try {
      const res = await fetch('/api/db/project-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, targetUserId, role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');

      showToast('権限を更新しました');
      this.loadProjectMembers(projectId); // リストを再描画
    } catch (err) {
      console.error(err);
      showToast(err.message || '権限の更新に失敗しました');
      this.loadProjectMembers(projectId); // 元に戻すため再描画
    }
  }

  async removeMember(projectId, targetUserId, isMe) {
    const title = isMe ? 'プロジェクトから退出' : 'メンバーの追放';
    const message = isMe ? '本当にこのプロジェクトから退出しますか？' : '本当にこのメンバーをプロジェクトから追放しますか？';

    showConfirm(title, message, async () => {
      try {
        const res = await fetch('/api/db/project-members', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, targetUserId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to remove member');

        showToast(isMe ? '退出しました' : 'メンバーを追放しました');
        
        if (isMe) {
          this.closeSettingsDrawer();
          this.loadMyProjects(); // プロジェクト一覧を更新
        } else {
          this.loadProjectMembers(projectId); // リストを再描画
        }
      } catch (err) {
        console.error(err);
        showToast(err.message || '操作に失敗しました');
      }
    });
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
