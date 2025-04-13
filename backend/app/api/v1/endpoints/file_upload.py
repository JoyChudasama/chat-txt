from fastapi import APIRouter, File, UploadFile, HTTPException
from app.models.file_upload_response import FileUploadResponse
from app.services.file_service import handle_file
from app.services.vector_store_service import prepare_vector_store

router = APIRouter()

@router.post("/upload", response_model=FileUploadResponse)
async def file_upload(user_id: str, session_id: str, file: UploadFile = File(...))->FileUploadResponse:
    try:
        if file.content_type != "text/plain":
            raise HTTPException(status_code=400, detail="File must be a text file")
        
        file_path = handle_file(user_id, session_id, file)
        await prepare_vector_store(user_id, session_id, file_path)
    
        return {
            "content": {
                "type": "success", 
                "message": "File uploaded successfully",
                "file_name": file.filename
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))