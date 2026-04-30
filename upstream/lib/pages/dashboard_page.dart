import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/common.dart';

/// Feature card model for dashboard
class _Feature {
  final String id;
  final String icon;
  final String title;
  final String desc;
  const _Feature({required this.id, required this.icon, required this.title, required this.desc});
}

const _features = [
  _Feature(id: 'proposal', icon: '💡', title: '技術スタック提案', desc: 'プロジェクトに最適な言語・フレームワーク・サービスをAIが提案'),
  _Feature(id: 'requirements', icon: '📋', title: '要件定義書作成', desc: 'テンプレートベースで要件定義書を効率的に作成・出力'),
  _Feature(id: 'architecture', icon: '🏗️', title: 'システム構成図', desc: 'ドラッグ&ドロップでシステムアーキテクチャを設計'),
  _Feature(id: 'uml', icon: '🔄', title: 'UML・画面遷移図', desc: '状態遷移図や画面フローを視覚的に作成'),
  _Feature(id: 'layout', icon: '📐', title: '画面レイアウト', desc: 'ワイヤーフレームをドラッグ&ドロップで構築'),
  _Feature(id: 'erdiagram', icon: '🗃️', title: 'E-R図', desc: 'エンティティとリレーションシップを直感的に設計'),
  _Feature(id: 'gantt', icon: '📅', title: 'ガントチャート', desc: 'プロジェクトスケジュールを視覚的に管理'),
];

class DashboardPage extends StatelessWidget {
  final ValueChanged<String> onNavigate;
  const DashboardPage({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'ダッシュボード',
            subtitle: '上流工程の各ツールにすばやくアクセスできます',
          ),
          // Stats row
          _buildStatsRow(),
          const SizedBox(height: 32),
          // Feature cards grid
          LayoutBuilder(
            builder: (context, constraints) {
              final crossAxisCount = constraints.maxWidth > 900
                  ? 3
                  : constraints.maxWidth > 560
                      ? 2
                      : 1;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossAxisCount,
                  mainAxisSpacing: 20,
                  crossAxisSpacing: 20,
                  childAspectRatio: 1.6,
                ),
                itemCount: _features.length,
                itemBuilder: (context, index) => _buildFeatureCard(_features[index]),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    final stats = [
      {'value': '7', 'label': 'ツール数'},
      {'value': '0', 'label': '作成済み文書'},
      {'value': '0', 'label': 'エクスポート'},
      {'value': '1.0', 'label': 'バージョン'},
    ];
    return LayoutBuilder(
      builder: (context, constraints) {
        final count = constraints.maxWidth > 800 ? 4 : 2;
        final spacing = 16.0;
        final cardWidth =
            (constraints.maxWidth - spacing * (count - 1)) / count;
        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: stats.map((s) {
            return SizedBox(
              width: cardWidth,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [AppColors.accentLight, AppColors.accent2],
                      ).createShader(bounds),
                      child: Text(s['value']!,
                          style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              color: Colors.white)),
                    ),
                    const SizedBox(height: 4),
                    Text(s['label']!,
                        style: const TextStyle(
                            fontSize: 13, color: AppColors.textDim)),
                  ],
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildFeatureCard(_Feature f) {
    return GlassCard(
      onTap: () => onNavigate(f.id),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: const LinearGradient(
                    colors: [
                      Color(0x337C3AED),
                      Color(0x1A06B6D4),
                    ],
                  ),
                ),
                alignment: Alignment.center,
                child: Text(f.icon, style: const TextStyle(fontSize: 22)),
              ),
              const Spacer(),
              const Icon(Icons.arrow_forward, size: 18, color: AppColors.textMuted),
            ],
          ),
          const SizedBox(height: 16),
          Text(f.title,
              style: const TextStyle(
                  fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.text)),
          const SizedBox(height: 6),
          Text(f.desc,
              style: const TextStyle(fontSize: 13, color: AppColors.textDim, height: 1.5),
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}
