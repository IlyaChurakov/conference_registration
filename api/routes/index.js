const Router = require('express')
const nodemailer = require('nodemailer')
const sqlite3 = require('sqlite3').verbose()
const router = new Router()
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/AuthMiddleware')

const QRCode = require('qrcode')
const fs = require('fs')

router.post('/qr', async (req, res) => {
	const { text } = req.body

	// Создаем QR-код
	QRCode.toDataURL(text, async (err, url) => {
		if (err) throw err

		// Сохраняем изображение с QR-кодом
		const qrCodeImagePath = `${__dirname}/qrcode_${text}.png`
		const base64Data = url.replace(/^data:image\/png;base64/, '')
		fs.writeFileSync(qrCodeImagePath, base64Data, 'base64')

		console.log('QR-код успешно создан и сохранен:', qrCodeImagePath)
	})

	res.send('QRcode created')
})

router.get('/qr', (req, res) => {
	const { text } = req.body

	res.sendFile(`${__dirname}/qrcode_${text}.png`)
})

router.post('/login', (req, res) => {
	const { username, password } = req.body

	if (username === 'valid_user' && password === 'valid_password') {
		const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' })
		res.json({ token })
	} else {
		res.status(401).send('Authentication failed')
	}
})

const PDFDocument = require('pdfkit')
const path = require('path')

router.post('/createPDF', (req, res) => {
	const { pdfName, name, fio, phone, post, format, role, theme, qrcodeTime } =
		req.body
	const pdfFilePath = path.join(__dirname, `${pdfName}.pdf`)
	const today = new Date()

	const doc = new PDFDocument({
		size: 'A5',
		margin: 40, // Отступы по краям страницы
		layout: 'landscape',
	})
	doc.pipe(fs.createWriteStream(pdfFilePath))

	// Добавьте здесь ваш код для создания содержимого PDF
	doc
		.font(
			path.join(
				__dirname,
				'../documents/Shentox-Regular (RUS by Slavchansky)_0.ttf'
			)
		)
		.fontSize(10)
		.image('./images/v915-wit-011-f.jpg', 0, 0, { width: 612, height: 792 })
		.image('./images/logo.png', 50, 50, { width: 200, height: 50 })
		.image(`./routes/qrcode_${qrcodeTime}.png`, 400, 50, {
			width: 100,
			height: 100,
		})
		.text(
			`Приглашение на конференцию «Содействие развитию систем управления качеством, метрологии и стандартизации организаций промышленности Государственной корпорации «Ростех»`,
			70,
			160
		)
		.moveDown(1)
		.rect(50, 200, 500, 140)
		.stroke()
		.moveDown(1)
		.text(`Организация: ${name}`)
		.moveDown(0.5)
		.text(`Участник: ${fio}`)
		.moveDown(0.5)
		.text(`Должность: ${post}`)
		.moveDown(0.5)
		.text(`Телефон: ${phone}`)
		.moveDown(0.5)
		.text(`Формат участия: ${format}`)
		.moveDown(0.5)
		.text(`В роли: ${role}`)
		.moveDown(0.5)
		.text(`Тема доклада: ${theme}`)
	doc.end()

	res.status(200).send({ message: 'PDF успешно создан' })
})

router.get('/fetchPDF/:pdfName', (req, res) => {
	const { pdfName } = req.params

	res.sendFile(`${__dirname}/${pdfName}.pdf`)
})
router.get('/fetchPolicy', (req, res) => {
	const filePath = path.join(__dirname, '..', 'documents', 'Policy.pdf')
	res.sendFile(filePath)
})

router.post('/sendemail', (req, res) => {
	const { email, pdfName } = req.body
	// Настройка транспорта для отправки письма (указать свои настройки SMTP)

	const transporter = nodemailer.createTransport({
		host: 'smtp.mail.ru', // Замените на адрес вашего SMTP-сервера
		port: 465, // Порт SMTP сервера
		secure: true, // Использовать ли SSL/TLS (true для 465, false для других портов)
		auth: {
			user: 'churakov018@mail.ru', // Замените на ваше имя пользователя SMTP
			pass: '9J5YPUgkxvzUNDtHtzFq', // Замените на ваш пароль SMTP
		},
	})

	// Настройка содержания письма
	const mailOptions = {
		from: 'churakov018@mail.ru', // Замените на ваш email
		to: `${email}, d.kondratenko@rt-techpriemka.ru`, // Замените на email получателя
		subject: 'Регистрация на конференцию',
		attachments: [
			{
				filename: 'Регистрация на участие в конференции.pdf', // Имя файла в письме
				path: `${__dirname}/${pdfName}.pdf`, // Путь к файлу на сервере
			},
		],
		text: `
			Спасибо за регистрацию на конференцию
		`,
	}

	// Отправка письма
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error)
			res.status(500).send('Ошибка при отправке письма')
		} else {
			console.log('Письмо успешно отправлено: ' + info.response)
			res.status(200).send('Письмо успешно отправлено')
		}
	})
})
router.post('/database', (req, res) => {
	const { name, fio, post, phone, email, format, role, theme, options, text } =
		req.body

	const db = new sqlite3.Database('./ex_visitors.db')

	try {
		db.all(
			`INSERT INTO qr_visitors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) `,
			[name, fio, text, post, phone, email, format, role, theme, options],
			(err, rows) => {
				if (err) {
					console.log(err)
					res.status(504).send('Данные не уникальны')
				} else {
					res.status(200).send(rows) // Отправляем обычный текстовый ответ об успешном выполнении здесь
				}
			}
		)
	} catch (err) {
		res.status(500).send('Ошибка сервера, данные в БД не записаны')
	}

	db.close()
})
router.get('/database', authMiddleware, (req, res) => {
	const db = new sqlite3.Database('./ex_visitors.db')

	db.all(`select * from qr_visitors v`, (err, rows) => {
		if (err) {
			console.error(err)
			res.status(500).send('Ошибка сервера, не удалось получить данные из БД')
		} else {
			res.json(rows)
		}
	})

	db.close()
})

module.exports = router
