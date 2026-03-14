from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    user_name: str
    email: str
    password: str

class User(UserCreate):
    user_id: int

    class Config:
        orm_mode = True

class ItemCreate(BaseModel):
    item_name: str
    item_brand: str
    item_url: str
    item_category: str
class Item(ItemCreate):
    item_id: int
    class Config:
        orm_mode = True

        
class StylingCreate(BaseModel):
    styling_explanation: str
    styling_item_img:str

class Styling(StylingCreate):
    styling_id: int
    user_id: int
    creator: User
    items: list[Item]

    class Config:
        orm_mode = True
