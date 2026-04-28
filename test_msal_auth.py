import msal
import requests
import json
import sys

# ==========================================
# ここにStep1で取得した「クライアントID」を貼り付けてください
CLIENT_ID = "49c894a4-99ba-4d6d-b9cf-1bdbd15fe257"

# シングルテナント（自分の学校限定）の場合は「テナントID」も必要です
TENANT_ID = "103afe75-0bcb-4e7d-8b68-d24025dfa82b"
# ==========================================

# 検証したいスコープ（今回はカレンダーの読み取り権限）
SCOPES = ["Calendars.Read"]

def test_student_login():
    if TENANT_ID == "ここにテナントIDを貼り付ける":
        print("エラー: スクリプト内の TENANT_ID を書き換えてください。")
        sys.exit(1)

    # シングルテナントアプリとしてMSALアプリケーションを初期化
    app = msal.PublicClientApplication(
        CLIENT_ID, 
        authority=f"https://login.microsoftonline.com/{TENANT_ID}"
    )

    print("=== Microsoft 365 ログイン検証を開始します ===")
    
    # デバイスコードフロー（ブラウザでコードを入力してログインする方式）を開始
    flow = app.initiate_device_flow(scopes=SCOPES)
    
    if "user_code" not in flow:
        print("デバイスコードフローの初期化に失敗しました。")
        print(flow)
        sys.exit(1)

    print("\n" + "="*50)
    print(flow["message"])
    print("="*50 + "\n")
    print("1. ブラウザで上記のURLを開いてください。")
    print("2. コードを入力し、検証したい【学生用アカウント】でログインしてください。")
    print("3. 承認画面が出るか、エラー（管理者の承認が必要）が出るか確認します...\n")

    # ユーザーがブラウザでログインを完了するのを待機
    result = app.acquire_token_by_device_flow(flow)

    if "access_token" in result:
        print("\n✅ 成功！この学生アカウントはカレンダーの連携（ユーザーの同意）が許可されています！")
        
        # せっかくなので、テストとして予定を1つ取得してみる
        access_token = result["access_token"]
        headers = {'Authorization': 'Bearer ' + access_token}
        response = requests.get('https://graph.microsoft.com/v1.0/me/events?$select=subject,start,end&$top=1', headers=headers)
        
        if response.status_code == 200:
            events = response.json().get('value', [])
            if events:
                print("\n📅 最新の予定を取得できました:")
                print(f"タイトル: {events[0].get('subject')}")
                print(f"開始: {events[0].get('start', {}).get('dateTime')}")
            else:
                print("\n📅 カレンダーにアクセスできましたが、予定が空です。")
        else:
            print(f"\n❌ カレンダーの取得に失敗しました: {response.text}")
            
    else:
        print("\n❌ 失敗しました...")
        print("エラー内容:")
        print(result.get("error"))
        print(result.get("error_description"))
        print("\n【診断結果】")
        if "needadminapproval" in result.get("error_description", "").lower() or "admin_consent" in result.get("error_description", "").lower():
            print("🚨 この大学のアカウントは、IT管理者によって外部アプリとの連携（ユーザーの同意）がブロックされています。")
        else:
            print("🚨 その他のエラーです。")

if __name__ == "__main__":
    test_student_login()
