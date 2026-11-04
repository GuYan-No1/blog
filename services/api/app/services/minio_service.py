import json
import uuid
from minio import Minio
from minio.error import S3Error
from app.core.config import settings

# 初始化 MinIO 客户端
minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)


def init_bucket():
    """初始化桶：不存在则自动创建，设置公共读权限"""
    bucket_name = settings.MINIO_BUCKET
    if not minio_client.bucket_exists(bucket_name):
        minio_client.make_bucket(bucket_name)
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"],
                }
            ],
        }
        policy_json = json.dumps(policy)
        minio_client.set_bucket_policy(bucket_name, policy_json)


def upload_image(file_data, filename: str, content_type: str) -> str:
    """
    上传图片到MinIO
    :param file_data: 文件二进制流
    :param filename: 原始文件名
    :param content_type: mime类型
    :return: 给前端用的公网HTTPS图片URL
    """
    init_bucket()
    bucket_name = settings.MINIO_BUCKET
    ext = filename.split(".")[-1]
    obj_name = f"{uuid.uuid4().hex}.{ext}"

    minio_client.put_object(
        bucket_name,
        obj_name,
        file_data,
        length=-1,
        part_size=10 * 1024 * 1024,
        content_type=content_type,
    )
    # ✅ 固定使用公网域名，不再用 MINIO_ENDPOINT！
    return f"https://{settings.MINIO_PUBLIC_DOMAIN}/{bucket_name}/{obj_name}"
