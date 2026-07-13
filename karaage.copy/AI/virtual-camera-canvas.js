/**
 * ============================================================
 * 無限キャンバス(仮想カメラ方式) - 実装リファレンス
 * ============================================================
 *
 * DOM構造の前提:
 *
 * <div class="diagram-viewport" id="viewport"
 *      style="width:100%; height:100%; overflow:hidden; position:relative;">
 *   <div class="diagram-world" id="world"
 *        style="position:absolute; top:0; left:0; transform-origin:0 0;">
 *     <!-- artboard: 視覚的な背景グリッドのみ。AIペイロードには含めない -->
 *     <div class="artboard" id="artboard"
 *          style="position:absolute; left:0; top:0;"></div>
 *
 *     <!-- ノード群: 実データを持つ図形。x, y は常にワールド座標のまま保持 -->
 *     <!-- 例: <div class="node" style="position:absolute; left:{x}px; top:{y}px;">...</div> -->
 *   </div>
 * </div>
 *
 * 3階層の役割分担:
 * - viewport: 常に画面いっぱい。transformは一切かけない。
 * - world   : ズーム/パンの translate + scale をここだけに適用する(仮想カメラ)。
 * - artboard / nodes: どちらも world の子。同じtransformを共有するため、
 *   ズーム時に「グリッド背景」と「図形」が同じ比率で一緒に縮小/拡大される。
 */

class VirtualCamera {
  /**
   * @param {HTMLElement} viewportEl - 画面いっぱいに広がる外枠要素(overflow:hidden)
   * @param {HTMLElement} worldEl    - transformを実際にかける内側のレイヤー要素
   * @param {Object} options
   * @param {number} [options.minZoom=0.1]
   * @param {number} [options.maxZoom=4]
   */
  constructor(viewportEl, worldEl, options = {}) {
    this.viewportEl = viewportEl;
    this.worldEl = worldEl;

    this.camX = 0;
    this.camY = 0;
    this.zoom = 1;

    this.minZoom = options.minZoom ?? 0.1;
    this.maxZoom = options.maxZoom ?? 4;

    this.worldEl.style.transformOrigin = '0 0';
    this.worldEl.style.position = 'absolute';
    this.worldEl.style.top = '0';
    this.worldEl.style.left = '0';

    this._applyTransform();
  }

  _applyTransform() {
    this.worldEl.style.transform =
      `translate(${this.camX}px, ${this.camY}px) scale(${this.zoom})`;
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.camX) / this.zoom,
      y: (screenY - this.camY) / this.zoom,
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.zoom + this.camX,
      y: worldY * this.zoom + this.camY,
    };
  }

  zoomAt(newZoom, pivotScreenX, pivotScreenY) {
    const clampedZoom = Math.min(this.maxZoom, Math.max(this.minZoom, newZoom));
    const worldPivot = this.screenToWorld(pivotScreenX, pivotScreenY);

    this.zoom = clampedZoom;
    this.camX = pivotScreenX - worldPivot.x * this.zoom;
    this.camY = pivotScreenY - worldPivot.y * this.zoom;

    this._applyTransform();
  }

  handleWheelZoom(event, zoomStep = 0.001) {
    event.preventDefault();
    const rect = this.viewportEl.getBoundingClientRect();
    const pivotX = event.clientX - rect.left;
    const pivotY = event.clientY - rect.top;

    const factor = Math.exp(-event.deltaY * zoomStep);
    this.zoomAt(this.zoom * factor, pivotX, pivotY);
  }

  panBy(dx, dy) {
    this.camX += dx;
    this.camY += dy;
    this._applyTransform();
  }

  reset(camX = 0, camY = 0, zoom = 1) {
    this.camX = camX;
    this.camY = camY;
    this.zoom = zoom;
    this._applyTransform();
  }
}

/**
 * ============================================================
 * artboard(視覚的な背景グリッド)のセットアップ
 * ============================================================
 * artboardはあくまで「利用者への視覚的な作業領域の目安」であり、
 * AIへのペイロードには含めない。固定サイズでも、ノードのバウンディング
 * ボックスに応じて動的に広げても良い。
 */
function setupArtboard(artboardEl, width, height, gridSize = 16) {
  artboardEl.style.width = `${width}px`;
  artboardEl.style.height = `${height}px`;
  artboardEl.style.backgroundImage =
    'radial-gradient(circle, var(--border, #ccc) 1px, transparent 1px)';
  artboardEl.style.backgroundSize = `${gridSize}px ${gridSize}px`;
}

/**
 * ============================================================
 * ドラッグ&ドロップ座標変換の実装ヒント
 * ============================================================
 *
 * viewportEl.addEventListener('drop', (event) => {
 *   event.preventDefault();
 *   const rect = viewportEl.getBoundingClientRect();
 *   const screenX = event.clientX - rect.left;
 *   const screenY = event.clientY - rect.top;
 *   const worldPos = camera.screenToWorld(screenX, screenY);
 *   createNode({ x: worldPos.x, y: worldPos.y, width: 120, height: 80 });
 * });
 *
 * ノードのドラッグ移動時は、画面px単位の移動量をそのままワールド座標に
 * 足すとズーム時にズレるため、必ず zoom で割ってから加算する。
 *
 * node.x += event.movementX / camera.zoom;
 * node.y += event.movementY / camera.zoom;
 */

/**
 * ============================================================
 * AI連携用: バウンディングボックス計算 & 相対座標変換
 * ============================================================
 */
function buildAIPayload(nodes) {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  const boundingBox = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  const normalizedNodes = nodes.map((node) => ({
    ...node,
    x: node.x - minX,
    y: node.y - minY,
  }));

  return {
    boundingBox,
    nodes: normalizedNodes,
  };
}

/**
 * 使用例:
 *
 * const payload = buildAIPayload(allNodesInState);
 * if (payload) {
 *   fetch('/api/ai-analyze', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   });
 * }
 *
 * AI応答の座標を画面に反映する場合は、boundingBox.x / y を足し戻す:
 * const worldX = aiResponse.x + payload.boundingBox.x;
 * const worldY = aiResponse.y + payload.boundingBox.y;
 */

export { VirtualCamera, setupArtboard, buildAIPayload };
