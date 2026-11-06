from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .database import engine, Base, get_db
from . import models, schemas

# 启动时自动创建所有数据表（如果不存在）
Base.metadata.create_all(bind=engine)

app = FastAPI(title="博客 API", version="1.0.0")


# -------------------- 分类接口 --------------------
@app.get("/api/v1/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    """获取所有分类"""
    return db.query(models.Category).all()


# -------------------- 标签接口 --------------------
@app.get("/api/v1/tags", response_model=List[schemas.Tag])
def get_tags(db: Session = Depends(get_db)):
    """获取所有标签"""
    return db.query(models.Tag).all()


# -------------------- 文章接口 --------------------
@app.get("/api/v1/articles", response_model=List[schemas.ArticleListItem])
def get_articles(
    page: int = 1,
    page_size: int = 10,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """分页获取文章列表，支持按分类筛选"""
    query = db.query(models.Article)
    if category_id:
        query = query.filter(models.Article.category_id == category_id)

    offset = (page - 1) * page_size
    return (
        query.order_by(models.Article.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )


@app.get("/api/v1/articles/{article_id}", response_model=schemas.ArticleDetail)
def get_article_detail(article_id: int, db: Session = Depends(get_db)):
    """获取文章详情，阅读量自动+1"""
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")

    article.views += 1  # type: ignore
    db.commit()
    return article


@app.post("/api/v1/articles", response_model=schemas.ArticleDetail)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    """创建新文章（后续后台管理用）"""
    # 校验分类
    category = None
    if article.category_id:
        category = (
            db.query(models.Category)
            .filter(models.Category.id == article.category_id)
            .first()
        )
        if not category:
            raise HTTPException(status_code=400, detail="分类不存在")

    # 处理标签：不存在则自动创建
    tags = []
    for tag_name in article.tags:
        tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
        if not tag:
            tag = models.Tag(name=tag_name)
            db.add(tag)
            db.flush()
        tags.append(tag)

    # 创建文章
    db_article = models.Article(
        title=article.title,
        summary=article.summary,
        content=article.content,
        cover_image=article.cover_image,
        category_id=article.category_id,
        tags=tags,
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article
