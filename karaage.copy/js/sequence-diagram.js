/* ===== Sequence Diagram Library ===== */
(function (global) {

  /* ---------- コンポーネント定義 ---------- */
  const sequenceComponents = [
    { icon:'<i data-lucide="user" class="node-lucide-icon"></i>',       label:'ライフライン',       color:'#7c3aed', behaviorType:'lifeline',   nodeType:'seq-lifeline',   width: 120, height: 40 },
    { icon:'<i data-lucide="user-check" class="node-lucide-icon"></i>', label:'アクター',           color:'#06b6d4', behaviorType:'seqActor',   nodeType:'seq-lifeline',   width: 80,  height: 54 },
    { icon:'<i data-lucide="rectangle-horizontal" class="node-lucide-icon"></i>', label:'実行仕様', color:'#10b981', behaviorType:'execSpec',   nodeType:'seq-exec',       width: 16,  height: 80 },
    { icon:'<i data-lucide="square" class="node-lucide-icon"></i>',     label:'フラグメント',       color:'#f59e0b', behaviorType:'fragment',   nodeType:'seq-fragment',   width: 300, height: 120 },
    { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>',  label:'ノート',             color:'#64748b', behaviorType:'seqNote',    nodeType:'seq-note',       width: 140, height: 60 },
    { icon:'<i data-lucide="x-circle" class="node-lucide-icon"></i>',   label:'破棄マーク',         color:'#ef4444', behaviorType:'destruction',nodeType:'seq-destruction', width: 24,  height: 24 },
  ];

  /* ---------- ノードバリアント定義 ---------- */
  const sequenceNodeVariants = {
    lifeline:    { kind: 'lifeline' },
    seqActor:    { kind: 'lifeline', isActor: true },
    execSpec:    { kind: 'execSpec' },
    fragment:    { kind: 'fragment' },
    seqNote:     { kind: 'note' },
    destruction: { kind: 'destruction' },
  };

  /* ---------- ユーティリティ ---------- */
  function buildNodeStyleString(parts) {
    return Object.entries(parts).map(([key, value]) => `${key}:${value};`).join('');
  }

  /* ---------- ライフラインの点線の長さ ---------- */
  const LIFELINE_DASH_LENGTH = 400;

  /* ---------- プレゼンテーション構築 ---------- */
  function buildSequenceNodePresentation(node, escapeHtml) {
    const variant = sequenceNodeVariants[node.behaviorType];
    if (!variant) return null;

    const label = escapeHtml(node.label);
    const color = node.color || '#7c3aed';

    // ========== ライフライン ==========
    if (variant.kind === 'lifeline') {
      const dashLen = node.lifelineLength || LIFELINE_DASH_LENGTH;
      const boxWidth = node.width || 120;
      const isActor = variant.isActor;

      // アクター: スティックマンアイコン + 名前 + 点線
      // オブジェクト: 名前ボックス + 点線
      const headerHtml = isActor
        ? `<div class="seq-lifeline-header seq-lifeline-actor" style="border-color:${color}60;">
            <div class="seq-actor-icon" style="color:${color};">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="16" x2="8" y2="22"/><line x1="12" y1="16" x2="16" y2="22"/></svg>
            </div>
            <span class="node-label seq-lifeline-name">${label}</span>
          </div>`
      : `<div class="seq-lifeline-header" style="border-color:${color}60;min-width:${boxWidth}px;">
            <span class="node-label seq-lifeline-name">${label}</span>
          </div>`;

      return {
        className: 'diagram-node seq-node seq-lifeline-node',
        style: buildNodeStyleString({
          position: 'absolute',
          background: 'transparent',
          border: 'none',
          padding: '0',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          'min-width': `${boxWidth}px`,
          cursor: 'move',
          'z-index': '10',
        }),
        innerHTML: `${headerHtml}
          <div class="seq-lifeline-dash" style="width:2px;height:${dashLen}px;border-left:2px dashed ${color}50;margin-top:0;"></div>
          <span class="node-port port-top" data-port="top"></span>
          <span class="node-port port-bottom" data-port="bottom"></span>
          <span class="node-port port-left" data-port="left"></span>
          <span class="node-port port-right" data-port="right"></span>`,
      };
    }

    // ========== 実行仕様（Execution Specification） ==========
    if (variant.kind === 'execSpec') {
      const w = node.width || 16;
      const h = node.height || 80;
      return {
        className: 'diagram-node seq-node seq-exec-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: `${w}px`,
          height: `${h}px`,
          background: `${color}30`,
          border: `2px solid ${color}`,
          'border-radius': '2px',
          padding: '0',
          'min-width': '0px',
          cursor: 'move',
          'z-index': '15',
        }),
        innerHTML: `<span class="node-port port-top" data-port="top"></span>
          <span class="node-port port-bottom" data-port="bottom"></span>
          <span class="node-port port-left" data-port="left"></span>
          <span class="node-port port-right" data-port="right"></span>`,
      };
    }

    // ========== フラグメント（alt / loop / opt / break 等） ==========
    if (variant.kind === 'fragment') {
      const fragType = node.fragmentType || 'alt';
      const fragLabel = node.fragmentLabel || '';
      const w = node.width || 300;
      const h = node.height || 120;
      return {
        className: 'diagram-node seq-node seq-fragment-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: `${w}px`,
          height: `${h}px`,
          background: 'transparent',
          border: `2px solid ${color}80`,
          'border-radius': '4px',
          padding: '0',
          'min-width': '0px',
          cursor: 'move',
          'z-index': '5',
        }),
        innerHTML: `<div class="seq-fragment-header" style="background:${color}25;border-color:${color}60;">
            <span class="seq-fragment-type" style="color:${color};font-weight:700;">${escapeHtml(fragType)}</span>
            <span class="seq-fragment-label" style="color:${color}cc;">${escapeHtml(fragLabel)}</span>
          </div>
          <div class="seq-fragment-body"></div>
          <span class="node-label" style="display:none;">${label}</span>
          <span class="node-port port-top" data-port="top"></span>
          <span class="node-port port-bottom" data-port="bottom"></span>
          <span class="node-port port-left" data-port="left"></span>
          <span class="node-port port-right" data-port="right"></span>`,
      };
    }

    // ========== ノート ==========
    if (variant.kind === 'note') {
      const w = node.width || 140;
      return {
        className: 'diagram-node seq-node seq-note-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: `${w}px`,
          background: '#fef3c7',
          border: `1px solid ${color}80`,
          'border-radius': '2px',
          padding: '8px 10px',
          'min-width': '80px',
          cursor: 'move',
          'z-index': '20',
          color: '#1f2937',
          'font-size': '0.78rem',
          'line-height': '1.4',
        }),
        innerHTML: `<div class="seq-note-fold" style="border-color:${color}60;"></div>
          <span class="node-label">${label}</span>`,
      };
    }

    // ========== 破棄マーク（×印） ==========
    if (variant.kind === 'destruction') {
      return {
        className: 'diagram-node seq-node seq-destruction-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: '24px',
          height: '24px',
          background: 'transparent',
          border: 'none',
          padding: '0',
          'min-width': '0px',
          cursor: 'move',
          'z-index': '16',
          display: 'grid',
          'place-items': 'center',
        }),
        innerHTML: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
          <span class="node-label" style="display:none;">${label}</span>`,
      };
    }

    return null;
  }

  /* ---------- メッセージ線の水平補正 ---------- */
  function correctMessageEndpoint(fromNode, toNode, rawY) {
    // シーケンス図では、メッセージは水平に引くのが基本
    // toNode の Y 座標を fromNode の Y に合わせて返す
    if (!fromNode || !toNode) return null;
    return { y: rawY };
  }

  /* ---------- ライフラインの子要素検出 ---------- */
  function findLifelineChildren(lifelineNode, allNodes) {
    if (!lifelineNode || (lifelineNode.behaviorType !== 'lifeline' && lifelineNode.behaviorType !== 'seqActor')) {
      return [];
    }
    const llEl = document.getElementById(lifelineNode.id);
    if (!llEl) return [];
    const llRect = llEl.getBoundingClientRect();
    // ライフラインの中心X ± 幅/2 にいるノード
    const centerX = llRect.left + llRect.width / 2;
    const tolerance = Math.max(llRect.width / 2, 30);

    return allNodes.filter(n => {
      if (n.id === lifelineNode.id) return false;
      if (n.behaviorType !== 'execSpec' && n.behaviorType !== 'destruction') return false;
      const nEl = document.getElementById(n.id);
      if (!nEl) return false;
      const nRect = nEl.getBoundingClientRect();
      const nCenterX = nRect.left + nRect.width / 2;
      return Math.abs(nCenterX - centerX) < tolerance;
    });
  }

  /* ---------- ライブラリのエクスポート ---------- */
  global.SequenceDiagramLibrary = Object.freeze({
    components: Object.freeze(sequenceComponents),
    variants: Object.freeze(sequenceNodeVariants),
    LIFELINE_DASH_LENGTH,

    getDefaultComponents() {
      return sequenceComponents;
    },

    getNodeVariant(behaviorType) {
      return sequenceNodeVariants[behaviorType] || null;
    },

    buildNodePresentation(node, escapeHtml) {
      return buildSequenceNodePresentation(node, escapeHtml);
    },

    /** メッセージ線を水平に補正する */
    correctMessageEndpoint,

    /** ライフラインに属する子ノード（実行仕様・破棄マーク）を取得 */
    findLifelineChildren,

    /** ノードがシーケンス図のノードかどうか判定 */
    isSequenceNode(node) {
      return !!sequenceNodeVariants[node?.behaviorType];
    },

    /** ライフラインのノードかどうか判定 */
    isLifeline(node) {
      return node?.behaviorType === 'lifeline' || node?.behaviorType === 'seqActor';
    },
  });

})(window);
