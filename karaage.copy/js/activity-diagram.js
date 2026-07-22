/* ===== Activity Diagram Library ===== */
(function (global) {

  const POOL_START_X = 10;
  let POOL_WIDTH = 1435;
  const HEADER_HEIGHT = 36;

  function drawLanes(diagramInstance) {
    const canvas = diagramInstance.canvas;
    const laneCount = diagramInstance.currentLaneCount || 0;
    const laneNames = diagramInstance.laneNames || [];
    // 既存の線をすべて削除
    const existingLines = canvas.querySelectorAll('.activity-lane-line');
    existingLines.forEach(el => el.remove());

    if (laneCount < 1) return;

    const lineStyle = 'position: absolute; top: 0; bottom: 0; width: 1px; background-color: var(--text-color, #333); z-index: 0; pointer-events: none; opacity: 0.3;';
    const headerStyle = `position: absolute; top: 4px; height: ${HEADER_HEIGHT - 4}px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--text-color, #333); z-index: 0; pointer-events: auto; opacity: 0.6; cursor: text; outline: none; border-radius: 4px;`;

    // 1. 左ボーダー（プールの開始線）
    const leftBorder = document.createElement('div');
    leftBorder.className = 'activity-lane-line';
    leftBorder.style.cssText = lineStyle + `left: ${POOL_START_X}px;`;
    canvas.prepend(leftBorder);

    // 2. 右ボーダー（プールの終了線）
    const rightBorder = document.createElement('div');
    rightBorder.className = 'activity-lane-line';
    rightBorder.style.cssText = lineStyle + `left: ${POOL_START_X + POOL_WIDTH}px;`;
    canvas.prepend(rightBorder);

    // 3. 上部横線（ヘッダー下部）
    const topBorder = document.createElement('div');
    topBorder.className = 'activity-lane-line';
    topBorder.style.cssText = `position: absolute; left: ${POOL_START_X}px; top: ${HEADER_HEIGHT}px; width: ${POOL_WIDTH}px; height: 1px; background-color: var(--text-color, #333); z-index: 0; pointer-events: none; opacity: 0.3;`;
    canvas.prepend(topBorder);

    // 4. 区切り線とヘッダーラベル
    const laneWidth = POOL_WIDTH / laneCount;
    for (let i = 0; i < laneCount; i++) {
      // ヘッダーラベル
      const header = document.createElement('div');
      header.className = 'activity-lane-line activity-lane-header';
      header.style.cssText = headerStyle + `left: ${POOL_START_X + (i * laneWidth)}px; width: ${laneWidth}px;`;
      header.innerText = laneNames[i] || `レーン ${i + 1}`;
      
      // ダブルクリックで名前の編集
      header.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        header.contentEditable = 'true';
        header.style.backgroundColor = 'var(--bg-card, rgba(255, 255, 255, 0.8))';
        header.focus();
        
        // 全選択
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(header);
        selection.removeAllRanges();
        selection.addRange(range);
      });

      // 編集終了処理
      const finishEdit = () => {
        if (header.contentEditable === 'true') {
          header.contentEditable = 'false';
          header.style.backgroundColor = '';
          const newName = header.innerText.trim();
          laneNames[i] = newName || `レーン ${i + 1}`;
          header.innerText = laneNames[i];
          diagramInstance.isDirty = true;
          window.getSelection().removeAllRanges();
        }
      };

      header.addEventListener('blur', finishEdit);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          finishEdit();
        }
      });
      
      canvas.prepend(header);

      // 区切り線 (最後のレーンの右は右ボーダーなので引かない)
      if (i < laneCount - 1) {
        const divider = document.createElement('div');
        divider.className = 'activity-lane-line';
        divider.style.cssText = lineStyle + `left: ${POOL_START_X + ((i + 1) * laneWidth)}px;`;
        canvas.prepend(divider);
      }
    }
  }

  global.ActivityDiagramLibrary = Object.freeze({
    drawLanes,
    setPoolWidth: (width) => {
      POOL_WIDTH = width;
    }
  });

})(window);
