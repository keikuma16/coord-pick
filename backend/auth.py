import jwt
from pwdlib import PasswordHash
from datetime import datetime, timedelta

SECRET_KEY = '0806690554d9fb8ab2d2e4b08c068b0bfdf2b4f2ded34ad6a61dfe204ac4ed38'
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hash = PasswordHash.recommended()

def hash_password(password: str):
    return password_hash.hash(password)

def verify_password(password: str, hashed: str):
    return password_hash.verify(password, hashed)

def create_accestoken(data: dict):
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload['exp'] = expire

    token = jwt.encode(payload, SECRET_KEY, algorithm=(ALGORITHM))
    return token

def decode_token(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithm=[ALGORITHM])
    return payload

