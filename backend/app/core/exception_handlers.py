import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.exceptions import AppError

logger = logging.getLogger(__name__)

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content={"success": False, "message": exc.message, "error": {"code": exc.code}})

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"success": False, "message": "Validation failed.", "error": {"code": "VALIDATION_ERROR", "details": exc.errors()}})

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception):
        logger.exception("Unhandled application error. request_id=%s", getattr(request.state, "request_id", "unknown"))
        return JSONResponse(status_code=500, content={"success": False, "message": "An unexpected error occurred.", "error": {"code": "INTERNAL_ERROR"}})
