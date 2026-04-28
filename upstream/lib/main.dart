import 'package:flutter/material.dart';
import 'theme.dart';
import 'widgets/sidebar.dart';
import 'pages/dashboard_page.dart';
import 'pages/proposal_page.dart';
import 'pages/requirements_page.dart';
import 'pages/diagram_page.dart';
import 'pages/layout_page.dart';
import 'pages/erdiagram_page.dart';
import 'pages/gantt_page.dart';

void main() {
  runApp(const UpStreamApp());
}

class UpStreamApp extends StatelessWidget {
  const UpStreamApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UpStream | 上流工程サポートツール',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainShell(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell>
    with SingleTickerProviderStateMixin {
  String _currentTool = 'dashboard';
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  static const List<String> _toolOrder = [
    'dashboard',
    'proposal',
    'requirements',
    'architecture',
    'uml',
    'layout',
    'erdiagram',
    'gantt',
  ];

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    );
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  void _navigateTo(String toolId) {
    if (_currentTool == toolId) return;
    _fadeController.reset();
    setState(() => _currentTool = toolId);
    _fadeController.forward();
  }

  int get _currentIndex {
    final index = _toolOrder.indexOf(_currentTool);
    return index >= 0 ? index : 0;
  }

  List<Widget> _buildPages() {
    return [
      KeyedSubtree(
        key: const ValueKey('dashboard'),
        child: DashboardPage(onNavigate: _navigateTo),
      ),
      const KeyedSubtree(key: ValueKey('proposal'), child: ProposalPage()),
      const KeyedSubtree(
        key: ValueKey('requirements'),
        child: RequirementsPage(),
      ),
      const KeyedSubtree(
        key: ValueKey('architecture'),
        child: DiagramPage(
          title: 'システム構成図',
          subtitle: 'コンポーネントをドラッグ＆ドロップしてシステム構成を設計します',
          isArchitecture: true,
        ),
      ),
      const KeyedSubtree(
        key: ValueKey('uml'),
        child: DiagramPage(
          title: 'UML・画面遷移図',
          subtitle: '画面遷移やステートマシンの図を作成します',
          isArchitecture: false,
        ),
      ),
      const KeyedSubtree(key: ValueKey('layout'), child: LayoutPage()),
      const KeyedSubtree(key: ValueKey('erdiagram'), child: ERDiagramPage()),
      const KeyedSubtree(key: ValueKey('gantt'), child: GanttPage()),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width > 1024;
    return Scaffold(
      body: Stack(
        children: [
          // Background radial glow
          Positioned(
            top: -200,
            right: -200,
            child: Container(
              width: 600,
              height: 600,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.accent.withValues(alpha: 0.08),
                    Colors.transparent,
                  ],
                  stops: const [0, 0.7],
                ),
              ),
            ),
          ),
          // Main layout
          Row(
            children: [
              AppSidebar(
                currentTool: _currentTool,
                onToolSelected: _navigateTo,
                collapsed: !isWide,
              ),
              Expanded(
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: IndexedStack(
                    index: _currentIndex,
                    children: _buildPages(),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
