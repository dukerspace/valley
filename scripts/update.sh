#!/bin/bash
git pull
cp .env ./apps/api/.env
cp .env ./apps/web/.env
pnpm run build
pm2 restart ecosystem.config.js
