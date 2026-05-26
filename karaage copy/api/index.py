import os
import sys

# backend フォルダを sys.path に追加し、既存のインポート関係がそのまま維持されるようにします
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from main import app
