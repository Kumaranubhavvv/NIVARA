from typing import Any, Optional, Dict
from fastapi.responses import JSONResponse


def success_response(
    data: Any = None,
    message: str = "Operation successful",
    status_code: int = 200,
    meta: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """Standardizes JSON success response envelope."""
    payload: Dict[str, Any] = {
        "success": True,
        "message": message,
        "data": data,
    }
    if meta is not None:
        payload["meta"] = meta
    return JSONResponse(status_code=status_code, content=payload)


def error_response(
    message: str = "An error occurred",
    status_code: int = 400,
    error_code: Optional[str] = None,
    details: Optional[Any] = None,
) -> JSONResponse:
    """Standardizes JSON error response envelope."""
    payload: Dict[str, Any] = {
        "success": False,
        "message": message,
        "error_code": error_code,
    }
    if details is not None:
        payload["details"] = details
    return JSONResponse(status_code=status_code, content=payload)
