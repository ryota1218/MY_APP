/* ===== Behavior Diagram Shape Library ===== */
(function (global) {
  const activityComponents = [
    { icon:'<i data-lucide="play" class="node-lucide-icon"></i>', label:'アクション', color:'#06b6d4', behaviorType:'action' },
    { icon:'<i data-lucide="circle" class="node-lucide-icon"></i>', label:'開始ノード', color:'#10b981', behaviorType:'start' },
    { icon:'<i data-lucide="circle-x" class="node-lucide-icon"></i>', label:'終了ノード', color:'#ef4444', behaviorType:'end' },
    { icon:'<i data-lucide="diamond" class="node-lucide-icon"></i>', label:'判定/分岐', color:'#f59e0b', behaviorType:'decision' },
    { icon:'<i data-lucide="diamond" class="node-lucide-icon"></i>', label:'合流', color:'#f59e0b', behaviorType:'merge' },
    { icon:'<i data-lucide="minus" class="node-lucide-icon"></i>', label:'フォーク', color:'#8b5cf6', behaviorType:'fork' },
    { icon:'<i data-lucide="minus" class="node-lucide-icon"></i>', label:'ジョイン', color:'#8b5cf6', behaviorType:'join' },
    { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'オブジェクトノード', color:'#7c3aed', behaviorType:'object' },
    { icon:'<i data-lucide="send" class="node-lucide-icon"></i>', label:'送信シグナル', color:'#f97316', behaviorType:'sendSignal' },
    { icon:'<i data-lucide="inbox" class="node-lucide-icon"></i>', label:'受信シグナル', color:'#0ea5e9', behaviorType:'receiveSignal' },
    { icon:'<i data-lucide="clock" class="node-lucide-icon"></i>', label:'タイマーイベント', color:'#64748b', behaviorType:'timer' },
    { icon:'<i data-lucide="layout-grid" class="node-lucide-icon"></i>', label:'スイムレーン', color:'#3b82f6', behaviorType:'lane' },
    { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b', behaviorType:'note' },
  ];

  const activityFeatureSuggestions = [
    '分岐のガード条件を接続線に表示する',
    'スイムレーンを実際の区画として扱う',
    'ノードの自動整列とスナップを追加する',
    '開始・終了ノードを専用の見た目で描画する',
    'フォーク/ジョインを太いバーとして描画する',
  ];

  const activityNodeVariants = {
    action: { kind: 'card', minWidth: '150px' },
    object: { kind: 'card', minWidth: '160px' },
    note: { kind: 'card', minWidth: '140px' },
    sendSignal: { kind: 'card', minWidth: '160px' },
    receiveSignal: { kind: 'card', minWidth: '160px' },
    timer: { kind: 'card', minWidth: '150px' },
    lane: { kind: 'card', minWidth: '180px' },
    decision: { kind: 'diamond', minWidth: '110px' },
    merge: { kind: 'diamond', minWidth: '110px' },
    start: { kind: 'initial' },
    end: { kind: 'final' },
    fork: { kind: 'bar', minWidth: '140px' },
    join: { kind: 'bar', minWidth: '140px' },
  };

  function buildNodeStyleString(parts) {
    return Object.entries(parts).map(([key, value]) => `${key}:${value};`).join('');
  }

  function buildActivityNodePresentation(node, escapeHtml) {
    const variant = activityNodeVariants[node.behaviorType];
    if (!variant) return null;

    const label = escapeHtml(node.label);
    const icon = node.icon || '';
    const borderColor = node.color ? `${node.color}80` : '#e5e7eb';
    const baseStyle = { 'border-color': borderColor, background: 'var(--bg-secondary)' };
    const ports = `
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>`;

    if (variant.kind === 'initial') {
      return {
        className: 'diagram-node behavior-node behavior-node-initial',
        style: buildNodeStyleString({
          ...baseStyle,
          width: '34px',
          height: '34px',
          'min-width': '34px',
          padding: '0',
          border: 'none',
          'border-radius': '50%',
          background: '#111827',
        }),
        innerHTML: `${ports}`,
      };
    }

    if (variant.kind === 'final') {
      return {
        className: 'diagram-node behavior-node behavior-node-final',
        style: buildNodeStyleString({
          ...baseStyle,
          width: '34px',
          height: '34px',
          'min-width': '34px',
          padding: '0',
          'border-radius': '50%',
          border: '2px solid #111827',
          background: '#fff',
        }),
        innerHTML: `<div style="width:16px;height:16px;border-radius:50%;background:#111827;display:block;"></div>${ports}`,
      };
    }

    if (variant.kind === 'diamond') {
      return {
        className: 'diagram-node behavior-node behavior-node-diamond',
        style: buildNodeStyleString({
          'min-width': '110px',
          width: '110px',
          height: '110px',
          border: 'none',
          background: 'transparent',
          'box-shadow': 'none',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          'justify-content': 'center',
          gap: '2px',
        }),
        innerHTML: `
          <div class="behavior-node-diamond-bg" style="position:absolute;top:50%;left:50%;width:74px;height:74px;transform:translate(-50%,-50%) rotate(45deg);border:2px solid ${node.color};background:var(--bg-secondary);z-index:-1;border-radius:4px;"></div>
          <div style="display:grid;place-items:center;color:${node.color};z-index:1;">${icon}</div>
          <span class="node-label" style="text-align:center;font-size:11px;z-index:1;max-width:80px;line-height:1.2;word-break:break-word;">${label}</span>
          <span class="node-port port-top" data-port="top" style="top:-2px;"></span>
          <span class="node-port port-bottom" data-port="bottom" style="bottom:-2px;"></span>
          <span class="node-port port-left" data-port="left" style="left:-2px;"></span>
          <span class="node-port port-right" data-port="right" style="right:-2px;"></span>`,
      };
    }

    if (variant.kind === 'round') {
      return {
        className: 'diagram-node behavior-node behavior-node-round',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          padding: '12px 14px',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '8px',
          ...(variant.ring ? { 'box-shadow': `inset 0 0 0 5px ${node.color}40` } : {}),
        }),
        innerHTML: `
          <div class="behavior-node-round-mark" style="width:42px;height:42px;border-radius:50%;border:2px solid ${node.color};background:${node.color}20;display:grid;place-items:center;color:${node.color};">${icon}</div>
          <span class="node-label">${label}</span>
          <span class="node-port port-top" data-port="top"></span>
          <span class="node-port port-bottom" data-port="bottom"></span>
          <span class="node-port port-left" data-port="left"></span>
          <span class="node-port port-right" data-port="right"></span>`,
      };
    }

    if (variant.kind === 'bar') {
      return {
        className: 'diagram-node behavior-node behavior-node-bar',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          padding: '10px 14px',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '8px',
        }),
        innerHTML: `
          <div class="behavior-node-bar-mark" style="width:100%;height:14px;border-radius:999px;background:${node.color};"></div>
          <span class="node-label">${label}</span>
          <span class="node-port port-top" data-port="top"></span>
          <span class="node-port port-bottom" data-port="bottom"></span>
          <span class="node-port port-left" data-port="left"></span>
          <span class="node-port port-right" data-port="right"></span>`,
      };
    }

    return {
      className: 'diagram-node behavior-node behavior-node-card',
      style: buildNodeStyleString({
        ...baseStyle,
        'min-width': variant.minWidth,
      }),
      innerHTML: `
        <span class="node-icon">${icon}</span><span class="node-label">${label}</span>
        <span class="node-port port-top" data-port="top"></span>
        <span class="node-port port-bottom" data-port="bottom"></span>
        <span class="node-port port-left" data-port="left"></span>
        <span class="node-port port-right" data-port="right"></span>`,
    };
  }

  /* ===== State Machine Diagram ===== */
  const stateComponents = [
    { icon:'<i data-lucide="circle" class="node-lucide-icon"></i>', label:'初期状態', color:'#111827', behaviorType:'stateInitial' },
    { icon:'<i data-lucide="circle-x" class="node-lucide-icon"></i>', label:'終了状態', color:'#111827', behaviorType:'stateFinal' },
    { icon:'<i data-lucide="git-branch" class="node-lucide-icon"></i>', label:'状態', color:'#6366f1', behaviorType:'state' },
    { icon:'<i data-lucide="boxes" class="node-lucide-icon"></i>', label:'複合状態', color:'#7c3aed', behaviorType:'compositeState' },
    { icon:'<i data-lucide="diamond" class="node-lucide-icon"></i>', label:'選択', color:'#f59e0b', behaviorType:'choice' },
    { icon:'<i data-lucide="minus" class="node-lucide-icon"></i>', label:'フォーク', color:'#8b5cf6', behaviorType:'stateFork' },
    { icon:'<i data-lucide="minus" class="node-lucide-icon"></i>', label:'ジョイン', color:'#8b5cf6', behaviorType:'stateJoin' },
    { icon:'<i data-lucide="history" class="node-lucide-icon"></i>', label:'浅い履歴', color:'#0ea5e9', behaviorType:'historyShallow' },
    { icon:'<i data-lucide="history" class="node-lucide-icon"></i>', label:'深い履歴', color:'#0ea5e9', behaviorType:'historyDeep' },
    { icon:'<i data-lucide="circle-dashed" class="node-lucide-icon"></i>', label:'エントリポイント', color:'#111827', behaviorType:'entryPoint' },
    { icon:'<i data-lucide="circle-dot-dashed" class="node-lucide-icon"></i>', label:'エグジットポイント', color:'#111827', behaviorType:'exitPoint' },
    { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b', behaviorType:'stateNote' },
  ];

  const stateNodeVariants = {
    stateInitial:    { kind: 'initial' },
    stateFinal:      { kind: 'final' },
    state:           { kind: 'stateCard', minWidth: '160px' },
    compositeState:  { kind: 'composite', minWidth: '320px', minHeight: '220px' },
    choice:          { kind: 'diamond', minWidth: '110px' },
    stateFork:       { kind: 'bar', minWidth: '140px' },
    stateJoin:       { kind: 'bar', minWidth: '140px' },
    historyShallow:  { kind: 'history', depth: 'H' },
    historyDeep:     { kind: 'history', depth: 'H*' },
    entryPoint:      { kind: 'entryPoint' },
    exitPoint:       { kind: 'exitPoint' },
    stateNote:       { kind: 'card', minWidth: '140px' },
  };

  function buildStateNodePresentation(node, escapeHtml) {
    const variant = stateNodeVariants[node.behaviorType];
    if (!variant) return null;

    const label = escapeHtml(node.label);
    const icon = node.icon || '';
    const borderColor = node.color ? `${node.color}80` : '#e5e7eb';
    const baseStyle = { 'border-color': borderColor, background: 'var(--bg-secondary)' };
    const ports = `
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>`;

    if (variant.kind === 'initial') {
      return {
        className: 'diagram-node behavior-node behavior-node-initial',
        style: buildNodeStyleString({
          ...baseStyle,
          width: '34px',
          height: '34px',
          'min-width': '34px',
          padding: '0',
          border: 'none',
          'border-radius': '50%',
          background: '#111827',
        }),
        innerHTML: `${ports}`,
      };
    }

    if (variant.kind === 'final') {
      return {
        className: 'diagram-node behavior-node behavior-node-final',
        style: buildNodeStyleString({
          ...baseStyle,
          width: '34px',
          height: '34px',
          'min-width': '34px',
          padding: '0',
          'border-radius': '50%',
          border: '2px solid #111827',
          background: '#fff',
        }),
        innerHTML: `<div style="width:16px;height:16px;border-radius:50%;background:#111827;display:block;"></div>${ports}`,
      };
    }

    if (variant.kind === 'entryPoint') {
      return {
        className: 'diagram-node behavior-node behavior-node-entry-point',
        style: buildNodeStyleString({
          ...baseStyle,
          width: '34px',
          height: '34px',
          'min-width': '34px',
          padding: '0',
          'border-radius': '50%',
          border: '2px solid #111827',
          background: 'var(--bg-secondary)',
          display: 'grid',
          'place-items': 'center',
        }),
        innerHTML: `${ports}`,
      };
    }

    if (variant.kind === 'exitPoint') {
      return {
        className: 'diagram-node behavior-node behavior-node-exit-point',
        style: buildNodeStyleString({
          ...baseStyle,
          width: '34px',
          height: '34px',
          'min-width': '34px',
          padding: '0',
          'border-radius': '50%',
          border: '2px solid #111827',
          background: 'var(--bg-secondary)',
          display: 'grid',
          'place-items': 'center',
          position: 'relative',
        }),
        innerHTML: `
          <div style="position:absolute; width:44px; height:2px; background:#111827; transform:rotate(45deg);"></div>
          <div style="position:absolute; width:44px; height:2px; background:#111827; transform:rotate(-45deg);"></div>
          ${ports}`,
      };
    }

    if (variant.kind === 'diamond') {
      return {
        className: 'diagram-node behavior-node behavior-node-diamond',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          padding: '12px 16px',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '8px',
        }),
        innerHTML: `<div class="behavior-node-diamond-mark" style="width:72px;height:72px;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);border:2px solid ${node.color};background:rgba(255,255,255,0.03);display:grid;place-items:center;color:${node.color};">${icon}</div><span class="node-label">${label}</span>${ports}`,
      };
    }

    if (variant.kind === 'round') {
      const historyMark = node.behaviorType === 'historyShallow' ? 'H' : node.behaviorType === 'historyDeep' ? 'H*' : '';
      const innerContent = historyMark
        ? `<span style="font-weight:700;font-size:1.1rem;color:${node.color};">${historyMark}</span>`
        : icon;
      return {
        className: 'diagram-node behavior-node behavior-node-round',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          padding: '12px 14px',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '8px',
          ...(variant.ring ? { 'box-shadow': `inset 0 0 0 5px ${node.color}40` } : {}),
        }),
        innerHTML: `<div class="behavior-node-round-mark" style="width:42px;height:42px;border-radius:50%;border:2px solid ${node.color};background:${node.color}20;display:grid;place-items:center;color:${node.color};">${innerContent}</div><span class="node-label">${label}</span>${ports}`,
      };
    }

    if (variant.kind === 'history') {
      const mark = variant.depth || 'H';
      return {
        className: 'diagram-node behavior-node behavior-node-round behavior-node-history',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': '80px',
          padding: '12px 14px',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '8px',
        }),
        innerHTML: `<div class="behavior-node-round-mark" style="width:42px;height:42px;border-radius:50%;border:2px solid ${node.color};background:${node.color}20;display:grid;place-items:center;"><span style="font-weight:700;font-size:1.1rem;color:${node.color};">${mark}</span></div><span class="node-label">${label}</span>${ports}`,
      };
    }

    if (variant.kind === 'bar') {
      return {
        className: 'diagram-node behavior-node behavior-node-bar',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          padding: '10px 14px',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '8px',
        }),
        innerHTML: `<div class="behavior-node-bar-mark" style="width:100%;height:14px;border-radius:999px;background:${node.color};"></div><span class="node-label">${label}</span>${ports}`,
      };
    }

    if (variant.kind === 'composite') {
      return {
        className: 'diagram-node behavior-node behavior-node-composite',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          'min-height': variant.minHeight || '220px',
          padding: '12px 14px 18px',
          display: 'flex',
          'flex-direction': 'column',
          gap: '10px',
          'border-radius': '18px',
          'box-shadow': 'inset 0 1px 0 rgba(255,255,255,0.12)',
        }),
        innerHTML: `
          <div style="display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid ${node.color}2a;flex-shrink:0;">
            <span class="node-icon">${icon}</span>
            <span class="node-label" style="font-weight:700;white-space:nowrap;">${label}</span>
          </div>
          <div style="flex:1;"></div>
          ${ports}`,
      };
    }

    return {
      className: 'diagram-node behavior-node behavior-node-card',
      style: buildNodeStyleString({
        ...baseStyle,
        'min-width': variant.minWidth,
        'border-radius': '16px',
        padding: '12px 16px',
      }),
      innerHTML: `<span class="node-icon">${icon}</span><span class="node-label">${label}</span>${ports}`,
    };
  }

  /* ===== Structure Diagram Components ===== */
  const structureComponents = {
    class: [
      { icon:'<i data-lucide="box" class="node-lucide-icon"></i>', label:'クラス', color:'#7c3aed', nodeType:'class-box',
        defaults: { stereotype:'', attributes:['-属性1 : 型'], methods:['+操作1() : 戻り値型'] } },
      { icon:'<i data-lucide="diamond" class="node-lucide-icon"></i>', label:'インターフェース', color:'#3b82f6', nodeType:'class-box',
        defaults: { stereotype:'«interface»', attributes:[], methods:['+操作1() : 戻り値型'] } },
      { icon:'<i data-lucide="box" class="node-lucide-icon"></i>', label:'抽象クラス', color:'#8b5cf6', nodeType:'class-box',
        defaults: { stereotype:'«abstract»', attributes:['-属性1 : 型'], methods:['+操作1() : 戻り値型'] } },
      { icon:'<i data-lucide="list" class="node-lucide-icon"></i>', label:'列挙型', color:'#06b6d4', nodeType:'class-box',
        defaults: { stereotype:'«enum»', attributes:['VALUE_1','VALUE_2','VALUE_3'], methods:[] } },
      { icon:'<i data-lucide="folder" class="node-lucide-icon"></i>', label:'パッケージ', color:'#f59e0b' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
    object: [
      { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'オブジェクト', color:'#14b8a6', nodeType:'object-box', defaults: { attributes: ['age = 25'] } },
      { icon:'<i data-lucide="box" class="node-lucide-icon"></i>', label:'クラス', color:'#3b82f6' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
    package: [
      { icon:'<i data-lucide="folder" class="node-lucide-icon"></i>', label:'パッケージ', color:'#06b6d4' },
      { icon:'<i data-lucide="box" class="node-lucide-icon"></i>', label:'クラス', color:'#7c3aed' },
      { icon:'<i data-lucide="diamond" class="node-lucide-icon"></i>', label:'インターフェース', color:'#3b82f6' },
      { icon:'<i data-lucide="link" class="node-lucide-icon"></i>', label:'依存', color:'#f59e0b' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
    composite: [
      { icon:'<i data-lucide="box" class="node-lucide-icon"></i>', label:'クラス/コンポーネント', color:'#7c3aed' },
      { icon:'<i data-lucide="plug" class="node-lucide-icon"></i>', label:'ポート', color:'#10b981' },
      { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'パート', color:'#06b6d4' },
      { icon:'<i data-lucide="diamond" class="node-lucide-icon"></i>', label:'インターフェース', color:'#3b82f6' },
      { icon:'<i data-lucide="link-2" class="node-lucide-icon"></i>', label:'コネクタ', color:'#f59e0b' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
    component: [
      { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'コンポーネント', color:'#7c3aed' },
      { icon:'<i data-lucide="diamond" class="node-lucide-icon"></i>', label:'インターフェース', color:'#3b82f6' },
      { icon:'<i data-lucide="plug" class="node-lucide-icon"></i>', label:'ポート', color:'#10b981' },
      { icon:'<i data-lucide="folder" class="node-lucide-icon"></i>', label:'パッケージ', color:'#06b6d4' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
    deployment: [
      { icon:'<i data-lucide="monitor" class="node-lucide-icon"></i>', label:'ノード', color:'#7c3aed' },
      { icon:'<i data-lucide="smartphone" class="node-lucide-icon"></i>', label:'デバイス', color:'#a855f7' },
      { icon:'<i data-lucide="cloud" class="node-lucide-icon"></i>', label:'実行環境', color:'#06b6d4' },
      { icon:'<i data-lucide="square" class="node-lucide-icon"></i>', label:'コンポーネント', color:'#10b981' },
      { icon:'<i data-lucide="hard-drive" class="node-lucide-icon"></i>', label:'成果物', color:'#f59e0b' },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b' },
    ],
    usecase: [
      { icon:'<i data-lucide="user" class="node-lucide-icon"></i>', label:'アクター', color:'#10b981', behaviorType:'actor' },
      { icon:'<i data-lucide="circle" class="node-lucide-icon"></i>', label:'ユースケース', color:'#f59e0b', behaviorType:'usecase' },
      { icon:'<i data-lucide="rectangle-horizontal" class="node-lucide-icon"></i>', label:'システム境界', color:'#7c3aed', behaviorType:'systemBoundary' },
      { icon:'<i data-lucide="list-plus" class="node-lucide-icon"></i>', label:'拡張ポイント', color:'#ec4899', behaviorType:'extensionPoint', defaults: { label: '拡張ポイント1' } },
      { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b', behaviorType:'usecaseNote' },
    ],
  };

  /* ===== Usecase Diagram Node Variants ===== */
  const usecaseNodeVariants = {
    actor:           { kind: 'actor', width: '60px', height: '80px' },
    usecase:         { kind: 'ellipse', minWidth: '140px', minHeight: '80px' },
    systemBoundary:  { kind: 'systemBox', minWidth: '320px', minHeight: '240px' },
    extensionPoint:  { kind: 'extensionPoint', minWidth: '160px', minHeight: '60px' },
    usecaseNote:     { kind: 'card', minWidth: '140px' },
  };

  function buildUsecaseNodePresentation(node, escapeHtml) {
    const variant = usecaseNodeVariants[node.behaviorType];
    if (!variant) return null;

    const label = escapeHtml(node.label);
    const icon = node.icon || '';
    const borderColor = node.color ? `${node.color}80` : '#e5e7eb';
    const baseStyle = { 'border-color': borderColor, background: 'var(--bg-secondary)' };
    const ports = `
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>`;

    if (variant.kind === 'actor') {
      return {
        className: 'diagram-node usecase-node usecase-node-actor',
        style: buildNodeStyleString({
          ...baseStyle,
          width: variant.width,
          height: variant.height,
          'min-width': variant.width,
          'min-height': variant.height,
          padding: '8px 4px 4px',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '6px',
          'box-sizing': 'border-box',
        }),
        innerHTML: `
          <div style="flex-shrink:0;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:${node.color}20;border:1.5px solid ${node.color};color:${node.color};">${icon}</div>
          <span class="node-label" style="font-size:0.8rem;text-align:center;word-break:break-word;flex:1;display:flex;align-items:center;justify-content:center;padding:0 2px;">${label}</span>
          ${ports}`,
      };
    }

    if (variant.kind === 'ellipse') {
      return {
        className: 'diagram-node usecase-node usecase-node-ellipse',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          'min-height': variant.minHeight,
          padding: '16px',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          'justify-content': 'center',
          gap: '8px',
          'border-radius': '50%/45%',
          'box-sizing': 'border-box',
        }),
        innerHTML: `
          <span class="node-icon">${icon}</span>
          <span class="node-label" style="text-align:center;word-break:break-word;">${label}</span>
          ${ports}`,
      };
    }

    if (variant.kind === 'systemBox') {
      return {
        className: 'diagram-node usecase-node usecase-node-system-boundary',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          'min-height': variant.minHeight,
          padding: '12px 14px 18px',
          display: 'flex',
          'flex-direction': 'column',
          gap: '10px',
          'border-radius': '8px',
          'box-shadow': 'inset 0 1px 0 rgba(255,255,255,0.12)',
          'box-sizing': 'border-box',
        }),
        innerHTML: `
          <div style="display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid ${node.color}2a;flex-shrink:0;">
            <span class="node-icon">${icon}</span>
            <span class="node-label" style="font-weight:700;white-space:nowrap;">${label}</span>
          </div>
          <div style="flex:1;"></div>
          ${ports}`,
      };
    }

    if (variant.kind === 'extensionPoint') {
      return {
        className: 'diagram-node usecase-node usecase-node-extension-point',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          'min-height': variant.minHeight,
          padding: '10px 14px',
          display: 'flex',
          'flex-direction': 'column',
          gap: '6px',
          'border-radius': '6px',
          border: '1.5px dashed ' + (node.color || '#ec4899'),
          background: 'transparent',
          'box-sizing': 'border-box',
        }),
        innerHTML: `
          <div style="font-size:0.75rem;font-weight:bold;border-bottom:1px solid ${node.color}40;padding-bottom:4px;text-align:center;color:${node.color};">extension points</div>
          <span class="node-label" style="text-align:center;word-break:break-word;padding-top:4px;">${label}</span>
          ${ports}`,
      };
    }

    return {
      className: 'diagram-node usecase-node usecase-node-card',
      style: buildNodeStyleString({
        ...baseStyle,
        'min-width': variant.minWidth,
        'border-radius': '16px',
        padding: '12px 16px',
      }),
      innerHTML: `<span class="node-icon">${icon}</span><span class="node-label">${label}</span>${ports}`,
    };
  }

  global.BehaviorDiagramLibrary = Object.freeze({
    activity: Object.freeze({
      components: Object.freeze(activityComponents),
      suggestions: Object.freeze(activityFeatureSuggestions),
      variants: Object.freeze(activityNodeVariants),
      getDefaultComponents() { return activityComponents; },
      getFeatureSuggestions() { return activityFeatureSuggestions; },
      getNodeVariant(behaviorType) { return activityNodeVariants[behaviorType] || null; },
      buildNodePresentation(node, escapeHtml) { return buildActivityNodePresentation(node, escapeHtml); },
    }),
    state: Object.freeze({
      components: Object.freeze(stateComponents),
      variants: Object.freeze(stateNodeVariants),
      getDefaultComponents() { return stateComponents; },
      getNodeVariant(behaviorType) { return stateNodeVariants[behaviorType] || null; },
      buildNodePresentation(node, escapeHtml) { return buildStateNodePresentation(node, escapeHtml); },
    }),
    structure: Object.freeze({
      components: Object.freeze(structureComponents),
      getDefaultComponents(type) { return structureComponents[type] || []; },
      getComponents(type) { return structureComponents[type] || []; },
    }),
    usecase: Object.freeze({
      components: Object.freeze(structureComponents.usecase),
      variants: Object.freeze(usecaseNodeVariants),
      getDefaultComponents() { return structureComponents.usecase; },
      getNodeVariant(behaviorType) { return usecaseNodeVariants[behaviorType] || null; },
      buildNodePresentation(node, escapeHtml) { return buildUsecaseNodePresentation(node, escapeHtml); },
    }),
  });
})(window);
