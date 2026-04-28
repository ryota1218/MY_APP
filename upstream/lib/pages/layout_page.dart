import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/common.dart';

class _LayoutItem {
  final String icon;
  final String label;
  final double w;
  final double h;
  final Color bg;
  final Color textColor;
  const _LayoutItem({
    required this.icon,
    required this.label,
    required this.w,
    required this.h,
    required this.bg,
    this.textColor = const Color(0xFF64748B),
  });
}

class _PlacedElement {
  final String id;
  String label;
  Offset position;
  double width;
  double height;
  Color bg;
  Color textColor;
  _PlacedElement({
    required this.id,
    required this.label,
    required this.position,
    required this.width,
    required this.height,
    required this.bg,
    required this.textColor,
  });
}

const _layoutItems = [
  _LayoutItem(icon: '▬', label: 'ヘッダー', w: 360, h: 50, bg: Color(0xFFE2E8F0)),
  _LayoutItem(icon: '◻', label: 'サイドバー', w: 120, h: 300, bg: Color(0xFFF1F5F9)),
  _LayoutItem(icon: '▭', label: 'ボタン', w: 120, h: 40, bg: Color(0xFF7C3AED), textColor: Colors.white),
  _LayoutItem(icon: '▤', label: 'テーブル', w: 300, h: 180, bg: Color(0xFFF8FAFC)),
  _LayoutItem(icon: '🖼', label: '画像', w: 200, h: 150, bg: Color(0xFFE2E8F0)),
  _LayoutItem(icon: '📝', label: 'テキスト', w: 200, h: 30, bg: Colors.transparent),
  _LayoutItem(icon: '📋', label: 'フォーム', w: 280, h: 200, bg: Color(0xFFF8FAFC)),
  _LayoutItem(icon: '📊', label: 'カード', w: 200, h: 140, bg: Colors.white),
  _LayoutItem(icon: '▬', label: 'フッター', w: 360, h: 40, bg: Color(0xFFE2E8F0)),
  _LayoutItem(icon: '🔍', label: '検索バー', w: 240, h: 36, bg: Colors.white),
];

class LayoutPage extends StatefulWidget {
  const LayoutPage({super.key});
  @override
  State<LayoutPage> createState() => _LayoutPageState();
}

class _LayoutPageState extends State<LayoutPage> {
  final List<_PlacedElement> _elements = [];
  int _elemIdCounter = 0;
  String? _selectedElementId;
  final GlobalKey _canvasKey = GlobalKey();

  void _addElement(_LayoutItem item, Offset position) {
    setState(() {
      _elements.add(_PlacedElement(
        id: 'layout_el_${_elemIdCounter++}',
        label: item.label,
        position: position,
        width: item.w,
        height: item.h,
        bg: item.bg,
        textColor: item.textColor,
      ));
    });
  }

  void _clearAll() {
    setState(() {
      _elements.clear();
      _elemIdCounter = 0;
      _selectedElementId = null;
    });
    showToast(context, 'キャンバスをクリアしました');
  }

  void _renameElement(String id) {
    final el = _elements.firstWhere((e) => e.id == id);
    final controller = TextEditingController(text: el.label);
    showAppModal(
      context,
      title: 'ラベル',
      body: AppFormField(
        label: 'ラベル名',
        child: TextField(
          controller: controller,
          style: const TextStyle(color: AppColors.text),
          autofocus: true,
        ),
      ),
      onConfirm: () {
        if (controller.text.isNotEmpty) {
          setState(() => el.label = controller.text);
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: '画面レイアウト',
            subtitle: 'ワイヤーフレームをドラッグ＆ドロップで作成します',
          ),
          ToolBar(
            title: 'レイアウトエディタ',
            actions: [
              SmallButton(label: '🗑 クリア', onPressed: _clearAll),
              const ToolBarSep(),
              SmallButton(
                label: '📥 エクスポート',
                onPressed: () => showToast(context, 'レイアウトデータを保存しました'),
                primary: true,
              ),
            ],
          ),
          Expanded(
            child: Row(
              children: [
                _buildPalette(),
                const SizedBox(width: 16),
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
          const Text('UI要素',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDim,
                  letterSpacing: 1)),
          const SizedBox(height: 12),
          ..._layoutItems.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Draggable<_LayoutItem>(
                  data: item,
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
                          Text(item.icon, style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 8),
                          Text(item.label,
                              style: const TextStyle(
                                  color: AppColors.text, fontSize: 13)),
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
                        Text(item.icon, style: const TextStyle(fontSize: 16)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(item.label,
                              style: const TextStyle(fontSize: 13, color: AppColors.text)),
                        ),
                      ],
                    ),
                  ),
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildCanvas() {
    return DragTarget<_LayoutItem>(
      onAcceptWithDetails: (details) {
        final renderBox =
            _canvasKey.currentContext?.findRenderObject() as RenderBox?;
        if (renderBox != null) {
          final localPos = renderBox.globalToLocal(details.offset);
          _addElement(details.data, localPos);
        }
      },
      builder: (context, candidateData, rejectedData) {
        return Container(
          key: _canvasKey,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(
                color: candidateData.isNotEmpty ? AppColors.accent : AppColors.border),
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: Stack(
            children: [
              // Placed elements
              ..._elements.map((el) => _buildPlacedElement(el)),
              // Empty state
              if (_elements.isEmpty)
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.drag_indicator,
                          size: 48, color: Colors.grey.withValues(alpha: 0.3)),
                      const SizedBox(height: 12),
                      Text('UI要素をドラッグ＆ドロップ',
                          style: TextStyle(
                              color: Colors.grey.withValues(alpha: 0.5), fontSize: 14)),
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPlacedElement(_PlacedElement el) {
    final isSelected = _selectedElementId == el.id;
    return Positioned(
      left: el.position.dx,
      top: el.position.dy,
      child: GestureDetector(
        onPanUpdate: (details) {
          setState(() {
            el.position += details.delta;
          });
        },
        onTap: () => setState(() => _selectedElementId = el.id),
        onDoubleTap: () => _renameElement(el.id),
        child: Container(
          width: el.width,
          height: el.height,
          decoration: BoxDecoration(
            color: el.bg == Colors.transparent ? null : el.bg,
            border: Border.all(
              color: isSelected ? AppColors.accent : const Color(0xFFCBD5E1),
              width: 2,
              strokeAlign: BorderSide.strokeAlignInside,
            ),
            borderRadius: BorderRadius.circular(4),
          ),
          alignment: Alignment.center,
          child: Text(
            el.label,
            style: TextStyle(fontSize: 12, color: el.textColor),
          ),
        ),
      ),
    );
  }
}
