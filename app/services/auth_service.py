from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, Role, RoleEnum
from app.auth.jwt import verify_password, create_access_token, hash_password
from app.schemas.auth import LoginRequest, TokenResponse, RegisterRequest
from app.core.config import settings


def authenticate_user(db: Session, request: LoginRequest) -> TokenResponse:
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.name,
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


def register_user(db: Session, request: RegisterRequest) -> User:
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    role = db.query(Role).filter(Role.name == request.role).first()
    if not role:
        role = Role(name=request.role, description=f"{request.role} role")
        db.add(role)
        db.flush()

    user = User(
        email=request.email,
        full_name=request.full_name,
        hashed_password=hash_password(request.password),
        role_id=role.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
