# 我的技术博客
Next.js 14 + FastAPI + MySQL + Redis + MinIO + RAG + Docker + K8s

## 开发
- 前端：`pnpm dev:web`
- 后端：见 services/api


cat > ~/minio.yaml <<'EOF'

# 持久化存储声明
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: minio-pvc
  labels:
    app: minio
spec:
  storageClassName: local-path
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
# 部署实例
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minio
  labels:
    app: minio
spec:
  replicas: 1
  selector:
    matchLabels:
      app: minio
  template:
    metadata:
      labels:
        app: minio
    spec:
      containers:
        - name: minio
          image: minio/minio:latest
          args: ["server", "/data", "--console-address", ":9001"]
          env:
            - name: MINIO_ROOT_USER
              value: minioadmin
            - name: MINIO_ROOT_PASSWORD
              value: minio@123456
          ports:
            - containerPort: 9000
              name: api
            - containerPort: 9001
              name: console
          volumeMounts:
            - name: data
              mountPath: /data
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: minio-pvc
---
# 集群内服务
apiVersion: v1
kind: Service
metadata:
  name: minio-svc
  labels:
    app: minio
spec:
  selector:
    app: minio
  ports:
    - name: api
      port: 9000
      targetPort: 9000
    - name: console
      port: 9001
      targetPort: 9001
  type: ClusterIP
---
# 控制台公网入口
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: minio-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
    traefik.ingress.kubernetes.io/router.middlewares: default-redirect-https@kubernetescrd
spec:
  ingressClassName: traefik
  tls:
    - hosts:
        - minio.xmoekr.cn
      secretName: minio-xmoekr-tls
  rules:
    - host: minio.xmoekr.cn
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: minio-svc
                port:
                  number: 9001
EOF
