class AppError(Exception):
    status_code = 400
    code = "APPLICATION_ERROR"

    def __init__(self, message: str = "Request could not be completed."):
        self.message = message
        super().__init__(message)


class AuthenticationError(AppError):
    status_code, code = 401, "AUTHENTICATION_ERROR"


class AuthorizationError(AppError):
    status_code, code = 403, "AUTHORIZATION_ERROR"


class ResourceNotFoundError(AppError):
    status_code, code = 404, "RESOURCE_NOT_FOUND"


class ConflictError(AppError):
    status_code, code = 409, "CONFLICT"


class ValidationError(AppError):
    status_code, code = 422, "VALIDATION_ERROR"


class ExternalServiceError(AppError):
    status_code, code = 502, "EXTERNAL_SERVICE_ERROR"
