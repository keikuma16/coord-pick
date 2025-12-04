from db import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    items = relationship('Item', back_populates='seller')

class Item(Base):
    __tablename__ = 'items'

    item_category = Column(String, index=True)
    item_price = Column(Integer, index=True)
    item_id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    item_size = Column(String, index=True)
    seller_id = Column(Integer, ForeignKey('users.user_id', ondelete='CASCADE'),nullable=False)
    item_image_URL = Column(String, index=True)

    seller = relationship('User', back_populates='items')