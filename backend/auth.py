import jwt
from pwdlib import PasswordHash
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db import SessionLocal
import models

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

SECRET_KEY = '0806690554d9fb8ab2d2e4b08c068b0bfdf2b4f2ded34ad6a61dfe204ac4ed38'
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hash = PasswordHash.recommended()

def hash_password(password: str):
    return password_hash.hash(password)

def verify_password(password: str, hashed: str):
    return password_hash.verify(password, hashed)

def create_access_token(data: dict):
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload['exp'] = expire

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_token(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="有効なtokenではありません")
    user = db.query(models.User).filter(models.User.user_id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=401, detail="ログインしてください")
    return user

