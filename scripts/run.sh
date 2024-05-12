#!/bin/bash
docker compose up -d
cp .env ./apps/api/.env
cp .env ./apps/ui/.env
pnpm install && pnpm run build
pm2 start ecosystem.config.js
