/**
 * 管理后台鉴权工具
 * 基于 Web Crypto API 实现 HMAC-SHA256 签名令牌，兼容 Edge Runtime
 * 仅可在服务端代码（Middleware、Route Handler）中使用
 */

// 令牌有效期：7天
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Base64URL 编码
 * 兼容 Node.js 与浏览器环境，基于标准 btoa 实现，无外部依赖
 * 用于 JWT 签名令牌的载荷与签名二进制数据编码
 * @param data - 待编码的二进制数据，兼容任意底层缓冲区的 Uint8Array
 * @returns 无填充的 Base64URL 编码字符串
 */
function base64UrlEncode(data: Uint8Array<ArrayBufferLike>): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]!);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}


/**
 * Base64URL 解码
 * 兼容 RFC 4648 §5 无填充标准输入，同时防御性兼容带填充的非标准输入
 * 基于标准 atob 实现，无外部依赖，用于 JWT 验签时的载荷与签名字符串解码
 * @param str - Base64URL 编码字符串，允许带或不带尾部 padding
 * @returns 解码后的二进制数据，底层为纯 ArrayBuffer，可直接传入 Web Crypto API
 * @throws {DOMException} 输入含非法字符或长度非法时抛出 InvalidCharacterError，由调用方捕获并处理为鉴权失败
 */
function base64UrlDecode(str: string): Uint8Array<ArrayBuffer> {
  // 字符替换 + 移除所有尾部 padding，兼容带/不带 padding 的输入
  const base64 = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/=+$/, "");

  // 计算并补齐标准 Base64 所需的尾部 padding
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length) as Uint8Array<ArrayBuffer>;

  for (let i = 0; i < binary.length; i++) {
    bytes[i]! = binary.charCodeAt(i);
  }

  return bytes;
}


/**
 * 导入签名密钥
 */
async function importKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * 生成签名令牌
 */
export async function generateToken(secret: string): Promise<string> {
  const key = await importKey(secret);
  const exp = Date.now() + TOKEN_TTL;
  const payload = JSON.stringify({ exp });

  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);
  const signatureBytes = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, payloadBytes)
  );

  const payloadStr = base64UrlEncode(payloadBytes);
  const signatureStr = base64UrlEncode(signatureBytes);

  return `${payloadStr}.${signatureStr}`;
}

/**
 * 验证令牌合法性
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const [payloadStr, signatureStr] = token.split(".");
    if (!payloadStr || !signatureStr) return false;

    const key = await importKey(secret);
    const payloadBytes = base64UrlDecode(payloadStr);
    const signatureBytes = base64UrlDecode(signatureStr);

    // 验证签名
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      payloadBytes
    );
    if (!isValid) return false;

    // 验证有效期
    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(payloadBytes));
    if (!payload.exp || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}
