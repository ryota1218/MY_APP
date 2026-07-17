class PropertyPanelManager {
  constructor(diagram) {
    this.diagram = diagram;
    this.propertyPanelNode = null;
    this.initPropertyPanel();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  initPropertyPanel() {
    const panel = document.getElementById(this.diagram.prefix + '-property-panel');
    if (!panel) return;

    const bindInput = (suffix, prop, parser = String) => {
      const el = document.getElementById(this.diagram.prefix + '-prop-' + suffix);
      if (el) {
        const handler = (e) => {
          if (this.propertyPanelNode) {
            this.propertyPanelNode[prop] = parser(e.target.value);
            if (this.propertyPanelNode.from !== undefined) {
              this.diagram.drawConnections();
            } else {
              this.diagram.updateNodeDOM(this.propertyPanelNode);
            }
          }
        };
        el.addEventListener('input', handler);
        if (el.tagName === 'SELECT') {
          el.addEventListener('change', handler);
        }
      }
    };
    bindInput('label', 'label');
    bindInput('x', 'x', Number);
    bindInput('y', 'y', Number);
    bindInput('fontsize', 'textSize', Number);
    bindInput('connfontsize', 'textSize', Number);
    // fontsize専用：プロパティパネル → ツールバーへの同期
    const fontsizeEl = document.getElementById(this.diagram.prefix + '-prop-fontsize');
    if (fontsizeEl) {
      fontsizeEl.addEventListener('input', () => {
        if (this.diagram.fontSizeControl) {
          const val = fontsizeEl.value;
          if (val) {
            let exists = Array.from(this.diagram.fontSizeControl.options).some(o => o.value === val);
            if (!exists) {
              const opt = document.createElement('option');
              opt.value = val;
              opt.text = val;
              this.diagram.fontSizeControl.appendChild(opt);
            }
          }
          this.diagram.fontSizeControl.value = val;
        }
      });
    }

    bindInput('routing', 'routing');
    bindInput('linestyle', 'lineStyle');
    bindInput('fragtype', 'fragmentType');
    bindInput('fraglabel', 'fragmentLabel');
    bindInput('timingval', 'timingValue');
    bindInput('timingtext', 'timingValue');
    bindInput('multFrom', 'multiplicityFrom');
    bindInput('multTo', 'multiplicityTo');
    bindInput('subtexttop', 'subtextTop');
    bindInput('subtextbottom', 'subtextBottom');
    bindInput('arrowdir', 'arrowDirection');
    bindInput('conntype', 'connType');

    const conntypeEl = document.getElementById(this.diagram.prefix + '-prop-conntype');
    if (conntypeEl) {
      conntypeEl.addEventListener('change', () => {
        if (!this.propertyPanelNode) return;
        const conn = this.propertyPanelNode;
        const type = conntypeEl.value;

        // portProtocol（ポートラベル）を自動設定
        const portLabels = {
          include: '<<include>>',
          extend:  '<<extend>>',
          dependency: '<<use>>',
        };
        if (portLabels[type] !== undefined) {
          conn.portProtocol = portLabels[type];
        } else {
          // association / aggregation / composition は空にリセット
          conn.portProtocol = '';
        }

        // ポート入力欄のUIへの反映
        const portEl = document.getElementById(this.diagram.prefix + '-prop-port-center');
        if (portEl) portEl.value = conn.portProtocol;

        // 線スタイルを自動切替（include/extend/dependency は破線、その他は実線）
        const dashedTypes = ['include', 'extend', 'dependency'];
        conn.lineStyle = dashedTypes.includes(type) ? 'dashed' : 'solid';

        // 線スタイルUIの同期
        const lineStyleEl = document.getElementById(this.diagram.prefix + '-prop-linestyle');
        if (lineStyleEl) lineStyleEl.value = conn.lineStyle;

        this.diagram.drawConnections();
        if (this.diagram.saveState) this.diagram.saveState();
      });
    }
    // プロパティパネルのカラーピッカー初期化
    this.initPropertyPanelColorPicker('textcolor', 'textColor');
    this.initPropertyPanelColorPicker('color', 'color');
  }

  initPropertyPanelColorPicker(suffix, nodeProp) {
    const pickerEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-picker');
    const menuEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-menu');
    const themeRowEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-theme-row');
    const shadeGridEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-shade-grid');
    const standardRowEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-standard-row');
    const otherBtn = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-other-btn');
    const sampleEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-sample');
    const textEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-text');

    if (!pickerEl || !menuEl) return;

    // カラーパレット構築
    const themeColors = [
      { label: '黒', color: '#111111', shades: ['#f3f4f6', '#d1d5db', '#6b7280', '#111111'] },
      { label: '赤', color: '#ef4444', shades: ['#fee2e2', '#fca5a5', '#ef4444', '#991b1b'] },
      { label: '灰', color: '#9ca3af', shades: ['#f3f4f6', '#d1d5db', '#9ca3af', '#4b5563'] },
      { label: '青', color: '#3b82f6', shades: ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'] },
      { label: '水色', color: '#60a5fa', shades: ['#dbeafe', '#bfdbfe', '#60a5fa', '#2563eb'] },
      { label: '橙', color: '#f97316', shades: ['#ffedd5', '#fdba74', '#f97316', '#c2410c'] },
      { label: '銀', color: '#a3a3a3', shades: ['#f5f5f5', '#e5e7eb', '#a3a3a3', '#525252'] },
      { label: '黄', color: '#facc15', shades: ['#fef9c3', '#fde68a', '#facc15', '#ca8a04'] },
      { label: '青系', color: '#60a5fa', shades: ['#eff6ff', '#dbeafe', '#60a5fa', '#1d4ed8'] },
      { label: '緑', color: '#84cc16', shades: ['#ecfccb', '#bef264', '#84cc16', '#3f6212'] },
    ];
    const standardColors = ['#dc2626', '#ff0000', '#f59e0b', '#ffea00', '#84cc16', '#10b981', '#06b6d4', '#0284c7', '#1d4ed8', '#7c3aed'];

    if (themeRowEl) {
      themeRowEl.innerHTML = themeColors.map(item => `
        <button type="button" class="diagram-color-option" data-color="${item.color}" data-label="${item.label}">
          <span class="diagram-color-option-swatch" style="background:${item.color}"></span>
        </button>
      `).join('');
    }

    if (shadeGridEl) {
      shadeGridEl.innerHTML = themeColors.map(item => `
        <div class="diagram-color-shade-column" data-label="${item.label}">
          ${item.shades.map((shade, index) => `<button type="button" class="diagram-color-shade-option" data-color="${shade}" data-label="${item.label} ${index + 1}" style="background:${shade}"></button>`).join('')}
        </div>
      `).join('');
    }

    if (standardRowEl) {
      standardRowEl.innerHTML = standardColors.map((color, index) => `
        <button type="button" class="diagram-color-option" data-color="${color}" data-label="標準 ${index + 1}">
          <span class="diagram-color-option-swatch" style="background:${color}"></span>
        </button>
      `).join('');
    }

    // カラーイベント
    menuEl.addEventListener('click', e => {
      const option = e.target.closest('[data-color]');
      if (!option) return;
      const selectedColor = option.dataset.color || '';
      if (!this.propertyPanelNode) return;
      this.propertyPanelNode[nodeProp] = selectedColor;
      this.diagram.updateNodeDOM(this.propertyPanelNode);
      this.refreshPropertyPanelColorButton(suffix, nodeProp);
      // textcolorの場合、ツールバーも更新
      if (suffix === 'textcolor') {
        this.diagram.setTextColor(selectedColor);
        this.diagram.refreshTextColorButton(selectedColor || this.diagram.defaultTextStyle.color);
      }
      pickerEl.open = false;
    });

    // その他の色ボタン（ネイティブカラーピッカー）
    if(otherBtn) {
      const inputId = this.diagram.prefix + '-native-' + suffix;
      let nativeColorInput = document.getElementById(inputId);

      if (!nativeColorInput) {
        nativeColorInput = document.createElement('input');
        nativeColorInput.id = inputId;
        nativeColorInput.type = 'color';
        nativeColorInput.value = '#e5e7eb';
        nativeColorInput.style.display = 'none';
        document.body.appendChild(nativeColorInput);
      }

      otherBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        nativeColorInput.value = this.propertyPanelNode && this.propertyPanelNode[nodeProp] ? this.propertyPanelNode[nodeProp] : '#e5e7eb';
        nativeColorInput.click();
      });

      nativeColorInput.addEventListener('change', () => {
        const selectedColor = nativeColorInput.value;
        if (!this.propertyPanelNode) return;
        this.propertyPanelNode[nodeProp] = selectedColor;
        this.diagram.updateNodeDOM(this.propertyPanelNode);
        this.refreshPropertyPanelColorButton(suffix, nodeProp);
        // textcolorの場合、ツールバーも更新
        if (suffix === 'textcolor') {
          this.diagram.setTextColor(selectedColor);
          this.diagram.refreshTextColorButton(selectedColor || this.diagram.defaultTextStyle.color);
        }
        pickerEl.open = false;
      });
    }

    // クリックで閉じる
    document.addEventListener('click', e => {
      if (!pickerEl.contains(e.target)) {
        pickerEl.open = false;
      }
    });
  }

  refreshPropertyPanelColorButton(suffix, nodeProp) {
    const sampleEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-sample');
    const textEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-text');
    const menuEl = document.getElementById(this.diagram.prefix + '-prop-' + suffix + '-menu');

    if (!this.propertyPanelNode || !sampleEl || !textEl) return;

    const color = this.propertyPanelNode[nodeProp] || '';
    const isAuto = !color;
    const displayColor = isAuto ? '#e5e7eb' : color;

    sampleEl.style.background = displayColor;

    if (menuEl) {
      const activeOption = isAuto ? menuEl.querySelector('.diagram-color-auto-row') : menuEl.querySelector(`.diagram-color-option[data-color="${color}"]`);
      textEl.textContent = activeOption?.dataset.label || (isAuto ? '自動' : color);
    }
  }

  openPropertyPanel(node) {
    this.propertyPanelNode = node;
    const isConn = node && node.from !== undefined;
    const isNode = node && node.from === undefined;

    // パネル項目の表示切り替え（タイミング図などの設定）
    const routingGroup = document.getElementById(this.diagram.prefix + '-prop-group-routing');
    if (routingGroup) routingGroup.style.display = isConn ? '' : 'none';
    const linestyleGroup = document.getElementById(this.diagram.prefix + '-prop-group-linestyle');
    if (linestyleGroup) linestyleGroup.style.display = isConn ? '' : 'none';
    const multFromGroup = document.getElementById(this.diagram.prefix + '-prop-group-multFrom');
    if (multFromGroup) multFromGroup.style.display = isConn ? '' : 'none';
    const multToGroup = document.getElementById(this.diagram.prefix + '-prop-group-multTo');
    if (multToGroup) multToGroup.style.display = isConn ? '' : 'none';
    const fragmentGroup = document.getElementById(this.diagram.prefix + '-prop-group-fragment');
    if (fragmentGroup) fragmentGroup.style.display = (node && node.behaviorType === 'fragment') ? '' : 'none';
    const timingGroup = document.getElementById(this.diagram.prefix + '-prop-group-timing');
    if (timingGroup) timingGroup.style.display = (node && (node.behaviorType === 'stateTimeline' || node.behaviorType === 'valueTimeline')) ? '' : 'none';
    
    const nodeOnlyGroup = document.getElementById(this.diagram.prefix + '-prop-group-node-only');
    if (nodeOnlyGroup) nodeOnlyGroup.style.display = isNode ? '' : 'none';
    const connOnlyGroup = document.getElementById(this.diagram.prefix + '-prop-group-conn-only');
    if (connOnlyGroup) connOnlyGroup.style.display = isConn ? '' : 'none';
    const conntypeGroup = document.getElementById(this.diagram.prefix + '-prop-group-conntype');
    if (conntypeGroup) conntypeGroup.style.display = isConn ? '' : 'none';

    const panel = document.getElementById(this.diagram.prefix + '-property-panel');
    if (panel) panel.classList.add('open');

    // 押し出し式連動: 右のプロパティが開いたら左のサイドバーを隠し、右のチャットも閉じる
    document.body.classList.add('sidebar-collapsed');
    const aiPanel = document.getElementById(this.diagram.prefix + '-ai-chat-panel');
    if (aiPanel) aiPanel.classList.remove('open');

    // Populate fields
    const setVal = (suffix, val) => {
      const el = document.getElementById(this.diagram.prefix + '-prop-' + suffix);
      if (el) el.value = val;
    };

    const gridToggleBtn = document.getElementById(this.diagram.prefix + '-grid-toggle');
    if (gridToggleBtn) {
      gridToggleBtn.addEventListener('click', () => {
        this.diagram.isGridVisible = !this.diagram.isGridVisible;
        if (this.diagram.viewport) {
          this.diagram.viewport.classList.toggle('grid-active', this.diagram.isGridVisible);
        } else {
          this.diagram.canvas.classList.toggle('grid-active', this.diagram.isGridVisible);
        }
      });
    }

    if (isNode) {
      setVal('label', node.label || '');
      setVal('subtexttop', node.subtextTop || '');
      setVal('subtextbottom', node.subtextBottom || '');

      // アクティビティ図専用のUI調整
      const isActivity = this.diagram.umlType === 'activity';
      const topGroup = document.getElementById(this.diagram.prefix + '-prop-subtexttop')?.closest('.property-group');
      const bottomGroup = document.getElementById(this.diagram.prefix + '-prop-subtextbottom')?.closest('.property-group');
      if (topGroup) topGroup.style.display = isActivity ? 'none' : '';
      if (bottomGroup) bottomGroup.style.display = isActivity ? 'none' : '';

      const labelInput = document.getElementById(this.diagram.prefix + '-prop-label');
      if (labelInput) {
        const labelTextEl = labelInput.closest('.property-group')?.querySelector('label');
        if (isActivity && (node.behaviorType === 'decision' || node.behaviorType === 'merge')) {
          if (labelTextEl) labelTextEl.textContent = "判定条件 (メイン名)";
          labelInput.placeholder = "例: 休日か";
        } else {
          if (labelTextEl) labelTextEl.textContent = "名前 (メイン名)";
          labelInput.placeholder = "";
        }
      }
      setVal('x', node.x);
      setVal('y', node.y);
      setVal('fontsize', node.textSize || this.diagram.defaultTextStyle.fontSize);

      // カラーボタンの表示を更新（新方式）
      this.refreshPropertyPanelColorButton('textcolor', 'textColor');
      this.refreshPropertyPanelColorButton('color', 'color');

      // タイミング図やフラグメント専用の設定
      if (node.behaviorType === 'fragment') {
        setVal('fragtype', node.fragmentType || 'alt');
        setVal('fraglabel', node.fragmentLabel || '');
      }
      if (node.behaviorType === 'stateTimeline' || node.behaviorType === 'valueTimeline') {
        const val = node.timingValue || 'High';
        setVal('timingval', (val === 'High' || val === 'Low') ? val : 'Other');
        setVal('timingtext', val);
      }
    } else if (isConn) {
      // 線（コネクション）を選択した場合
      setVal('label', node.label || '');
      setVal('arrowdir', node.arrowDirection || 'default');
      setVal('routing', node.routing || 'straight');
      setVal('linestyle', node.lineStyle || 'solid');
      setVal('multFrom', node.multiplicityFrom || '');
      setVal('multTo', node.multiplicityTo || '');
      setVal('conntype', node.connType || 'association');
      setVal('connfontsize', node.textSize || 11);

      // ポートモード初期化
      if (!node.portMode) {
        node.portMode = node.portFrom || node.portTo ? 'dual' : 'single';
      }

      const singleView = document.getElementById(this.diagram.prefix + '-prop-port-single-view');
      const dualView = document.getElementById(this.diagram.prefix + '-prop-port-dual-view');
      
      const updatePortModeUI = () => {
        if (singleView) singleView.style.display = node.portMode === 'single' ? 'block' : 'none';
        if (dualView) dualView.style.display = node.portMode === 'dual' ? 'block' : 'none';
      };

      updatePortModeUI();

      // 値をセット
      const inputCenter = document.getElementById(this.diagram.prefix + '-prop-port-center');
      const inputFrom = document.getElementById(this.diagram.prefix + '-prop-port-from');
      const inputTo = document.getElementById(this.diagram.prefix + '-prop-port-to');

      if (inputCenter) inputCenter.value = node.portProtocol || '';
      if (inputFrom) inputFrom.value = node.portFrom || '';
      if (inputTo) inputTo.value = node.portTo || '';

      // イベントリスナー (蓄積を防ぐためcloneNode)
      const setupInput = (el, propName) => {
        if (!el) return;
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('input', (e) => {
          node[propName] = e.target.value;
          this.diagram.drawConnections();
        });
      };

      setupInput(inputCenter, 'portProtocol');
      setupInput(inputFrom, 'portFrom');
      setupInput(inputTo, 'portTo');

      // モード切り替えボタン
      const switchDualBtn = document.getElementById(this.diagram.prefix + '-prop-switch-dual-btn');
      if (switchDualBtn) {
        const newBtn = switchDualBtn.cloneNode(true);
        switchDualBtn.parentNode.replaceChild(newBtn, switchDualBtn);
        newBtn.addEventListener('click', () => {
          node.portMode = 'dual';
          if (node.portProtocol && !node.portTo) {
            node.portTo = node.portProtocol;
            const toEl = document.getElementById(this.diagram.prefix + '-prop-port-to');
            if (toEl) toEl.value = node.portTo;
          }
          updatePortModeUI();
          this.diagram.drawConnections();
        });
      }

      const switchSingleBtn = document.getElementById(this.diagram.prefix + '-prop-switch-single-btn');
      if (switchSingleBtn) {
        const newBtn = switchSingleBtn.cloneNode(true);
        switchSingleBtn.parentNode.replaceChild(newBtn, switchSingleBtn);
        newBtn.addEventListener('click', () => {
          node.portMode = 'single';
          updatePortModeUI();
          this.diagram.drawConnections();
        });
      }

      updatePortModeUI();

      // 線の場合の色更新（線の色変更用）
      this.refreshPropertyPanelColorButton('color', 'color');
    }


    // --- クラスボックス専用フィールドの動的生成 ---
    const panelBody = panel?.querySelector('.property-panel-body');
    // 以前の動的フィールドを削除
    panelBody?.querySelectorAll('.uml-class-prop-group').forEach(g => g.remove());

    // class-box, object-box の場合: フォントサイズ・文字色フィールドを非表示にする
    const fontsizeGroup = document.getElementById(this.diagram.prefix + '-prop-fontsize')?.closest('.property-group');
    const textcolorGroup = document.getElementById(this.diagram.prefix + '-prop-textcolor')?.closest('.property-group');
    const labelGroup = document.getElementById(this.diagram.prefix + '-prop-label')?.closest('.property-group');
    
    const isClassOrObjectBox = node.nodeType === 'class-box' || node.nodeType === 'object-box';
    if (fontsizeGroup) fontsizeGroup.style.display = isClassOrObjectBox ? 'none' : '';
    if (textcolorGroup) textcolorGroup.style.display = isClassOrObjectBox ? 'none' : '';
    if (labelGroup) labelGroup.style.display = node.nodeType === 'object-box' ? 'none' : '';

    if (isClassOrObjectBox && panelBody) {
      const deleteBtn = panelBody.querySelector('[data-action="deleteSelectedNode"]');

      if (node.nodeType === 'object-box') {
        let objName = '';
        let className = '';
        if (node.label) {
          const parts = node.label.split(':').map(s => s.trim());
          if (parts.length > 1) {
            objName = parts[0];
            className = parts.slice(1).join(':').trim();
          } else {
            // No colon, so it's just an object name
            objName = parts[0];
          }
        }
        
        const nameGroup = document.createElement('div');
        nameGroup.className = 'property-group uml-class-prop-group';
        nameGroup.innerHTML = `
          <div style="display: flex; gap: 10px; margin-bottom: 5px;">
            <div style="flex: 1;">
              <label>オブジェクト名 <span class="prop-hint">(任意)</span></label>
              <input type="text" class="property-input" id="${this.diagram.prefix}-prop-obj-name" value="${this.escapeHtml(objName)}" placeholder="例: taro">
            </div>
            <div style="flex: 1;">
              <label>クラス名 <span class="prop-hint">(任意)</span></label>
              <input type="text" class="property-input" id="${this.diagram.prefix}-prop-class-name" value="${this.escapeHtml(className)}" placeholder="例: User">
            </div>
          </div>
          <div class="prop-hint" id="${this.diagram.prefix}-prop-name-preview" style="font-weight: bold; margin-bottom: 10px;">
            プレビュー: <span style="text-decoration: underline;">(未入力)</span>
          </div>
        `;
        panelBody.insertBefore(nameGroup, deleteBtn);
        
        const objInput = nameGroup.querySelector(`#${this.diagram.prefix}-prop-obj-name`);
        const classInput = nameGroup.querySelector(`#${this.diagram.prefix}-prop-class-name`);
        const preview = nameGroup.querySelector(`#${this.diagram.prefix}-prop-name-preview span`);
        
        const updateLabel = () => {
          const o = objInput.value.trim();
          const c = classInput.value.trim();
          let newLabel = '';
          if (o && c) newLabel = `${o} : ${c}`;
          else if (c) newLabel = `: ${c}`;
          else if (o) newLabel = o;
          
          preview.textContent = newLabel || '(未入力)';
          if (!this.propertyPanelNode) return;
          this.propertyPanelNode.label = newLabel;
          this.diagram.updateNodeDOM(this.propertyPanelNode);
        };
        
        objInput.addEventListener('input', updateLabel);
        classInput.addEventListener('input', updateLabel);
        updateLabel(); // 初期表示更新
      }

      if (node.nodeType === 'class-box') {
        // ステレオタイプ
        const stereoGroup = document.createElement('div');
        stereoGroup.className = 'property-group uml-class-prop-group';
        stereoGroup.innerHTML = `<label>ステレオタイプ</label>
            <input type="text" class="property-input" value="${this.escapeHtml(node.stereotype || '')}" placeholder="例: «interface»">`;
        panelBody.insertBefore(stereoGroup, deleteBtn);
        stereoGroup.querySelector('input').addEventListener('input', e => {
          if (!this.propertyPanelNode) return;
          this.propertyPanelNode.stereotype = e.target.value;
          this.diagram.updateNodeDOM(this.propertyPanelNode);
        });
      }

      // 属性 / スロット
      const attrGroup = document.createElement('div');
      attrGroup.className = 'property-group uml-class-prop-group';
      if (node.nodeType === 'class-box') {
        attrGroup.innerHTML = `<label>属性 <span class="prop-hint">(1行1属性)</span></label>
            <textarea class="property-input property-textarea" rows="4" placeholder="-属性名 : 型">${(node.attributes || []).join('\n')}</textarea>`;
      } else {
        attrGroup.innerHTML = `<label>スロット (属性の現在値) <span class="prop-hint">(1行1スロット)</span></label>
            <textarea class="property-input property-textarea" rows="4" placeholder="age = 25">${(node.attributes || []).join('\n')}</textarea>`;
      }
      panelBody.insertBefore(attrGroup, deleteBtn);
      attrGroup.querySelector('textarea').addEventListener('input', e => {
        if (!this.propertyPanelNode) return;
        this.propertyPanelNode.attributes = e.target.value.split('\n').filter(l => l.trim() !== '');
        this.diagram.updateNodeDOM(this.propertyPanelNode);
      });

      if (node.nodeType === 'class-box') {
        // 操作
        const methodGroup = document.createElement('div');
        methodGroup.className = 'property-group uml-class-prop-group';
        methodGroup.innerHTML = `<label>操作 <span class="prop-hint">(1行1操作)</span></label>
            <textarea class="property-input property-textarea" rows="4" placeholder="+操作名() : 戻り値型">${(node.methods || []).join('\n')}</textarea>`;
        panelBody.insertBefore(methodGroup, deleteBtn);
        methodGroup.querySelector('textarea').addEventListener('input', e => {
          if (!this.propertyPanelNode) return;
          this.propertyPanelNode.methods = e.target.value.split('\n').filter(l => l.trim() !== '');
          this.diagram.updateNodeDOM(this.propertyPanelNode);
        });
      }
    }

    // Focus and select the label input
    setTimeout(() => {
      const labelInput = document.getElementById(this.diagram.prefix + '-prop-label');
      if (labelInput) {
        labelInput.focus({ preventScroll: true });
        labelInput.select();
        
        // アクティビティ図の判定ノードで、デフォルト名なら自動クリアして即座に入力可能にする
        const isActivity = this.diagram.umlType === 'activity';
        const isDecisionNode = node && (node.behaviorType === 'decision' || node.behaviorType === 'merge');
        if (isActivity && isDecisionNode && (labelInput.value === '判定/分岐' || labelInput.value === '合流')) {
          labelInput.value = '';
          labelInput.dispatchEvent(new Event('input'));
        }
      }
    }, 300);
  }

  closePropertyPanel() {
    this.propertyPanelNode = null;
    const panel = document.getElementById(this.diagram.prefix + '-property-panel');
    if (panel) panel.classList.remove('open');

    // 押し出し式連動: チャットパネルも閉じていれば、左のサイドバーを復元する
    const aiPanel = document.getElementById(this.diagram.prefix + '-ai-chat-panel');
    const isAIChatOpen = aiPanel && aiPanel.classList.contains('open');
    if (!isAIChatOpen) {
      if (document.body.dataset.sidebarCollapsedByUser !== 'true') {
        document.body.classList.remove('sidebar-collapsed');
      }
    }
  }
}

window.PropertyPanelManager = PropertyPanelManager;
