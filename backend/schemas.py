from pydantic import BaseModel, Field

class UserBase(BaseModel):
    user_name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserPublic(BaseModel):
    user_id: int
    user_name: str
    class Config:
        from_attributes = True
class ItemCreate(BaseModel):
    item_name: str
    item_brand: str
    # 古着は買える場所が無いこともあるので任意。新品のときだけ必須にする(検証は main 側)
    item_url: str | None = None
    item_category: str
    # 後から足した項目。既存の投稿は NULL のままなので任意にしておく
    item_condition: str | None = None
class Item(ItemCreate):
    item_id: int
    class Config:
        from_attributes = True

        
class StylingCreate(BaseModel):
    styling_explanation: str
    styling_item_img: str

class Styling(StylingCreate):
    styling_id: int
    user_id: int
    creator: UserPublic
    items: list[Item]

    class Config:
        from_attributes = True

