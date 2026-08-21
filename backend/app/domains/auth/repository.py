from sqlalchemy.orm import Session
from app.domains.users.models import User
from app.domains.caregivers.models import Caregiver, VerificationSubmission

class AuthRepository:
    def get_user_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    def get_user(self, db: Session, user_id: str):
        return db.query(User).filter(User.id == user_id).first()

    def create_caregiver(self, db: Session, caregiver: Caregiver):
        db.add(caregiver)
        db.commit()
        db.refresh(caregiver)
        return caregiver

    def caregiver(self, db: Session, user_id: str):
        return db.query(Caregiver).filter(Caregiver.user_id == user_id).first()

    def add_verification(self, db: Session, submission: VerificationSubmission):
        db.add(submission)
        db.commit()
        db.refresh(submission)
        return submission
