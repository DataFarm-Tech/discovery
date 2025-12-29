from fastapi import Depends, status, Request, APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr
import db.db_models as db_models
from db.init import engine, get_db
from middleware.limiters import limiter
import bcrypt
from fastapi import BackgroundTasks
import asyncio

db_dependency = Annotated[Session, Depends(get_db)]
db_models.Base.metadata.create_all(bind=engine)
router = APIRouter(prefix="/auth")

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 90
SECRET_KEY = "650FX$IyZT/XWn>£2/nL£PR?=%N"
ALGORITHM = "HS256"


class UserCreate(BaseModel):
    user_id: EmailStr
    first_name: str
    last_name: str
    password: str


def hash_password(plain_password: str): # Function to hash the password
    salt: bytes = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str): # Function to verify the password
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", tags=["auth"], status_code=status.HTTP_201_CREATED, description="Register a user.")
async def register(user: UserCreate, db: Session = Depends(get_db), background_tasks: BackgroundTasks = None):

    if not user.first_name or not user.last_name:
        return JSONResponse(
            content={"message": "First and last name are required."},
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if db.query(db_models.user.user_id).filter_by(user_id=user.user_id).first():
        return JSONResponse(
            content={"message": "Email already registered."},
            status_code=status.HTTP_409_CONFLICT,
        )

     # Hash password in background (non-blocking)
    def hash_and_create_user():
        hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")
        new_user = db_models.user(
            user_id=user.user_id,
            first_name=user.first_name.strip(),
            last_name=user.last_name.strip(),
            password=hashed_password,
        )
        db.add(new_user)
        db.commit()

    background_tasks.add_task(hash_and_create_user)

    return JSONResponse(
        content={"message": "User successfully created"},
        status_code=status.HTTP_201_CREATED,
    )


@router.post("/login", tags=["auth"], status_code=status.HTTP_200_OK, description="Login a user and return access token.")
@limiter.limit("1/second")
async def login_user(request: Request, user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    db_user = db.query(db_models.user).filter(db_models.user.user_id == user.username).first()

    db_user = (
        db.query(db_models.user)
        .filter(db_models.user.user_id == user.username)
        .first()
    )

    if not db_user:
        return JSONResponse(
            content={
                "success": False,
                "message": "Invalid email or password",
            },
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    
    # Offload bcrypt to a thread to avoid blocking event loop
    password_ok = await asyncio.to_thread(
        verify_password, user.password, db_user.password
    )

    if not password_ok:
        return JSONResponse(
            content={
                "success": False,
                "message": "Invalid email or password",
            },
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.user_id},
        expires_delta=access_token_expires,
    )

    # Check if request is from SwaggerUI or needs OAuth2 format
    # SwaggerUI sends Content-Type: application/x-www-form-urlencoded
    # Also check Accept header or user agent
    
    # # If it's a form submission (from SwaggerUI OAuth2), return OAuth2 format
    # if "application/x-www-form-urlencoded" in content_type:
    #     return JSONResponse(
    #         content={
    #             "access_token": access_token,
    #             "token_type": "bearer"
    #         },
    #         status_code=status.HTTP_200_OK,
    #     )

    return JSONResponse(
        content={
            "success": True,
            "message": "user logged in successfully",
            "data": {"access_token": access_token},
        },
        status_code=status.HTTP_200_OK,
    )

# for SwaggerUI OAuth2 compatibility
@router.post("/token", tags=["auth"], status_code=status.HTTP_200_OK, description="OAuth2 token endpoint for SwaggerUI authentication.")
@limiter.limit("1/second")
async def get_token(request: Request, user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    db_user = (
        db.query(db_models.user)
        .filter(db_models.user.user_id == user.username)
        .first()
    )

    if not db_user:
        return JSONResponse(
            content={
                "success": False,
                "message": "Invalid email or password",
            },
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    
    # Offload bcrypt to a thread to avoid blocking event loop
    password_ok = await asyncio. to_thread(
        verify_password, user.password, db_user.password
    )

    if not password_ok:
        return JSONResponse(
            content={
                "success": False,
                "message": "Invalid email or password",
            },
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.user_id},
        expires_delta=access_token_expires,
    )

    # Return OAuth2-compliant response
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
