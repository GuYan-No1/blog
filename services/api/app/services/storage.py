import asyncio
import uuid
from datetime import date

import boto3
from botocore.config import Config

from app.core.config import settings

# 魔数映射：(特征字节, MIME, 扩展名)
_MIME_MAGIC = [
    (b"\xff\xd8\xff", "image/jpeg", ".jpg"),
    (b"\x89PNG\r\n\x1a\n", "image/png", ".png"),
    (b"GIF87a", "image/gif", ".gif"),
    (b"GIF89a", "image/gif", ".gif"),
]

_WEBP_MAGIC_PREFIX = b"RIFF"
_WEBP_MAGIC_SUFFIX = b"WEBP"
_WEBP_SUFFIX_OFFSET = 8


def detect_mime(file_header: bytes) -> tuple[str, str] | None:
    """纯字节魔数校验，返回 (mime, 扩展名)，不依赖任何系统库"""
    for magic, mime, ext in _MIME_MAGIC:
        if file_header.startswith(magic):
            return mime, ext

    # WebP：RIFF 头 + 第 8 字节起 WEBP 标识
    if (
        len(file_header) >= 12
        and file_header[:4] == _WEBP_MAGIC_PREFIX
        and file_header[_WEBP_SUFFIX_OFFSET : _WEBP_SUFFIX_OFFSET + 4]
        == _WEBP_MAGIC_SUFFIX
    ):
        return "image/webp", ".webp"

    return None


_S3_CONFIG = Config(
    signature_version="s3v4",
    retries={"max_attempts": 10, "mode": "adaptive"},
    connect_timeout=30,
    read_timeout=300,
    s3={"addressing_style": "path"},  # 关键：path-style，MinIO 更稳
)


class MinIOStorageService:
    """MinIO 存储服务（boto3 同步 + asyncio.to_thread 包装）"""

    def __init__(self):
        self.endpoint = settings.MINIO_ENDPOINT
        self.access_key = settings.MINIO_ACCESS_KEY
        self.secret_key = settings.MINIO_SECRET_KEY
        self.bucket = settings.MINIO_BUCKET
        self.public_prefix = settings.MINIO_PUBLIC_PREFIX.rstrip("/")

        # boto3 同步 client，由 asyncio.to_thread 包装成异步
        self._client = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            config=_S3_CONFIG,
        )

    def _get_object_key(self, ext: str) -> str:
        """生成按日期分目录的 uuid 文件名，完全不使用原始文件名"""
        today = date.today()
        date_path = today.strftime("%Y/%m/%d")
        filename = uuid.uuid4().hex + ext
        return f"images/{date_path}/{filename}"

    def get_public_url(self, object_key: str) -> str:
        """拼接公网可访问的完整 URL"""
        return f"{self.public_prefix}/{object_key}"

    def _put_sync(self, object_key: str, body: bytes, mime: str) -> None:
        self._client.put_object(
            Bucket=self.bucket,
            Key=object_key,
            Body=body,
            ContentType=mime,
            ContentLength=len(body),
        )

    def _delete_sync(self, object_key: str) -> None:
        self._client.delete_object(Bucket=self.bucket, Key=object_key)

    async def upload(self, file_content: bytes, mime: str, ext: str) -> tuple[str, str]:
        """上传文件，返回 (object_key, 公网URL)"""
        object_key = self._get_object_key(ext)
        # 同步 IO 丢到线程池，不阻塞事件循环
        await asyncio.to_thread(self._put_sync, object_key, file_content, mime)
        return object_key, self.get_public_url(object_key)

    async def delete(self, object_key: str) -> None:
        """删除文件，用于异常回滚"""
        await asyncio.to_thread(self._delete_sync, object_key)


storage = MinIOStorageService()
