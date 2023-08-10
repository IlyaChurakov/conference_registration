const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const router = require('./routes')
const cors = require('cors')

const app = express()

const allowedOrigins = ['http://localhost:5173', 'https://localhost']

app.use(
	cors({
		origin: (origin, callback) => {
			// Проверить, является ли источник одним из разрешенных
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		},
	})
)

// Настройка парсера для данных формы
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'static')))

app.use('/api', router)

// Запуск сервера на порту 3000
app.listen(3000, () => {
	console.log('Сервер запущен на порту 3000')
})
