import requests
from icalendar import Calendar
import sys

# ==========================================
# ここにOutlook等から取得した「iCal（ICS）形式のURL」を貼り付けてください
ICAL_URL = "https://outlook.office365.com/owa/calendar/3046dea55c8b423aa735da226e9bde78@ocsjoho.onmicrosoft.com/8aee6f4352ab436496492e6107bc45519848918447513966444/calendar.ics"
# ==========================================

def test_ical_sync():
    if ICAL_URL == "ここにiCalのURLを貼り付ける":
        print("エラー: スクリプト内の ICAL_URL を実際のURLに書き換えてください。")
        sys.exit(1)

    print("=== iCal URL連携の検証を開始します ===")
    print("データをダウンロード中...\n")

    try:
        # URLからデータをダウンロード
        response = requests.get(ICAL_URL)
        response.raise_for_status() # HTTPエラーチェック
        
        print("✅ ダウンロード成功！データを解析します...\n")
        
        # icalendarライブラリで解析
        cal = Calendar.from_ical(response.content)
        
        events = []
        for component in cal.walk():
            if component.name == "VEVENT":
                # タイトルと開始時間を取得
                summary = str(component.get('summary', 'タイトルなし'))
                dtstart = component.get('dtstart').dt if component.get('dtstart') else "不明"
                
                events.append({
                    'summary': summary,
                    'start': dtstart
                })

        print(f"合計 {len(events)} 件の予定が見つかりました！")
        print("【取得した予定の例（最大5件）】")
        print("-" * 40)
        
        for i, event in enumerate(events[:5]):
            print(f"[{i+1}] タイトル: {event['summary']}")
            print(f"    開始時間: {event['start']}")
            print("-" * 40)
            
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        print("URLが間違っているか、公開設定が正しく行われていない可能性があります。")

if __name__ == "__main__":
    test_ical_sync()
