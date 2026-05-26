from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

app = FastAPI(title="Supabase FastAPI Test")

# CORSの設定（フロントエンド HTML からのリクエストを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase接続情報
url = "https://ylgumuwmpnnqzrfleyoc.supabase.co"
key = "sb_publishable_iCBqRPHEWGq036pC_UXXww_a9tVqDAR"

url = "https://ylgumuwmpnnqzrfleyoc.supabase.co"
key = "sb_publishable_iCBqRPHEWGq036pC_UXXww_a9tVqDAR"

supabase: Client = create_client(url, key)

@app.get("/")
def home():
    return {"message": "FastAPI + Supabase"}

@app.get("/test")
def users():
    try:
        response = (
            supabase
            .table("test")
            .select("*")
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Supabaseからのデータ取得に失敗しました: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    print("\n* Supabase FastAPI テストサーバーを起動します...")
    print("   URL: http://127.0.0.1:5000")
    print("   Docs: http://127.0.0.1:5000/docs\n")
    uvicorn.run(app, host="127.0.0.1", port=5000)