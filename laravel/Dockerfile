FROM phpswoole/swoole:php8.5-alpine

# Install system deps + Swoole + Node/npm (keep libzip for zip extension runtime)
RUN apk add --update --no-cache \
    zlib-dev libsodium-dev libzip libzip-dev zip libpng libpng-dev bash git shadow libxml2-dev curl-dev nodejs npm  &&\
    docker-php-ext-configure pcntl --enable-pcntl &&\
    docker-php-ext-install exif zip gd xml curl pcntl

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer


WORKDIR /var/www/html

# Copy app (or create-project later)
COPY . .

RUN composer install --no-dev --optimize-autoloader 2>/dev/null || true

RUN usermod -u 1001 www-data &&\
    groupmod -g 1001 www-data &&\
    chown -R www-data:www-data /var/www/html

EXPOSE 8000

USER www-data

CMD ["/bin/bash", "/var/www/html/entrypoint.sh"]