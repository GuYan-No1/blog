import hmac
import hashlib
import base64
import json
import time
from fastapi import Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings
from .exceptions import AppException

security = HTTPBearer(auto_error=False)


def _base64url_decode(data: str) -> bytes:
    base64_str = data.replace("-", "+").replace("_", "/")
    padding = 4 - len(base64_str) % 4
    if padding != 4:
        base64_str += "=" * padding
    return base64.b64decode(base64_str)


def verify_admin_token(token: str) -> bool:
    """与 Next.js 令牌完全兼容的 HMAC-SHA256 校验"""
    try:
        payload_str, sig_str = token.split(".", 1)
    except ValueError:
        return False

    try:
        payload_bytes = _base64url_decode(payload_str)
        sig_bytes = _base64url_decode(sig_str)
    except Exception:
        return False

    expected_sig = hmac.new(
        settings.ADMIN_SECRET.encode("utf-8"), payload_bytes, hashlib.sha256
    ).digest()
    if not hmac.compare_digest(expected_sig, sig_bytes):
        return False

    try:
        payload = json.loads(payload_bytes.decode("utf-8"))
        if not payload.get("exp") or time.time() * 1000 > payload["exp"]:
            return False
    except Exception:
        return False

    return True


async def get_current_admin(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> None:
    """管理员鉴权依赖，优先读 Authorization 头，其次读 admin_token Cookie"""
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    if not token:
        token = request.cookies.get("admin_token")

    if not token or not verify_admin_token(token):
        raise AppException("未授权", status.HTTP_401_UNAUTHORIZED)
