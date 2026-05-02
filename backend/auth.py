from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional

# Security configurations
SECRET_KEY = "super-secret-earthai-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic Schemas
class UserCreate(BaseModel):
    email: str
    password: str
    lat: Optional[float] = None
    lon: Optional[float] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    lat: Optional[float] = None
    lon: Optional[float] = None

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
