from fastapi import FastAPI, Depends, Form, File, UploadFile, HTTPException
from typing import List
from sqlalchemy.orm import Session, joinedload
import schemas, models, auth
from db import SessionLocal 
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
import json
from db import engine, SessionLocal, Base
import cloudinary
import cloudinary.uploader 

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

cloudinary.config( 
  cloud_name = "dlyq2rrc3", 
  api_key = "929797163953452", 
  api_secret = "yiAZra0JV9OTWdSe2OuigjTxd0s",
  secure = True
)

#CORSエラーの解除
origins = [
    "http://localhost:5173",
    "https://coord-pick.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

 

#Userの登録
@app.post("/users")
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = models.User(
        user_name = user.user_name,
        password = auth.hash_password(user.password),
        email = user.email
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

#Userの取得
@app.get("/users", response_model=List[schemas.User])
async def users_read(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

#Stylingの登録
@app.post("/upload")
async def styling_create(
    styling_explanation:str = Form(...),
    styling_item_img:UploadFile = File(...),
    items: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    item_list = json.loads(items)

    upload_result = cloudinary.uploader.upload(
        styling_item_img.file.read(),
        folder="coordpick",
        resource_type="image"
    )
    
    img_url = upload_result.get("secure_url")

    new_styling=models.Styling(
        styling_explanation = styling_explanation,
        styling_item_img = img_url,
        user_id = current_user.user_id
    )

    db.add(new_styling)
    db.commit()
    db.refresh(new_styling)

    for item in item_list:
        new_item = models.Item(
            item_name = item["name"],
            item_brand = item["brand"],
            item_url = item["url"],
            item_category = item["category"],
            styling_id = new_styling.styling_id
        )
        db.add(new_item)
    
    db.commit()
    return new_styling

#Stylingの情報取得
@app.get("/stylings")
async def get_styling(db: Session = Depends(get_db)):
    stylings = db.query(models.Styling).options(joinedload(models.Styling.items)).all()
    return stylings

#詳細情報の取得
@app.get("/detail/{styling_id}")
async def get_styling_detail(styling_id: int, db: Session = Depends(get_db)):
    styling = db.query(models.Styling)\
    .options(joinedload(models.Styling.items))\
    .filter(models.Styling.styling_id == styling_id)\
    .first()

    return styling

@app.delete("/delete/{styling_id}")
async def delete_styling(styling_id: int, db:Session = Depends(get_db)):
    styling = db.query(models.Styling).filter(models.Styling.styling_id == styling_id).first()

    if styling is None:
        raise HTTPException(status_code=404, detail="投稿が存在しません")

    db.delete(styling)
    db.commit()
    return styling

@app.post("/login") 
async def login(user: schemas.UserLogin, db:Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if db_user is None:
        raise HTTPException(status_code=404, detail="userが存在しません")
    
    if not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="パスワードが違います")
    
    token = auth.create_access_token({
        "user_id" : db_user.user_id
    })

    return {"access_token": str(token)}