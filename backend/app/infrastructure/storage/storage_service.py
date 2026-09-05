import os
import uuid
import re
from typing import Tuple
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import ValidationError
from app.core.constants import ALLOWED_EXTENSIONS

class StorageService:
    def __init__(self, upload_dir: str = None):
        self.upload_dir = upload_dir or os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads"))
        os.makedirs(self.upload_dir, exist_ok=True)
        self.max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    def sanitize_filename(self, filename: str) -> str:
        base = os.path.basename(filename)
        base = re.sub(r"[^\w\.\-]", "_", base)
        if not base or base.startswith("."):
            base = f"file_{uuid.uuid4().hex[:8]}"
        return base

    def validate_file(self, filename: str, file_size: int) -> Tuple[bool, str]:
        if file_size > self.max_size_bytes:
            return False, f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
            
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"File extension .{ext} is not allowed."
            
        return True, ""

    async def save_file(self, file: UploadFile) -> str:
        contents = await file.read()
        file_size = len(contents)
        await file.seek(0)
        
        filename = self.sanitize_filename(file.filename)
        is_valid, err_msg = self.validate_file(filename, file_size)
        if not is_valid:
            raise ValidationError(err_msg)
            
        unique_id = uuid.uuid4().hex[:8]
        name_parts = filename.rsplit(".", 1)
        if len(name_parts) == 2:
            unique_filename = f"{name_parts[0]}_{unique_id}.{name_parts[1]}"
        else:
            unique_filename = f"{filename}_{unique_id}"
            
        file_path = os.path.join(self.upload_dir, unique_filename)
        with open(file_path, "wb") as f:
            f.write(contents)
            
        # Public URL path mapped to static uploads mount
        return f"/static/uploads/{unique_filename}"

storage_service = StorageService()
