import uuid
from datetime import date
from pathlib import Path
import aioboto3
from app.core.config import settings
from app.core.exceptions import AppException
from fastapi import status

# 魔数映射：(特征字节, 偏移量, MIME, 扩展名)
_MIME_MAGIC = [
    (b"\xff\xd8\xff", 0, "image/jpeg", ".jpg"),
    (b"\x89PNG\r\n\x1a\n", 0, "image/png", ".png"),
    (b"GIF87a", 0, "image/gif", ".gif"),
    (b"GIF89a", 0, "image/gif", ".gif"),
]
_WEBP_MAGIC_PREFIX = b"RIFF"
_WEBP_MAGIC_SUFFIX = b"WEBP"
_WEBP_SUFFIX_OFFSET = 8


def detect_mime(file_header: bytes) -> tuple[str, str] | None:
    """纯字节魔数校验，返回 (mime, 扩展名)，不依赖任何系统库"""
    for magic, offset, mime, ext in _MIME_MAGIC:
        end = offset + len(magic)
        if len(file_header) >= end and file_header[offset:end] == magic:
            return mime, ext

    # WebP 单独校验：RIFF 头 + 第8字节起 WEBP 标识
    if len(file_header) >= 12 and file_header[:4] == _WEBP_MAGIC_PREFIX:
        if (
            file_header[_WEBP_SUFFIX_OFFSET : _WEBP_SUFFIX_OFFSET + 4]
            == _WEBP_MAGIC_SUFFIX
        ):
            return "image/webp", ".webp"

    return None


class MinIOStorageService:
    """MinIO 异步存储服务，S3 兼容，后续可无缝切换对象存储"""

    def __init__(self):
        self.endpoint = settings.MINIO_ENDPOINT
        self.access_key = settings.MINIO_ACCESS_KEY
        self.secret_key = settings.MINIO_SECRET_KEY
        self.bucket = settings.MINIO_BUCKET
        self.public_prefix = settings.MINIO_PUBLIC_PREFIX.rstrip("/")

    def _get_object_key(self, ext: str) -> str:
        """生成按日期分目录的 uuid 文件名，完全不使用原始文件名"""
        today = date.today()
        date_path = today.strftime("%Y/%m/%d")
        filename = uuid.uuid4().hex + ext
        return f"images/{date_path}/{filename}"

    def get_public_url(self, object_key: str) -> str:
        """拼接公网可访问的完整 URL"""
        return f"{self.public_prefix}/{object_key}"

    async def upload_file(
        self, file_content: bytes, mime: str, ext: str
    ) -> tuple[str, str]:
        """上传文件，返回 (object_key, 公网URL)"""
        object_key = self._get_object_key(ext)

        session = aioboto3.Session()
        async with session.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
        ) as s3:
            await s3.put_object(
                Bucket=self.bucket,
                Key=object_key,
                Body=file_content,
                ContentType=mime,
            )

        public_url = self.get_public_url(object_key)
        return object_key, public_url

    async def delete_file(self, object_key: str) -> None:
        """删除文件，用于异常回滚"""
        session = aioboto3.Session()
        async with session.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
        ) as s3:
            await s3.delete_object(Bucket=self.bucket, Key=object_key)


storage = MinIOStorageService()
