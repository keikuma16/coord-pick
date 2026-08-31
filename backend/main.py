from fastapi import FastAPI, Depends, Form, File, UploadFile, HTTPException
from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
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

IMAGE_MAGIC_SIGNATURES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
}

def detect_image_content_type(data: bytes):
    for signature, content_type in IMAGE_MAGIC_SIGNATURES.items():
        if data.startswith(signature):
            return content_type
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None

cloudinary.config(
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key = os.getenv("CLOUDINARY_API_KEY"),
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

#CORSエラーの解除
origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,https://coord-pick.vercel.app",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

 

#Userの登録
@app.post("/users", response_model=schemas.UserPublic)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # メール・ユーザー名はどちらも DB でユニーク制約が張られている。
    # ここで事前に照合して 400 で返さないと、commit 時の IntegrityError が
    # そのまま 500 になり、利用者には「原因不明のエラー」に見えてしまう。
    existing_email = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_email is not None:
        raise HTTPException(status_code=400, detail="このメールアドレスは既に登録されています")

    existing_name = db.query(models.User).filter(models.User.user_name == user.user_name).first()
    if existing_name is not None:
        raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")

    new_user = models.User(
        user_name = user.user_name,
        password = auth.hash_password(user.password),
        email = user.email
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        # 事前チェックと commit の間に同じ値が登録された場合の保険。
        # ここを握らないと、競合が起きるたびに 500 が返ってしまう。
        db.rollback()
        raise HTTPException(status_code=400, detail="このメールアドレスまたはユーザー名は既に使われています")
    db.refresh(new_user)
    return new_user

#Stylingの登録
@app.post("/upload")
async def styling_create(
    styling_explanation:str = Form(...),
    styling_item_img:UploadFile = File(...),
    items: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 画像のみ受け付ける(Content-Typeは偽装可能なため、実際のファイル内容も検証する)
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if styling_item_img.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="画像ファイルのみアップロードできます。jpeg, png, gif, webp のみ対応しています。"
        )

    image_bytes = styling_item_img.file.read()
    if detect_image_content_type(image_bytes) not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="画像ファイルのみアップロードできます。jpeg, png, gif, webp のみ対応しています。"
        )

    item_list = json.loads(items)

    upload_result = cloudinary.uploader.upload(
        image_bytes,
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
@app.get("/stylings", response_model=List[schemas.Styling])
async def get_styling(db: Session = Depends(get_db)):
    stylings = db.query(models.Styling)\
        .options(joinedload(models.Styling.items), joinedload(models.Styling.creator))\
        .all()
    return stylings

#詳細情報の取得
@app.get("/detail/{styling_id}", response_model=schemas.Styling)
async def get_styling_detail(styling_id: int, db: Session = Depends(get_db)):
    styling = db.query(models.Styling)\
    .options(joinedload(models.Styling.items), joinedload(models.Styling.creator))\
    .filter(models.Styling.styling_id == styling_id)\
    .first()

    if styling is None:
        raise HTTPException(status_code=404, detail="投稿が存在しません")

    return styling

def remove_styling_with_items(styling: models.Styling, db: Session):
    db.query(models.Item).filter(models.Item.styling_id == styling.styling_id).delete()
    db.delete(styling)
    db.commit()
    return styling

@app.delete("/stylings/{styling_id}")
async def delete_styling(styling_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    styling = db.query(models.Styling).filter(models.Styling.styling_id == styling_id).first()

    if styling is None:
        raise HTTPException(status_code=404, detail="投稿が存在しません")
    if styling.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="他人の投稿は削除できません")

    return remove_styling_with_items(styling, db)

@app.delete("/delete/{styling_id}")
async def delete_styling_legacy(styling_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    styling = db.query(models.Styling).filter(models.Styling.styling_id == styling_id).first()

    if styling is None:
        raise HTTPException(status_code=404, detail="投稿が存在しません")
    if styling.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="他人の投稿は削除できません")

    return remove_styling_with_items(styling, db)

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
