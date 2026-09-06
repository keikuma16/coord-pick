from fastapi import FastAPI, Depends, Form, File, UploadFile, HTTPException
from typing import List
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import schemas, models, auth
from constants import ITEM_CATEGORIES, ITEM_CONDITIONS, ITEM_CONDITION_NEW
from db import SessionLocal 
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
import json
from db import engine, SessionLocal, Base
import cloudinary
import cloudinary.uploader 

models.Base.metadata.create_all(bind=engine)


def ensure_item_condition_column():
    """items.item_condition を後から足すための繋ぎ。

    create_all は無いテーブルを作るだけで、既存テーブルに列は足さない。
    そのため本番の Postgres には item_condition が無いまま
    「列が存在しない」で全件取得が落ちる。起動時に一度だけ流しておく。
    本来は Alembic を入れる場所。
    """
    inspector = inspect(engine)
    if "items" not in inspector.get_table_names():
        return
    existing = {column["name"] for column in inspector.get_columns("items")}
    if "item_condition" in existing:
        return
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE items ADD COLUMN item_condition VARCHAR"))


ensure_item_condition_column()

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


def validate_item_list(item_list):
    """商品の入力をまとめて検証し、保存する形に整えて返す。

    画像を Cloudinary に上げる前に呼ぶ。以前は先に画像を上げて Styling も
    commit してから商品を見ていたため、入力が不正だと商品の無い投稿と
    使われない画像だけが残っていた。
    """
    normalized = []
    for item in item_list:
        if not isinstance(item, dict):
            raise HTTPException(status_code=400, detail="商品情報の形式が正しくありません。")

        def field(key):
            value = item.get(key)
            return value.strip() if isinstance(value, str) else ""

        name = field("name")
        brand = field("brand")
        category = field("category")
        condition = field("condition")
        url = field("url")

        if not name or not brand:
            raise HTTPException(
                status_code=400,
                detail="商品情報に必要な項目（名前・ブランド）が足りません。",
            )
        if category not in ITEM_CATEGORIES:
            raise HTTPException(status_code=400, detail="カテゴリーは一覧から選んでください。")
        if condition not in ITEM_CONDITIONS:
            raise HTTPException(
                status_code=400,
                detail="商品の状態は「新品」か「古着」のどちらかを選んでください。",
            )
        # 新品は購入先があるはずなので必須。古着は一点物で、買える場所が無いこともある
        if condition == ITEM_CONDITION_NEW and not url:
            raise HTTPException(
                status_code=400,
                detail="新品の商品には購入先URLが必要です。",
            )
        if url and not url.startswith(("http://", "https://")):
            raise HTTPException(
                status_code=400,
                detail="商品URLは http:// または https:// から始まる形式で入力してください。",
            )

        normalized.append(
            {
                "name": name,
                "brand": brand,
                "category": category,
                "condition": condition,
                # 古着で未入力のときは空文字ではなく NULL で持つ
                "url": url or None,
            }
        )
    return normalized

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

    # items は multipart の文字列で届くので、まず JSON として妥当か確かめる。
    # 壊れていたら 500 ではなく 400 で「フォームの内容が不正」と伝える。
    try:
        item_list = json.loads(items)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=400, detail="商品情報の形式が正しくありません。")
    if not isinstance(item_list, list):
        raise HTTPException(status_code=400, detail="商品情報の形式が正しくありません。")

    # 画像を上げる前に検証する。不正な入力のために Cloudinary の容量を使わない
    items_to_create = validate_item_list(item_list)

    # Cloudinary への保存。認証情報の未設定やサービス障害でここが落ちると、
    # 以前は素の 500 になり原因が分からなかった。502 で「画像保存に失敗」と返す。
    try:
        upload_result = cloudinary.uploader.upload(
            image_bytes,
            folder="coordpick",
            resource_type="image"
        )
    except Exception as e:
        # 認証エラー・通信断など。詳細はログに残し、利用者には汎用メッセージを返す。
        print(f"[upload] cloudinary error: {e}")
        raise HTTPException(status_code=502, detail="画像の保存に失敗しました。時間をおいて再度お試しください。")

    img_url = upload_result.get("secure_url")
    if not img_url:
        raise HTTPException(status_code=502, detail="画像の保存に失敗しました。時間をおいて再度お試しください。")

    try:
        new_styling = models.Styling(
            styling_explanation = styling_explanation,
            styling_item_img = img_url,
            user_id = current_user.user_id
        )
        db.add(new_styling)
        db.commit()
        db.refresh(new_styling)

        # 検証済みなので、ここでは詰めるだけ
        for item in items_to_create:
            db.add(models.Item(
                item_name = item["name"],
                item_brand = item["brand"],
                item_url = item["url"],
                item_category = item["category"],
                item_condition = item["condition"],
                styling_id = new_styling.styling_id
            ))

        db.commit()
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        print(f"[upload] db error: {e}")
        raise HTTPException(status_code=500, detail="投稿の保存に失敗しました。時間をおいて再度お試しください。")

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
