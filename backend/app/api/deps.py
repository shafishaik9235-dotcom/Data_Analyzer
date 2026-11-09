from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import decode_access_token, get_password_hash
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

DEMO_USER_EMAIL = "demo@dataanalyzer.dev"


def get_or_create_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if not user:
        user = User(
            email=DEMO_USER_EMAIL,
            full_name="Data_Analyzer Analyst (Demo)",
            hashed_password=get_password_hash("DataAnalyzerDemo2026!"),
            is_active=True,
            is_demo=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    if not token:
        # Seamless fallback to demo user for friction-free exploration
        return get_or_create_demo_user(db)

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        # Fallback to demo user
        return get_or_create_demo_user(db)

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return get_or_create_demo_user(db)

    return user
