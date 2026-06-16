/**
 * Supabase データベースと図データ（ダイアグラム）の同期を行う共通モジュール
 */
const DBIO = {
  currentDiagramId: null,
  currentDiagramName: '',
  currentDiagramStatus: '作成中',
  pendingLoadCallback: null,

  getCurrentProjectId() {
    return localStorage.getItem('current_project_id');
  },

  // ----------------------------------------------------
  // UI - Modals setup
  // ----------------------------------------------------
  setupModals() {
    if (document.getElementById('db-io-overlay')) return;
    
    const modalsHTML = `
      <div id="db-io-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 9998; backdrop-filter: blur(2px);"></div>
      
      <!-- Save Modal (Glassmorphism design) -->
      <div id="save-diagram-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); align-items: center; gap: 12px; padding: 15px 25px; z-index: 9999; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3); background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 40px; color: #fff; min-width: 550px; box-sizing: border-box;">
        
        <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent, #7c3aed), var(--accent-light, #a855f7)); border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 10px rgba(124, 58, 237, 0.5);">
          <i data-lucide="save" style="width: 18px; height: 18px; color: #fff;"></i>
        </div>
        
        <div style="flex: 1; min-width: 150px;">
          <input type="text" id="save-diagram-name" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 8px 14px; color: #fff; font-size: 0.9rem; width: 100%; box-sizing: border-box; outline: none; transition: border-color 0.2s;" placeholder="図のタイトルを入力...">
        </div>
        
        <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 4px 10px; flex-shrink: 0;">
          <select id="save-diagram-status" style="background: transparent; border: none; color: #fff; font-size: 0.85rem; outline: none; cursor: pointer; padding: 4px;">
            <option value="作成中" style="background: #0f172a;">作成中</option>
            <option value="完了" style="background: #0f172a;">完了</option>
            <option value="保留" style="background: #0f172a;">保留</option>
          </select>
        </div>
        
        <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
          <button id="btn-save-overwrite" class="btn btn-sm btn-secondary" style="display: none; border-radius: 20px; padding: 6px 14px; font-size: 0.85rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.15); color: #fff; cursor: pointer;">上書き保存</button>
          <button id="btn-save-new" class="btn btn-sm btn-primary" style="border-radius: 20px; padding: 6px 14px; font-size: 0.85rem; background: var(--accent, #7c3aed); border: none; color: #fff; font-weight: bold; cursor: pointer;">新規保存</button>
          <button style="background: transparent; border: none; color: rgba(255, 255, 255, 0.5); font-size: 1.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; line-height: 1;" onclick="window.DBIO.closeModals()">&times;</button>
        </div>
      </div>

      <!-- Open Modal -->
      <div id="open-diagram-modal" class="card" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 450px; padding: 20px; z-index: 9999; box-shadow: var(--shadow); background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);">
        <h3 style="font-size: 1.1rem; margin-top: 0; margin-bottom: 16px; color: var(--text);">図を開く</h3>
        
        <div id="open-diagram-list" style="max-height: 300px; overflow-y: auto; margin-bottom: 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-primary); padding: 8px;">
          <!-- List items injected here -->
        </div>
        
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="window.DBIO.closeModals()">キャンセル</button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalsHTML);
    if (window.lucide) {
      lucide.createIcons({ root: document.getElementById('save-diagram-modal') });
    }

    // Attach generic event listeners
    document.getElementById('btn-save-overwrite').addEventListener('click', () => {
      if (this.onConfirmSaveCallback) this.onConfirmSaveCallback(false);
    });
    document.getElementById('btn-save-new').addEventListener('click', () => {
      if (this.onConfirmSaveCallback) this.onConfirmSaveCallback(true);
    });
  },

  closeModals() {
    const overlay = document.getElementById('db-io-overlay');
    const saveModal = document.getElementById('save-diagram-modal');
    const openModal = document.getElementById('open-diagram-modal');
    if (overlay) overlay.style.display = 'none';
    if (saveModal) saveModal.style.display = 'none';
    if (openModal) openModal.style.display = 'none';
    
    if (this.onCancelSaveCallback) {
      this.onCancelSaveCallback();
      this.onCancelSaveCallback = null;
    }
  },

  // ----------------------------------------------------
  // Helper
  // ----------------------------------------------------
  getJapaneseChartType(type) {
    const map = {
      'arch_main': 'システム構成図',
      'st_main': '画面遷移図',
      'layout': '画面レイアウト',
      'er': 'E-R図',
      'gantt': 'ガントチャート',
      'uml_class': 'クラス図',
      'uml_object': 'オブジェクト図',
      'uml_component': 'コンポーネント図',
      'uml_deployment': '配置図',
      'uml_composite': 'コンポジット構造図',
      'uml_package': 'パッケージ図',
      'uml_activity': 'アクティビティ図',
      'uml_state': 'ステートマシン図',
      'uml_usecase': 'ユースケース図',
      'uml_communication': 'コミュニケーション図',
      'uml_sequence': 'シーケンス図',
      'uml_interaction': '相互作用図',
      'uml_timing': 'タイミング図'
    };
    return map[type] || type;
  },

  // ----------------------------------------------------
  // DB API
  // ----------------------------------------------------
  async insertDiagram(projectId, name, type, jsonStr, status) {
    const jpType = this.getJapaneseChartType(type);
    const newId = crypto.randomUUID();
    const { error } = await window.supabaseClient
      .from('images')
      .insert([
        {
          id: newId,
          project_id: projectId,
          name: name,
          json: jsonStr,
          stats: status,
          chart_type: jpType
        }
      ]);
    if (error) throw error;
    return newId;
  },

  async updateDiagram(id, name, jsonStr, status) {
    const { error } = await window.supabaseClient
      .from('images')
      .update({
        name: name,
        json: jsonStr,
        stats: status,
        update_att: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw error;
    return id;
  },

  async fetchDiagrams(projectId, type) {
    const jpType = this.getJapaneseChartType(type);
    const { data, error } = await window.supabaseClient
      .from('images')
      .select('id, name, stats, create_at, update_att')
      .eq('project_id', projectId)
      .eq('chart_type', jpType)
      .order('update_att', { ascending: false });
    if (error) throw error;
    return data;
  },

  async fetchDiagramById(id) {
    const { data, error } = await window.supabaseClient
      .from('images')
      .select('json')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // ----------------------------------------------------
  // Workflows
  // ----------------------------------------------------
  
  /**
   * Called by diagram editors to save the diagram.
   * Prompts the user with a modal to choose Overwrite or Save As New.
   */
  async saveDiagramToDB(diagramType, data) {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      if (window.showToast) showToast('プロジェクトが選択されていません', 'warning');
      return false;
    }

    this.setupModals();
    
    const nameInput = document.getElementById('save-diagram-name');
    const statusInput = document.getElementById('save-diagram-status');
    const btnOverwrite = document.getElementById('btn-save-overwrite');
    const btnNew = document.getElementById('btn-save-new');

    nameInput.value = this.currentDiagramName || '';
    statusInput.value = this.currentDiagramStatus || '作成中';
    
    // UI logic: If we have a current diagram, show Overwrite option.
    if (this.currentDiagramId) {
      btnOverwrite.style.display = 'inline-block';
      btnNew.textContent = '別名で保存';
    } else {
      btnOverwrite.style.display = 'none';
      btnNew.textContent = '新規保存';
    }
    
    document.getElementById('db-io-overlay').style.display = 'block';
    document.getElementById('save-diagram-modal').style.display = 'flex';
    
    return new Promise((resolve) => {
      this.onCancelSaveCallback = () => {
        resolve(false);
      };

      this.onConfirmSaveCallback = async (isNew) => {
        const finalName = nameInput.value.trim();
        const finalStatus = statusInput.value;

        if (!finalName) {
          if (window.showToast) showToast('タイトルを入力してください', 'warning');
          return;
        }

        this.onCancelSaveCallback = null; // Prevent rejecting on close
        this.closeModals();

        try {
          const chartJson = JSON.stringify(data);
          let savedId;

          if (isNew || !this.currentDiagramId) {
            savedId = await this.insertDiagram(projectId, finalName, diagramType, chartJson, finalStatus);
            if (window.showToast) showToast('新規保存しました');
          } else {
            savedId = await this.updateDiagram(this.currentDiagramId, finalName, chartJson, finalStatus);
            if (window.showToast) showToast('上書き保存しました');
          }
          
          this.currentDiagramId = savedId;
          this.currentDiagramName = finalName;
          this.currentDiagramStatus = finalStatus;
          resolve(true);

        } catch (err) {
          console.error('[DBIO] 図の保存に失敗:', err);
          if (window.showToast) showToast(`保存エラー: ${err.message}`, 'danger');
          resolve(false);
        }
      };
    });
  },

  async showOpenModal(diagramType, onSelectCallback) {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      if (window.showToast) showToast('プロジェクトが選択されていません', 'warning');
      return;
    }

    this.setupModals();
    const listEl = document.getElementById('open-diagram-list');
    listEl.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-dim);">読み込み中...</div>';
    
    document.getElementById('db-io-overlay').style.display = 'block';
    document.getElementById('open-diagram-modal').style.display = 'block';
    
    try {
      const data = await this.fetchDiagrams(projectId, diagramType);
      
      if (!data || data.length === 0) {
        listEl.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-dim);">保存された図がありません。</div>';
        return;
      }
      
      let html = '';
      data.forEach(item => {
        const dateStr = new Date(item.update_att || item.create_at).toLocaleString();
        html += `
          <div style="padding: 10px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; color: var(--text);">${item.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-dim);">状態: ${item.stats || '未設定'} | 更新: ${dateStr}</div>
            </div>
            <button class="btn btn-primary" onclick="window.DBIO.executeLoad('${item.id}', '${item.name.replace(/'/g, "\\'")}', '${item.stats || ''}')">開く</button>
          </div>
        `;
      });
      listEl.innerHTML = html;
      
      this.pendingLoadCallback = onSelectCallback;
      
    } catch (err) {
      console.error('[DBIO] 一覧の取得に失敗:', err);
      listEl.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--error);">エラー: ${err.message}</div>`;
    }
  },
  
  async executeLoad(id, name, status) {
    this.closeModals();
    if (window.showToast) showToast('読み込み中...');
    
    try {
      const data = await this.fetchDiagramById(id);
      
      if (data && data.json) {
        this.currentDiagramId = id;
        this.currentDiagramName = name;
        this.currentDiagramStatus = status;
        
        const chartData = JSON.parse(data.json);
        if (this.pendingLoadCallback) {
          this.pendingLoadCallback(chartData, id, name, status);
        }
      } else {
        if (window.showToast) showToast('図のデータが見つかりませんでした', 'danger');
      }
    } catch(err) {
      console.error('[DBIO] 読み込みに失敗:', err);
      if (window.showToast) showToast(`読み込みエラー: ${err.message}`, 'danger');
    } finally {
      this.pendingLoadCallback = null;
    }
  },

  resetCurrentDiagram() {
    this.currentDiagramId = null;
    this.currentDiagramName = '';
    this.currentDiagramStatus = '作成中';
  },

  async loadDiagramFromDB(diagramType) {
    return null;
  },

  // ----------------------------------------------------
  // Project Color Theme API
  // ----------------------------------------------------
  async fetchProjectColor(projectId) {
    if (!projectId) return null;
    const { data, error } = await window.supabaseClient
      .from('color')
      .select('main, sub, accent')
      .eq('project_id', projectId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async saveProjectColor(projectId, main, sub, accent) {
    if (!projectId) return null;
    
    // 既存のレコードがあるか確認
    const existing = await this.fetchProjectColor(projectId);
    
    if (existing) {
      // 更新
      const { data, error } = await window.supabaseClient
        .from('color')
        .update({
          main: main,
          sub: sub,
          accent: accent
        })
        .eq('project_id', projectId)
        .select();
      if (error) throw error;
      return data;
    } else {
      // 新規作成
      const { data, error } = await window.supabaseClient
        .from('color')
        .insert([
          {
            project_id: projectId,
            main: main,
            sub: sub,
            accent: accent
          }
        ])
        .select();
      if (error) throw error;
      return data;
    }
  },

  // ----------------------------------------------------
  // Gantt Chart Data API
  // ----------------------------------------------------
  async fetchGanttData(projectId) {
    if (!projectId) return null;
    const { data, error } = await window.supabaseClient
      .from('gantt')
      .select('json')
      .eq('project_id', projectId)
      .maybeSingle();
    if (error) throw error;
    return data ? data.json : null;
  },

  async saveGanttData(projectId, jsonStr) {
    if (!projectId) return null;
    
    // Check if record exists
    const { data: existing, error: checkError } = await window.supabaseClient
      .from('gantt')
      .select('id')
      .eq('project_id', projectId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existing) {
      // Update
      const { data, error } = await window.supabaseClient
        .from('gantt')
        .update({ json: jsonStr })
        .eq('project_id', projectId)
        .select();
      if (error) throw error;
      return data;
    } else {
      // Insert
      const { data, error } = await window.supabaseClient
        .from('gantt')
        .insert([{ project_id: projectId, json: jsonStr }])
        .select();
      if (error) throw error;
      return data;
    }
  }
};

window.DBIO = DBIO;
