import os
import frontmatter  # python-frontmatter 解析 markdown frontmatter
from app.core.config import settings


def get_all_articles():
    articles_dir = os.path.abspath(settings.ARTICLES_DIR)
    print(f"\x1b[33m{articles_dir}\x1b[0m")
    # 兜底：目录不存在直接返回空数组
    if not os.path.exists(articles_dir):
        print(f"文章目录不存在：{articles_dir}")
        return []
    articles = []
    for filename in os.listdir(articles_dir):
        if filename.endswith(".md"):
            file_path = os.path.join(articles_dir, filename)
            try:
                post = frontmatter.load(file_path)
                articles.append(
                    {
                        "slug": post["slug"],
                        "title": post["title"],
                        "date": post["date"],
                        "tag": post["tag"],
                        "desc": post.get("desc", ""),
                    }
                )
            except Exception as e:
                print(f"解析失败 {filename}, err: {e}")
                continue
    # 日期倒序
    articles.sort(key=lambda x: x["date"], reverse=True)
    return articles


def get_article_by_slug(slug: str):
    """读取单篇文章完整内容"""
    articles_dir = os.path.abspath(settings.ARTICLES_DIR)
    filepath = os.path.join(articles_dir, f"{slug}.md")
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        post = frontmatter.load(f)
    return {
        "slug": slug,
        "title": post.metadata.get("title", ""),
        "date": post.metadata.get("date", ""),
        "tag": post.metadata.get("tag", ""),
        "desc": post.metadata.get("desc", ""),
        "content": post.content,  # markdown 正文
    }
