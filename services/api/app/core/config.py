import os
from pydantic import BaseModel
from pathlib import Path


class Settings(BaseModel):
    # 项目名称
    PROJECT_NAME: str = "博客API"

    # API 版本前缀
    API_V1_STR: str = "/api/v1"

    # 后端API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # CORS 跨域来源
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://xmoekr.cn",
    ]

    # MinIO 配置
    # 本地开发：MINIO_ENDPOINT="minio.xmoekr.cn"
    # K8s集群内部：MINIO_ENDPOINT="minio:9000"
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "minio.xmoekr.cn")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minio@123456")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "blog-images")

    # 图片对外访问域名（固定公网，前端浏览器用，永远不变）
    MINIO_PUBLIC_DOMAIN: str = "minio.xmoekr.cn"

    # secure 自动判断：端点是集群内部 minio:9000 则http，否则HTTPS
    @property
    def MINIO_SECURE(self) -> bool:
        return self.MINIO_ENDPOINT != "minio:9000"

    @property
    def ARTICLES_DIR(self) -> str:
        # 当前文件：blog/services/api/app/core/config.py
        root = Path(__file__).parent.parent.parent.parent.parent
        return str(root / "content")


settings = Settings()
