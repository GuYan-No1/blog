import time
import logging
from fastapi import APIRouter, Depends, Request, File, UploadFile, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_admin
from app.core.config import settings
from app.core.exceptions import AppException
from app.services.storage import storage, detect_mime
from app.core.database import get_db
from app.models.upload import UploadRecord

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.post("/upload/image")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    start = time.time()
    client_ip = request.client.host if request.client else ""

    # 1. Content-Length 预检
    cl = request.headers.get("content-length")
    if cl and cl.isdigit() and int(cl) > settings.MAX_FILE_SIZE:
        raise AppException(
            "文件大小不能超过 5MB", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
        )

    content = await file.read()

    # 2. 二次大小校验
    if len(content) == 0:
        raise AppException("文件不能为空", status.HTTP_400_BAD_REQUEST)
    if len(content) > settings.MAX_FILE_SIZE:
        raise AppException(
            "文件大小不能超过 5MB", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
        )

    # 3. 魔数校验类型
    detect_result = detect_mime(content[:12])
    if not detect_result:
        raise AppException("不支持的文件类型", status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
    mime, ext = detect_result

    # 4. 上传到 MinIO
    key, url = await storage.upload(content, mime, ext)

    # 5. 写数据库，失败回滚删除文件
    try:
        record = UploadRecord(
            key=key,
            url=url,
            size=len(content),
            mime=mime,
            original_name=file.filename or "",
            uploader_ip=client_ip,
        )
        db.add(record)
        db.commit()
    except Exception:
        db.rollback()
        await storage.delete(key)
        raise AppException("上传失败", status.HTTP_500_INTERNAL_SERVER_ERROR)

    logging.info(
        f"[上传成功] size={len(content)} key={key} cost={int((time.time()-start)*1000)}ms"
    )
    return {"url": url, "key": key}
