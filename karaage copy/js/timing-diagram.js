/* ===== Timing Diagram Library ===== */
(function (global) {

  /* ---------- コンポーネント定義 ---------- */
  const timingComponents = [
    { icon:'<i data-lucide="split" class="node-lucide-icon"></i>', label:'タイミング・ライフライン', color:'#7c3aed', behaviorType:'timingLifeline', nodeType:'timing-lifeline', width: 600, height: 80 },
    { icon:'<i data-lucide="activity" class="node-lucide-icon"></i>', label:'ステート・タイムライン', color:'#10b981', behaviorType:'stateTimeline', nodeType:'timing-timeline', width: 100, height: 40 },
    { icon:'<i data-lucide="align-justify" class="node-lucide-icon"></i>', label:'バリュー・タイムライン', color:'#3b82f6', behaviorType:'valueTimeline', nodeType:'timing-timeline', width: 100, height: 40 },
    { icon:'<i data-lucide="ruler" class="node-lucide-icon"></i>', label:'タイムルーラー', color:'#64748b', behaviorType:'timeRuler', nodeType:'timing-ruler', width: 600, height: 30 },
    { icon:'<i data-lucide="arrow-left-right" class="node-lucide-icon"></i>', label:'時間制約', color:'#f59e0b', behaviorType:'timeConstraint', nodeType:'timing-constraint', width: 120, height: 20 },
    { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#94a3b8', behaviorType:'timingNote', nodeType:'timing-note', width: 140, height: 60 },
  ];

  /* ---------- ノードバリアント定義 ---------- */
  const timingNodeVariants = {
    timingLifeline: { kind: 'lifeline' },
    stateTimeline:  { kind: 'timeline', type: 'state' },
    valueTimeline:  { kind: 'timeline', type: 'value' },
    timeRuler:      { kind: 'ruler' },
    timeConstraint: { kind: 'constraint' },
    timingNote:     { kind: 'note' },
  };

  function buildNodeStyleString(parts) {
    return Object.entries(parts).map(([key, value]) => `${key}:${value};`).join('');
  }

  /* ---------- プレゼンテーション構築 ---------- */
  function buildTimingNodePresentation(node, escapeHtml) {
    const variant = timingNodeVariants[node.behaviorType];
    if (!variant) return null;

    const label = escapeHtml(node.label);
    const color = node.color || '#7c3aed';
    const w = node.width || 200;
    const h = node.height || 60;

    // ========== ライフライン (左側にラベル、右側にグリッド) ==========
    if (variant.kind === 'lifeline') {
      const headerWidth = 150;
      const gridWidth = Math.max(0, w - headerWidth);
      return {
        className: 'diagram-node timing-node timing-lifeline-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: `${w}px`,
          height: `${h}px`,
          display: 'flex',
          background: 'transparent',
          border: 'none',
          padding: '0',
          'min-width': '0px',
        }),
        innerHTML: `
          <div class="timing-lifeline-header" style="width:${headerWidth}px; border:2px solid ${color}; border-right:none; background:${color}10; display:flex; align-items:center; justify-content:center; position:relative;">
            <span class="node-label timing-lifeline-label" style="padding: 0 10px; word-break: break-all;">${label}</span>
            <div class="timing-lifeline-states">
              <span class="timing-state-label" style="top:15%;">High</span>
              <span class="timing-state-label" style="bottom:15%;">Low</span>
            </div>
          </div>
          <div class="timing-lifeline-grid" style="flex:1; border:2px solid ${color}; position:relative;">
            <div class="timing-grid-pattern"></div>
          </div>
          <span class="node-port port-left" data-port="left"></span>
          <span class="node-port port-right" data-port="right"></span>`,
      };
    }

    // ========== タイムライン (ステート/バリュー) ==========
    if (variant.kind === 'timeline') {
      const isState = variant.type === 'state';
      const stateVal = node.timingValue || 'High'; // High / Low / Any Value
      const isHigh = stateVal === 'High';
      
      // ステートタイムラインの場合、Highなら上、Lowなら下に線を引く
      // バリュータイムラインの場合、六角形のボックスを描画
      let innerContent = '';
      if (isState) {
        const lineY = isHigh ? '25%' : '75%';
        innerContent = `<div class="timing-wave-line" style="top:${lineY}; border-color:${color};"></div>
                        <div class="timing-wave-label">${escapeHtml(stateVal)}</div>`;
      } else {
        innerContent = `<div class="timing-value-box" style="border-color:${color}; background:${color}20;">
                          <span class="node-label">${label}</span>
                        </div>`;
      }

      return {
        className: 'diagram-node timing-node timing-timeline-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: `${w}px`,
          height: `${h}px`,
          background: 'transparent',
          border: 'none',
          padding: '0',
          'min-width': '0px',
          'z-index': '20',
        }),
        innerHTML: `
          ${innerContent}
          <span class="node-port port-left" data-port="left"></span>
          <span class="node-port port-right" data-port="right"></span>`,
      };
    }

    // ========== タイムルーラー (時間軸の目盛り) ==========
    if (variant.kind === 'ruler') {
      let ticks = '';
      const tickCount = 10;
      for(let i=0; i<=tickCount; i++) {
        const pos = (i / tickCount) * 100;
        ticks += `<div class="timing-ruler-tick" style="left:${pos}%; border-color:${color}80;">
                    <span class="timing-ruler-val">${i*10}ms</span>
                  </div>`;
      }
      return {
        className: 'diagram-node timing-node timing-ruler-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: `${w}px`,
          height: `${h}px`,
          border: 'none',
          background: 'transparent',
          'min-width': '0px',
        }),
        innerHTML: `
          <div class="timing-ruler-line" style="border-bottom:2px solid ${color}; width:100%;"></div>
          <div class="timing-ruler-ticks" style="position:relative; width:100%; height:100%;">${ticks}</div>`,
      };
    }

    // ========== 時間制約 (矢印とテキスト) ==========
    if (variant.kind === 'constraint') {
      return {
        className: 'diagram-node timing-node timing-constraint-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: `${w}px`,
          height: `${h}px`,
          border: 'none',
          background: 'transparent',
          'min-width': '0px',
          'z-index': '30',
        }),
        innerHTML: `
          <div class="timing-constraint-arrow" style="border-left:1px solid ${color}; border-right:1px solid ${color}; border-bottom:1px solid ${color}; height:10px; margin-top:10px;">
            <div class="timing-constraint-text" style="color:${color}; position:absolute; top:-18px; white-space:nowrap;">${label || '{ t...t+10 }'}</div>
          </div>`,
      };
    }

    // ========== ノート ==========
    if (variant.kind === 'note') {
      return {
        className: 'diagram-node timing-node timing-note-node',
        style: buildNodeStyleString({
          position: 'absolute',
          width: `${w}px`,
          height: `${h}px`,
          background: '#fef3c7',
          border: `1px solid ${color}80`,
          padding: '8px 10px',
          'font-size': '0.75rem',
          color: '#1f2937',
        }),
        innerHTML: `<div class="timing-note-fold" style="border-color:${color}60;"></div>
                    <span class="node-label">${label}</span>`,
      };
    }

    return null;
  }

  /* ---------- ライブラリのエクスポート ---------- */
  global.TimingDiagramLibrary = Object.freeze({
    components: timingComponents,
    variants: timingNodeVariants,

    getDefaultComponents() {
      return timingComponents;
    },

    buildNodePresentation(node, escapeHtml) {
      return buildTimingNodePresentation(node, escapeHtml);
    },

    isTimingNode(node) {
      return !!timingNodeVariants[node?.behaviorType];
    },

    isTimingLifeline(node) {
      return node?.behaviorType === 'timingLifeline';
    },

    findLifelineChildren(parent, allNodes) {
      const parentEl = document.getElementById(parent.id);
      if (!parentEl) return [];
      const parentRect = parentEl.getBoundingClientRect();
      
      return allNodes.filter(n => {
        if (n.id === parent.id) return false;
        // ステートタイムライン、バリュータイムライン、時間制約などを子として扱う
        if (n.behaviorType !== 'stateTimeline' && n.behaviorType !== 'valueTimeline' && n.behaviorType !== 'timeConstraint') return false;
        
        const childEl = document.getElementById(n.id);
        if (!childEl) return false;
        const cr = childEl.getBoundingClientRect();
        
        // ライフラインのグリッド領域内にあるか判定
        return cr.left >= parentRect.left && cr.right <= parentRect.right &&
               cr.top >= parentRect.top && cr.bottom <= parentRect.bottom;
      });
    }
  });

})(window);
