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
    allow_credentials=True,
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


# ─────────────────────────────────────────────
# 開発用サーバー起動
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n* UpStream AI Layout API を起動します...")
    print("   URL: http://localhost:8000")
    print("   Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
