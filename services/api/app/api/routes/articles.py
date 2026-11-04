from fastapi import APIRouter
from app.services.article_service import get_all_articles, get_article_by_slug

router = APIRouter()


# 获取所有文章列表
@router.get("/")
def list_articles():
    articles = get_all_articles()
    return {"data": articles}


# 获取单篇文章详情
@router.get("/{slug}")
def read_article(slug: str):
    article = get_article_by_slug(slug)
    if not article:
        return {"error": "文章不存在"}
    return {"data": article}
