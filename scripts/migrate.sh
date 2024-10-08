#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

# Navigate to the apps/api directory
cd apps/api

# Run the Prisma migration command
npx prisma migrate dev
