# 阶段1：安装依赖
FROM python:3.12-slim AS builder

# 安装 uv（高速包管理器）
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# 先拷贝依赖描述文件，利用docker缓存
COPY pyproject.toml uv.lock ./
# 安装依赖到虚拟环境
RUN uv sync --frozen

# 阶段2：运行时
FROM python:3.12-slim AS runner

WORKDIR /app

# 从builder拷贝虚拟环境
COPY --from=builder /app/.venv /app/.venv
# 拷贝代码
COPY app ./app

# 把venv加入PATH
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
