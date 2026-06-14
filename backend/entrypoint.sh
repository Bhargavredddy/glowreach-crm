#!/bin/sh

# Set database provider based on env
if [ "$DATABASE_PROVIDER" = "postgresql" ]; then
  echo "Switching Prisma provider to postgresql"
  node scripts/switch-db.js postgresql
else
  echo "Switching Prisma provider to sqlite"
  node scripts/switch-db.js sqlite
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push database schema to database
echo "Pushing database schema..."
npx prisma db push

# Conditionally seed the database
if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  npm run prisma:seed
fi

# Start the application
echo "Starting backend..."
exec npm run start
