from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import Enum
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from models.base import Base


class Settings(Base):
    __tablename__ = 'setting'

    id = Column(Integer, primary_key=True)
    parent_id = Column(Integer, ForeignKey('User.id'))
    calendar = Column(Boolean)
    weather = Column(Boolean)
    alarm = Column(Boolean)
    spotify = Column(Boolean)
