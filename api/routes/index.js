const Router = require('express')
const nodemailer = require('nodemailer')
const sqlite3 = require('sqlite3').verbose()
const router = new Router()
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/AuthMiddleware')

const QRCode = require('qrcode')
const fs = require('fs')

router.post('/qr', authMiddleware, async (req, res) => {
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

router.get('/qr', authMiddleware, (req, res) => {
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

router.post('/createPDF', authMiddleware, (req, res) => {
	const {
		pdfName,
		name,
		fio,
		phone,
		post,
		format,
		role,
		theme,
		qrcodeTime,
		options,
	} = req.body
	const pdfFilePath = path.join(__dirname, `${pdfName}.pdf`)
	const today = new Date()

	const doc = new PDFDocument({
		size: 'A5',
		margin: 0, // Отступы по краям страницы
		// layout: 'landscape',
	})
	doc.pipe(fs.createWriteStream(pdfFilePath))

	// Добавьте здесь ваш код для создания содержимого PDF
	doc
		.font(
			path.join(__dirname, '../documents/Proxima Nova Condensed Regular.otf')
		)
		.fontSize(12)
		.image('./images/background.jpg', 0, 0, { width: 612, height: 792 })
		.image('./images/rttech_dark.png', 80, 30, { width: 50, height: 50 })
		.image('./images/rostech_dark.png', 20, 30, { width: 50, height: 50 })
		.image(`./routes/qrcode_${qrcodeTime}.png`, 300, 25, {
			width: 100,
			height: 100,
		})
		.fillColor('black')
		.text(`Заявка на конференцию `, 20, 100, {
			width: 250,
			height: 20,
		})
		.text(`Государственной корпорации «Ростех»`, {
			width: 250,
			height: 20,
		})
		.fontSize(10)
		.moveDown(0.5)
		.text(
			`Содействие развитию систем управления качеством, метрологии и стандартизации организаций промышленности`,
			{
				width: 250,
				height: 50,
			}
		)
		.moveDown(1)
		.rect(10, 170, 400, 415)
		.strokeColor('black')
		.stroke()
		.moveDown(1)

	name && doc.text(`Организация: ${name}`).moveDown(0.5)
	fio && doc.text(`Участник: ${fio}`).moveDown(0.5)
	post && doc.text(`Должность: ${post}`).moveDown(0.5)
	phone && doc.text(`Телефон: ${phone}`).moveDown(0.5)
	format && doc.text(`Формат участия: ${format}`).moveDown(0.5)
	role && doc.text(`В роли: ${role}`).moveDown(0.5)

	theme && doc.text(`Тема доклада: ${theme}`).moveDown(0.5)

	options && options.length && doc.text(`Интересные темы:`)

	options &&
		options.length &&
		options.forEach(opt => {
			doc
				.fontSize(8)
				.text(
					`- ${
						options.length >= 10
							? opt.length >= 90
								? opt.slice(0, 90) + '...'
								: opt
							: opt
					}`,
					{
						width: 380,
						height: 50,
					}
				)
		})

	doc.end()

	res.status(200).send('PDF успешно создан')
})

router.get('/fetchPDF/:pdfName', authMiddleware, (req, res) => {
	const { pdfName } = req.params

	res.setHeader('Content-Type', 'application/pdf')

	res.sendFile(`${__dirname}/${pdfName}`)
})
router.get('/fetchPrivacy', (req, res) => {
	const filePath = path.join(__dirname, '..', 'documents', 'privacy.pdf')
	res.sendFile(filePath)
})
router.get('/fetchAgreement', (req, res) => {
	const filePath = path.join(__dirname, '..', 'documents', 'agreement.pdf')
	res.sendFile(filePath)
})

router.post('/sendemail', authMiddleware, (req, res) => {
	const { fio, email, pdfName } = req.body
	// Настройка транспорта для отправки письма (указать свои настройки SMTP)

	const transporter = nodemailer.createTransport({
		host: 'smtp.mail.ru', // Замените на адрес вашего SMTP-сервера
		port: 465, // Порт SMTP сервера
		secure: true, // Использовать ли SSL/TLS (true для 465, false для других портов)
		auth: {
			user: 'no-replay@rt-techpriemka.ru', // Замените на ваше имя пользователя SMTP
			pass: 'ku1YpQSZ67vW1Z2C69bh', // Замените на ваш пароль SMTP
		},
	})

	// Настройка содержания письма
	const mailOptions = {
		from: 'no-replay@rt-techpriemka.ru', // Замените на ваш email
		to: `${email}, d.kondratenko@rt-techpriemka.ru`, // Замените на email получателя
		subject: 'Регистрация на конференцию',
		attachments: [
			{
				filename: 'Регистрация на участие в конференции.pdf', // Имя файла в письме
				path: `${__dirname}/${pdfName}.pdf`, // Путь к файлу на сервере
			},
		],
		html: `
			<div>
				<div>Здравствуйте, ${fio}!</div>
				<p>Спасибо за регистрацию на конференцию «Содействие развитию систем управления качеством, метрологии и стандартизации организаций промышленности Государственной корпорации «Ростех».</p>
				<p>Мы будем рады видеть Вас <strong> 10-13 октября 2023 года </strong> в городе <strong>Сочи</strong>.</p>
				<p>За несколько дней до конференции Вам придет письмо с напоминанием.</p>
				<p>Пожалуйста, не забудьте приглашение, вложенное в письмо. Его можно не распечатывать, а сохранить в телефоне: оно понадобится для оформления бейджа участника.</p>
				<p>Не прощаемся и ждем Вас в Сочи!</p>
				<p><i>АО «РТ-Техприемка»</i></p>
			</div>`,
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
router.post('/database', authMiddleware, (req, res) => {
	const {
		name,
		fio,
		post,
		phone,
		email,
		format,
		role,
		theme,
		options,
		text,
		metrology,
	} = req.body

	const db = new sqlite3.Database('./ex_visitors.db')

	try {
		db.all(
			`INSERT INTO qr_visitors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) `,
			[
				name,
				fio,
				text,
				post,
				phone,
				email,
				format,
				role,
				theme,
				options,
				metrology,
			],
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
