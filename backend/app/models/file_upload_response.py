from pydantic import BaseModel
from typing import Optional

class FileUploadResponse(BaseModel):
    file_path: str
    error: Optional[str] = None 