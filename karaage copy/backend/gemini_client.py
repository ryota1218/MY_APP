"""
UpStream AI自動配置 — Gemini API通信クライアント

Google Gemini APIとの通信を一元管理する。
- .envからAPIキーを安全に読み込み
- レスポンスのJSON抽出（Markdownコードブロック除去）
- リトライロジック（最大2回リトライ）
"""

import json
import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

# .envファイルの読み込み（backend/ ディレクトリ内の .env を探す）
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path)

# --- Gemini クライアントの初期化 ---
_client = None

def get_client():
    global _client
    if _client is not None:
        return _client
    
    project_id = os.getenv("GCP_PROJECT_ID", "").strip()
    
    # Vertex AIの新世代モデル（3.5 Flash等）は global エンドポイントに集約されているため固定
    location = "global"

    if not project_id:
        raise RuntimeError(
            "\n"
            "============================================================\n"
            " GCP_PROJECT_ID が設定されていません！\n"
            " backend/.env ファイルにGCPプロジェクトIDを設定してください。\n"
            "============================================================"
        )
    
    # Vertex AI経由で初期化
    _client = genai.Client(vertexai=True, project=project_id, location=location)
    return _client

# 使用するモデル（AI Studio版の3.5 Flash）
MODEL_NAME = "gemini-3.5-flash"

def extract_json_from_response(text: str) -> dict | list:
    """
    Gemini APIのレスポンステキストからJSONを抽出する。

    AIが返すテキストには ```json ... ``` のマークダウンブロックや
    説明文が含まれることがあるため、それを除去してパースする。
    """
    if not text:
        raise ValueError("空のレスポンスを受信しました")

    # パターン1: ```json ... ``` ブロックを抽出
    json_block_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", text, re.DOTALL)
    if json_block_match:
        json_str = json_block_match.group(1).strip()
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    # パターン2: テキスト全体がJSONの場合
    text_stripped = text.strip()
    try:
        return json.loads(text_stripped)
    except json.JSONDecodeError:
        pass

    # パターン3: 最初の { ... } または [ ... ] を抽出
    brace_match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if brace_match:
        try:
            return json.loads(brace_match.group(1))
        except json.JSONDecodeError:
            pass

    raise ValueError(
        f"Gemini APIからのレスポンスをJSONとして解析できませんでした。\n"
        f"レスポンス（先頭500文字）: {text[:500]}"
    )


def call_gemini(prompt: str, max_retries: int = 2, model_name: str = MODEL_NAME) -> dict | list:
    """
    Gemini APIにプロンプトを送信し、JSONレスポンスを返す。

    Args:
        prompt: Geminiに送信するプロンプト文字列
        max_retries: APIエラー時の最大リトライ回数（デフォルト: 2）

    Returns:
        パース済みのJSONオブジェクト（dictまたはlist）

    Raises:
        RuntimeError: 全リトライが失敗した場合
    """
    last_error = None

    for attempt in range(1, max_retries + 2):  # 初回 + リトライ回数
        try:
            client = get_client()
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,  # 低めの温度で安定した出力
                    response_mime_type="application/json",
                ),
            )

            # レスポンスのステータスとテキストを取得
            finish_reason = response.candidates[0].finish_reason if response.candidates else "Unknown"
            response_text = response.text
            print(f"[Gemini API] レスポンス受信: 終了理由={finish_reason}, 文字数={len(response_text) if response_text else 0}")

            if not response_text:
                raise ValueError("Gemini APIから空のレスポンスが返されました")

            # JSONを抽出してパース
            try:
                result = extract_json_from_response(response_text)
                return result
            except ValueError as val_err:
                print(f"\n[ERROR] レスポンスのJSONパースに失敗しました。生の出力は以下です:\n{response_text}\n")
                raise val_err

        except Exception as e:
            last_error = e
            if attempt <= max_retries:
                # リトライ前に少し待機（指数バックオフ）
                wait_time = 2 ** attempt
                print(
                    f"[GeminiClient] リトライ {attempt}/{max_retries} "
                    f"({wait_time}秒後に再試行): {e}"
                )
                time.sleep(wait_time)
            else:
                print(f"[GeminiClient] 全リトライ失敗: {e}")

    error_msg = str(last_error)
    if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
        friendly_msg = (
            "Gemini APIの無料枠制限（クォータ制限: 1日20リクエスト）に達しました。\n"
            "【解決方法】\n"
            "1. Google AI Studio（ https://aistudio.google.com/ ）で別のGoogleアカウントで新しいAPIキーを発行し、backend/.env をそのキーに書き換える\n"
            "2. Google AI Studio で無料枠から従量課金プラン（Pay-as-you-go）に切り替える（gemini-1.5-flashは100万トークンあたり数円〜数十円と非常に安価なため、個人開発であれば月数十円〜数百円程度で無制限に使えます）"
        )
        raise RuntimeError(friendly_msg)

    raise RuntimeError(
        f"Gemini APIへのリクエストが{max_retries + 1}回すべて失敗しました。\n"
        f"最後のエラー: {last_error}"
    )
