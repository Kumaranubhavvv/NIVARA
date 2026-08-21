from sqlalchemy.orm import Session
from app.core.exceptions import ResourceNotFoundError
from app.domains.users.repository import UserRepository

class UserService:
    def __init__(self, repository=None):
        self.repository = repository or UserRepository()

    def get(self, db: Session, user_id: str):
        user = self.repository.get(db, user_id)
        if not user:
            raise ResourceNotFoundError("User not found.")
        return user

    def update_me(self, db: Session, user_id: str, **values):
        return self.repository.update(db, self.get(db, user_id), **values)
