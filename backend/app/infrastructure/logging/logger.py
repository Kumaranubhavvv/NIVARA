import logging
import json
import re
from typing import Any, Dict

class SensitiveDataFilter(logging.Filter):
    JWT_PATTERN = re.compile(r"eyJhbGciOi[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+")
    SENSITIVE_KEYS = {
        "password", "hashed_password", "token", "access_token", "refresh_token",
        "secret", "jwt", "authorization", "latitude", "longitude", "lat", "lon",
        "private_message", "message_content", "text", "content", "bio"
    }

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self.sanitize_string(record.msg)
            
        if record.args:
            if isinstance(record.args, dict):
                record.args = self.sanitize_dict(record.args)
            elif isinstance(record.args, tuple):
                record.args = tuple(self.sanitize_value(v) for v in record.args)
            else:
                record.args = self.sanitize_value(record.args)
                
        return True

    def sanitize_string(self, text: str) -> str:
        text = self.JWT_PATTERN.sub("[REDACTED_JWT]", text)
        return text

    def sanitize_value(self, val: Any) -> Any:
        if isinstance(val, str):
            return self.sanitize_string(val)
        if isinstance(val, dict):
            return self.sanitize_dict(val)
        if isinstance(val, list):
            return [self.sanitize_value(item) for item in val]
        return val

    def sanitize_dict(self, d: Dict[str, Any]) -> Dict[str, Any]:
        sanitized = {}
        for k, v in d.items():
            if k.lower() in self.SENSITIVE_KEYS:
                sanitized[k] = "[REDACTED]"
            else:
                sanitized[k] = self.sanitize_value(v)
        return sanitized

def setup_logging():
    class JSONFormatter(logging.Formatter):
        def format(self, record: logging.LogRecord) -> str:
            log_data = {
                "timestamp": self.formatTime(record, self.datefmt),
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
                "file": record.pathname,
                "line": record.lineno
            }
            if record.exc_info:
                log_data["exception"] = self.formatException(record.exc_info)
            return json.dumps(log_data)

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate setups
    for h in logger.handlers[:]:
        logger.removeHandler(h)
        
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    handler.addFilter(SensitiveDataFilter())
    
    logger.addHandler(handler)
