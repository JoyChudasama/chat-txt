from pydantic import BaseModel
from typing import Optional

class FileUploadResponse(BaseModel):
    content: dict[str, str, str]
    error: Optional[str] = None 