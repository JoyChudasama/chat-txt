from fastapi import APIRouter
from app.api.v1.endpoints import chat, file_upload, session

router = APIRouter()

router.include_router(chat.router, prefix="/chat", tags=["chat"])
router.include_router(file_upload.router, prefix="/file", tags=["file"])
router.include_router(session.router, prefix="/session", tags=["session"])