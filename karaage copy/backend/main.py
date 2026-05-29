"""
UpStream AI自動配置 — FastAPI サーバー

POST /api/ai-layout  : ノード情報を受け取り、Gemini APIで最適配置＋自動接続を返す
GET  /api/health      : ヘルスチェック
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from gemini_client import call_gemini
from prompts import build_prompt
from supabase_client import get_test_data, insert_test_data

# ─────────────────────────────────────────────
# FastAPI アプリケーション
# ─────────────────────────────────────────────
app = FastAPI(
    title="UpStream AI Layout API",
    description="UpStreamの図形を自動配置＆自動接続するAI API",
    version="1.0.0",
)

# CORSの設定（フロントエンドからのリクエストを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ローカル開発用に全オリジン許可
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# リクエスト / レスポンス モデル
# ─────────────────────────────────────────────
class NodeInput(BaseModel):
    """フロントエンドから送信されるノード情報"""
    id: str
    label: str
    x: float = 0
    y: float = 0
    width: float = 160
    height: float = 50


class ConnectionInput(BaseModel):
    """フロントエンドから送信される既存の接続情報"""
    from_id: str = Field(alias="from")
    to_id: str = Field(alias="to")
    label: str = ""

    model_config = {"populate_by_name": True}


class AILayoutRequest(BaseModel):
    """AI配置＆接続のリクエストボディ"""
    diagram_type: str = "architecture"
    nodes: list[NodeInput]
    existing_connections: list[ConnectionInput] = []
    canvas_width: int = 1200
    canvas_height: int = 800


class AIChatLayoutRequest(BaseModel):
    """AI対話型配置微調整のリクエストボディ"""
    diagram_type: str = "architecture"
    nodes: list[NodeInput]
    existing_connections: list[ConnectionInput] = []
    canvas_width: int = 1200
    canvas_height: int = 800
    user_instruction: str
    chat_history: list[dict] = []


class NodeOutput(BaseModel):
    """AIが返すノードの新しい座標"""
    id: str
    x: float
    y: float


class ConnectionOutput(BaseModel):
    """AIが返す接続情報"""
    from_id: str = Field(alias="from")
    to_id: str = Field(alias="to")
    label: str = ""

    model_config = {"populate_by_name": True}


class AILayoutResponse(BaseModel):
    """AI配置＆接続のレスポンスボディ"""
    nodes: list[NodeOutput]
    connections: list[ConnectionOutput]


# ─────────────────────────────────────────────
# エンドポイント
# ─────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    """ヘルスチェック"""
    return {"status": "ok", "service": "UpStream AI Layout API"}


class SupabaseInsertInput(BaseModel):
    """Supabaseデータ挿入用のテストモデル"""
    name: str
    image_path: str


@app.get("/api/supabase-test")
async def supabase_test():
    """Supabaseからデータを取得するテストエンドポイント（GET）"""
    try:
        data = get_test_data()
        return data
    except Exception as e:
        print(f"\n[ERROR] Supabaseのデータ取得に失敗しました: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Supabaseのデータ取得に失敗しました: {str(e)}"
        )


@app.post("/api/supabase-test")
async def supabase_insert(data: SupabaseInsertInput):
    """Supabaseにデータを送信（保存）するテストエンドポイント（POST）"""
    try:
        # Pydanticモデルを辞書に変換して送信
        inserted_data = insert_test_data(data.model_dump())
        return {
            "status": "success",
            "message": "データをSupabaseに正常に送信しました",
            "data": inserted_data
        }
    except Exception as e:
        print(f"\n[ERROR] Supabaseへのデータ送信に失敗しました: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Supabaseへのデータ送信に失敗しました: {str(e)}"
        )


@app.post("/api/ai-layout")
async def ai_layout(request: AILayoutRequest):
    """
    ノード情報を受け取り、Gemini APIで最適な配置と接続を計算して返す。
    """
    # CLIログ: リクエスト受信
    node_labels = [n.label for n in request.nodes]
    print(f"\n[AI Layout Request]")
    print(f"  - Diagram Type: {request.diagram_type}")
    print(f"  - Nodes count: {len(request.nodes)} ({', '.join(node_labels)})")
    print(f"  - Existing Connections: {len(request.existing_connections)}")

    # バリデーション: ノードが1つもない場合
    if not request.nodes:
        print("  - [Warning] No nodes specified.")
        raise HTTPException(
            status_code=400,
            detail="ノードが1つも指定されていません。"
        )

    # バリデーション: ノードが1つだけの場合はAI不要
    if len(request.nodes) == 1:
        node = request.nodes[0]
        print("  - [Success] Single node, skipping AI call.")
        return {
            "nodes": [{"id": node.id, "x": 80, "y": 80}],
            "connections": [],
        }

    # 既存接続をプロンプト用に整形
    existing_conns = [
        {"from": c.from_id, "to": c.to_id, "label": c.label}
        for c in request.existing_connections
    ]

    # ノード情報をプロンプト用に整形
    nodes_for_prompt = [
        {"id": n.id, "label": n.label, "x": n.x, "y": n.y}
        for n in request.nodes
    ]

    # プロンプトを生成
    prompt = build_prompt(
        diagram_type=request.diagram_type,
        nodes=nodes_for_prompt,
        existing_connections=existing_conns,
        canvas_width=request.canvas_width,
        canvas_height=request.canvas_height,
    )

    try:
        # Gemini APIを呼び出し
        result = call_gemini(prompt)
    except RuntimeError as e:
        print("\n[ERROR] Gemini APIとの通信に失敗しました")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=502,
            detail=f"Gemini APIとの通信に失敗しました: {str(e)}"
        )
    except ValueError as e:
        print("\n[ERROR] Gemini APIのレスポンスを解析できませんでした")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=502,
            detail=f"Gemini APIのレスポンスを解析できませんでした: {str(e)}"
        )

    # レスポンスの整形と検証
    try:
        response_nodes = result.get("nodes", [])
        response_connections = result.get("connections", [])

        # ノードIDの存在確認
        valid_node_ids = {n.id for n in request.nodes}

        # 有効なノードのみをフィルタリング
        validated_nodes = []
        for node in response_nodes:
            node_id = node.get("id", "")
            if node_id in valid_node_ids:
                validated_nodes.append({
                    "id": node_id,
                    "x": max(60, float(node.get("x", 80))),
                    "y": max(60, float(node.get("y", 80))),
                })

        # AIがノードを返し忘れた場合、元の位置を保持
        returned_ids = {n["id"] for n in validated_nodes}
        for input_node in request.nodes:
            if input_node.id not in returned_ids:
                validated_nodes.append({
                    "id": input_node.id,
                    "x": input_node.x,
                    "y": input_node.y,
                })

        # 有効な接続のみをフィルタリング
        validated_connections = []
        existing_conn_set = {
            (c.from_id, c.to_id) for c in request.existing_connections
        }
        for conn in response_connections:
            from_id = conn.get("from", "")
            to_id = conn.get("to", "")
            # 両端のノードが存在し、自己参照でなく、既存接続と重複しないこと
            if (
                from_id in valid_node_ids
                and to_id in valid_node_ids
                and from_id != to_id
                and (from_id, to_id) not in existing_conn_set
            ):
                validated_connections.append({
                    "from": from_id,
                    "to": to_id,
                    "label": conn.get("label", ""),
                    "connType": conn.get("connType") or conn.get("conn_type") or "association",
                    "lineStyle": conn.get("lineStyle") or conn.get("line_style") or "solid",
                })

        print(f"[AI Layout Success]")
        print(f"  - Generated Nodes: {len(validated_nodes)}")
        print(f"  - Generated Connections: {len(validated_connections)}")

        return {
            "nodes": validated_nodes,
            "connections": validated_connections,
        }

    except Exception as e:
        print("\n[ERROR] AIレスポンスの検証中にエラーが発生しました")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"AIレスポンスの検証中にエラーが発生しました: {str(e)}"
        )


@app.post("/api/ai-chat-layout")
async def ai_chat_layout(request: AIChatLayoutRequest):
    """
    現在の座標配置、接続、およびユーザーの自由入力指示を受け取り、
    Gemini APIを用いて修正後の座標を計算して返す対話型API。
    """
    instruction = request.user_instruction.strip()
    if not instruction:
        raise HTTPException(status_code=400, detail="指示内容が空です。")
    
    # 簡易セキュリティチェック (プロンプトインジェクション防御)
    if len(instruction) > 400:
        raise HTTPException(status_code=400, detail="指示文が長すぎます。400文字以内で入力してください。")
    
    block_words = ["GEMINI_API_KEY", "SUPABASE_KEY", "env", "secret", "password", "token"]
    for word in block_words:
        if word.lower() in instruction.lower():
            print(f"[SECURITY ALERT] Blocked instruction containing secret word: {word}")
            raise HTTPException(
                status_code=403, 
                detail="セキュリティ保護のため、システム変数やキーに関する指示は送信できません。"
              )

    # 既存の接続・ノードをプロンプト用に整形
    existing_conns = [
        {"from": c.from_id, "to": c.to_id, "label": c.label}
        for c in request.existing_connections
    ]
    nodes_for_prompt = [
        {"id": n.id, "label": n.label, "x": n.x, "y": n.y}
        for n in request.nodes
    ]
    
    # 対話用プロンプトを組み立て
    from prompts import build_chat_prompt
    prompt = build_chat_prompt(
        diagram_type=request.diagram_type,
        nodes=nodes_for_prompt,
        existing_connections=existing_conns,
        user_instruction=instruction,
        chat_history=[{"role": m.get("role"), "content": m.get("content")} for m in request.chat_history],
        canvas_width=request.canvas_width,
        canvas_height=request.canvas_height,
    )
    
    try:
        result = call_gemini(prompt)
    except Exception as e:
        print(f"\n[ERROR] Gemini APIとの通信に失敗しました (Chat-Layout): {str(e)}")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini APIとの通信に失敗しました: {str(e)}"
        )

    # レスポンスの整形と検証
    try:
        response_nodes = result.get("nodes", [])
        response_connections = result.get("connections", [])

        # ノードIDの存在確認
        valid_node_ids = {n.id for n in request.nodes}

        # 有効なノードのみをフィルタリング
        validated_nodes = []
        for node in response_nodes:
            node_id = node.get("id", "")
            if node_id in valid_node_ids:
                validated_nodes.append({
                    "id": node_id,
                    "x": max(60, float(node.get("x", 80))),
                    "y": max(60, float(node.get("y", 80))),
                })

        # AIがノードを返し忘れた場合、元の位置を保持
        returned_ids = {n["id"] for n in validated_nodes}
        for input_node in request.nodes:
            if input_node.id not in returned_ids:
                validated_nodes.append({
                    "id": input_node.id,
                    "x": input_node.x,
                    "y": input_node.y,
                })

        # 有効な接続のみをフィルタリング
        validated_connections = []
        existing_conn_set = {
            (c.from_id, c.to_id) for c in request.existing_connections
        }
        for conn in response_connections:
            from_id = conn.get("from", "")
            to_id = conn.get("to", "")
            # 両端のノードが存在し、自己参照でなく、既存接続と重複しないこと
            if (
                from_id in valid_node_ids
                and to_id in valid_node_ids
                and from_id != to_id
                and (from_id, to_id) not in existing_conn_set
            ):
                validated_connections.append({
                    "from": from_id,
                    "to": to_id,
                    "label": conn.get("label", ""),
                    "connType": conn.get("connType") or conn.get("conn_type") or "association",
                    "lineStyle": conn.get("lineStyle") or conn.get("line_style") or "solid",
                })

        print(f"[AI Chat Layout Success]")
        print(f"  - Generated Nodes: {len(validated_nodes)}")
        print(f"  - Generated Connections: {len(validated_connections)}")

        return {
            "nodes": validated_nodes,
            "connections": validated_connections,
        }

    except Exception as e:
        print("\n[ERROR] AIレスポンスの検証中にエラーが発生しました")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"AIレスポンスの検証中にエラーが発生しました: {str(e)}"
        )


# ─────────────────────────────────────────────
# 開発用サーバー起動
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n* UpStream AI Layout API を起動します...")
    print("   URL: http://localhost:8000")
    print("   Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
