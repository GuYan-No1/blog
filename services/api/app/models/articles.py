from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

# 文章-标签 多对多关联中间表
article_tag = Table(
    "article_tag",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


class Category(Base):
    """文章分类表"""

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200), default="")

    # 一对多关联：一个分类对应多篇文章
    articles = relationship("Article", back_populates="category")


class Tag(Base):
    """文章标签表"""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), unique=True, nullable=False)

    # 多对多关联：一个标签对应多篇文章
    articles = relationship("Article", secondary=article_tag, back_populates="tags")


class Article(Base):
    """文章主表"""

    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    summary = Column(String(500), default="")
    content = Column(Text, nullable=False)
    cover_image = Column(String(500), default="")
    views = Column(Integer, default=0)

    # 外键关联分类
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="articles")

    # 多对多关联标签
    tags = relationship("Tag", secondary=article_tag, back_populates="articles")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
