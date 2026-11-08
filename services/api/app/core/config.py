import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    # 项目名称
    PROJECT_NAME: str = "blog-api"
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
    MINIO_ENDPOINT: str = "http://minio-svc:9000"
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_BUCKET: str = "blog"
    MINIO_PUBLIC_PREFIX: str = "https://img.xmoekr.cn/blog"

    # 图片对外访问域名（固定公网，前端浏览器用，永远不变）
    MINIO_PUBLIC_DOMAIN: str = ""
    # 鉴权配置（与 Next.js 共享密钥）
    ADMIN_SECRET: str = ""

    # 上传限制
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    MAX_IMAGE_DIMENSION: int = 8000  # 最大宽高，防解压炸弹
    RATE_LIMIT: int = 10  # 单IP每分钟次数
    RATE_LIMIT_WINDOW: int = 60  # 秒

    DATABASE_URL: str = ""

    # TODO beforeMinIO 配置
    # 本地开发：MINIO_ENDPOINT="minio.xmoekr.cn"
    # K8s集群内部：MINIO_ENDPOINT="minio-svc:9000"
    # MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "minio.xmoekr.cn")
    # MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    # MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minio@123456")
    # MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "blog-images")

    # secure 自动判断：端点是集群内部 minio-svc:9000 则http，否则HTTPS
    @property
    def MINIO_SECURE(self) -> bool:
        return self.MINIO_ENDPOINT != "minio-svc:9000"

    @property
    def ARTICLES_DIR(self) -> str:
        # 当前文件：blog/services/api/app/core/config.py
        root = Path(__file__).parent.parent.parent.parent.parent
        return str(root / "content")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
