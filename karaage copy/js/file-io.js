/**
 * Diagram File I/O
 * Handles export/import of SVG and JSON formats for diagrams.
 */
const FileIO = {
  /**
   * エディタキャンバスをSVGとしてダウンロード
   */
  exportSVG(diagramInstance) {
    if (!diagramInstance.svg || !diagramInstance.canvas) return;
    try {
      const svgClone = diagramInstance.svg.cloneNode(true);
      const w = diagramInstance.canvas.offsetWidth, h = diagramInstance.canvas.offsetHeight;
      svgClone.setAttribute('width', w);
      svgClone.setAttribute('height', h);
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', '100%');
      bg.setAttribute('height', '100%');
      bg.setAttribute('fill', getComputedStyle(document.body).getPropertyValue('--bg-main').trim() || '#0f172a');
      svgClone.insertBefore(bg, svgClone.firstChild);

      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgClone);
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (diagramInstance.prefix || 'diagram') + '_export.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (typeof showToast === 'function') showToast('SVGをエクスポートしました');
    } catch (e) {
      console.error('SVG Export Error:', e);
      if (typeof showToast === 'function') showToast('SVGのエクスポートに失敗しました', 'error');
    }
  },

  /**
   * ダイアグラムのデータをJSONとしてダウンロード
   */
  exportJSON(diagramInstance) {
    try {
      const data = {
        diagramType: diagramInstance.umlType || diagramInstance.diagramType || diagramInstance.prefix || 'diagram',
        nodes: diagramInstance.nodes || [],
        connections: diagramInstance.connections || [],
        elements: diagramInstance.elements || [] // For layout.js
      };
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (diagramInstance.prefix || 'diagram') + '_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (typeof showToast === 'function') showToast('JSONをエクスポートしました');
    } catch (e) {
      console.error('JSON Export Error:', e);
      if (typeof showToast === 'function') showToast('JSONのエクスポートに失敗しました', 'error');
    }
  },

  /**
   * JSONファイルを選択して読み込む
   */
  importJSON(diagramInstance) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          this._applyImportData(diagramInstance, data);
          if (typeof showToast === 'function') showToast('ファイルをインポートしました');
        } catch (err) {
          console.error('JSON Import Error:', err);
          if (typeof showToast === 'function') showToast('ファイルの読み込みに失敗しました', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  /**
   * 入力フォーム（モーダル）を開いてJSONテキストを読み込む
   */
  importJSONFromText(diagramInstance) {
    let modal = document.getElementById('json-import-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'json-import-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; width: 90%;">
          <h3>JSONデータのインポート</h3>
          <p style="margin-bottom:10px;font-size:14px;color:var(--text-secondary);">エクスポートしたJSONデータ、またはAIが生成したJSONを貼り付けてください。</p>
          <textarea id="json-import-textarea" class="property-textarea" style="width:100%;height:300px;font-family:monospace;background:var(--bg-main);border:1px solid var(--border-color);color:var(--text-main);padding:10px;resize:vertical;" placeholder='{ "diagramType": "...", "nodes": [...], "connections": [...] }'></textarea>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:15px;">
            <button id="json-import-file-btn" class="btn btn-secondary" style="display:flex;align-items:center;gap:4px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              ファイルを選択
            </button>
            <div style="display:flex;gap:10px;">
              <button id="json-import-cancel" class="btn btn-secondary">キャンセル</button>
              <button id="json-import-submit" class="btn btn-primary">インポート実行</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Styles for modal if not exists
      if (!document.getElementById('file-io-styles')) {
        const style = document.createElement('style');
        style.id = 'file-io-styles';
        style.textContent = `
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000; }
          .modal-content { background: var(--bg-secondary); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        `;
        document.head.appendChild(style);
      }
    }

    modal.style.display = 'flex';
    const textarea = document.getElementById('json-import-textarea');
    textarea.value = '';
    textarea.focus();

    const closeBtn = document.getElementById('json-import-cancel');
    const submitBtn = document.getElementById('json-import-submit');
    const fileBtn = document.getElementById('json-import-file-btn');

    const closeModal = () => { modal.style.display = 'none'; };
    
    // Remove old event listeners to prevent duplicate triggers
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    const newFileBtn = fileBtn.cloneNode(true);
    fileBtn.parentNode.replaceChild(newFileBtn, fileBtn);

    newCloseBtn.addEventListener('click', closeModal);
    newFileBtn.addEventListener('click', () => {
      closeModal();
      this.importJSON(diagramInstance);
    });
    newSubmitBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (!text) {
        closeModal();
        return;
      }
      try {
        const data = JSON.parse(text);
        this._applyImportData(diagramInstance, data);
        if (typeof showToast === 'function') showToast('テキストからインポートしました');
        closeModal();
      } catch (err) {
        console.error('JSON Parse Error:', err);
        alert('JSONの形式が正しくありません。エラー: ' + err.message);
      }
    });
  },

  /**
   * パースされたJSONデータをダイアグラムに適用する内部関数
   */
  _applyImportData(diagramInstance, data) {
    if (diagramInstance.saveSnapshot) {
      diagramInstance.saveSnapshot(); // 保存しておく（元に戻せるように）
    }
    
    if (diagramInstance.elements !== undefined) {
      // layout.js の場合
      let maxId = 0;
      const elements = Array.isArray(data.elements) ? data.elements : [];
      elements.forEach(e => {
        if (e.id) {
          const parts = e.id.split('_');
          if (parts.length > 1) {
            const num = parseInt(parts[parts.length - 1]);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        }
      });
      if (diagramInstance.restoreSnapshot) {
        diagramInstance.restoreSnapshot({
          elements: elements,
          elemIdCounter: maxId
        });
      }
    } else {
      // diagram.js / erdiagram.js の場合
      let maxId = 0;
      const nodes = Array.isArray(data.nodes) ? data.nodes : [];
      nodes.forEach(n => {
        if (n.id) {
          const parts = n.id.split('_');
          if (parts.length > 1) {
            const num = parseInt(parts[parts.length - 1]);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        }
      });
      const connections = Array.isArray(data.connections) ? data.connections : [];
      
      if (diagramInstance.restoreSnapshot) {
        diagramInstance.restoreSnapshot({
          nodes: nodes,
          connections: connections,
          nodeIdCounter: maxId,
          quickAddCounter: 0
        });
      }
    }
  }
};
