from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    user_name: str
    password: str
    email: str

class User(UserCreate):
    user_id: int

    class Config:
        orm_mode = True

class ItemCreate(BaseModel):
    item_name: str
    item_category: str
    item_size: str
    item_price: int
    item_image_URL: str
class Item(ItemCreate):
    item_id: int
    seller_id: int

    class Config:
        orm_mode = True