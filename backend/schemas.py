from pydantic import BaseModel, Field

class UserBase(BaseModel):
    user_name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserCreate):
    user_id: int
    class Config:
        from_attributes = True
class ItemCreate(BaseModel):
    item_name: str
    item_brand: str
    item_url: str
    item_category: str
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
    creator: User
    items: list[Item]

    class Config:
        from_attributes = True

