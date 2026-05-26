"""
UpStream — Supabase データベースクライアント

Supabase との接続およびデータクエリ（取得・送信）を一元管理します。
- .envから環境変数を安全に読み込み
- クライアントのシングルトン初期化
- 取得（GET）および送信（INSERT/POST）用の汎用ヘルパー関数を提供
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# .envファイルの読み込み（backend/ ディレクトリ内の .env を探す）
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path)

# --- Supabase クライアントの初期化 ---
_supabase_client = None

def get_supabase_client() -> Client:
    """Supabase クライアントのシングルトンインスタンスを取得する"""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_KEY", "").strip()
    
    if not url or not key:
        raise RuntimeError(
            "Supabase接続情報が設定されていません。\n"
            "backend/.env または Vercelの環境変数に SUPABASE_URL と SUPABASE_KEY を設定してください。"
        )
        
    _supabase_client = create_client(url, key)
    return _supabase_client


# =============================================================
# データ操作関数 (クエリ処理)
# =============================================================

def get_test_data() -> list:
    """
    test テーブルからデータをすべて取得します（GET処理）
    """
    try:
        client = get_supabase_client()
        response = client.table("test").select("*").execute()
        return response.data
    except Exception as e:
        print(f"[SupabaseClient ERROR] データ取得に失敗しました: {e}")
        raise RuntimeError(f"データ取得に失敗しました: {e}")


def insert_test_data(data: dict) -> list:
    """
    test テーブルに新しいレコードを挿入します（POST/SEND処理）
    
    Args:
        data: 挿入するデータ辞書 (例: {"name": "sample", "image_path": "https://..."})
    Returns:
        挿入されたレコードのデータリスト
    """
    try:
        client = get_supabase_client()
        response = client.table("test").insert(data).execute()
        return response.data
    except Exception as e:
        print(f"[SupabaseClient ERROR] データ送信に失敗しました: {e}")
        raise RuntimeError(f"データ送信に失敗しました: {e}")
