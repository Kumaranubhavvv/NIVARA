import os
from typing import Tuple, Set, Optional

# Allowed file extensions by media category
ALLOWED_IMAGE_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_AUDIO_EXTENSIONS: Set[str] = {".mp3", ".wav", ".m4a", ".ogg", ".aac"}
ALLOWED_DOCUMENT_EXTENSIONS: Set[str] = {".pdf", ".docx", ".doc", ".txt"}

# Max upload sizes in bytes
MAX_IMAGE_SIZE_BYTES: int = 5 * 1024 * 1024       # 5 MB
MAX_AUDIO_SIZE_BYTES: int = 15 * 1024 * 1024      # 15 MB
MAX_DOCUMENT_SIZE_BYTES: int = 20 * 1024 * 1024   # 20 MB


def validate_image_file(filename: str, file_size: Optional[int] = None) -> Tuple[bool, str]:
    """Validates avatar or image media file extension and optional size."""
    if not filename:
        return False, "No filename provided."

    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return False, f"Unsupported image extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}"

    if file_size is not None and file_size > MAX_IMAGE_SIZE_BYTES:
        return False, f"Image size ({file_size // (1024 * 1024)}MB) exceeds max allowed size of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB."

    return True, "Valid image file."


def validate_audio_file(filename: str, file_size: Optional[int] = None) -> Tuple[bool, str]:
    """Validates sensory sound audio file extension and optional size."""
    if not filename:
        return False, "No filename provided."

    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        return False, f"Unsupported audio extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_AUDIO_EXTENSIONS))}"

    if file_size is not None and file_size > MAX_AUDIO_SIZE_BYTES:
        return False, f"Audio file size exceeds max allowed size of {MAX_AUDIO_SIZE_BYTES // (1024 * 1024)}MB."

    return True, "Valid audio file."


def sanitize_filename(filename: str) -> str:
    """Sanitizes user uploaded filename to prevent directory traversal and invalid characters."""
    base = os.path.basename(filename)
    safe_chars = "".join(c for c in base if c.isalnum() or c in (".", "_", "-")).strip()
    return safe_chars or "unnamed_upload"
