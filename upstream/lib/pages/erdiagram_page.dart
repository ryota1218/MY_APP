import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/common.dart';

class _ERAttribute {
  final String name;
  final String type;
  final bool pk;
  final bool fk;
  const _ERAttribute({
    required this.name,
    required this.type,
    this.pk = false,
    this.fk = false,
  });
}

class _EREntity {
  final String id;
  String name;
  List<_ERAttribute> attrs;
  Offset position;
  _EREntity({
    required this.id,
    required this.name,
    required this.attrs,
    required this.position,
  });
}

class _ERRelation {
  final String fromId;
  final String toId;
  final String label;
  const _ERRelation({
    required this.fromId,
    required this.toId,
    required this.label,
  });
}

class ERDiagramPage extends StatefulWidget {
  const ERDiagramPage({super.key});
  @override
  State<ERDiagramPage> createState() => _ERDiagramPageState();
}

class _ERDiagramPageState extends State<ERDiagramPage> {
  final List<_EREntity> _entities = [];
  final List<_ERRelation> _relations = [];
  int _entityIdCounter = 0;
  String? _selectedEntityId;
  String? _connectingFromId;

  @override
  void initState() {
    super.initState();
    // Sample data
    _entities.addAll([
      _EREntity(
        id: 'er_entity_${_entityIdCounter++}',
        name: 'ユーザー',
        attrs: const [
          _ERAttribute(name: 'user_id', type: 'INT', pk: true),
          _ERAttribute(name: 'name', type: 'VARCHAR'),
          _ERAttribute(name: 'email', type: 'VARCHAR'),
          _ERAttribute(name: 'created_at', type: 'DATETIME'),
        ],
        position: const Offset(100, 80),
      ),
      _EREntity(
        id: 'er_entity_${_entityIdCounter++}',
        name: '注文',
        attrs: const [
          _ERAttribute(name: 'order_id', type: 'INT', pk: true),
          _ERAttribute(name: 'user_id', type: 'INT', fk: true),
          _ERAttribute(name: 'total', type: 'DECIMAL'),
          _ERAttribute(name: 'status', type: 'VARCHAR'),
          _ERAttribute(name: 'ordered_at', type: 'DATETIME'),
        ],
        position: const Offset(420, 80),
      ),
      _EREntity(
        id: 'er_entity_${_entityIdCounter++}',
        name: '商品',
        attrs: const [
          _ERAttribute(name: 'product_id', type: 'INT', pk: true),
          _ERAttribute(name: 'name', type: 'VARCHAR'),
          _ERAttribute(name: 'price', type: 'DECIMAL'),
          _ERAttribute(name: 'stock', type: 'INT'),
        ],
        position: const Offset(420, 340),
      ),
    ]);
    _relations.addAll([
      _ERRelation(fromId: _entities[1].id, toId: _entities[0].id, label: '1:N'),
      _ERRelation(fromId: _entities[1].id, toId: _entities[2].id, label: 'N:M'),
    ]);
  }

  void _addEntity() {
    final nameController = TextEditingController();
    final attrsController = TextEditingController();
    showAppModal(
      context,
      title: 'エンティティ追加',
      body: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AppFormField(
            label: 'テーブル名',
            child: TextField(
              controller: nameController,
              decoration: const InputDecoration(hintText: '例: users'),
              style: const TextStyle(color: AppColors.text),
            ),
          ),
          AppFormField(
            label: 'カラム（1行1カラム: 名前,型）',
            child: TextField(
              controller: attrsController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: 'id,INT\nname,VARCHAR\nemail,VARCHAR',
              ),
              style: const TextStyle(color: AppColors.text),
            ),
          ),
        ],
      ),
      onConfirm: () {
        final name = nameController.text.trim();
        if (name.isEmpty) return;
        final attrs = attrsController.text
            .split('\n')
            .where((l) => l.trim().isNotEmpty)
            .toList()
            .asMap()
            .entries
            .map((e) {
              final parts = e.value.split(',').map((s) => s.trim()).toList();
              return _ERAttribute(
                name: parts.isNotEmpty ? parts[0] : 'col',
                type: parts.length > 1 ? parts[1] : 'VARCHAR',
                pk: e.key == 0,
              );
            })
            .toList();
        final offset = _entities.length * 40.0;
        setState(() {
          _entities.add(
            _EREntity(
              id: 'er_entity_${_entityIdCounter++}',
              name: name,
              attrs: attrs,
              position: Offset(100 + offset, 100 + offset),
            ),
          );
        });
        showToast(context, 'エンティティを追加しました');
      },
    );
  }

  void _addRelation() {
    if (_entities.length < 2) {
      showToast(context, 'エンティティを2つ以上追加してください');
      return;
    }
    setState(() => _connectingFromId = null);
    showToast(context, '接続元エンティティをクリックしてください');
  }

  void _onEntityTap(String entityId) {
    if (_connectingFromId == null && _entities.any((e) => e.id == entityId)) {
      // Check if we're in relation-add mode
      setState(() {
        _selectedEntityId = entityId;
        if (_connectingFromId == null) {
          // First click - might be starting a connection
        }
      });
    }
    if (_connectingFromId != null && _connectingFromId != entityId) {
      // Complete connection
      final labelController = TextEditingController(text: '1:N');
      showAppModal(
        context,
        title: 'リレーション',
        body: AppFormField(
          label: 'リレーション (例: 1:N, N:M)',
          child: TextField(
            controller: labelController,
            style: const TextStyle(color: AppColors.text),
          ),
        ),
        onConfirm: () {
          setState(() {
            _relations.add(
              _ERRelation(
                fromId: _connectingFromId!,
                toId: entityId,
                label: labelController.text,
              ),
            );
            _connectingFromId = null;
          });
        },
      );
    } else if (_connectingFromId == null) {
      setState(() => _connectingFromId = entityId);
      showToast(context, '接続先エンティティをクリックしてください');
    }
  }

  void _clearAll() {
    setState(() {
      _entities.clear();
      _relations.clear();
      _entityIdCounter = 0;
      _selectedEntityId = null;
      _connectingFromId = null;
    });
    showToast(context, 'E-R図をクリアしました');
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'E-R図',
            subtitle: 'エンティティとリレーションシップを視覚的に設計します',
          ),
          ToolBar(
            title: 'E-R図エディタ',
            actions: [
              SmallButton(label: '＋ エンティティ追加', onPressed: _addEntity),
              SmallButton(label: '🔗 リレーション追加', onPressed: _addRelation),
              SmallButton(label: '🗑 クリア', onPressed: _clearAll),
              const ToolBarSep(),
              SmallButton(
                label: '📥 SVGエクスポート',
                onPressed: () => showToast(context, 'SVGをエクスポートしました'),
                primary: true,
              ),
            ],
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() {
                _selectedEntityId = null;
                _connectingFromId = null;
              }),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  border: Border.all(color: AppColors.border),
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
                      // Relation lines
                      CustomPaint(
                        size: Size.infinite,
                        painter: _ERRelationPainter(
                          entities: _entities,
                          relations: _relations,
                        ),
                      ),
                      // Entities
                      ..._entities.map((entity) => _buildEntity(entity)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEntity(_EREntity entity) {
    final isSelected =
        _selectedEntityId == entity.id || _connectingFromId == entity.id;
    return Positioned(
      left: entity.position.dx,
      top: entity.position.dy,
      child: GestureDetector(
        onPanUpdate: (details) {
          setState(() => entity.position += details.delta);
        },
        onTap: () => _onEntityTap(entity.id),
        onDoubleTap: () {
          final controller = TextEditingController(text: entity.name);
          showAppModal(
            context,
            title: 'テーブル名',
            body: AppFormField(
              label: 'テーブル名',
              child: TextField(
                controller: controller,
                style: const TextStyle(color: AppColors.text),
                autofocus: true,
              ),
            ),
            onConfirm: () {
              if (controller.text.isNotEmpty) {
                setState(() => entity.name = controller.text);
              }
            },
          );
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          constraints: const BoxConstraints(minWidth: 180),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            border: Border.all(
              color: isSelected ? AppColors.accent2 : AppColors.border,
              width: 2,
            ),
            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.accent2.withValues(alpha: 0.2),
                      blurRadius: 20,
                    ),
                  ]
                : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.accent2.withValues(alpha: 0.15),
                      AppColors.accent.withValues(alpha: 0.1),
                    ],
                  ),
                  border: const Border(
                    bottom: BorderSide(color: AppColors.border),
                  ),
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(AppTheme.radiusSm - 2),
                  ),
                ),
                child: Text(
                  entity.name,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.text,
                  ),
                ),
              ),
              // Attributes
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Column(
                  children: entity.attrs
                      .map(
                        (a) => Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 4,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              if (a.pk)
                                Container(
                                  margin: const EdgeInsets.only(right: 6),
                                  child: const Text(
                                    'PK',
                                    style: TextStyle(
                                      color: AppColors.warn,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              if (a.fk)
                                Container(
                                  margin: const EdgeInsets.only(right: 6),
                                  child: const Text(
                                    'FK',
                                    style: TextStyle(
                                      color: AppColors.accent2,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              Text(
                                a.name,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textDim,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                a.type,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.accent2,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

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

class _ERRelationPainter extends CustomPainter {
  final List<_EREntity> entities;
  final List<_ERRelation> relations;
  _ERRelationPainter({required this.entities, required this.relations});

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = AppColors.accent2.withValues(alpha: 0.6)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    for (final rel in relations) {
      final from = entities.where((e) => e.id == rel.fromId).firstOrNull;
      final to = entities.where((e) => e.id == rel.toId).firstOrNull;
      if (from == null || to == null) continue;

      final fromCenter = from.position + const Offset(90, 40);
      final toCenter = to.position + const Offset(90, 40);

      canvas.drawLine(fromCenter, toCenter, linePaint);

      // Arrow
      final arrowPaint = Paint()
        ..color = AppColors.accent2.withValues(alpha: 0.6)
        ..style = PaintingStyle.fill;
      final dir = (toCenter - fromCenter);
      final norm = dir / dir.distance;
      final arrowTip = toCenter - norm * 15;
      final perp = Offset(-norm.dy, norm.dx) * 5;
      final arrowPath = Path()
        ..moveTo(toCenter.dx, toCenter.dy)
        ..lineTo(arrowTip.dx + perp.dx, arrowTip.dy + perp.dy)
        ..lineTo(arrowTip.dx - perp.dx, arrowTip.dy - perp.dy)
        ..close();
      canvas.drawPath(arrowPath, arrowPaint);

      // Label
      textPainter.text = TextSpan(
        text: rel.label,
        style: const TextStyle(color: AppColors.accent2, fontSize: 12),
      );
      textPainter.layout();
      final mid = (fromCenter + toCenter) / 2 + const Offset(8, -12);
      textPainter.paint(canvas, mid);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
