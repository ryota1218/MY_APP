import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../theme.dart';
import '../widgets/common.dart';

const _apiBase = 'http://localhost:8000';

class ProposalPage extends StatefulWidget {
  const ProposalPage({super.key});
  @override
  State<ProposalPage> createState() => _ProposalPageState();
}

class _ProposalPageState extends State<ProposalPage> {
  String _projType = '';
  String _projScale = 'small';
  String _projPriority = 'speed';
  String _projUserScale = '';
  String _projTeamSkill = '';
  String _projBudget = '';
  String _projDeploy = '';
  String _projDesc = '';

  bool _apiAvailable = false;
  bool _loading = false;
  Map<String, dynamic>? _lastResult;
  String? _errorMessage;
  String _statusText = '● オフライン';
  Color _statusColor = const Color(0xFFF87171);

  @override
  void initState() {
    super.initState();
    _checkApi();
  }

  Future<void> _checkApi() async {
    try {
      final res = await http
          .get(Uri.parse('$_apiBase/api/health'))
          .timeout(const Duration(seconds: 3));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (!mounted) return;
        setState(() {
          _apiAvailable = true;
          if (data['ai_configured'] == true) {
            _statusText = '● AI接続中';
            _statusColor = const Color(0xFF34D399);
          } else {
            _statusText = '● フォールバック';
            _statusColor = const Color(0xFFFBBF24);
          }
        });
      }
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _apiAvailable = false;
        _statusText = '● オフライン';
        _statusColor = const Color(0xFFF87171);
      });
    }
  }

  Map<String, dynamic> _buildRequestBody() {
    final body = <String, dynamic>{
      'project_type': _projType,
      'scale': _projScale,
      'priority': _projPriority,
    };
    if (_projDesc.isNotEmpty) body['description'] = _projDesc;
    if (_projUserScale.isNotEmpty) body['user_scale'] = _projUserScale;
    if (_projTeamSkill.isNotEmpty) body['team_skill'] = _projTeamSkill;
    if (_projBudget.isNotEmpty) body['budget'] = _projBudget;
    if (_projDeploy.isNotEmpty) body['deploy_env'] = _projDeploy;
    return body;
  }

  Future<void> _generate() async {
    if (_projType.isEmpty) {
      showToast(context, 'プロジェクト種別を選択してください');
      return;
    }
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    final body = _buildRequestBody();
    try {
      if (_apiAvailable) {
        final res = await http.post(
          Uri.parse('$_apiBase/api/proposal/generate'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        );
        if (res.statusCode != 200) {
          throw Exception('API Error: ${res.statusCode}');
        }
        if (!mounted) return;
        setState(() {
          _lastResult = jsonDecode(res.body);
          _loading = false;
        });
      } else {
        showToast(context, 'バックエンド未起動のため簡易提案を表示します');
        await Future.delayed(const Duration(milliseconds: 500));
        if (!mounted) return;
        setState(() {
          _lastResult = _localFallback(body);
          _loading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _errorMessage = e.toString();
      });
    }
  }

  Map<String, dynamic> _localFallback(Map<String, dynamic> body) {
    final db = <String, Map<String, List<String>>>{
      'web': {
        'langs': ['TypeScript', 'JavaScript', 'Python', 'Go'],
        'fws': ['Next.js', 'React', 'Vue.js', 'Django'],
        'svcs': ['AWS', 'Vercel', 'Firebase'],
        'dbs': ['PostgreSQL', 'MySQL', 'MongoDB'],
        'infra': ['Docker', 'GitHub Actions'],
        'feats': ['SPA/SSR', '認証', 'REST API', 'CI/CD'],
      },
      'mobile': {
        'langs': ['Dart', 'Kotlin', 'Swift', 'TypeScript'],
        'fws': ['Flutter', 'React Native', 'SwiftUI'],
        'svcs': ['Firebase', 'AWS Amplify', 'Supabase'],
        'dbs': ['SQLite', 'Firebase DB'],
        'infra': ['Fastlane', 'Codemagic'],
        'feats': ['プッシュ通知', 'オフライン対応', '生体認証'],
      },
      'api': {
        'langs': ['Go', 'Rust', 'TypeScript', 'Python', 'Java'],
        'fws': ['Gin', 'NestJS', 'FastAPI', 'Spring Boot'],
        'svcs': ['AWS Lambda', 'Docker/K8s', 'API Gateway'],
        'dbs': ['PostgreSQL', 'Redis', 'DynamoDB'],
        'infra': ['Docker', 'Kubernetes', 'Terraform'],
        'feats': ['REST/GraphQL', 'gRPC', 'キャッシュ', 'レート制限'],
      },
      'ai': {
        'langs': ['Python', 'R', 'Julia', 'C++'],
        'fws': ['PyTorch', 'TensorFlow', 'scikit-learn', 'LangChain'],
        'svcs': ['AWS SageMaker', 'GCP Vertex AI', 'Hugging Face'],
        'dbs': ['PostgreSQL', 'Pinecone', 'Elasticsearch'],
        'infra': ['Docker', 'MLflow', 'Kubeflow'],
        'feats': ['モデル学習', '推論API', 'データパイプライン'],
      },
      'iot': {
        'langs': ['C/C++', 'Python', 'Rust', 'MicroPython'],
        'fws': ['ESP-IDF', 'Arduino', 'MQTT', 'Node-RED'],
        'svcs': ['AWS IoT Core', 'Azure IoT Hub'],
        'dbs': ['InfluxDB', 'TimescaleDB'],
        'infra': ['Docker', 'MQTT Broker'],
        'feats': ['センサーデータ収集', 'リアルタイム監視', 'OTA更新'],
      },
      'enterprise': {
        'langs': ['Java', 'C#', 'TypeScript', 'Python'],
        'fws': ['Spring Boot', 'ASP.NET', 'Angular', 'React'],
        'svcs': ['AWS', 'Azure', 'Oracle Cloud'],
        'dbs': ['PostgreSQL', 'Oracle', 'SQL Server'],
        'infra': ['Docker', 'Jenkins', 'Terraform'],
        'feats': ['SSO認証', '権限管理', '帳票出力', '監査ログ'],
      },
      'ec': {
        'langs': ['TypeScript', 'PHP', 'Python', 'Ruby'],
        'fws': ['Next.js', 'Laravel', 'Shopify API'],
        'svcs': ['AWS', 'Stripe', 'SendGrid'],
        'dbs': ['PostgreSQL', 'MySQL', 'Redis'],
        'infra': ['Docker', 'GitHub Actions'],
        'feats': ['決済連携', '在庫管理', '検索', 'レコメンド'],
      },
      'cms': {
        'langs': ['TypeScript', 'PHP', 'Python'],
        'fws': ['Next.js', 'WordPress', 'Strapi', 'Contentful'],
        'svcs': ['Vercel', 'AWS S3', 'Cloudinary'],
        'dbs': ['PostgreSQL', 'MySQL', 'MongoDB'],
        'infra': ['Docker', 'Vercel'],
        'feats': ['WYSIWYG編集', 'メディア管理', 'SEO', '多言語対応'],
      },
    };
    final d = db[body['project_type']] ?? db['web']!;
    List<Map<String, dynamic>> mkItems(List<String> arr) => arr
        .asMap()
        .entries
        .map(
          (e) => {
            'name': e.value,
            'reason': 'バックエンド接続で詳細な理由が表示されます',
            'score': (90 - e.key * 10).clamp(50, 90),
          },
        )
        .toList();
    return {
      'advice': 'バックエンドに接続すると、AIによる詳細な分析と選定理由が提供されます。',
      'categories': [
        {'category': 'プログラミング言語', 'items': mkItems(d['langs']!)},
        {'category': 'フレームワーク', 'items': mkItems(d['fws']!)},
        {'category': 'クラウドサービス', 'items': mkItems(d['svcs']!)},
        {'category': 'データベース', 'items': mkItems(d['dbs']!)},
        {'category': 'インフラ/DevOps', 'items': mkItems(d['infra']!)},
        {'category': '推奨機能', 'items': mkItems(d['feats']!)},
      ],
      'architecture_suggestion': 'AI接続時にプロジェクト条件に基づくアーキテクチャ提案が表示されます。',
    };
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: '技術スタック提案',
            subtitle: 'プロジェクトの要件に最適なサービス・言語・機能を提案します',
          ),
          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth > 800) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: _buildForm()),
                    const SizedBox(width: 24),
                    Expanded(child: _buildResults()),
                  ],
                );
              }
              return Column(
                children: [
                  _buildForm(),
                  const SizedBox(height: 24),
                  _buildResults(),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'プロジェクト情報',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const Spacer(),
              Text(
                _statusText,
                style: TextStyle(fontSize: 12, color: _statusColor),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _dropdown('プロジェクト種別', true, _projType, {
            '': '選択してください',
            'web': 'Webアプリケーション',
            'mobile': 'モバイルアプリ',
            'api': 'API / マイクロサービス',
            'ai': 'AI / 機械学習',
            'iot': 'IoTシステム',
            'enterprise': '業務システム',
            'ec': 'ECサイト',
            'cms': 'CMS / ポータル',
          }, (v) => setState(() => _projType = v ?? '')),
          _dropdown('チーム規模', true, _projScale, {
            'small': '小規模（〜5人）',
            'medium': '中規模（5〜20人）',
            'large': '大規模（20人〜）',
          }, (v) => setState(() => _projScale = v ?? 'small')),
          _dropdown(
            '重視するポイント',
            true,
            _projPriority,
            {
              'speed': '開発スピード',
              'performance': 'パフォーマンス',
              'security': 'セキュリティ',
              'scalability': 'スケーラビリティ',
              'cost': 'コスト削減',
            },
            (v) => setState(() => _projPriority = v ?? 'speed'),
          ),
          _dropdown(
            '想定ユーザー数',
            false,
            _projUserScale,
            {
              '': '未指定',
              'small': '〜1,000人',
              'medium': '〜100,000人',
              'large': '100,000人〜',
            },
            (v) => setState(() => _projUserScale = v ?? ''),
          ),
          _dropdown(
            'チームスキル傾向',
            false,
            _projTeamSkill,
            {
              '': '未指定',
              'frontend': 'フロントエンド寄り',
              'backend': 'バックエンド寄り',
              'fullstack': 'フルスタック',
            },
            (v) => setState(() => _projTeamSkill = v ?? ''),
          ),
          _dropdown('予算感', false, _projBudget, {
            '': '未指定',
            'low': '低（OSS中心）',
            'medium': '中',
            'high': '高（有料SaaS可）',
          }, (v) => setState(() => _projBudget = v ?? '')),
          _dropdown('デプロイ環境', false, _projDeploy, {
            '': '未指定',
            'cloud': 'クラウド',
            'onpremise': 'オンプレミス',
            'hybrid': 'ハイブリッド',
          }, (v) => setState(() => _projDeploy = v ?? '')),
          AppFormField(
            label: 'プロジェクト概要',
            child: TextField(
              maxLines: 4,
              decoration: const InputDecoration(hintText: 'プロジェクトの概要や特徴を入力...'),
              onChanged: (v) => _projDesc = v,
              style: const TextStyle(fontSize: 14, color: AppColors.text),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _loading ? null : _generate,
              icon: const Text('🚀'),
              label: const Text('提案を生成'),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _lastResult == null
                  ? null
                  : () => showToast(context, '提案書をエクスポートしました'),
              icon: const Text('📄'),
              label: const Text('結果をエクスポート'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _dropdown(
    String label,
    bool required,
    String value,
    Map<String, String> items,
    ValueChanged<String?> onChanged,
  ) {
    return AppFormField(
      label: label,
      required: required,
      child: DropdownButtonFormField<String>(
        initialValue: value,
        dropdownColor: AppColors.bgSecondary,
        style: const TextStyle(fontSize: 14, color: AppColors.text),
        items: items.entries
            .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
            .toList(),
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildResults() {
    if (_loading) {
      return GlassCard(
        child: SizedBox(
          height: 200,
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(
                  color: AppColors.accent,
                  strokeWidth: 3,
                ),
                const SizedBox(height: 16),
                const Text(
                  '提案を生成中...',
                  style: TextStyle(color: AppColors.textDim),
                ),
              ],
            ),
          ),
        ),
      );
    }
    if (_errorMessage != null) {
      return GlassCard(
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0x1AEF4444),
            border: Border.all(color: const Color(0x4DEF4444)),
            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '⚠️ エラー:',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              Text(
                _errorMessage!,
                style: const TextStyle(color: AppColors.textDim, fontSize: 13),
              ),
              const SizedBox(height: 4),
              const Text(
                'バックエンドが起動していることを確認してください。',
                style: TextStyle(color: AppColors.textDim, fontSize: 13),
              ),
            ],
          ),
        ),
      );
    }
    if (_lastResult == null) {
      return GlassCard(
        child: SizedBox(
          height: 200,
          child: Center(
            child: Text(
              '← プロジェクト情報を入力して提案を受けましょう',
              style: TextStyle(color: AppColors.textDim, fontSize: 14),
            ),
          ),
        ),
      );
    }
    return _buildResultContent(_lastResult!);
  }

  Widget _buildResultContent(Map<String, dynamic> data) {
    final catIcons = {
      'プログラミング言語': '📝',
      'フレームワーク': '⚙️',
      'クラウドサービス': '☁️',
      'データベース': '🗄️',
      'インフラ/DevOps': '🏗️',
      '推奨機能': '🔧',
    };
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Advice
          if (data['advice'] != null)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: const Color(0x1A7C3AED),
                border: Border.all(color: const Color(0x4D7C3AED)),
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('💡 ', style: TextStyle(fontSize: 16)),
                  Expanded(
                    child: Text(
                      'アドバイス: ${data['advice']}',
                      style: const TextStyle(fontSize: 13, height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
          // Categories
          if (data['categories'] != null)
            ...List<Widget>.from(
              (data['categories'] as List).map((cat) {
                final icon = catIcons[cat['category']] ?? '📦';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$icon ${cat['category']}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          height: 2,
                        ),
                      ),
                      ...List<Widget>.from(
                        (cat['items'] as List).map((item) {
                          final score = (item['score'] as num).toInt();
                          final scoreColor = score >= 80
                              ? const Color(0xFF34D399)
                              : score >= 60
                              ? const Color(0xFFFBBF24)
                              : AppColors.textMuted;
                          return Container(
                            margin: const EdgeInsets.only(top: 6),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.bgGlass,
                              border: Border.all(color: AppColors.border),
                              borderRadius: BorderRadius.circular(
                                AppTheme.radiusSm,
                              ),
                            ),
                            child: Row(
                              children: [
                                if (score >= 85)
                                  const Text(
                                    '★ ',
                                    style: TextStyle(color: Color(0xFFFBBF24)),
                                  ),
                                SizedBox(
                                  width: 110,
                                  child: Text(
                                    item['name'],
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    item['reason'],
                                    style: const TextStyle(
                                      color: AppColors.textDim,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '$score点',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: scoreColor,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                );
              }),
            ),
          // Architecture suggestion
          if (data['architecture_suggestion'] != null)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(top: 8),
              decoration: BoxDecoration(
                color: const Color(0x1A06B6D4),
                border: Border.all(color: const Color(0x4D06B6D4)),
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '🏛️ アーキテクチャ提案:',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    data['architecture_suggestion'],
                    style: const TextStyle(
                      color: AppColors.textDim,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
