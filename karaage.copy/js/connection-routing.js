/**
 * Connection Routing Logic
 * Separated from diagram.js to handle fixed ports and orthogonal routing.
 */

window.ConnectionRouting = {
  calculateEndpoints: function(params) {
    const { conn, cx1, cy1, fw, fh, cx2, cy2, tw, th, isSeqMessage, isFromBar, isToBar, getOffset } = params;
    let x1 = cx1, y1 = cy1, x2 = cx2, y2 = cy2;
    const isHorizontal = Math.abs(cx2 - cx1) > Math.abs(cy2 - cy1);

    const useFixedPorts = conn.routing === 'orthogonal' || conn.routing === 'curve';

    let dir1X = 0, dir1Y = 0;
    let dir2X = 0, dir2Y = 0;

    if (conn.fixedFromPort && useFixedPorts) {
      switch (conn.fixedFromPort) {
        case 'top': y1 = cy1 - fh / 2; dir1Y = -1; break;
        case 'bottom': y1 = cy1 + fh / 2; dir1Y = 1; break;
        case 'left': x1 = cx1 - fw / 2; dir1X = -1; break;
        case 'right': x1 = cx1 + fw / 2; dir1X = 1; break;
      }
    } else {
      if (isFromBar) {
        if (cy2 >= cy1) { y1 = cy1 + fh / 2; x1 += getOffset(conn.from, 'bottom', fw, true); dir1Y = 1; }
        else { y1 = cy1 - fh / 2; x1 += getOffset(conn.from, 'top', fw, true); dir1Y = -1; }
      } else {
        if (isHorizontal) {
          if (cx1 < cx2) { x1 = cx1 + fw / 2; y1 += getOffset(conn.from, 'right', fh, false); dir1X = 1; }
          else { x1 = cx1 - fw / 2; y1 += getOffset(conn.from, 'left', fh, false); dir1X = -1; }
        } else {
          if (cy1 < cy2) { y1 = cy1 + fh / 2; x1 += getOffset(conn.from, 'bottom', fw, false); dir1Y = 1; }
          else { y1 = cy1 - fh / 2; x1 += getOffset(conn.from, 'top', fw, false); dir1Y = -1; }
        }
      }
    }

    if (conn.fixedToPort && useFixedPorts) {
      switch (conn.fixedToPort) {
        case 'top': y2 = cy2 - th / 2; dir2Y = -1; break;
        case 'bottom': y2 = cy2 + th / 2; dir2Y = 1; break;
        case 'left': x2 = cx2 - tw / 2; dir2X = -1; break;
        case 'right': x2 = cx2 + tw / 2; dir2X = 1; break;
      }

    } else {
      if (isToBar) {
        if (cy1 <= cy2) { y2 = cy2 - th / 2; x2 += getOffset(conn.to, 'top', tw, true); dir2Y = -1; }
        else { y2 = cy2 + th / 2; x2 += getOffset(conn.to, 'bottom', tw, true); dir2Y = 1; }
      } else {
        if (isHorizontal) {
          if (cx1 < cx2) { x2 = cx2 - tw / 2; y2 += getOffset(conn.to, 'left', th, false); dir2X = -1; }
          else { x2 = cx2 + tw / 2; y2 += getOffset(conn.to, 'right', th, false); dir2X = 1; }
        } else {
          if (cy1 < cy2) { y2 = cy2 - th / 2; x2 += getOffset(conn.to, 'top', tw, false); dir2Y = -1; }
          else { y2 = cy2 + th / 2; x2 += getOffset(conn.to, 'bottom', tw, false); dir2Y = 1; }
        }
      }
    }

    if (isSeqMessage && !conn.fixedToPort) {
      y2 = y1;
      dir2Y = 0; // Or whatever is needed for sequence messages
    }

    return { x1, y1, x2, y2, dir1X, dir1Y, dir2X, dir2Y };
  }
};
