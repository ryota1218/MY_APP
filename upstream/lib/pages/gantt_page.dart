import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/common.dart';

class _GanttTask {
  int id;
  String name;
  bool phase;
  DateTime start;
  DateTime end;
  Color color;
  _GanttTask({
    required this.id,
    required this.name,
    required this.phase,
    required this.start,
    required this.end,
    required this.color,
  });
}

class GanttPage extends StatefulWidget {
  const GanttPage({super.key});
  @override
  State<GanttPage> createState() => _GanttPageState();
}

class _GanttPageState extends State<GanttPage> {
  late List<_GanttTask> _tasks;
  int _taskIdCounter = 11;

  @override
  void initState() {
    super.initState();
    _tasks = [
      _GanttTask(id: 1, name: '要件定義', phase: true, start: DateTime(2026, 5, 1), end: DateTime(2026, 5, 14), color: const Color(0xFF7C3AED)),
      _GanttTask(id: 2, name: 'ヒアリング', phase: false, start: DateTime(2026, 5, 1), end: DateTime(2026, 5, 7), color: const Color(0xFFA78BFA)),
      _GanttTask(id: 3, name: '要件書作成', phase: false, start: DateTime(2026, 5, 5), end: DateTime(2026, 5, 14), color: const Color(0xFFA78BFA)),
      _GanttTask(id: 4, name: '基本設計', phase: true, start: DateTime(2026, 5, 12), end: DateTime(2026, 5, 28), color: const Color(0xFF06B6D4)),
      _GanttTask(id: 5, name: '画面設計', phase: false, start: DateTime(2026, 5, 12), end: DateTime(2026, 5, 21), color: const Color(0xFF22D3EE)),
      _GanttTask(id: 6, name: 'DB設計', phase: false, start: DateTime(2026, 5, 15), end: DateTime(2026, 5, 25), color: const Color(0xFF22D3EE)),
      _GanttTask(id: 7, name: 'API設計', phase: false, start: DateTime(2026, 5, 19), end: DateTime(2026, 5, 28), color: const Color(0xFF22D3EE)),
      _GanttTask(id: 8, name: '詳細設計', phase: true, start: DateTime(2026, 5, 26), end: DateTime(2026, 6, 11), color: const Color(0xFF10B981)),
      _GanttTask(id: 9, name: 'コンポーネント設計', phase: false, start: DateTime(2026, 5, 26), end: DateTime(2026, 6, 4), color: const Color(0xFF34D399)),
      _GanttTask(id: 10, name: 'テスト計画', phase: false, start: DateTime(2026, 6, 1), end: DateTime(2026, 6, 11), color: const Color(0xFF34D399)),
    ];
  }

  ({DateTime start, DateTime end}) _getDateRange() {
    DateTime minDate = DateTime(2099, 12, 31);
    DateTime maxDate = DateTime(2000, 1, 1);
    for (final t in _tasks) {
      if (t.start.isBefore(minDate)) minDate = t.start;
      if (t.end.isAfter(maxDate)) maxDate = t.end;
    }
    return (
      start: minDate.subtract(const Duration(days: 3)),
      end: maxDate.add(const Duration(days: 7)),
    );
  }

  void _addPhase() {
    final nameController = TextEditingController();
    DateTime? startDate;
    DateTime? endDate;
    showAppModal(
      context,
      title: 'フェーズ追加',
      body: StatefulBuilder(
        builder: (context, setDialogState) => Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppFormField(
              label: 'フェーズ名',
              child: TextField(
                controller: nameController,
                style: const TextStyle(color: AppColors.text),
              ),
            ),
            AppFormField(
              label: '開始日',
              child: InkWell(
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2025),
                    lastDate: DateTime(2030),
                  );
                  if (date != null) setDialogState(() => startDate = date);
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  ),
                  child: Text(
                    startDate != null
                        ? '${startDate!.year}/${startDate!.month}/${startDate!.day}'
                        : '日付を選択',
                    style: TextStyle(
                      color: startDate != null ? AppColors.text : AppColors.textMuted,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),
            AppFormField(
              label: '終了日',
              child: InkWell(
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2025),
                    lastDate: DateTime(2030),
                  );
                  if (date != null) setDialogState(() => endDate = date);
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  ),
                  child: Text(
                    endDate != null
                        ? '${endDate!.year}/${endDate!.month}/${endDate!.day}'
                        : '日付を選択',
                    style: TextStyle(
                      color: endDate != null ? AppColors.text : AppColors.textMuted,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      onConfirm: () {
        final name = nameController.text.trim();
        if (name.isNotEmpty && startDate != null && endDate != null) {
          final colors = [
            const Color(0xFF7C3AED),
            const Color(0xFF06B6D4),
            const Color(0xFF10B981),
            const Color(0xFFF59E0B),
            const Color(0xFFEC4899),
            const Color(0xFF6366F1),
          ];
          setState(() {
            _tasks.add(_GanttTask(
              id: _taskIdCounter++,
              name: name,
              phase: true,
              start: startDate!,
              end: endDate!,
              color: colors[_tasks.length % colors.length],
            ));
          });
          showToast(context, 'フェーズを追加しました');
        }
      },
    );
  }

  void _addTask() {
    final nameController = TextEditingController();
    DateTime? startDate;
    DateTime? endDate;
    showAppModal(
      context,
      title: 'タスク追加',
      body: StatefulBuilder(
        builder: (context, setDialogState) => Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppFormField(
              label: 'タスク名',
              child: TextField(
                controller: nameController,
                style: const TextStyle(color: AppColors.text),
              ),
            ),
            AppFormField(
              label: '開始日',
              child: InkWell(
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2025),
                    lastDate: DateTime(2030),
                  );
                  if (date != null) setDialogState(() => startDate = date);
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  ),
                  child: Text(
                    startDate != null
                        ? '${startDate!.year}/${startDate!.month}/${startDate!.day}'
                        : '日付を選択',
                    style: TextStyle(
                      color: startDate != null ? AppColors.text : AppColors.textMuted,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),
            AppFormField(
              label: '終了日',
              child: InkWell(
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2025),
                    lastDate: DateTime(2030),
                  );
                  if (date != null) setDialogState(() => endDate = date);
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  ),
                  child: Text(
                    endDate != null
                        ? '${endDate!.year}/${endDate!.month}/${endDate!.day}'
                        : '日付を選択',
                    style: TextStyle(
                      color: endDate != null ? AppColors.text : AppColors.textMuted,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      onConfirm: () {
        final name = nameController.text.trim();
        if (name.isNotEmpty && startDate != null && endDate != null) {
          setState(() {
            _tasks.add(_GanttTask(
              id: _taskIdCounter++,
              name: name,
              phase: false,
              start: startDate!,
              end: endDate!,
              color: const Color(0xFFA78BFA),
            ));
          });
          showToast(context, 'タスクを追加しました');
        }
      },
    );
  }

  void _exportCSV() {
    showToast(context, 'CSVをエクスポートしました');
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'ガントチャート',
            subtitle: 'プロジェクトのスケジュールを視覚的に管理します',
          ),
          ToolBar(
            title: 'ガントチャート',
            actions: [
              SmallButton(label: '＋ フェーズ追加', onPressed: _addPhase),
              SmallButton(label: '＋ タスク追加', onPressed: _addTask),
              const ToolBarSep(),
              SmallButton(label: '📥 CSVエクスポート', onPressed: _exportCSV, primary: true),
            ],
          ),
          Expanded(child: _buildGanttChart()),
        ],
      ),
    );
  }

  Widget _buildGanttChart() {
    if (_tasks.isEmpty) return const SizedBox.shrink();

    final range = _getDateRange();
    final days = <DateTime>[];
    var d = range.start;
    while (!d.isAfter(range.end)) {
      days.add(d);
      d = d.add(const Duration(days: 1));
    }
    const dayWidth = 36.0;
    const taskHeight = 41.0;
    const headerHeight = 48.0;
    const taskListWidth = 300.0;
    final weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        child: Row(
          children: [
            // Task list
            SizedBox(
              width: taskListWidth,
              child: Column(
                children: [
                  // Task list header
                  Container(
                    height: headerHeight,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: const BoxDecoration(
                      color: AppColors.bgSecondary,
                      border: Border(
                        bottom: BorderSide(color: AppColors.border),
                        right: BorderSide(color: AppColors.border),
                      ),
                    ),
                    child: const Row(
                      children: [
                        Expanded(
                            child: Text('タスク名',
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textDim))),
                        SizedBox(
                            width: 70,
                            child: Text('開始日',
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textDim))),
                        SizedBox(
                            width: 70,
                            child: Text('終了日',
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textDim))),
                      ],
                    ),
                  ),
                  // Task rows
                  Expanded(
                    child: ListView.builder(
                      itemCount: _tasks.length,
                      itemBuilder: (context, index) {
                        final task = _tasks[index];
                        return GestureDetector(
                          onDoubleTap: () {
                            final controller =
                                TextEditingController(text: task.name);
                            showAppModal(
                              context,
                              title: 'タスク名',
                              body: AppFormField(
                                label: 'タスク名',
                                child: TextField(
                                  controller: controller,
                                  style: const TextStyle(color: AppColors.text),
                                ),
                              ),
                              onConfirm: () {
                                if (controller.text.isNotEmpty) {
                                  setState(() => task.name = controller.text);
                                }
                              },
                            );
                          },
                          child: Container(
                            height: taskHeight,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: task.phase
                                  ? const Color(0x147C3AED)
                                  : Colors.transparent,
                              border: const Border(
                                bottom: BorderSide(color: AppColors.border),
                                right: BorderSide(color: AppColors.border),
                              ),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Padding(
                                    padding: EdgeInsets.only(
                                        left: task.phase ? 0 : 16),
                                    child: Text(
                                      '${task.phase ? '▸ ' : ''}${task.name}',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: task.phase
                                            ? FontWeight.w600
                                            : FontWeight.normal,
                                        color: AppColors.text,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  width: 70,
                                  child: Text(
                                    '${task.start.month.toString().padLeft(2, '0')}/${task.start.day.toString().padLeft(2, '0')}',
                                    style: const TextStyle(
                                        fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ),
                                SizedBox(
                                  width: 70,
                                  child: Text(
                                    '${task.end.month.toString().padLeft(2, '0')}/${task.end.day.toString().padLeft(2, '0')}',
                                    style: const TextStyle(
                                        fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            // Timeline
            Expanded(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: days.length * dayWidth,
                  child: Column(
                    children: [
                      // Timeline header
                      SizedBox(
                        height: headerHeight,
                        child: Row(
                          children: days.map((day) {
                            final isWeekend =
                                day.weekday == DateTime.sunday || day.weekday == DateTime.saturday;
                            return Container(
                              width: dayWidth,
                              decoration: BoxDecoration(
                                color: isWeekend
                                    ? Colors.white.withValues(alpha: 0.02)
                                    : AppColors.bgSecondary,
                                border: const Border(
                                  bottom: BorderSide(color: AppColors.border),
                                  right: BorderSide(
                                      color: Color(0x08FFFFFF)),
                                ),
                              ),
                              alignment: Alignment.center,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text('${day.day}',
                                      style: const TextStyle(
                                          fontSize: 11,
                                          color: AppColors.textMuted)),
                                  Text(weekdays[day.weekday % 7],
                                      style: const TextStyle(
                                          fontSize: 9,
                                          color: AppColors.textMuted)),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      // Bars
                      Expanded(
                        child: ListView.builder(
                          itemCount: _tasks.length,
                          itemBuilder: (context, index) {
                            final task = _tasks[index];
                            final startOffset = task.start
                                .difference(range.start)
                                .inDays;
                            final duration =
                                task.end.difference(task.start).inDays + 1;
                            final left = startOffset * dayWidth;
                            final width = duration * dayWidth;
                            return SizedBox(
                              height: taskHeight,
                              child: Stack(
                                children: [
                                  // Background row line
                                  Positioned.fill(
                                    child: Container(
                                      decoration: const BoxDecoration(
                                        border: Border(
                                          bottom: BorderSide(
                                              color: Color(0x08FFFFFF)),
                                        ),
                                      ),
                                    ),
                                  ),
                                  // Bar
                                  Positioned(
                                    left: left,
                                    top: task.phase ? 16 : 8,
                                    child: Container(
                                      width: width.clamp(20, double.infinity),
                                      height: task.phase ? 8 : 24,
                                      decoration: BoxDecoration(
                                        gradient: task.phase
                                            ? LinearGradient(colors: [
                                                task.color.withValues(alpha: 0.3),
                                                task.color.withValues(alpha: 0.3),
                                              ])
                                            : LinearGradient(colors: [
                                                task.color,
                                                task.color.withValues(alpha: 0.8),
                                              ]),
                                        borderRadius: BorderRadius.circular(
                                            task.phase ? 4 : 6),
                                        border: task.phase
                                            ? Border.all(
                                                color:
                                                    task.color.withValues(alpha: 0.5))
                                            : null,
                                      ),
                                      alignment: Alignment.centerLeft,
                                      padding:
                                          const EdgeInsets.symmetric(horizontal: 8),
                                      child: task.phase
                                          ? null
                                          : Text(
                                              task.name,
                                              style: const TextStyle(
                                                  fontSize: 10,
                                                  color: Colors.white),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
