from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from datetime import datetime
from ..core.database import Base


class UploadRecord(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(512), nullable=False, unique=True)
    url = Column(String(512), nullable=False)
    size = Column(BigInteger, nullable=False)
    mime = Column(String(64), nullable=False)
    original_name = Column(String(255), nullable=False, default="")
    uploader_ip = Column(String(64), nullable=False, default="")
    created_at = Column(DateTime, default=datetime.now, index=True)
