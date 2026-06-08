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

      // Supabaseからユーザーの所属プロジェクト一覧を結合クエリで取得
      // project_members を経由して projects と users (owner) を取得
      const { data: memberships, error } = await window.supabaseClient
        .from('project_members')
        .select(`
          role,
          joined_at,
          projects (
            id,
            name,
            account_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

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
          <tr style="${isCurrent ? 'background: rgba(124, 58, 237, 0.1); border-left: 3px solid var(--accent);' : ''}">
            <td><code title="${p.id}">${displayId}</code></td>
            <td><strong>${this.escapeHTML(p.name)}</strong> ${isCurrent ? '<span style="color: var(--accent-light); font-size: 0.75rem; margin-left: 6px;">● 選択中</span>' : ''}</td>
            <td style="color: var(--text-muted); font-size: 0.8rem;">
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
    errorEl.style.color = '#8b5cf6';

    try {
      const user = window.Auth?.currentUser;
      if (!user) throw new Error('ユーザーが認証されていません。');

      // UUIDをクライアント側で生成 (安全策)
      const newProjectId = crypto.randomUUID();

      // 1. projects テーブルにレコードを新規追加 (id, account_id, name)
      const { data: newProj, error: projError } = await window.supabaseClient
        .from('projects')
        .insert([
          { id: newProjectId, name: projectName, account_id: user.id }
        ])
        .select();

      if (projError) throw projError;
      if (!newProj || newProj.length === 0) throw new Error('プロジェクトの作成結果を取得できませんでした。');

      const createdProject = newProj[0];

      // 2. project_members テーブルに所属メンバーとしてオーナーを追加
      const { error: memberError } = await window.supabaseClient
        .from('project_members')
        .insert([
          { project_id: createdProject.id, user_id: user.id, role: 'owner' }
        ]);

      if (memberError) throw memberError;

      // 3. 成功！作成したプロジェクトを現在の選択プロジェクトにする
      this.selectProject(createdProject.id, createdProject.name);
      
      // フォームクリア
      nameEl.value = '';
      errorEl.textContent = '';
      
      showToast('プロジェクト「' + projectName + '」を作成しました！');
      this.refreshProjects();

    } catch (err) {
      console.error('Project creation failed:', err);
      errorEl.style.color = '#ef4444';
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
    errorEl.style.color = '#8b5cf6';

    try {
      const user = window.Auth?.currentUser;
      if (!user) throw new Error('ユーザーが認証されていません。');

      // 1. そのプロジェクトが本当に存在するかチェック
      const { data: proj, error: checkError } = await window.supabaseClient
        .from('projects')
        .select('id, name')
        .eq('id', projectIdStr);

      if (checkError) throw checkError;
      if (!proj || proj.length === 0) {
        throw new Error('指定されたIDのプロジェクトは見つかりませんでした。正しいUUIDを入力してください。');
      }

      const targetProj = proj[0];

      // 2. 既に参加しているかチェック
      const { data: memberCheck, error: memberCheckError } = await window.supabaseClient
        .from('project_members')
        .select('role')
        .eq('project_id', targetProj.id)
        .eq('user_id', user.id);

      if (memberCheckError) throw memberCheckError;

      if (memberCheck && memberCheck.length > 0) {
        throw new Error('既にこのプロジェクトに参加しています。');
      }

      // 3. メンバーとして新規追加 (roleは editor とします)
      const { error: joinError } = await window.supabaseClient
        .from('project_members')
        .insert([
          { project_id: targetProj.id, user_id: user.id, role: 'editor' }
        ]);

      if (joinError) throw joinError;

      // 4. 成功！
      this.selectProject(targetProj.id, targetProj.name);
      
      idEl.value = '';
      errorEl.textContent = '';
      
      showToast('プロジェクト「' + targetProj.name + '」に参加しました！');
      this.refreshProjects();

    } catch (err) {
      console.error('Project join failed:', err);
      errorEl.style.color = '#ef4444';
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
