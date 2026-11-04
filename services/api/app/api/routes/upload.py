from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.minio_service import upload_image

router = APIRouter()

# 允许的图片后缀
ALLOWED_EXT = {"jpg", "jpeg", "png", "gif", "webp"}


@router.post("/")
async def upload(file: UploadFile = File(...)):
    mime_map = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
    }
    if not file.filename:
        raise HTTPException(status_code=400, detail="文件名不能为空")
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="只允许 jpg/png/gif/webp 图片")

    try:
        ct = mime_map.get(ext, file.content_type or "application/octet-stream")
        url = upload_image(file.file, file.filename, ct)
        return {"code": 200, "msg": "上传成功", "data": {"url": url}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败：{str(e)}")
