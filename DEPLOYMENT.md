# Deployment Guide

## Vercel

Deploy the `frontend` folder as a separate Vercel project.

- Framework preset: `Vite`
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com`

## Render

You can use the repo-level `render.yaml` blueprint or create the services manually.

Services to create:

1. `billing-backend`
2. `billing-ml-engine`
3. `billing-cpp-engine`

Recommended settings:

- `billing-backend`
  Root directory: `backend`
  Runtime: `Node`
  Build command: `npm install`
  Start command: `npm start`
- `billing-ml-engine`
  Root directory: `ml-engine`
  Runtime: `Docker`
- `billing-cpp-engine`
  Root directory: `cpp-engine`
  Runtime: `Docker`

Backend environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN=https://<your-vercel-app>.vercel.app`
- `CPP_ENGINE_URL=https://<your-cpp-service>.onrender.com`
- `ML_ENGINE_URL=https://<your-ml-service>.onrender.com`
- `S3_ENDPOINT=<your-s3-compatible-endpoint>`
- `S3_PORT=443`
- `S3_USE_SSL=true`
- `S3_ACCESS_KEY=<your-access-key>`
- `S3_SECRET_KEY=<your-secret-key>`
- `S3_REGION=<your-region>`
- `S3_PATH_STYLE=true` if your storage provider requires path-style URLs

## Storage Note

Render will host your services, but it is not your object storage provider here. For production uploads/downloads, point the backend at a real S3-compatible provider such as AWS S3, Cloudflare R2, Backblaze B2 S3, or a hosted MinIO instance.
