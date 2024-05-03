#!/bin/bash
git pull
pnpm run build
pm2 restart ecosystem.config.js
