/* ===== Use Case Diagram Shape Library ===== */
(function (global) {
  const usecaseComponents = [
    { icon:'<i data-lucide="user" class="node-lucide-icon"></i>', label:'アクター', color:'#10b981', behaviorType:'actor' },
    { icon:'<i data-lucide="circle" class="node-lucide-icon"></i>', label:'ユースケース', color:'#f59e0b', behaviorType:'usecase' },
    { icon:'<i data-lucide="rectangle-horizontal" class="node-lucide-icon"></i>', label:'システム境界', color:'#7c3aed', behaviorType:'systemBoundary' },
    { icon:'<i data-lucide="folder" class="node-lucide-icon"></i>', label:'パッケージ', color:'#3b82f6', behaviorType:'package' },
    { icon:'<i data-lucide="file-text" class="node-lucide-icon"></i>', label:'ノート', color:'#64748b', behaviorType:'usecaseNote' },
  ];

  const usecaseNodeVariants = {
    actor:           { kind: 'actor', width: '60px', height: '80px' },
    usecase:         { kind: 'ellipse', minWidth: '140px', minHeight: '80px' },
    systemBoundary:  { kind: 'systemBox', minWidth: '320px', minHeight: '240px' },
    package:         { kind: 'packageBox', minWidth: '240px', minHeight: '180px' },
    usecaseNote:     { kind: 'card', minWidth: '140px' },
  };

  function buildNodeStyleString(parts) {
    return Object.entries(parts).map(([key, value]) => `${key}:${value};`).join('');
  }

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
          padding: '0',
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

    if (variant.kind === 'packageBox') {
      return {
        className: 'diagram-node usecase-node usecase-node-package',
        style: buildNodeStyleString({
          ...baseStyle,
          'min-width': variant.minWidth,
          'min-height': variant.minHeight,
          padding: '0',
          display: 'flex',
          'flex-direction': 'column',
          'border-radius': '4px',
          'box-sizing': 'border-box',
          'background': 'transparent',
          'border': 'none',
        }),
        innerHTML: `
          <div style="align-self:flex-start;padding:6px 16px 6px 12px;background:var(--bg-secondary);border:2px solid ${borderColor};border-bottom:none;border-radius:6px 6px 0 0;display:flex;align-items:center;gap:6px;position:relative;z-index:2;">
             <span class="node-icon">${icon}</span>
             <span class="node-label" style="font-weight:700;">${label}</span>
          </div>
          <div style="flex:1;border:2px solid ${borderColor};background:var(--bg-secondary);border-radius:0 6px 6px 6px;margin-top:-2px;position:relative;z-index:1;"></div>
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

  global.UsecaseDiagramLibrary = Object.freeze({
    components: Object.freeze(usecaseComponents),
    variants: Object.freeze(usecaseNodeVariants),
    getDefaultComponents() { return usecaseComponents; },
    getNodeVariant(behaviorType) { return usecaseNodeVariants[behaviorType] || null; },
    buildNodePresentation(node, escapeHtml) { return buildUsecaseNodePresentation(node, escapeHtml); },
  });
})(window);
