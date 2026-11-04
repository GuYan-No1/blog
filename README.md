# 我的技术博客

Next.js 14 + FastAPI + MySQL + Redis + MinIO + RAG + Docker + K8s

## 开发
- 前端：`pnpm dev:web`
- 后端：见 services/api

```
blog/
├── pnpm-workspace.yaml     # 定义workspace，apps/*、packages/*
├── pnpm-lock.yaml          # 全局共享依赖锁
├── package.json            # 根工作区描述
├── .gitignore
├── README.md
├── apps/
│   └── web/                # Next.js博客前端
│       ├── package.json
│       ├── app/
│       ├── public/
│       ├── tsconfig.json
│       └── .gitignore
├── packages/
│   └── shared-types/       # TS共享类型（前端共用）
├── services/
│   └── api/                # Python FastAPI后端（uv管理，和pnpm无关）
└── deploy/
    └── k8s/                # k8s yaml编排、dockerfile
```

kubectl create secret docker-registry tcr-secret \
  --docker-server=ccr.ccs.tencentyun.com \
  --docker-username=100045259055 \
  --docker-password=xiaoCHUANG. \
  --docker-email=admin@xmoekr.cn

wc__zm@163.com
Abcd1324.*


page.ele("#user_login").input("wc__zm@163.com")
# 定位密码输入框并输入密码
page.ele("#user_password").input("Abcd1324.*")

