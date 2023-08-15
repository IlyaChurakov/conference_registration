const Router = require('express')
const nodemailer = require('nodemailer')
const sqlite3 = require('sqlite3').verbose()
const router = new Router()
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/AuthMiddleware')
const pdf = require('html-pdf')
const pdfTemplate = require('../documents/index')

router.post('/login', (req, res) => {
	const { username, password } = req.body

	if (username === 'valid_user' && password === 'valid_password') {
		const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' })
		res.json({ token })
	} else {
		res.status(401).send('Authentication failed')
	}
})

// Ошибка где-то тут
// router.post('/createPDF', (req, res) => {
// 	const { pdfName } = req.body

// 	pdf
// 		.create(pdfTemplate(req.body), {})
// 		.toFile(`${__dirname}/${pdfName}.pdf`, err => {
// 			if (err) {
// 				console.log(err)
// 				res.send(Promise.reject())
// 			} else {
// 				res.send(Promise.resolve())
// 			}
// 		})
// })

const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

router.post('/createPDF', (req, res) => {
	const { pdfName, name, fio, phone, post, format, role, options } = req.body
	const pdfFilePath = path.join(__dirname, `${pdfName}.pdf`)
	const today = new Date()

	const doc = new PDFDocument()
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
		.text(
			`Дата регистрации: ${`${today.getDate()}. ${
				(today.getMonth() + 1).length == 1
					? today.getMonth() + 1
					: '0' + (today.getMonth() + 1)
			}. ${today.getFullYear()}.`}`,
			70,
			150
		)
		.moveDown(1)
		.text(`Благодарим за регистрацию на конференцию!`)
		.moveDown(1)
		.rect(50, 200, 500, 120)
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
	doc.end()

	res.status(200).send({ message: 'PDF успешно создан' })
})

router.get('/fetchPDF/:pdfName', (req, res) => {
	const { pdfName } = req.params

	res.sendFile(`${__dirname}/${pdfName}.pdf`)
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
	const { name, fio, post, contacts, format, role, theme, options } = req.body

	const db = new sqlite3.Database('./ex_visitors.db')

	try {
		db.all(
			`INSERT INTO visitors VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
			[name, fio, post, contacts, format, role, theme, options],
			(err, rows) => {
				if (err) {
					res.status(500).send('Ошибка сервера, данные в БД не записаны')
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

	db.all(`select * from visitors v`, (err, rows) => {
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
