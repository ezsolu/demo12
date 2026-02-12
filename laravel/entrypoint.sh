#!/bin/sh
set -e

# Ensure storage directory permissions
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependencies if needed
if [ ! -d "vendor" ]; then
    composer install 
fi

# copy env file if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
    php artisan migrate --force
    php artisan db:seed --force
fi

# Start Laravel Octane with Swoole
exec php artisan octane:start --host=0.0.0.0 --port=8000 --server=swoole