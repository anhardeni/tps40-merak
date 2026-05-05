#!/bin/bash
set -e

echo "Starting deployment..."

# 1. Bring down the application for maintenance
php artisan down || true

# 2. Pull the latest code
git pull origin main

# 3. Install PHP dependencies
composer install --no-dev --optimize-autoloader

# 4. Install Node dependencies and build assets
npm install
npm run build

# 5. Run database migrations
php artisan migrate --force

# 6. Optimized caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 7. Bring the application back up
php artisan up

echo "Deployment complete!"
