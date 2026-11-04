from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import articles, upload

app = FastAPI(title=settings.PROJECT_NAME, docs_url="/docs")

# CORS 跨域（前端连后端必须）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(
    articles.router, prefix=f"{settings.API_V1_STR}/articles", tags=["文章"]
)
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/upload", tags=["上传"])


# 健康检查
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "blog-api running"}
