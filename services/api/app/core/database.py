from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 从环境变量读取数据库连接串，集群内通过服务名访问
# 格式: postgresql://用户名:密码@服务名:端口/库名
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://blog_admin:Blog@2026strong@postgres-svc:5432/blog_db"
)

# 创建数据库引擎
engine = create_engine(DATABASE_URL)
# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 数据模型基类，所有表结构都继承它
Base = declarative_base()


# 依赖项：给每个接口提供数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
