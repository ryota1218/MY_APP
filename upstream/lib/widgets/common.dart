import 'package:flutter/material.dart';
import '../theme.dart';

/// Gradient section header like karaage's .section-header
class SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  const SectionHeader({super.key, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [AppColors.text, AppColors.accentLight],
            ).createShader(bounds),
            child: Text(title,
                style: const TextStyle(
                    fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white)),
          ),
          const SizedBox(height: 6),
          Text(subtitle, style: const TextStyle(color: AppColors.textDim, fontSize: 14)),
        ],
      ),
    );
  }
}

/// Toolbar row (like karaage's .toolbar)
class ToolBar extends StatelessWidget {
  final String title;
  final List<Widget> actions;
  const ToolBar({super.key, required this.title, required this.actions});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
      ),
      child: Row(
        children: [
          Text(title,
              style: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text)),
          const Spacer(),
          ...actions,
        ],
      ),
    );
  }
}

/// Small outlined button for toolbars
class SmallButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool primary;
  const SmallButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.primary = false,
  });

  @override
  Widget build(BuildContext context) {
    if (primary) {
      return Container(
        margin: const EdgeInsets.only(left: 6),
        child: ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            textStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500),
          ),
          child: Text(label),
        ),
      );
    }
    return Container(
      margin: const EdgeInsets.only(left: 6),
      child: OutlinedButton(
        onPressed: onPressed,
        child: Text(label, style: const TextStyle(fontSize: 12.5)),
      ),
    );
  }
}

/// Toolbar separator
class ToolBarSep extends StatelessWidget {
  const ToolBarSep({super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 24,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      color: AppColors.border,
    );
  }
}

/// Glass-style card
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final VoidCallback? onTap;
  const GlassCard({super.key, required this.child, this.padding, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        hoverColor: AppColors.bgCardHover,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: padding ?? const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: child,
        ),
      ),
    );
  }
}

/// Toast-style snackbar helper
void showToast(BuildContext context, String message) {
  ScaffoldMessenger.of(context).removeCurrentSnackBar();
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message, style: const TextStyle(color: AppColors.text)),
      backgroundColor: AppColors.bgSecondary,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
        side: const BorderSide(color: AppColors.border),
      ),
      duration: const Duration(seconds: 2),
      margin: const EdgeInsets.only(bottom: 24, right: 24, left: 24),
    ),
  );
}

/// Modal dialog helper
Future<T?> showAppModal<T>(
  BuildContext context, {
  required String title,
  required Widget body,
  VoidCallback? onConfirm,
}) {
  return showDialog<T>(
    context: context,
    barrierColor: Colors.black54,
    builder: (ctx) => Dialog(
      backgroundColor: AppColors.bgSecondary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 500, minWidth: 380),
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.text)),
              const SizedBox(height: 20),
              body,
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('キャンセル'),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: () {
                      if (onConfirm != null) onConfirm();
                      Navigator.of(ctx).pop();
                    },
                    child: const Text('確定'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

/// Form field builder
class AppFormField extends StatelessWidget {
  final String label;
  final bool required;
  final Widget child;
  const AppFormField({super.key, required this.label, this.required = false, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RichText(
            text: TextSpan(
              text: label,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textDim),
              children: required
                  ? [const TextSpan(text: ' *', style: TextStyle(color: AppColors.danger))]
                  : null,
            ),
          ),
          const SizedBox(height: 6),
          child,
        ],
      ),
    );
  }
}
