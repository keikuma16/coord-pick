from fastapi import FastAPI, Depends, HTTPException, Form, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os
import shutil
import models, schemas
from db import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

#CORS設定(Reactからのアクセス許可)
origins = [
    'http://localhost:5173'
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# passwordのハッシュ化
#ハッシュ化の設定
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
#passwordを受け取って、ハッシュ化して返す関数
def get_hased_password(password):
    return pwd_context.hash(password)

#貸出データベース
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 
#ユーザー情報の登録(create_user)
@app.post('/users', response_model=schemas.User)
def create_users(user: schemas.UserCreate, db: Session = Depends(get_db)):
    #登録済みメアドの除去
    db_user = db.query(models.User).filter(user.email == models.User.email).first()
    if db_user:    
        raise HTTPException(status_code=400, detail='このメールアドレスは登録済みです')
    #passwordのハッシュ化
    hashed_password = get_hased_password(user.password)
    #DB保存用データ
    new_user = models.User(
        user_name=user.user_name,
        email=user.email,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

#全ユーザーの情報一覧取得(read_users)
@app.get('/users', response_model=List[schemas.User])
def read_users(skip: int = 0,limit:int = 100, db:Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

#特定のユーザーの情報の取得(read_user)
@app.get('/users/{user_id}', response_model=schemas.User)
def read_user(user_id: int, db:Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail='ユーザーが見つかりません')
    return db_user

#商品情報の登録(create_item)
@app.post('/users/{user_id}/items', response_model=schemas.Item)
def create_item(
        user_id: int,
        item_name:str = Form(...),
        item_category: str = Form(...),
        item_price: int = Form(...),
        item_size: str = Form(...),
        image: UploadFile = File(...),
        db: Session = Depends(get_db)
    ):
    #userがいるか確認
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    #userがいない場合
    if user is None:
        raise HTTPException(status_code=404, detail='ユーザーが見つかりません')
    #保存フォルダの制作
    upload_dir = 'static/image'
    os.makedirs(upload_dir, exist_ok=True)
    #保存フォルダの保存
    image_filename = image.filename
    file_location = f'{upload_dir}/{image_filename}'
    with open(file_location, 'wb') as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    #db保存用データ
    new_item = models.Item(
        item_category=item_category,
        item_name=item_name,
        item_price=item_price,
        item_size=item_size,
        item_image_URL=image_filename,
        seller_id=user_id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item

#全商品の一覧の情報取得
@app.get('/items', response_model=List[schemas.Item])
def read_items(skip:int = 0, limit:int = 100, db:Session = Depends(get_db)):
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return items

#特定の商品の情報の取得
@app.get('/items/{item_id}', response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.item_id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail='商品が見つかりません')
    return db_item
