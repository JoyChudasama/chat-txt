from fastapi import APIRouter, File, UploadFile
from app.models.file_upload_response import FileUploadResponse
from app.services.file_service import handle_file
from backend.app.services.vector_store_service import prepare_vector_store

router = APIRouter()

@router.post("/upload", response_model=FileUploadResponse)
async def file_upload(user_id: str, chat_id: str, file: UploadFile = File(...))->dict:
    try:
        file_path = handle_file(user_id, chat_id, file)
        await prepare_vector_store(user_id, chat_id, file_path)
        return {"file_path": file_path}
    except Exception as e:
        return {"error": str(e)}