from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class TagBase(BaseModel):
    name: str


class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = ""


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class ArticleCreate(BaseModel):
    """创建文章请求体"""

    title: str
    summary: Optional[str] = ""
    content: str
    cover_image: Optional[str] = ""
    category_id: Optional[int] = None
    tags: List[str] = []


class ArticleListItem(BaseModel):
    """文章列表项，不含正文，减少传输"""

    id: int
    title: str
    summary: str
    cover_image: str
    views: int
    category: Optional[Category] = None
    tags: List[Tag] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleDetail(ArticleListItem):
    """文章详情，包含正文"""

    content: str
    updated_at: datetime
