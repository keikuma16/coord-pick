from db import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, unique=True, index=True)
    stylings = relationship('Styling', back_populates='creator')

class Styling(Base):
    __tablename__ = 'stylings'

    styling_id = Column(Integer, primary_key=True, index=True)
    styling_explanation = Column(String)
    styling_item_img = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    creator = relationship('User', back_populates='stylings')
    items = relationship('Item', back_populates='styling_post')

class Item(Base):
    __tablename__ = 'items'

    item_id = Column(Integer,primary_key=True, index=True)
    item_url = Column(String)
    item_name = Column(String, nullable=False)
    item_brand = Column(String)
    item_category = Column(String)
    styling_id = Column(Integer, ForeignKey('stylings.styling_id'))
    styling_post = relationship('Styling', back_populates='items')


