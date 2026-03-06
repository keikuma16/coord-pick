from fastapi import FastAPI, Depends, Form, File, UploadFile
from typing import List
from sqlalchemy.orm import Session, joinedload
import schemas, models
from db import SessionLocal 
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
import json
from db import engine, SessionLocal, Base
    
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/images",StaticFiles (directory="images"), name="images")    

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#CORSエラーの解除
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://coord-pick.vercel.app/",
        "http://localhost:5173"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Userの登録
@app.post("/users")
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = models.User(
        user_name = user.user_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

#Stylingの登録
@app.post("/upload")
async def styling_create(
    styling_explanation:str = Form(...),
    styling_item_img:UploadFile = File(...),
    items: str = Form(...),
    db: Session = Depends(get_db)
):
    item_list = json.loads(items)
    save_folder = "images"
    os.makedirs(save_folder, exist_ok = True)  
    file_path = os.path.join(save_folder, styling_item_img.filename)
    with open(file_path, "wb") as f:
        f.write(await styling_item_img.read())
    
    img_url = f"https://fastapi-demo-y2bu.onrender.com/images/{styling_item_img.filename}"

    new_styling=models.Styling(
        styling_explanation = styling_explanation,
        styling_item_img = img_url
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