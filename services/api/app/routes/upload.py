import time
import logging
from fastapi import APIRouter, Depends, Request, File, UploadFile, status
from sqlalchemy.orm import Session
from PIL import Image
import io
from app.core.auth import get_current_admin
from app.core.config import settings
from app.core.exceptions import AppException
from app.services.storage import storage, detect_mime
from ..core.database import get_db
from ..models.upload import UploadRecord

router = APIRouter(tags=["上传"], dependencies=[Depends(get_current_admin)])

# 简单内存限流器，单节点有效
_rate_limit_store: dict[str, list[float]] = {}


def _check_rate_limit(ip: str) -> None:
    now = time.time()
    window_start = now - settings.RATE_LIMIT_WINDOW
    records = _rate_limit_store.get(ip, [])
    records = [t for t in records if t > window_start]
    _rate_limit_store[ip] = records

    if len(records) >= settings.RATE_LIMIT:
        raise AppException(
            "请求过于频繁，请稍后再试", status.HTTP_429_TOO_MANY_REQUESTS
        )
    records.append(now)


@router.post("/api/v1/upload/image")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    start_time = time.time()
    client_ip = request.client.host if request.client else ""

    # 限流校验
    _check_rate_limit(client_ip)

    # 第一道：Content-Length 预检，避免大请求体读入内存
    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit():
        if int(content_length) > settings.MAX_FILE_SIZE:
            raise AppException(
                "文件大小不能超过 5MB", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
            )

    # 读取文件内容
    file_content = await file.read()
    file_size = len(file_content)

    # 空文件校验
    if file_size == 0:
        raise AppException("文件不能为空", status.HTTP_400_BAD_REQUEST)

    # 第二道：实际大小二次校验
    if file_size > settings.MAX_FILE_SIZE:
        raise AppException(
            "文件大小不能超过 5MB", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
        )

    # 魔数校验类型
    detect_result = detect_mime(file_content[:12])
    if not detect_result:
        raise AppException("不支持的文件类型", status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
    mime, ext = detect_result

    # 图片尺寸校验，防解压炸弹
    try:
        with Image.open(io.BytesIO(file_content)) as img:
            width, height = img.size
            if (
                width > settings.MAX_IMAGE_DIMENSION
                or height > settings.MAX_IMAGE_DIMENSION
            ):
                raise AppException(
                    f"图片尺寸超过限制（最大 {settings.MAX_IMAGE_DIMENSION}px）",
                    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                )
    except AppException:
        raise
    except Exception:
        # 魔数已校验为图片，解析失败直接拒绝
        raise AppException("不支持的文件类型", status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

    # 上传到 MinIO
    object_key, public_url = await storage.upload_file(file_content, mime, ext)

    # 写入数据库，失败则回滚删除 MinIO 文件
    try:
        record = UploadRecord(
            key=object_key,
            url=public_url,
            size=file_size,
            mime=mime,
            original_name=file.filename or "upload",
            uploader_ip=client_ip,
        )
        db.add(record)
        db.commit()
    except Exception:
        db.rollback()
        await storage.delete_file(object_key)
        raise AppException(
            "上传失败，请稍后重试", status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # 打日志
    cost = round((time.time() - start_time) * 1000, 2)
    logging.info(
        f"[上传成功] size={file_size} mime={mime} key={object_key} "
        f"ip={client_ip} cost={cost}ms"
    )

    return {"url": public_url, "key": object_key}
