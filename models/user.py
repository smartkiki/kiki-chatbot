from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import Enum
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from models.base import Base


class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)
    images = relationship("Image")
    videos = relationship("Video")
    audios = relationship("Audio")
    settings = relationship("Settings")
