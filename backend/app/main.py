import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.app_setup import create_app
from app.api.v1.routes import router

app = create_app()
app.include_router(router, prefix="/api/v1")