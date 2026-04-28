import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/common.dart';

class _ReqField {
  final String label;
  final String type; // 'input' or 'textarea'
  String value;
  _ReqField({required this.label, required this.type, this.value = ''});
}

class _ReqSection {
  final String id;
  final String title;
  final List<_ReqField> fields;
  _ReqSection({required this.id, required this.title, required this.fields});
}

class RequirementsPage extends StatefulWidget {
  const RequirementsPage({super.key});
  @override
  State<RequirementsPage> createState() => _RequirementsPageState();
}

class _RequirementsPageState extends State<RequirementsPage> {
  late List<_ReqSection> _sections;
  int _activeSection = 0;

  @override
  void initState() {
    super.initState();
    _sections = [
      _ReqSection(id: 'overview', title: '1. 概要', fields: [
        _ReqField(label: 'プロジェクト名', type: 'input'),
        _ReqField(label: 'プロジェクト目的', type: 'textarea'),
        _ReqField(label: '対象ユーザー', type: 'textarea'),
        _ReqField(label: 'スコープ', type: 'textarea'),
      ]),
      _ReqSection(id: 'functional', title: '2. 機能要件', fields: [
        _ReqField(
            label: '機能一覧',
            type: 'textarea',
            value: '例:\n・ユーザー登録/ログイン\n・ダッシュボード表示\n・データ検索・フィルタリング\n・レポート出力'),
        _ReqField(label: '画面一覧', type: 'textarea'),
        _ReqField(label: '外部インターフェース', type: 'textarea'),
      ]),
      _ReqSection(id: 'nonfunctional', title: '3. 非機能要件', fields: [
        _ReqField(label: 'パフォーマンス要件', type: 'textarea'),
        _ReqField(label: '可用性要件', type: 'textarea'),
        _ReqField(label: 'セキュリティ要件', type: 'textarea'),
        _ReqField(label: '拡張性要件', type: 'textarea'),
      ]),
      _ReqSection(id: 'constraints', title: '4. 制約条件', fields: [
        _ReqField(label: '技術的制約', type: 'textarea'),
        _ReqField(label: 'スケジュール制約', type: 'textarea'),
        _ReqField(label: '予算制約', type: 'textarea'),
      ]),
      _ReqSection(id: 'glossary', title: '5. 用語定義', fields: [
        _ReqField(label: '用語集', type: 'textarea', value: '用語 | 定義\n---|---\n'),
      ]),
    ];
  }

  void _addSection() {
    final nameController = TextEditingController();
    showAppModal(
      context,
      title: 'セクション追加',
      body: AppFormField(
        label: 'セクション名',
        child: TextField(
          controller: nameController,
          style: const TextStyle(color: AppColors.text),
        ),
      ),
      onConfirm: () {
        final name = nameController.text.trim();
        if (name.isNotEmpty) {
          setState(() {
            _sections.add(_ReqSection(
              id: 'custom_${DateTime.now().millisecondsSinceEpoch}',
              title: '${_sections.length + 1}. $name',
              fields: [_ReqField(label: '内容', type: 'textarea')],
            ));
            _activeSection = _sections.length - 1;
          });
          showToast(context, 'セクションを追加しました');
        }
      },
    );
  }

  void _exportDoc() {
    final now = DateTime.now();
    final dateStr = '${now.year}/${now.month}/${now.day}';
    var doc = '# 要件定義書\n\n作成日: $dateStr\n\n---\n\n';
    for (final s in _sections) {
      doc += '## ${s.title}\n\n';
      for (final f in s.fields) {
        doc += '### ${f.label}\n\n${f.value.isEmpty ? '（未記入）' : f.value}\n\n';
      }
      doc += '---\n\n';
    }
    showToast(context, '要件定義書をエクスポートしました');
    debugPrint(doc); // TODO: Implement file export with file_saver package
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: '要件定義書',
            subtitle: 'テンプレートに沿って要件定義書を作成・エクスポートできます',
          ),
          ToolBar(
            title: '要件定義書エディタ',
            actions: [
              SmallButton(label: '＋ セクション追加', onPressed: _addSection),
              const ToolBarSep(),
              SmallButton(label: '📄 エクスポート', onPressed: _exportDoc, primary: true),
            ],
          ),
          Expanded(
            child: Row(
              children: [
                // Navigation sidebar
                Container(
                  width: 240,
                  margin: const EdgeInsets.only(right: 16),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  ),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _sections.length,
                    itemBuilder: (context, index) {
                      final active = index == _activeSection;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Material(
                          color: Colors.transparent,
                          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                            onTap: () => setState(() => _activeSection = index),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: active
                                    ? const Color(0x267C3AED)
                                    : Colors.transparent,
                                borderRadius:
                                    BorderRadius.circular(AppTheme.radiusSm),
                              ),
                              child: Text(
                                _sections[index].title,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: active
                                      ? AppColors.accentLight
                                      : AppColors.textDim,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                // Content area
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.bgCard,
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                    ),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: _buildSectionContent(),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionContent() {
    final section = _sections[_activeSection];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(section.title,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 24),
        ...section.fields.map((f) => AppFormField(
              label: f.label,
              child: f.type == 'input'
                  ? TextFormField(
                      initialValue: f.value,
                      onChanged: (v) => f.value = v,
                      style: const TextStyle(color: AppColors.text, fontSize: 14),
                    )
                  : TextFormField(
                      initialValue: f.value,
                      onChanged: (v) => f.value = v,
                      maxLines: 5,
                      style: const TextStyle(color: AppColors.text, fontSize: 14),
                    ),
            )),
      ],
    );
  }
}
