# Этап 1: Добавление Nginx
FROM nginx

# Копируем конфигурацию Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Копируем статические файлы React приложения из предыдущего этапа
COPY --from=build /app/build /usr/share/nginx/html

# Открываем порт для Nginx
EXPOSE 80
