import 'package:flutter_test/flutter_test.dart';

import 'package:upstream/main.dart';

void main() {
  testWidgets('UpStream app loads and shows dashboard', (WidgetTester tester) async {
    await tester.pumpWidget(const UpStreamApp());
    expect(find.text('UpStream'), findsOneWidget);
    expect(find.text('ダッシュボード'), findsWidgets);
  });
}
