import os
from fastapi import UploadFile, File

from app.core.config import UPLOAD_DIR

def handle_file(user_id: str, chat_id: str, file: UploadFile = File(...)) -> str:
    """Handle file upload and save to disk."""
    upload_dir = os.path.join(UPLOAD_DIR, user_id, chat_id)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return file_path