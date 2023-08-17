# Приложение по подаче заявок на конференцию

## Для запуска без nginx и docker - npm run dev

### api - http://localhost:3000/api

### app - http://localhost:5173

## Для запуска с docker и nginx - docker-compose up --build -d

### api - http://localhost:3000/api

### app - http://localhost:5173

### директория db - для volume api с БД

## Доступные роуты api

### /api/createPDF (POST)

### /api/fetchPDF/:pdfName (GET)

### /api/database (GET, POST)

### /api/sendemail (POST)

### /api/qr (GET, POST)
