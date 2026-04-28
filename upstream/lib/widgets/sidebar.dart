import 'package:flutter/material.dart';
import '../theme.dart';

/// Navigation item model
class NavItem {
  final String id;
  final String icon;
  final String label;
  const NavItem({required this.id, required this.icon, required this.label});
}

const navItems = [
  NavItem(id: 'dashboard', icon: '📊', label: 'ダッシュボード'),
  NavItem(id: 'proposal', icon: '💡', label: '技術スタック提案'),
  NavItem(id: 'requirements', icon: '📋', label: '要件定義書'),
  NavItem(id: 'architecture', icon: '🏗️', label: 'システム構成図'),
  NavItem(id: 'uml', icon: '🔄', label: 'UML・画面遷移図'),
  NavItem(id: 'layout', icon: '📐', label: '画面レイアウト'),
  NavItem(id: 'erdiagram', icon: '🗃️', label: 'E-R図'),
  NavItem(id: 'gantt', icon: '📅', label: 'ガントチャート'),
];

class AppSidebar extends StatelessWidget {
  final String currentTool;
  final ValueChanged<String> onToolSelected;
  final bool collapsed;

  const AppSidebar({
    super.key,
    required this.currentTool,
    required this.onToolSelected,
    this.collapsed = false,
  });

  @override
  Widget build(BuildContext context) {
    final width = collapsed ? AppTheme.sidebarCollapsedWidth : AppTheme.sidebarWidth;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      width: width,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xF2111827), // rgba(17,24,39,0.95)
            Color(0xFA0A0E1A), // rgba(10,14,26,0.98)
          ],
        ),
        border: const Border(right: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        children: [
          // Logo
          _buildLogo(),
          // Nav items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              children: navItems
                  .map((item) => _buildNavItem(item, item.id == currentTool))
                  .toList(),
            ),
          ),
          // Footer
          Container(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: collapsed
                ? const SizedBox.shrink()
                : const Text(
                    'UpStream v1.0 © 2026',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                    textAlign: TextAlign.center,
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: collapsed ? 8 : 20,
        vertical: 20,
      ),
      child: Row(
        mainAxisAlignment: collapsed ? MainAxisAlignment.center : MainAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              gradient: AppColors.headerGradient,
            ),
            alignment: Alignment.center,
            child: const Text('▲',
                style: TextStyle(fontSize: 18, color: Colors.white)),
          ),
          if (!collapsed) ...[
            const SizedBox(width: 12),
            ShaderMask(
              shaderCallback: (bounds) =>
                  AppColors.headerGradient.createShader(bounds),
              child: const Text(
                'UpStream',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNavItem(NavItem item, bool active) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          onTap: () => onToolSelected(item.id),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.symmetric(
              horizontal: collapsed ? 0 : 14,
              vertical: 12,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              gradient: active
                  ? const LinearGradient(
                      colors: [
                        Color(0x337C3AED), // rgba(124,58,237,0.2)
                        Color(0x1A06B6D4), // rgba(6,182,212,0.1)
                      ],
                    )
                  : null,
              border: active ? Border.all(color: AppColors.borderHover) : null,
            ),
            child: Row(
              mainAxisAlignment:
                  collapsed ? MainAxisAlignment.center : MainAxisAlignment.start,
              children: [
                // Active indicator
                if (active && !collapsed)
                  Container(
                    width: 3,
                    height: 22,
                    margin: const EdgeInsets.only(right: 10),
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                Text(item.icon, style: const TextStyle(fontSize: 18)),
                if (!collapsed) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      item.label,
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w500,
                        color: active ? Colors.white : AppColors.textDim,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
