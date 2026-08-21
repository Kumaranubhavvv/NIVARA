import math
from typing import List, TypeVar, Generic, Dict, Any, Optional
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number starting from 1")
    limit: int = Field(20, ge=1, le=100, description="Items per page (max 100)")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


def paginate_list(items: List[T], page: int = 1, limit: int = 20) -> Dict[str, Any]:
    """Paginates an in-memory list and returns items along with pagination metadata."""
    total = len(items)
    page = max(1, page)
    limit = max(1, min(limit, 100))
    total_pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    paginated_items = items[offset : offset + limit]

    return {
        "items": paginated_items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }
