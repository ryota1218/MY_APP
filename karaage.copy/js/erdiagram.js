/* ===== ER Diagram Tool ===== */
class ERDiagramTool {
  constructor() {
    this.entities = [];
    this.relations = [];
    this.entityIdCounter = 0;
    this.selectedEntity = null;
    this.undoHistory = [];
    this.redoStack = [];
    this.isApplyingUndo = false;
    this.viewMode = 'logical'; // 'logical' or 'physical'
    this.sqlDialect = 'mysql'; // 'mysql' or 'postgres'
    this.zoomLevel = 1.0;
    this.isGridVisible = true;
    this.clipboard = null;
    this.isDirty = false;
    this.canvas = document.getElementById('er-canvas');
    this.svg = document.getElementById('er-svg');
    if (this.canvas) this.canvas.classList.add('grid-active');
    this.connectingFrom = null;
    
    // AI Chat state
    this.prefix = 'er';
    this.aiChatListenersInitialized = false;
    this.chatHistory = [];

    // Add sample entities
    this.addEntityAt('ユーザー', 'users', [
      {logicalName:'ユーザーID', physicalName:'user_id', type:'INT', pk:true, fk:false},
      {logicalName:'氏名', physicalName:'name', type:'VARCHAR', pk:false, fk:false},
      {logicalName:'メールアドレス', physicalName:'email', type:'VARCHAR', pk:false, fk:false},
      {logicalName:'登録日時', physicalName:'created_at', type:'DATETIME', pk:false, fk:false}
    ], 100, 80);
    this.addEntityAt('注文', 'orders', [
      {logicalName:'注文ID', physicalName:'order_id', type:'INT', pk:true, fk:false},
      {logicalName:'ユーザーID', physicalName:'user_id', type:'INT', pk:false, fk:true},
      {logicalName:'合計金額', physicalName:'total', type:'DECIMAL', pk:false, fk:false},
      {logicalName:'ステータス', physicalName:'status', type:'VARCHAR', pk:false, fk:false},
      {logicalName:'注文日時', physicalName:'ordered_at', type:'DATETIME', pk:false, fk:false}
    ], 420, 80);
    this.addEntityAt('商品', 'products', [
      {logicalName:'商品ID', physicalName:'product_id', type:'INT', pk:true, fk:false},
      {logicalName:'商品名', physicalName:'name', type:'VARCHAR', pk:false, fk:false},
      {logicalName:'価格', physicalName:'price', type:'DECIMAL', pk:false, fk:false},
      {logicalName:'在庫数', physicalName:'stock', type:'INT', pk:false, fk:false}
    ], 420, 340);
    this.relations.push({from:this.entities[1].id,to:this.entities[0].id,label:'1:N'});
    this.relations.push({from:this.entities[1].id,to:this.entities[2].id,label:'N:M'});
    this.drawRelations();

    // キャンバスのクリックで選択解除および接続モードキャンセル
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.target === this.canvas || e.target === this.svg) {
        if (this.connectingFrom) {
          this.connectingFrom = null;
          showToast('接続モードをキャンセルしました');
        }
        this.canvas.querySelectorAll('.er-entity').forEach(el => el.classList.remove('selected'));
        this.selectedEntity = null;
      }
    });
  }

  async saveDiagram() {
    const data = {
      entities: this.entities,
      relations: this.relations,
      entityIdCounter: this.entityIdCounter,
      viewMode: this.viewMode,
      sqlDialect: this.sqlDialect
    };
    if (window.DBIO) {
      return await window.DBIO.saveDiagramToDB('er', data);
    } else {
      if(window.showToast) window.showToast('データベース連携モジュールが見つかりません', 'danger');
      return false;
    }
  }

  async openDiagramModal() {
    if (window.DBIO) {
      await window.DBIO.showOpenModal('er', (data, id, name, status) => {
        this.restoreSnapshot(data);
        if(window.showToast) window.showToast(`${name} を読み込みました`);
      });
    } else {
      if(window.showToast) window.showToast('データベース連携モジュールが見つかりません', 'danger');
    }
  }

  async loadDiagram(forceWithoutConfirm = false) {
    // DB保存への一本化に伴い、自動ロード（プロジェクト切り替え時）は常に空のキャンバスで初期化します
    this.entities = [];
    this.relations = [];
    this.entityIdCounter = 0;
    if (this.canvas) {
      this.canvas.querySelectorAll('.er-entity').forEach(e => e.remove());
    }
    if (this.svg) {
      this.svg.innerHTML = '';
    }
    if (window.DBIO) window.DBIO.resetCurrentDiagram();
  }

  redoLastAction() {
    const action = this.redoStack.pop();
    if (!action) {
      showToast('やり直せる操作がありません');
      return;
    }
    this.isApplyingUndo = true;
    try {
      // Redoは現状Snapshotからの復元、またはアクションの再適用
      if (action.type === 'removeEntity') {
        this.addEntityAt(action.logicalName, action.physicalName, action.attrs, action.x, action.y);
      } else if (action.type === 'clearAll') {
        this.entities = [];
        this.relations = [];
        this.canvas.querySelectorAll('.er-entity').forEach(e => e.remove());
        this.svg.innerHTML = '';
      }
      // 必要に応じて他のアクションタイプも拡張
      this.drawRelations();
      showToast('やり直しました');
    } finally {
      this.isApplyingUndo = false;
    }
  }

  copySelected() {
    if (this.selectedEntity) {
      this.clipboard = JSON.parse(JSON.stringify(this.selectedEntity));
      showToast('エンティティをコピーしました');
    } else {
      showToast('エンティティを選択してください');
    }
  }

  pasteSelected() {
    if (!this.clipboard) {
      showToast('貼り付ける要素がありません');
      return;
    }
    const offset = 40;
    this.addEntityAt(
      this.clipboard.logicalName + '_copy',
      this.clipboard.physicalName + '_copy',
      this.clipboard.attrs,
      this.clipboard.x + offset,
      this.clipboard.y + offset
    );
    showToast('コピーを貼り付けました');
  }

  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2.0);
    this.applyZoom();
    showToast(`ズーム: ${Math.round(this.zoomLevel * 100)}%`);
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
    this.applyZoom();
    showToast(`ズーム: ${Math.round(this.zoomLevel * 100)}%`);
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.applyZoom();
    showToast('ズームをリセットしました');
  }

  applyZoom() {
    this.canvas.style.transform = `scale(${this.zoomLevel})`;
    this.canvas.style.transformOrigin = '0 0';
  }

  toggleGrid() {
    this.isGridVisible = !this.isGridVisible;
    if (this.canvas) {
      this.canvas.classList.toggle('grid-active', this.isGridVisible);
    }
    showToast(this.isGridVisible ? 'グリッドを表示' : 'グリッドを非表示');
  }

  autoLayout() {
    this.entities.forEach((entity, i) => {
      entity.x = 80 + (i % 3) * 350;
      entity.y = 80 + Math.floor(i / 3) * 300;
      const el = document.getElementById(entity.id);
      if (el) {
        el.style.left = entity.x + 'px';
        el.style.top = entity.y + 'px';
      }
    });
    this.drawRelations();
    showToast('エンティティを再配置しました');
  }

  async aiAutoLayout() {
    if (!this.entities || this.entities.length === 0) {
      showToast('配置するノードがありません');
      return;
    }

    const requestBody = {
      diagram_type: 'erdiagram',
      nodes: this.entities.map(e => ({
        id: e.id,
        label: e.label || '',
        x: e.x,
        y: e.y,
        width: e.width || 160,
        height: e.height || 50,
      })),
      existing_connections: this.relations.map(r => ({
        from: r.from,
        to: r.to,
        label: r.label || '',
      })),
      canvas_width: (this.canvas.clientWidth || 1200) - 200,
      canvas_height: (this.canvas.clientHeight || 800) - 80,
    };

    showToast('🤖 AIが最適な配置を計算中...');

    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
      const apiBaseUrl = isLocal ? 'http://localhost:8000' : 'https://upstream-ai-backend-976977069035.us-central1.run.app';

      const response = await fetch(`${apiBaseUrl}/api/ai-layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `サーバーエラー (${response.status})`);
      }

      const result = await response.json();

      if (result.nodes && result.nodes.length > 0) {
        const duration = 400;
        const startTime = performance.now();
        const startPositions = {};
        const targetPositions = {};

        result.nodes.forEach(rn => {
          const node = this.entities.find(n => n.id === rn.id);
          if (node) {
            startPositions[rn.id] = { x: node.x, y: node.y };
            targetPositions[rn.id] = { x: rn.x, y: rn.y };
          }
        });

        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);

          Object.keys(startPositions).forEach(nodeId => {
            const node = this.entities.find(n => n.id === nodeId);
            const el = document.getElementById(nodeId);
            if (!node || !el) return;
            const start = startPositions[nodeId];
            const target = targetPositions[nodeId];
            node.x = start.x + (target.x - start.x) * easedProgress;
            node.y = start.y + (target.y - start.y) * easedProgress;
            el.style.left = node.x + 'px';
            el.style.top = node.y + 'px';
          });

          this.drawRelations();
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            showToast('AIレイアウト最適化が完了しました');
          }
        };
        requestAnimationFrame(animate);
      } else {
        showToast('配置の変更はありませんでした');
      }

      if (result.advice) {
        console.log("AI Advice:", result.advice);
      }
    } catch (error) {
      console.error('[AI Layout] Error:', error);
      showToast(`AI最適化エラー: ${error.message}`, 'danger');
    }
  }
  
  toggleAIChat() {
    const panel = document.getElementById(this.prefix + '-ai-chat-panel');
    if (!panel) return;

    const isOpen = panel.classList.toggle('open');
    if (isOpen) {
      this.closePropertyPanel();
      document.body.classList.add('sidebar-collapsed');
      
      const msgArea = document.getElementById(this.prefix + '-ai-chat-messages');
      if (msgArea) msgArea.scrollTop = msgArea.scrollHeight;
      this.initAIChatListeners();
    } else {
      const propPanel = document.getElementById(this.prefix + '-property-panel');
      const isPropOpen = propPanel && propPanel.classList.contains('open');
      if (!isPropOpen) {
        if (document.body.dataset.sidebarCollapsedByUser !== 'true') {
          document.body.classList.remove('sidebar-collapsed');
        }
      }
    }
  }

  initAIChatListeners() {
    if (this.aiChatListenersInitialized) return;

    const sendBtn = document.getElementById(this.prefix + '-ai-chat-send-btn');
    const input = document.getElementById(this.prefix + '-ai-chat-input');
    if (!sendBtn || !input) return;

    sendBtn.addEventListener('click', () => {
      this.sendAIChatMessage();
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendAIChatMessage();
      }
    });

    this.aiChatListenersInitialized = true;
    this.chatHistory = [];
  }

  async sendAIChatMessage() {
    const input = document.getElementById(this.prefix + '-ai-chat-input');
    const msgArea = document.getElementById(this.prefix + '-ai-chat-messages');
    if (!input || !msgArea) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'ai-chat-msg user';
    userMsgDiv.innerHTML = `<div class="ai-chat-bubble">${this.escapeHTML(text)}</div>`;
    msgArea.appendChild(userMsgDiv);
    msgArea.scrollTop = msgArea.scrollHeight;

    const loaderMsgDiv = document.createElement('div');
    loaderMsgDiv.className = 'ai-chat-msg assistant';
    loaderMsgDiv.innerHTML = `
      <div class="ai-chat-bubble" style="color: #9ca3af; display: flex; align-items: center; gap: 8px;">
        <span class="icon-spin" style="display:inline-block; width:12px; height:12px; border:2px solid #a78bfa; border-top-color:transparent; border-radius:50%; animation: spin 1s linear infinite;"></span>
        <span>AIが配置を再計算しています...</span>
      </div>
    `;
    msgArea.appendChild(loaderMsgDiv);
    msgArea.scrollTop = msgArea.scrollHeight;

    const requestBody = {
      diagram_type: 'erdiagram',
      nodes: this.entities.map(e => ({
        id: e.id,
        label: e.label || '',
        x: e.x,
        y: e.y,
        width: e.width || 160,
        height: e.height || 50,
      })),
      existing_connections: this.relations.map(c => ({
        from: c.from,
        to: c.to,
        label: c.label || '',
      })),
      canvas_width: (this.canvas.clientWidth || 1200) - 200,
      canvas_height: (this.canvas.clientHeight || 800) - 80,
      user_instruction: text,
      chat_history: this.chatHistory || []
    };

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    const apiBaseUrl = isLocal ? 'http://localhost:8000' : 'https://upstream-ai-backend-976977069035.us-central1.run.app';

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai-chat-layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      loaderMsgDiv.remove();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `サーバーエラー (${response.status})`);
      }

      const result = await response.json();

      if (result.nodes && result.nodes.length > 0) {
        const duration = 400;
        const startTime = performance.now();
        const startPositions = {};
        const targetPositions = {};

        result.nodes.forEach(rn => {
          const node = this.entities.find(n => n.id === rn.id);
          if (node) {
            startPositions[rn.id] = { x: node.x, y: node.y };
            targetPositions[rn.id] = { x: rn.x, y: rn.y };
          }
        });

        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);

          Object.keys(startPositions).forEach(nodeId => {
            const node = this.entities.find(n => n.id === nodeId);
            const el = document.getElementById(nodeId);
            if (!node || !el) return;
            const start = startPositions[nodeId];
            const target = targetPositions[nodeId];
            node.x = start.x + (target.x - start.x) * easedProgress;
            node.y = start.y + (target.y - start.y) * easedProgress;
            el.style.left = node.x + 'px';
            el.style.top = node.y + 'px';
          });

          this.drawRelations();
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }

      const assistantMsgDiv = document.createElement('div');
      assistantMsgDiv.className = 'ai-chat-msg assistant';
      
      let adviceHtml = '';
      if (result.advice) {
        adviceHtml = `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.9em; line-height: 1.4;">
            <div style="font-weight: 600; color: #a78bfa; margin-bottom: 4px;">💡 構成の評価・アドバイス:</div>
            <div style="color: #e5e7eb;">${this.escapeHTML(result.advice)}</div>
          </div>
        `;
      }

      assistantMsgDiv.innerHTML = `
        <div class="ai-chat-bubble">
          指示されたレイアウト調整を適用しました！
          <ul>
            <li>指示: <em>「${this.escapeHTML(text)}」</em></li>
            <li>移動されたノード数: <strong>${result.nodes?.length || 0}</strong> 個</li>
          </ul>
          ${adviceHtml}
        </div>
      `;
      msgArea.appendChild(assistantMsgDiv);
      msgArea.scrollTop = msgArea.scrollHeight;

      this.chatHistory.push({ role: 'user', content: text });
      this.chatHistory.push({ role: 'model', content: `指示されたレイアウト調整を適用しました！移動ノード数: ${result.nodes?.length || 0}. アドバイス: ${result.advice || ''}` });

    } catch (error) {
      console.error('[AI Chat Layout] Error:', error);
      loaderMsgDiv.remove();

      const errorMsgDiv = document.createElement('div');
      errorMsgDiv.className = 'ai-chat-msg assistant';
      errorMsgDiv.innerHTML = `
        <div class="ai-chat-bubble" style="border-color: #f87171; background-color: rgba(239, 68, 68, 0.05);">
          <span style="color: #f87171; font-weight: 600;">⚠️ エラーが発生しました</span><br>
          ${this.escapeHTML(error.message)}
        </div>
      `;
      msgArea.appendChild(errorMsgDiv);
      msgArea.scrollTop = msgArea.scrollHeight;
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  shareDiagram() { showToast('共有用URLを作成しました'); }
  showUserProfile() {
    if (window.app && window.app.profile) {
      window.app.profile.show();
    }
  }
  showHelp() { showToast('ヘルプを表示します'); }
  showSettings() { 
    showToast('エディタ設定を開きます');
    if (window.themeManager) window.themeManager.toggleModal();
  }
  closePropertyPanel() {
    const panel = document.getElementById('er-property-panel');
    if (panel) panel.classList.remove('visible');
  }
  bringToFront() {
    if (this.selectedEntity) {
      const el = document.getElementById(this.selectedEntity.id);
      if (el) {
        let maxZ = 0;
        document.querySelectorAll('.er-entity').forEach(e => {
          const z = parseInt(window.getComputedStyle(e).zIndex) || 0;
          if (z > maxZ) maxZ = z;
        });
        el.style.zIndex = maxZ + 1;
      }
    }
  }
  sendToBack() {
    if (this.selectedEntity) {
      const el = document.getElementById(this.selectedEntity.id);
      if (el) {
        let minZ = 0;
        document.querySelectorAll('.er-entity').forEach(e => {
          const z = parseInt(window.getComputedStyle(e).zIndex) || 0;
          if (z < minZ) minZ = z;
        });
        el.style.zIndex = minZ - 1;
      }
    }
  }
  deleteSelected() {
    if (this.selectedEntity) {
      this.removeEntityById(this.selectedEntity.id);
      this.drawRelations();
      this.closePropertyPanel();
      showToast('削除しました');
    }
  }

  toggleSidebar() {
    const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
    if (isCollapsed) {
      document.body.dataset.sidebarCollapsedByUser = 'true';
    } else {
      document.body.dataset.sidebarCollapsedByUser = 'false';
    }
  }

  toggleNameView() {
    this.viewMode = this.viewMode === 'logical' ? 'physical' : 'logical';
    const btn = document.getElementById('er-toggle-name-btn');
    if (btn) btn.textContent = this.viewMode === 'logical' ? '🌐 論理名を表示中' : '💻 物理名を表示中';
    this.entities.forEach(entity => {
      const el = document.getElementById(entity.id);
      if (el) {
        el.querySelector('.er-entity-header').textContent = this.viewMode === 'logical' ? entity.logicalName : entity.physicalName;
        el.querySelector('.er-entity-attrs').innerHTML = entity.attrs.map(a => `<div class="er-attr">
          ${a.pk?'<span class="attr-key">PK</span>':''}${a.fk?'<span class="attr-key" style="color:#06b6d4">FK</span>':''}
          <span>${this.escapeHtml(this.viewMode === 'logical' ? a.logicalName : a.physicalName)}</span><span class="attr-type">${this.escapeHtml(a.type)}</span>
        </div>`).join('');
      }
    });
  }

  exportSQL() {
    const isPG = this.sqlDialect === 'postgres';
    const quote = isPG ? '"' : '`';
    let sql = `-- DDL Export generated by UpStream (${this.sqlDialect.toUpperCase()})\n\n`;

    this.entities.forEach(entity => {
      sql += `CREATE TABLE ${quote}${entity.physicalName}${quote} (\n`;
      const colDefs = [];
      const pks = [];
      
      entity.attrs.forEach(attr => {
        let type = attr.type;
        if (isPG) {
          if (type === 'INT') type = 'INTEGER';
          if (type === 'DATETIME') type = 'TIMESTAMP';
          if (attr.pk && (type === 'INTEGER' || type === 'INT')) type = 'SERIAL';
        }
        
        let col = `  ${quote}${attr.physicalName}${quote} ${type}`;
        colDefs.push(col);
        if (attr.pk) pks.push(`${quote}${attr.physicalName}${quote}`);
      });
      
      if (pks.length > 0) {
        colDefs.push(`  PRIMARY KEY (${pks.join(', ')})`);
      }
      
      sql += colDefs.join(',\n') + '\n';
      
      if (isPG) {
        sql += `);\n`;
        sql += `COMMENT ON TABLE "${entity.physicalName}" IS '${entity.logicalName}';\n`;
        entity.attrs.forEach(attr => {
          sql += `COMMENT ON COLUMN "${entity.physicalName}"."${attr.physicalName}" IS '${attr.logicalName}';\n`;
        });
        sql += `\n`;
      } else {
        sql += `) COMMENT='${entity.logicalName}';\n\n`;
      }
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal er-class-modal" style="min-width: 600px;">
        <h2>DDL出力 (${this.sqlDialect === 'mysql' ? 'MySQL' : 'PostgreSQL'})</h2>
        <textarea class="form-input" style="height: 300px; font-family: monospace; resize: vertical;" readonly>${this.escapeHtml(sql)}</textarea>
        <div class="modal-actions" style="margin-top: 16px;">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">閉じる</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  addEntityAt(logicalName, physicalName, attrs, x, y) {
    const id = 'er_entity_' + (this.entityIdCounter++);
    const entity = { id, logicalName, physicalName, attrs, x, y };
    this.entities.push(entity);
    this.renderEntity(entity);
    this.pushUndoAction({
      type: 'removeEntity',
      entityId: entity.id,
      logicalName: entity.logicalName,
      physicalName: entity.physicalName,
      attrs: JSON.parse(JSON.stringify(entity.attrs)),
      x: entity.x,
      y: entity.y,
      entityIndex: this.entities.length - 1,
      entityIdCounter: this.entityIdCounter - 1,
    });
    return entity;
  }
  addEntity() {
    this.showEntityForm();
  }

  showEntityForm(existingEntity = null) {
    const isEdit = !!existingEntity;
    const title = isEdit ? 'エンティティを編集' : 'エンティティを追加';
    const logicalName = isEdit ? existingEntity.logicalName : '';
    const physicalName = isEdit ? existingEntity.physicalName : '';
    const initialAttrs = isEdit ? existingEntity.attrs : [
      { logicalName: 'ID', physicalName: 'id', type: 'INT', pk: true, fk: false }
    ];

    const container = document.getElementById('modal-container');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal er-class-modal" style="min-width: 600px;">
          <h2>${title}</h2>
          <div class="form-group" style="display:flex; gap:10px;">
            <div style="flex:1;">
              <label>論理名 (日本語等)</label>
              <input type="text" class="form-input" id="er-form-logical-name" value="${this.escapeHtml(logicalName)}" placeholder="例: ユーザー" autofocus>
            </div>
            <div style="flex:1;">
              <label>物理名 (英数字)</label>
              <input type="text" class="form-input" id="er-form-physical-name" value="${this.escapeHtml(physicalName)}" placeholder="例: users">
            </div>
          </div>
          <div class="form-group">
            <label>カラム定義</label>
            <div class="er-form-rows" id="er-form-rows-container"></div>
            <button type="button" class="btn btn-sm btn-secondary er-form-add-btn" id="er-form-add-row">＋ カラムを追加</button>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="er-form-cancel">キャンセル</button>
            <button class="btn btn-primary" id="er-form-submit">${isEdit ? '更新' : '作成'}</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { container.innerHTML = ''; container.style.display = 'none'; };
    document.getElementById('er-form-cancel').onclick = close;
    const rowsContainer = document.getElementById('er-form-rows-container');
    const addRowBtn = document.getElementById('er-form-add-row');
    const submitBtn = document.getElementById('er-form-submit');

    const createRow = (attr = { logicalName: '', physicalName: '', type: 'VARCHAR', pk: false, fk: false }) => {
      const row = document.createElement('div');
      row.className = 'er-form-row';
      row.innerHTML = `
        <button type="button" class="er-form-key-btn pk ${attr.pk ? 'active' : ''}" title="Primary Key">PK</button>
        <button type="button" class="er-form-key-btn fk ${attr.fk ? 'active' : ''}" title="Foreign Key">FK</button>
        <input type="text" class="form-input er-form-logical-input" placeholder="論理名" value="${this.escapeHtml(attr.logicalName)}" style="flex:1;">
        <input type="text" class="form-input er-form-physical-input" placeholder="物理名" value="${this.escapeHtml(attr.physicalName)}" style="flex:1;">
        <select class="form-input er-form-type-select" style="flex:0.8;">
          ${['INT', 'BIGINT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'DATETIME', 'DECIMAL', 'JSON', 'UUID'].map(t => 
            `<option value="${t}" ${attr.type === t ? 'selected' : ''}>${t}</option>`
          ).join('')}
        </select>
        <button type="button" class="er-form-del-btn" title="削除">✕</button>
      `;

      // PK Toggle
      row.querySelector('.pk').addEventListener('click', (e) => e.target.classList.toggle('active'));
      // FK Toggle
      row.querySelector('.fk').addEventListener('click', (e) => e.target.classList.toggle('active'));
      // Delete
      row.querySelector('.er-form-del-btn').addEventListener('click', () => row.remove());

      rowsContainer.appendChild(row);
    };

    initialAttrs.forEach(createRow);

    addRowBtn.addEventListener('click', () => createRow());

    submitBtn.addEventListener('click', () => {
      const logName = document.getElementById('er-form-logical-name').value.trim();
      const phyName = document.getElementById('er-form-physical-name').value.trim();
      if (!logName || !phyName) { showToast('論理名と物理名を入力してください'); return; }
      
      const nameRegex = /^[a-zA-Z0-9_]+$/;
      if (!nameRegex.test(phyName)) {
        showToast('テーブル物理名は半角英数字とアンダースコアのみ使用可能です');
        return;
      }

      const rows = rowsContainer.querySelectorAll('.er-form-row');
      const attrs = Array.from(rows).map(row => ({
        logicalName: row.querySelector('.er-form-logical-input').value.trim() || 'カラム',
        physicalName: row.querySelector('.er-form-physical-input').value.trim() || 'column',
        type: row.querySelector('.er-form-type-select').value,
        pk: row.querySelector('.pk').classList.contains('active'),
        fk: row.querySelector('.fk').classList.contains('active')
      }));

      if (attrs.some(a => !nameRegex.test(a.physicalName))) {
        showToast('カラム物理名は半角英数字とアンダースコアのみ使用可能です');
        return;
      }

      if (isEdit) {
        const oldState = { 
          logicalName: existingEntity.logicalName, 
          physicalName: existingEntity.physicalName, 
          attrs: JSON.parse(JSON.stringify(existingEntity.attrs)) 
        };
        existingEntity.logicalName = logName;
        existingEntity.physicalName = phyName;
        existingEntity.attrs = attrs;
        
        this.pushUndoAction({
          type: 'updateEntity',
          entityId: existingEntity.id,
          oldState: oldState
        });

        const el = document.getElementById(existingEntity.id);
        if (el) {
          el.querySelector('.er-entity-header').textContent = this.viewMode === 'logical' ? logName : phyName;
          el.querySelector('.er-entity-attrs').innerHTML = attrs.map(a => `<div class="er-attr">
            ${a.pk?'<span class="attr-key">PK</span>':''}${a.fk?'<span class="attr-key" style="color:#06b6d4">FK</span>':''}
            <span>${this.escapeHtml(this.viewMode === 'logical' ? a.logicalName : a.physicalName)}</span><span class="attr-type">${this.escapeHtml(a.type)}</span>
          </div>`).join('');
        }
        showToast('エンティティを更新しました');
      } else {
        const offset = this.entities.length * 30;
        this.addEntityAt(logName, phyName, attrs, 100 + offset, 100 + offset);
        showToast('エンティティを追加しました');
      }

      container.innerHTML = '';
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  }
  renderEntity(entity) {
    const el = document.createElement('div');
    el.className = 'er-entity';
    el.id = entity.id;
    el.style.left = entity.x + 'px';
    el.style.top = entity.y + 'px';
    
    el.innerHTML = `<div class="er-entity-header"></div><div class="er-entity-attrs"></div>`;
    el.querySelector('.er-entity-header').textContent = this.viewMode === 'logical' ? entity.logicalName : entity.physicalName;
    el.querySelector('.er-entity-attrs').innerHTML = entity.attrs.map(a => `<div class="er-attr">
      ${a.pk?'<span class="attr-key">PK</span>':''}${a.fk?'<span class="attr-key" style="color:#06b6d4">FK</span>':''}
      <span>${this.escapeHtml(this.viewMode === 'logical' ? a.logicalName : a.physicalName)}</span><span class="attr-type">${this.escapeHtml(a.type)}</span>
    </div>`).join('');

    let dragging = false, ox, oy;
    el.addEventListener('mousedown', e => {
      if (this.connectingFrom) {
        if (this.connectingFrom.id !== entity.id) {
          const label = prompt('リレーション (例: 1:N, N:M) [空でキャンセル]:', '1:N');
          if (label === null || label.trim() === '') {
            this.connectingFrom = null;
            document.querySelectorAll('.er-entity').forEach(el => el.classList.remove('selected'));
            return;
          }

          // 外部キーの自動追加
          if (label.includes('N') || label.includes('M') || label.includes('1:1')) {
             const parent = this.getEntityById(this.connectingFrom.id);
             if (parent) {
                const pk = parent.attrs.find(a => a.pk);
                if (pk) {
                   const fkLogicalName = parent.logicalName + 'ID';
                   const fkPhysicalName = parent.physicalName.replace(/s$/, '') + '_id';
                   if (!entity.attrs.find(a => a.physicalName === fkPhysicalName)) {
                      entity.attrs.push({
                         logicalName: fkLogicalName,
                         physicalName: fkPhysicalName,
                         type: pk.type,
                         pk: false,
                         fk: true
                      });
                      el.querySelector('.er-entity-attrs').innerHTML = entity.attrs.map(a => `<div class="er-attr">
                        ${a.pk?'<span class="attr-key">PK</span>':''}${a.fk?'<span class="attr-key" style="color:#06b6d4">FK</span>':''}
                        <span>${this.escapeHtml(this.viewMode === 'logical' ? a.logicalName : a.physicalName)}</span><span class="attr-type">${this.escapeHtml(a.type)}</span>
                      </div>`).join('');
                      showToast(`外部キー ${fkPhysicalName} を自動追加しました`);
                   }
                }
             }
          }

          this.relations.push({from: this.connectingFrom.id, to: entity.id, label});
          this.drawRelations();
          document.getElementById(this.connectingFrom.id)?.classList.remove('selected');
          this.pushUndoAction({
            type: 'removeRelation',
            from: this.connectingFrom.id,
            to: entity.id,
            label,
          });
          this.connectingFrom = null;
        }
        return;
      }
      dragging = true;
      this.selectEntity(entity, el);
      const dragStart = { x: entity.x, y: entity.y };
      let moved = false;
      ox = e.clientX - entity.x;
      oy = e.clientY - entity.y;
      e.preventDefault();
      const onMouseMove = event => {
        if (!dragging) return;
        const nextX = event.clientX - ox;
        const nextY = event.clientY - oy;
        if (nextX !== entity.x || nextY !== entity.y) moved = true;
        entity.x = nextX;
        entity.y = nextY;
        el.style.left = entity.x + 'px';
        el.style.top = entity.y + 'px';
        this.drawRelations();
      };
      const onMouseUp = () => {
        if (dragging && moved) {
          const maxX = this.canvas.clientWidth - el.offsetWidth;
          const maxY = this.canvas.clientHeight - el.offsetHeight;
          if (entity.x < -10 || entity.y < -10 || entity.x > maxX + 10 || entity.y > maxY + 10) {
            // スナップバック
            entity.x = dragStart.x;
            entity.y = dragStart.y;
            el.style.left = entity.x + 'px';
            el.style.top = entity.y + 'px';
            this.drawRelations();
            if (typeof showToast === 'function') showToast('キャンバスの領域外には配置できません');
          } else {
            this.pushUndoAction({
              type: 'moveEntity',
              entityId: entity.id,
              x: dragStart.x,
              y: dragStart.y,
            });
          }
        }
        dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    el.addEventListener('dblclick', () => {
      this.showEntityForm(entity);
    });
    this.canvas.appendChild(el);
  }
  selectEntity(entity, el) {
    this.canvas.querySelectorAll('.er-entity').forEach(e => e.classList.remove('selected'));
    this.selectedEntity = entity;
    el.classList.add('selected');

    // プロパティパネルを表示し、現在の値をセット
    const panel = document.getElementById('er-property-panel');
    if (panel) {
      panel.classList.add('visible');
      document.getElementById('er-prop-label').value = entity.logicalName;
      document.getElementById('er-prop-x').value = entity.x;
      document.getElementById('er-prop-y').value = entity.y;
    }
  }
  addRelation() {
    if (this.entities.length < 2) { showToast('エンティティを2つ以上追加してください'); return; }
    this.connectingFrom = null;
    showToast('接続元エンティティをクリックしてください');
    // Next click on entity will start connection
    const handler = () => {
      if (this.selectedEntity) {
        this.connectingFrom = this.selectedEntity;
        document.getElementById(this.selectedEntity.id)?.classList.add('selected');
        showToast('接続先エンティティをクリックしてください (余白クリックでキャンセル)');
        this.canvas.removeEventListener('mousedown', handler);

        // Setup dynamic line tracking
        this.activeConnectionLine = document.createElementNS('http://www.w3.org/2000/svg','line');
        this.activeConnectionLine.setAttribute('stroke','#f59e0b');
        this.activeConnectionLine.setAttribute('stroke-width','2');
        this.activeConnectionLine.setAttribute('stroke-dasharray','5,5');
        this.svg.appendChild(this.activeConnectionLine);

        const mouseMoveHandler = (e) => {
          if (!this.connectingFrom) {
            document.removeEventListener('mousemove', mouseMoveHandler);
            if (this.activeConnectionLine) {
              this.activeConnectionLine.remove();
              this.activeConnectionLine = null;
            }
            return;
          }
          const fromEl = document.getElementById(this.connectingFrom.id);
          if (!fromEl) return;
          const cr = this.canvas.getBoundingClientRect();
          const fr = fromEl.getBoundingClientRect();
          const cx1 = fr.left + fr.width/2 - cr.left;
          const cy1 = fr.top + fr.height/2 - cr.top;
          const x2 = e.clientX - cr.left;
          const y2 = e.clientY - cr.top;

          const p1 = this.getEdgePoint(fr, cx1, cy1, x2, y2);

          this.activeConnectionLine.setAttribute('x1', p1.x);
          this.activeConnectionLine.setAttribute('y1', p1.y);
          this.activeConnectionLine.setAttribute('x2', x2);
          this.activeConnectionLine.setAttribute('y2', y2);
        };
        document.addEventListener('mousemove', mouseMoveHandler);
      }
    };
    setTimeout(() => this.canvas.addEventListener('mousedown', handler), 100);
  }
  pushUndoAction(action) {
    if (this.isApplyingUndo || !action) return;
    this.undoHistory.push(action);
    this.redoStack = [];
    this.isDirty = true;
  }
  getEntityById(entityId) {
    return this.entities.find(entity => entity.id === entityId) || null;
  }
  removeEntityById(entityId) {
    const index = this.entities.findIndex(entity => entity.id === entityId);
    if (index < 0) return null;
    const [entity] = this.entities.splice(index, 1);
    const removedRelations = this.relations.filter(rel => rel.from === entityId || rel.to === entityId);
    this.relations = this.relations.filter(rel => rel.from !== entityId && rel.to !== entityId);
    const el = document.getElementById(entityId);
    if (el) el.remove();
    if (this.selectedEntity && this.selectedEntity.id === entityId) this.selectedEntity = null;
    if (this.connectingFrom && this.connectingFrom.id === entityId) this.connectingFrom = null;
    return { entity, removedRelations };
  }
  restoreSnapshot(snapshot) {
    if (!snapshot) return;
    this.entities = snapshot.entities.map(entity => ({ ...entity, attrs: entity.attrs.map(attr => ({ ...attr })) }));
    this.relations = snapshot.relations.map(rel => ({ ...rel }));
    this.entityIdCounter = snapshot.entityIdCounter;
    this.selectedEntity = null;
    this.connectingFrom = null;
    this.canvas.querySelectorAll('.er-entity').forEach(e => e.remove());
    this.svg.innerHTML = '';
    this.entities.forEach(entity => this.renderEntity(entity));
    this.drawRelations();
  }
  undoLastAction() {
    const action = this.undoHistory.pop();
    if (!action) {
      showToast('戻せる操作がありません');
      return;
    }
    this.redoStack.push(action);
    this.isApplyingUndo = true;
    try {
      if (action.type === 'removeEntity') {
        this.removeEntityById(action.entityId);
        this.entityIdCounter = action.entityIdCounter;
      } else if (action.type === 'moveEntity') {
        const entity = this.getEntityById(action.entityId);
        if (entity) {
          entity.x = action.x; entity.y = action.y;
          const el = document.getElementById(entity.id);
          if (el) { el.style.left = entity.x + 'px'; el.style.top = entity.y + 'px'; }
        }
      } else if (action.type === 'updateEntity') {
        const entity = this.getEntityById(action.entityId);
        if (entity) {
          entity.logicalName = action.oldState.logicalName;
          entity.physicalName = action.oldState.physicalName;
          entity.attrs = action.oldState.attrs;
          this.renderEntityContent(entity);
        }
      } else if (action.type === 'removeRelation') {
        this.relations = this.relations.filter(rel => !(rel.from === action.from && rel.to === action.to));
      } else if (action.type === 'clearAll') {
        this.restoreSnapshot(action.snapshot);
      }
      this.drawRelations();
      showToast('元に戻しました');
    } finally {
      this.isApplyingUndo = false;
    }
  }

  renderEntityContent(entity) {
    const el = document.getElementById(entity.id);
    if (!el) return;
    el.querySelector('.er-entity-header').textContent = this.viewMode === 'logical' ? entity.logicalName : entity.physicalName;
    el.querySelector('.er-entity-attrs').innerHTML = entity.attrs.map(a => `<div class="er-attr">
      ${a.pk?'<span class="attr-key">PK</span>':''}${a.fk?'<span class="attr-key" style="color:#06b6d4">FK</span>':''}
      <span>${this.escapeHtml(this.viewMode === 'logical' ? a.logicalName : a.physicalName)}</span><span class="attr-type">${this.escapeHtml(a.type)}</span>
    </div>`).join('');
  }
  drawRelations() {
    this.svg.innerHTML = `
      <defs>
        <marker id="er-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" fill="var(--accent, #06b6d4)">
          <polygon points="0 0,10 3.5,0 7"/>
        </marker>
      </defs>`;
      
    this.relations.forEach(rel => {
      const fromEl = document.getElementById(rel.from);
      const toEl = document.getElementById(rel.to);
      if (!fromEl || !toEl) return;
      const cr = this.canvas.getBoundingClientRect();
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const cx1 = fr.left + fr.width/2 - cr.left;
      const cy1 = fr.top + fr.height/2 - cr.top;
      const cx2 = tr.left + tr.width/2 - cr.left;
      const cy2 = tr.top + tr.height/2 - cr.top;
      
      const p1 = this.getEdgePoint(fr, cx1, cy1, cx2, cy2);
      const p2 = this.getEdgePoint(tr, cx2, cy2, cx1, cy1);
      
      const x1 = p1.x;
      const y1 = p1.y;
      const x2 = p2.x;
      const y2 = p2.y;
      
      let startMarker = '';
      let endMarker = ''; // シンプルにするためマーカーなし。必要なら 'url(#er-arrow)' を設定できます。

      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.style.cursor = 'pointer';
      
      const hitbox = document.createElementNS('http://www.w3.org/2000/svg','line');
      hitbox.setAttribute('x1',x1); hitbox.setAttribute('y1',y1);
      hitbox.setAttribute('x2',x2); hitbox.setAttribute('y2',y2);
      hitbox.setAttribute('stroke','transparent'); hitbox.setAttribute('stroke-width','15');
      g.appendChild(hitbox);

      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',x1); line.setAttribute('y1',y1);
      line.setAttribute('x2',x2); line.setAttribute('y2',y2);
      line.setAttribute('stroke','var(--accent, #06b6d4)'); line.setAttribute('stroke-width','2');
      if (startMarker) line.setAttribute('marker-start', startMarker);
      if (endMarker) line.setAttribute('marker-end', endMarker);
      line.setAttribute('opacity','0.6');
      g.appendChild(line);

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x',(x1+x2)/2+8); text.setAttribute('y',(y1+y2)/2-8);
      text.setAttribute('fill','var(--accent, #06b6d4)'); text.setAttribute('font-size','12');
      text.setAttribute('font-family','Inter,sans-serif');
      text.textContent = rel.label;
      g.appendChild(text);

      g.addEventListener('click', (e) => {
        e.stopPropagation();
        const newLabel = prompt('リレーション (例: 1:N, N:M) [空で削除]:', rel.label);
        if (newLabel !== null) {
          if (newLabel.trim() === '') {
            this.pushUndoAction({ type: 'restoreRelation', relation: { ...rel } });
            this.relations = this.relations.filter(r => r !== rel);
          } else {
            this.pushUndoAction({ type: 'updateRelation', oldState: { ...rel }, newState: { ...rel, label: newLabel } });
            rel.label = newLabel;
          }
          this.drawRelations();
        }
      });
      g.addEventListener('mouseenter', () => { line.setAttribute('opacity','1'); line.setAttribute('stroke-width','3'); });
      g.addEventListener('mouseleave', () => { line.setAttribute('opacity','0.6'); line.setAttribute('stroke-width','2'); });

      this.svg.appendChild(g);
    });
  }
  clearAll() {
    const performClear = () => {
      const snapshot = {
        entities: this.entities.map(entity => ({ ...entity, attrs: entity.attrs.map(attr => ({ ...attr })) })),
        relations: this.relations.map(rel => ({ ...rel })),
        entityIdCounter: this.entityIdCounter,
      };
      this.entities = []; this.relations = []; this.entityIdCounter = 0;
      this.canvas.querySelectorAll('.er-entity').forEach(e => e.remove());
      this.svg.innerHTML = '';
      if (window.DBIO) window.DBIO.resetCurrentDiagram();
      this.pushUndoAction({ type: 'clearAll', snapshot });
      this.isDirty = false;
      showToast('E-R図をクリアしました');
    };

    if (this.isDirty) {
      if (typeof showConfirm !== 'undefined') {
        showConfirm(
          '未保存の変更',
          '未保存の変更があります。<br>変更を保存し、新規作成しますか？',
          () => {
            if (typeof this.saveDiagram === 'function') {
              this.saveDiagram().then((saved) => { if (saved) performClear(); });
            } else {
              performClear();
            }
          },
          'はい',
          'いいえ'
        );
      } else {
        if (confirm('未保存の変更があります。\n変更を保存し、新規作成しますか？\n(OKで保存後にクリア、キャンセルで保存せずクリア)')) {
          if (typeof this.saveDiagram === 'function') this.saveDiagram().then((saved) => { if (saved) performClear(); });
          else performClear();
        } else {
          performClear();
        }
      }
    } else {
      if (typeof showConfirm !== 'undefined') {
        showConfirm('E-R図のクリア', 'E-R図をクリアします。よろしいですか？', performClear, 'はい', 'いいえ');
      } else {
        if (confirm('E-R図をクリアします。よろしいですか？')) performClear();
      }
    }
  }
  exportSVG() {
    FileIO.exportSVG(this);
  }

  exportJSON() {
    FileIO.exportJSON(this);
  }

  importJSON() {
    FileIO.importJSON(this);
  }

  importJSONFromText() {
    FileIO.importJSONFromText(this);
  }

  getEdgePoint(rect, cx, cy, targetX, targetY) {
    const w = rect.width / 2;
    const h = rect.height / 2;
    const dx = targetX - cx;
    const dy = targetY - cy;
    
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    
    const slope = dy / dx;
    const rectSlope = h / w;
    
    let x, y;
    if (Math.abs(slope) <= rectSlope) {
      x = dx > 0 ? cx + w : cx - w;
      y = cy + slope * (x - cx);
    } else {
      y = dy > 0 ? cy + h : cy - h;
      x = cx + (y - cy) / slope;
    }
    return { x, y };
  }
}
