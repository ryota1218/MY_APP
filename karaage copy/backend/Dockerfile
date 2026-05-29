# 軽量なPythonイメージを使用
FROM python:3.11-slim

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係ファイルのコピー
COPY requirements.txt .

# パッケージのインストール
RUN pip install --no-cache-dir -r requirements.txt

# ソースコードのコピー
COPY . .

# 環境変数の設定（Cloud Run向け）
ENV PYTHONUNBUFFERED=1

# Cloud Run はデフォルトで PORT 8080 を想定している
ENV PORT=8080

# uvicornを使ってサーバーを起動
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT}
