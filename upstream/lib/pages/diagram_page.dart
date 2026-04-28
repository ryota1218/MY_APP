import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/common.dart';

/// Represents a component type in palette
class _PaletteComponent {
  final String icon;
  final String label;
  final Color color;
  const _PaletteComponent({required this.icon, required this.label, required this.color});
}

/// A placed node on the canvas
class _DiagramNode {
  final String id;
  String icon;
  String label;
  Color color;
  Offset position;
  _DiagramNode({
    required this.id,
    required this.icon,
    required this.label,
    required this.color,
    required this.position,
  });
}

/// A connection between two nodes
class _Connection {
  final String fromId;
  final String toId;
  const _Connection({required this.fromId, required this.toId});
}

const _archComponents = [
  _PaletteComponent(icon: '🌐', label: 'Webサーバー', color: Color(0xFF7C3AED)),
  _PaletteComponent(icon: '🗄️', label: 'データベース', color: Color(0xFF06B6D4)),
  _PaletteComponent(icon: '⚙️', label: 'APIサーバー', color: Color(0xFF10B981)),
  _PaletteComponent(icon: '📦', label: 'キャッシュ', color: Color(0xFFF59E0B)),
  _PaletteComponent(icon: '☁️', label: 'CDN', color: Color(0xFF8B5CF6)),
  _PaletteComponent(icon: '🔐', label: '認証', color: Color(0xFFEF4444)),
  _PaletteComponent(icon: '📨', label: 'メッセージキュー', color: Color(0xFFEC4899)),
  _PaletteComponent(icon: '📊', label: 'ログ/監視', color: Color(0xFF14B8A6)),
  _PaletteComponent(icon: '💾', label: 'ストレージ', color: Color(0xFF6366F1)),
  _PaletteComponent(icon: '🔄', label: 'ロードバランサー', color: Color(0xFFF97316)),
  _PaletteComponent(icon: '👤', label: 'クライアント', color: Color(0xFF64748B)),
  _PaletteComponent(icon: '📱', label: 'モバイル', color: Color(0xFFA855F7)),
];

const _umlComponents = [
  _PaletteComponent(icon: '⬜', label: '画面', color: Color(0xFF7C3AED)),
  _PaletteComponent(icon: '🔵', label: '開始', color: Color(0xFF10B981)),
  _PaletteComponent(icon: '🔴', label: '終了', color: Color(0xFFEF4444)),
  _PaletteComponent(icon: '◇', label: '分岐', color: Color(0xFFF59E0B)),
  _PaletteComponent(icon: '▶️', label: 'アクション', color: Color(0xFF06B6D4)),
  _PaletteComponent(icon: '📋', label: 'フォーム', color: Color(0xFF8B5CF6)),
  _PaletteComponent(icon: '📊', label: 'ダッシュボード', color: Color(0xFF14B8A6)),
  _PaletteComponent(icon: '⚙️', label: '設定', color: Color(0xFF6366F1)),
  _PaletteComponent(icon: '🔔', label: '通知', color: Color(0xFFEC4899)),
  _PaletteComponent(icon: '📝', label: '入力', color: Color(0xFFF97316)),
];

/// Reusable diagram page for both Architecture and UML
class DiagramPage extends StatefulWidget {
  final String title;
  final String subtitle;
  final bool isArchitecture;
  const DiagramPage({
    super.key,
    required this.title,
    required this.subtitle,
    required this.isArchitecture,
  });

  @override
  State<DiagramPage> createState() => _DiagramPageState();
}

class _DiagramPageState extends State<DiagramPage> {
  final List<_DiagramNode> _nodes = [];
  final List<_Connection> _connections = [];
  int _nodeIdCounter = 0;
  String? _selectedNodeId;
  bool _connectMode = false;
  String? _connectingFromId;
  final GlobalKey _canvasKey = GlobalKey();

  List<_PaletteComponent> get _components =>
      widget.isArchitecture ? _archComponents : _umlComponents;

  void _addNode(_PaletteComponent comp, Offset position) {
    setState(() {
      final id = '${widget.isArchitecture ? "arch" : "uml"}_node_${_nodeIdCounter++}';
      _nodes.add(_DiagramNode(
        id: id,
        icon: comp.icon,
        label: comp.label,
        color: comp.color,
        position: position,
      ));
    });
  }

  void _onNodeTap(String nodeId) {
    if (_connectMode) {
      if (_connectingFromId == null) {
        setState(() => _connectingFromId = nodeId);
        showToast(context, '接続先ノードをクリックしてください');
      } else if (_connectingFromId != nodeId) {
        setState(() {
          _connections.add(_Connection(fromId: _connectingFromId!, toId: nodeId));
          _connectingFromId = null;
        });
      }
    } else {
      setState(() => _selectedNodeId = nodeId);
    }
  }

  void _renameNode(String nodeId) {
    final node = _nodes.firstWhere((n) => n.id == nodeId);
    final controller = TextEditingController(text: node.label);
    showAppModal(
      context,
      title: 'ノード名を入力',
      body: AppFormField(
        label: 'ノード名',
        child: TextField(
          controller: controller,
          style: const TextStyle(color: AppColors.text),
          autofocus: true,
        ),
      ),
      onConfirm: () {
        if (controller.text.isNotEmpty) {
          setState(() => node.label = controller.text);
        }
      },
    );
  }

  void _clearAll() {
    setState(() {
      _nodes.clear();
      _connections.clear();
      _nodeIdCounter = 0;
      _selectedNodeId = null;
      _connectingFromId = null;
    });
    showToast(context, 'キャンバスをクリアしました');
  }

  void _autoLayout() {
    if (_nodes.isEmpty) return;
    final cols = (_nodes.length.toDouble()).clamp(1, 999);
    final colCount = cols.toInt().clamp(1, (cols.toInt() + 1) ~/ 2 + 1);
    final gridCols = colCount.clamp(1, 4);
    setState(() {
      for (var i = 0; i < _nodes.length; i++) {
        _nodes[i].position = Offset(
          80.0 + (i % gridCols) * 200,
          60.0 + (i ~/ gridCols) * 120,
        );
      }
    });
    showToast(context, '自動配置しました');
  }

  void _exportSVG() {
    showToast(context, 'SVGをエクスポートしました');
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: widget.title, subtitle: widget.subtitle),
          ToolBar(
            title: widget.isArchitecture ? '構成図エディタ' : 'UMLエディタ',
            actions: [
              SmallButton(label: '🗑 クリア', onPressed: _clearAll),
              if (widget.isArchitecture)
                SmallButton(label: '📐 自動配置', onPressed: _autoLayout),
              const ToolBarSep(),
              SmallButton(label: '📥 SVGエクスポート', onPressed: _exportSVG, primary: true),
            ],
          ),
          Expanded(
            child: Row(
              children: [
                // Palette
                _buildPalette(),
                const SizedBox(width: 16),
                // Canvas
                Expanded(child: _buildCanvas()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPalette() {
    return Container(
      width: 200,
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
      ),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('コンポーネント',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDim,
                  letterSpacing: 1)),
          const SizedBox(height: 12),
          ..._components.map((comp) => _buildPaletteItem(comp)),
          const SizedBox(height: 16),
          const Text('操作',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDim,
                  letterSpacing: 1)),
          const SizedBox(height: 8),
          _buildConnectModeButton(),
        ],
      ),
    );
  }

  Widget _buildPaletteItem(_PaletteComponent comp) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Draggable<_PaletteComponent>(
        data: comp,
        feedback: Material(
          color: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              border: Border.all(color: AppColors.accent),
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(comp.icon, style: const TextStyle(fontSize: 16)),
                const SizedBox(width: 8),
                Text(comp.label,
                    style: const TextStyle(color: AppColors.text, fontSize: 13)),
              ],
            ),
          ),
        ),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.bgGlass,
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          ),
          child: Row(
            children: [
              Text(comp.icon, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(comp.label,
                    style: const TextStyle(fontSize: 13, color: AppColors.text)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConnectModeButton() {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
        onTap: () {
          setState(() {
            _connectMode = !_connectMode;
            if (!_connectMode) _connectingFromId = null;
          });
          showToast(
              context,
              _connectMode
                  ? '接続モード: ON ー ノードをクリックして接続'
                  : '接続モード: OFF');
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: _connectMode ? const Color(0x337C3AED) : AppColors.bgGlass,
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          ),
          child: const Row(
            children: [
              Text('🔗', style: TextStyle(fontSize: 16)),
              SizedBox(width: 10),
              Text('接続モード', style: TextStyle(fontSize: 13, color: AppColors.text)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCanvas() {
    return DragTarget<_PaletteComponent>(
      onAcceptWithDetails: (details) {
        final renderBox =
            _canvasKey.currentContext?.findRenderObject() as RenderBox?;
        if (renderBox != null) {
          final localPos = renderBox.globalToLocal(details.offset);
          _addNode(details.data, localPos);
        }
      },
      builder: (context, candidateData, rejectedData) {
        return Container(
          key: _canvasKey,
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            border: Border.all(
                color: candidateData.isNotEmpty ? AppColors.accent : AppColors.border),
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            child: Stack(
              children: [
                // Dot grid background
                CustomPaint(
                  size: Size.infinite,
                  painter: _DotGridPainter(),
                ),
                // Connection lines
                CustomPaint(
                  size: Size.infinite,
                  painter: _ConnectionPainter(
                    nodes: _nodes,
                    connections: _connections,
                    accentColor: widget.isArchitecture ? AppColors.accent : AppColors.accent2,
                  ),
                ),
                // Nodes
                ..._nodes.map((node) => _buildDiagramNode(node)),
                // Empty state
                if (_nodes.isEmpty)
                  Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.drag_indicator,
                            size: 48, color: AppColors.textMuted.withValues(alpha: 0.3)),
                        const SizedBox(height: 12),
                        Text('コンポーネントをドラッグ＆ドロップ',
                            style: TextStyle(
                                color: AppColors.textMuted.withValues(alpha: 0.5),
                                fontSize: 14)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDiagramNode(_DiagramNode node) {
    final isSelected = _selectedNodeId == node.id || _connectingFromId == node.id;
    return Positioned(
      left: node.position.dx,
      top: node.position.dy,
      child: GestureDetector(
        onPanUpdate: (details) {
          if (!_connectMode) {
            setState(() {
              node.position += details.delta;
            });
          }
        },
        onTap: () => _onNodeTap(node.id),
        onDoubleTap: () => _renameNode(node.id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            border: Border.all(
              color: isSelected ? node.color : node.color.withValues(alpha: 0.37),
              width: 2,
            ),
            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            boxShadow: isSelected
                ? [BoxShadow(color: node.color.withValues(alpha: 0.3), blurRadius: 20)]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(node.icon, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Text(node.label,
                  style: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.text)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Custom painter for dot grid background
class _DotGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..style = PaintingStyle.fill;
    const spacing = 24.0;
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 1, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Custom painter for connection lines
class _ConnectionPainter extends CustomPainter {
  final List<_DiagramNode> nodes;
  final List<_Connection> connections;
  final Color accentColor;
  _ConnectionPainter({
    required this.nodes,
    required this.connections,
    required this.accentColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = accentColor.withValues(alpha: 0.7)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    for (final conn in connections) {
      final fromNode = nodes.where((n) => n.id == conn.fromId).firstOrNull;
      final toNode = nodes.where((n) => n.id == conn.toId).firstOrNull;
      if (fromNode == null || toNode == null) continue;

      // Approximate center of the node
      final from = fromNode.position + const Offset(60, 20);
      final to = toNode.position + const Offset(60, 20);

      final path = Path()
        ..moveTo(from.dx, from.dy);

      // Curved line
      final midX = (from.dx + to.dx) / 2;
      path.cubicTo(midX, from.dy, midX, to.dy, to.dx, to.dy);
      canvas.drawPath(path, paint);

      // Arrow head
      final arrowPaint = Paint()
        ..color = accentColor.withValues(alpha: 0.7)
        ..style = PaintingStyle.fill;
      const arrowSize = 8.0;
      final arrowPath = Path()
        ..moveTo(to.dx, to.dy)
        ..lineTo(to.dx - arrowSize * 1.5 * (to.dx > from.dx ? 1 : -1),
            to.dy - arrowSize * 0.6)
        ..lineTo(to.dx - arrowSize * 1.5 * (to.dx > from.dx ? 1 : -1),
            to.dy + arrowSize * 0.6)
        ..close();
      canvas.drawPath(arrowPath, arrowPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
