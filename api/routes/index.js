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
		.moveDown(0.5)
		.text(
			`Содействие развитию систем управления качеством, метрологии и стандартизации организаций промышленности`,
			{
				width: 300,
				height: 50,
			}
		)
		.fontSize(10)
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
router.get('/fetchProgramm', (req, res) => {
	const filePath = path.join(
		__dirname,
		'..',
		'documents',
		'Программа конференции.pdf'
	)
	res.sendFile(filePath)
})
router.get('/fetchPrivacy', (req, res) => {
	const filePath = path.join(__dirname, '..', 'documents', 'Policy.pdf')
	res.sendFile(filePath)
})
router.get('/fetchAgreement', (req, res) => {
	const filePath = path.join(__dirname, '..', 'documents', 'Agreement.pdf')
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
				<p>Спасибо за регистрацию на конференцию Государственной корпорации «Ростех» «Содействие развитию систем управления качеством, метрологии и стандартизации организаций промышленности».</p>
				<p>Мы будем рады видеть Вас <strong> 10-13 октября 2023 года </strong> в городе <strong>Сочи, Санаторий «Зеленая Роща»</strong>.</p>
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
				JSON.stringify(options),
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
router.post('/rate', authMiddleware, (req, res) => {
	const { message, rating } = req.body

	const db = new sqlite3.Database('./ex_visitors.db')

	try {
		db.all(
			`INSERT INTO rating VALUES (CURRENT_TIMESTAMP, ?, ?) `,
			[message, rating],
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

// const uuid = require('uuid')

// router.post('/mails', authMiddleware, async (req, res) => {
// 	const transporter = nodemailer.createTransport({
// 		host: 'smtp.mail.ru', // Замените на адрес вашего SMTP-сервера
// 		port: 465, // Порт SMTP сервера
// 		secure: true, // Использовать ли SSL/TLS (true для 465, false для других портов)
// 		auth: {
// 			user: 'no-replay@rt-techpriemka.ru', // Замените на ваше имя пользователя SMTP
// 			pass: 'ku1YpQSZ67vW1Z2C69bh', // Замените на ваш пароль SMTP
// 		},
// 	})

// 	async function generateAndSaveQRCode(employee, hash) {
// 		return new Promise(async (resolve, reject) => {
// 			QRCode.toDataURL(hash, async (err, url) => {
// 				if (err) {
// 					reject(err)
// 				} else {
// 					const qrCodeImagePath = path.join(__dirname, `qrcode_${hash}.png`)
// 					const base64Data = url.replace(/^data:image\/png;base64,/, '')

// 					try {
// 						fs.writeFileSync(qrCodeImagePath, base64Data, 'base64')
// 						resolve({ name: employee.name, hash, qrCodeImagePath })
// 					} catch (error) {
// 						reject(error)
// 					}
// 				}
// 			})
// 		})
// 	}
// 	async function generateAndSavePDF(employee, hash) {
// 		const pdfFilePath = path.join(__dirname, `${employee.name}.pdf`)

// 		const doc = new PDFDocument({
// 			size: 'A5',
// 			margin: 0, // Отступы по краям страницы
// 		})
// 		doc.pipe(fs.createWriteStream(pdfFilePath))

// 		// Добавьте здесь ваш код для создания содержимого PDF
// 		doc
// 			.font(
// 				path.join(__dirname, '../documents/Proxima Nova Condensed Regular.otf')
// 			)
// 			.fontSize(12)
// 			.image('./images/background.jpg', 0, 0, { width: 612, height: 792 })
// 			.image('./images/rttech_dark.png', 80, 30, { width: 50, height: 50 })
// 			.image('./images/rostech_dark.png', 20, 30, { width: 50, height: 50 })
// 			.image(`./routes/qrcode_${hash}.png`, 300, 25, {
// 				width: 100,
// 				height: 100,
// 			})
// 			.fillColor('black')
// 			.text(`Заявка на конференцию `, 20, 100, {
// 				width: 250,
// 				height: 20,
// 			})
// 			.text(`Государственной корпорации «Ростех»`, {
// 				width: 250,
// 				height: 20,
// 			})
// 			.moveDown(0.5)
// 			.text(
// 				`Содействие развитию систем управления качеством, метрологии и стандартизации организаций промышленности`,
// 				{
// 					width: 300,
// 					height: 50,
// 				}
// 			)
// 			.fontSize(10)
// 			.moveDown(1)
// 			.rect(10, 170, 400, 415)
// 			.strokeColor('black')
// 			.stroke()
// 			.moveDown(1)

// 		employee.company &&
// 			doc.text(`Организация: ${employee.company}`).moveDown(0.5)
// 		employee.name && doc.text(`Участник: ${employee.name}`).moveDown(0.5)
// 		// post && doc.text(`Должность: ${post}`).moveDown(0.5)
// 		// phone && doc.text(`Телефон: ${phone}`).moveDown(0.5)
// 		// format && doc.text(`Формат участия: ${format}`).moveDown(0.5)
// 		// role && doc.text(`В роли: ${role}`).moveDown(0.5)

// 		// theme && doc.text(`Тема доклада: ${theme}`).moveDown(0.5)

// 		doc.end()
// 	}
// 	async function sendMail(employee) {
// 		const mailOptions = {
// 			from: 'no-replay@rt-techpriemka.ru', // Замените на ваш email
// 			to: `${employee.email}`, // Замените на email получателя
// 			subject: 'Регистрация на конференцию',
// 			attachments: [
// 				{
// 					filename: 'Регистрация на участие в конференции.pdf', // Имя файла в письме
// 					path: `${__dirname}/${employee.name}.pdf`, // Путь к файлу на сервере
// 				},
// 			],
// 			html: `
// 			<div>
// 				<div>Здравствуйте, ${employee.name}!</div>
// 				<p>Спасибо за регистрацию на конференцию Государственной корпорации «Ростех» «Содействие развитию систем управления качеством, метрологии и стандартизации организаций промышленности».</p>
// 				<p>Мы будем рады видеть Вас <strong> 10-13 октября 2023 года </strong> в городе <strong>Сочи, Санаторий «Зеленая Роща»</strong>.</p>
// 				<p>Пожалуйста, не забудьте приглашение, вложенное в письмо. Его можно не распечатывать, а сохранить в телефоне: оно понадобится для оформления бейджа участника.</p>
// 				<p>Не прощаемся и ждем Вас в Сочи!</p>
// 				<p><i>АО «РТ-Техприемка»</i></p>
// 			</div>`,
// 		}

// 		// Отправка письма
// 		transporter.sendMail(mailOptions, (error, info) => {
// 			if (error) {
// 				console.log(error)
// 			} else {
// 				console.log('Письмо успешно отправлено: ' + `${employee.name}.pdf`)
// 			}
// 		})
// 	}
// 	async function saveToDB(employee, hash) {
// 		const db = new sqlite3.Database('./ex_visitors.db')

// 		db.all(
// 			`INSERT INTO qr_visitors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) `,
// 			[
// 				employee.company,
// 				employee.name,
// 				hash,
// 				employee.post,
// 				employee.phone,
// 				employee.email,
// 				'-',
// 				'-',
// 				'-',
// 				'-',
// 				'-',
// 			]
// 		)

// 		db.close()
// 	}

// 	async function sendData(data) {
// 		for (let employee of data) {
// 			const hash = uuid.v4()

// 			// Создаем QR-код
// 			await generateAndSaveQRCode(employee.name, hash)

// 			// Создаем PDF
// 			await generateAndSavePDF(employee, hash)
// 			// Отправка письма
// 			await sendMail(employee)

// 			await saveToDB(employee, hash)
// 		}
// 	}

// 	await sendData([
// 		{
// 			name: 'Агаджанов Владислав Манвелович',
// 			company: 'ООО "РИА "Стандарты и качество"',
// 			post: 'Менеджер отдела маркетинга',
// 			phone: 89778047013,
// 			email: 'pr@mirq.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Алексеева Светлана Андреевна',
// 			company: 'АО «Уралоргсинтез»',
// 			post: 'Ведущий инженер по стандартизации',
// 			phone: '(982) 4983904',
// 			email: 'AlekseevaSA@uos.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Аникеев Сергей Александрович',
// 			company: 'ФГУП НАМИ',
// 			post: 'Заместитель генерального директора по техническому регулированию, Председатель Технического комитета «Дорожный транспорт» (ТК 056)',
// 			phone: '915-328-6300',
// 			email: 'anikeev@nami.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Анискин Алексей Игоревич',
// 			company:
// 				'Всероссийская организация качества, ООО "РИА "Стандарты и качество"',
// 			post: 'Исполнительный директор ВОК, директор по развитию бизнеса',
// 			phone: 89168038754,
// 			email: 'alex@mirQ.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Асанова Елена Александровна',
// 			company: 'АО «Российские космические системы»',
// 			post: 'Директор по программно-целевому планированию',
// 			phone: '(916) 937-86-10',
// 			email: 'asanova.ea@spacecorp.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Аулов Егор Викторович',
// 			company: 'ООО «ТМХ Инжиниринг» ',
// 			post: 'Руководитель направления национальной и международной стандартизации подразделения стандартизации, менеджмента качества и метрологии, Генеральная дирекция',
// 			phone: '(968)644-4959',
// 			email: 'e.aulov@tmh-eng.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Баканова Ирина Газимовна',
// 			company:
// 				'Заполярный филиал ПАО «Горно-металлургическая компания «Норильский никель»',
// 			post: 'Начальник Отдела стандартизации и сопровождения КИСМ Научно-технического управления ',
// 			phone: '(905) 090-60-10',
// 			email: 'BakanovaIG@nornik.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Баландова Ольга Сергеевна',
// 			company: 'АО «Челябинский трубопрокатный завод» (ТМК ЧТПЗ)',
// 			post: 'Ведущий инженер по нормативно-технической документации (бюро нормативной и технической документации',
// 			phone: '(904) 971-23-76',
// 			email: 'olga.balandova@tmk-group.com',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Белобрагин Виктор Яковлевич',
// 			company: 'ООО "РИА "Стандарты и качество", ВОК',
// 			post: 'Вице-президент ВОК по информационной политике, доктор техн.наук, профессор',
// 			phone: 89859234055,
// 			email: 'vok@mirq.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Бикасова Елена Николаевна - ',
// 			company: 'ООО "Эй Джи Си Флэт Гласс Клин", обособленное подразделение',
// 			post: 'Ведущий специалист по стандартизации и сертификации Службы качества',
// 			phone: 79101284446,
// 			email: 'elena.bikasova@agcrussia.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Бондарев Леонид Борисович',
// 			company: 'ООО "Арктик СПГ 2"',
// 			post: 'Заместитель начальника отдела контроля качества строительства береговых сооружений',
// 			phone: 9186189107,
// 			email: 'l.bond@inbox.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Борков Алексей Валерьевич',
// 			company: 'АО «НПО Энергомаш им. академика В.П. Глушко» ',
// 			post: 'Начальник отдела стандартизации',
// 			phone: 89263232025,
// 			email: 'borkov_av@npoem.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Васильченко Ирина Леонидовна ',
// 			company: 'ООО «ТМХ Инжиниринг»',
// 			post: 'Руководитель подразделения стандартизации, менеджмента качества и метрологии ',
// 			phone: '960 446 83 86',
// 			email: 'i.vasilchenko@tmh-eng.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Васин Дмитрий Александрович',
// 			company: 'ООО «Центр сертификации»',
// 			post: 'Генеральный директор ',
// 			phone: '8 925-51-888-39',
// 			email: 'davasin@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Гайфутдинов Рустем Талгатович',
// 			company: 'ООО "АЛЕЕ СОФТВЕР"',
// 			post: 'Руководитель проектного отдела ',
// 			phone: 79500296726,
// 			email: 'rg@alee.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Гольцева Оксана Юрьевна',
// 			company: 'ООО НПО 3Д Интеграция',
// 			post: 'Ассистент руководителя центра цифрового производства СПИН',
// 			phone: 89774444624,
// 			email: 'goltsevaksu@gmail.com',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Гордеева Елена Николаевна',
// 			company: 'АО «Российские космические системы»',
// 			post: 'Главный специалист',
// 			phone: '(915) 056-07-27',
// 			email: 'gordeeva.en@spacecorp.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Горохов Алексей Юрьевич',
// 			company:
// 				'в т.ч. Консультант Правления Ассоциации производителей строительных материалов, оборудования и сырья Евразийского экономического союза (Ассоциации ПСМ ЕАЭС)',
// 			post: 'Руководитель экспертной группы "Техническое регулирование и стандартизация" Научно-технического совета по развитию промышленности строительных материалов, изделий и конструкций при Минпромторге России',
// 			phone: 9671484370,
// 			email: 'info@pcm-eaeu.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Горчев Александр Иванович',
// 			company: 'ВНИИР - филиала ФГУП «ВНИИМ им. Д.И. Менделеева»',
// 			post: 'Заместитель директора филиала по науке',
// 			phone: 89172401685,
// 			email: 'nio13@vniir.org',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Губина Ольга Викторовна',
// 			company: 'АО «Сибур-Химпром»',
// 			post: 'Ведущий инженер по стандартизации Отдела технического сервиса, технического регулирования и стандартизации, Служба главного технолога',
// 			phone: 9124804779,
// 			email: 'GubinaOV@shp.sibur.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Долгов Алексей Евгеньевич ',
// 			company: 'ФБУ «Нижегородский ЦСМ»',
// 			post: 'Начальник отдела по работе с клиентами',
// 			phone: '8 986 766-69-20',
// 			email: 'Dolgov@nncsm.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Екатеринина Ольга Владимировна ',
// 			company: 'ООО ИТРСИС (Инст.техн.регулир.)',
// 			post: 'Руководитель проектов ',
// 			phone: 9032893214,
// 			email: 'vinna-x@yandex.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Зайцева Анна Андреевна',
// 			company: 'АО «Российские космические системы»',
// 			post: 'Инженер 1 категории ',
// 			phone: '(916) 494-23-41',
// 			email: 'zaytseva.aa@spacecorp.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Занченко Алексей Евгеньевич',
// 			company: 'АО «Российские космические системы»',
// 			post: 'Заместитель генерального директора по качеству',
// 			phone: '(915) 318-93-42',
// 			email: 'zaytseva.aa@spacecorp.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Зима Надежда Сергеевна',
// 			company: 'АО "БТК групп"',
// 			post: 'Руководитель отдела по формированию нормативно-технической и разрешительной документации В2В ',
// 			phone: 89112203082,
// 			email: 'nadzima@yandex.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Иваныш Василий Николаевич',
// 			company: 'ИТС',
// 			post: null,
// 			phone: 9069087000,
// 			email: 'zarya_guvd@ngs.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Изгаршева Валерия Александровна',
// 			company: 'АО«Уральский электрохимический комбинат» (АО "УЭХК")',
// 			post: 'Ведущий инженер по стандартизации',
// 			phone: '(952)7383827',
// 			email: 'VAIzgarsheva@rosatom.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Калиниченко Владимир Иванович   ',
// 			company: 'ООО "МедКомТех"',
// 			post: ' Генеральный директор, д-р экон.наук, канд.техн.наук, профессор',
// 			phone: '(918)983-34-95',
// 			email: 'kvi_krd@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Клепикова Юлия Анатольевна',
// 			company: 'Кемеровское акционерное общество «Азот» (КАО «АЗОТ») ',
// 			post: 'Начальник лаборатории №1 Управление по качеству',
// 			phone: '913-297-45-42',
// 			email: 'kua2@azot.kuzbass.net',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Ковалева Екатерина Александровна',
// 			company: 'ООО "Норгау Руссланд"',
// 			post: 'Руководитель направления продвижения высокоточных СИ',
// 			phone: 9663165633,
// 			email: 'e.kovaleva@norgau.com',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Козловский Владимир Николаевич',
// 			company: 'ФГБОУ ВО «Самарский государственный технический университет» ',
// 			post: 'Заведующий кафедрой «Теоретическая и общая электротехника», д.т.н., профессор',
// 			phone: 89179788356,
// 			email: 'Kozlovskiy-76@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Козловский Игорь Дмитриевич',
// 			company: 'ОАО "Минский тракторный завод"',
// 			post: 'Начальник управления развития СМК и производственной системыЭтот материал скопирован со страницы: https://xn--80aumfdhd.xn--90ais/news/igor-kozlovskij-naznachen-nachalnikom-urps/',
// 			phone: 8375447384833,
// 			email: 'i.kozlovskii@mtz.by',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Колесникова Ирина Ивановна',
// 			company:
// 				'Заполярный филиал ПАО «Горно-металлургическая компания «Норильский никель»',
// 			post: 'Начальник бюро стандартизации Отдела стандартизации и сопровождения КИСМ Научно-технического управления',
// 			phone: '(905) 090-37-91',
// 			email: 'KolesnikovaII@nornik.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Костенко Михаил Юрьевич',
// 			company:
// 				'Рязанский государственный агротехнологический университет имени П.А. Костычева» (ФГБОУ ВО РГАТУ)',
// 			post: 'Профессор кафедры технологии металлов и ремонта машин, д.т.н., профессор',
// 			phone: '960-567-19-50',
// 			email: 'kostenko.mihail2016@yandex.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Костенко Наталья Алексеевна',
// 			company:
// 				'Рязанский государственный агротехнологический университет имени П.А. Костычева» (ФГБОУ ВО РГАТУ)',
// 			post: 'Доцент кафедры строительство инженерных сооружений и механики',
// 			phone: 9209570783,
// 			email: 'kn340010@yandex.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Кошелев Максим Евгеньевич',
// 			company: 'АО «Российские космические системы»',
// 			post: 'Зам. начальника отдела стандартизации',
// 			phone: '(903) 237-41-23',
// 			email: 'koshelev.me@spacecorp.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Курбанова Екатерина Анатольевна',
// 			company: 'ООО «Релематика»',
// 			post: 'Заведующий отделом стандартизации, сертификации и управления качеством',
// 			phone: '8 917 674-03-31',
// 			email: 'kurbanova_ea@relematika.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Ларионова Лада Леонидовна ',
// 			company: 'АО «Уральский завод гражданской авиации»',
// 			post: 'Начальник отдела стандартизации ',
// 			phone: '912-240-17-02',
// 			email: 'llkuklinova@yandex.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Лахонин Александр Николаевич',
// 			company: 'ФБУ «Нижегородский ЦСМ»  ',
// 			post: 'Заместитель директорак.т.н., доцент',
// 			phone: '(920) 077-90-50',
// 			email: 'Lahonin@nncsm.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Лопатин Юрий Всеволодович',
// 			company: 'ФГБУ «ГНМЦ» Минобороны России',
// 			post: 'Заместитель начальника отдела ',
// 			phone: '8 (926) 628 08 03',
// 			email: 'yura_lopatin@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Лысенчук Надежда Васильевна',
// 			company: 'Кемеровское акционерное общество «Азот» (КАО «АЗОТ») ',
// 			post: 'Ведущий специалист (по техническому регулированию и стандартизации) управления по качеству',
// 			phone: '923-532-5181',
// 			email: 'lnv@azot.kuzdass.net',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Макаров Дмитрий Алексеевич',
// 			company: 'АО «ОКБ «Аэрокосмические системы»',
// 			post: 'Заместитель генерального конструктора, к.т.н.',
// 			phone: '(917) 651-55-03',
// 			email: 'makarov@ptkgroup.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Макаров Дмитрий Алексеевич',
// 			company: 'АО «ОКБ «Аэрокосмические системы»',
// 			post: 'Заместитель генерального конструктора, к.т.н.',
// 			phone: '(937) 9567463',
// 			email: 'makarovda@aerospace-systems.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Меркулова Юлия Сергеевна',
// 			company: 'АО «Концерн «Созвездие»',
// 			post: 'Начальник Отдела нормативной документации',
// 			phone: 89525502134,
// 			email: 'yu.s.evlahova@sozvezdie.su',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Мозговец Жанна Владимировна',
// 			company: 'ЗФ ПАО «ГМК «Норильский никель»',
// 			post: 'Ведущий специалист отдела стандартизации и сопровождения КИСМНаучно-технического департамента',
// 			phone: 89112534785,
// 			email: 'MozgovetsZV@nornik.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Мордкович Евгений Аркадьевич ',
// 			company: 'ООО «Остек-Электро» ',
// 			post: 'Генеральный директор',
// 			phone: 9104051944,
// 			email: 'Mordkovich.E@ostec-group.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Недзвецкий Максим Юрьевич ',
// 			company: 'ООО «Газпром ВНИИГАЗ»',
// 			post: 'Генеральный директор председатель ПК 1 / ТК 023 «Общеотраслевые нормы и правила», заместитель председателя Управляющего комитета ТК 023',
// 			phone: 89035884650,
// 			email: '5884650@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Неклюдов Дмитрий Г.',
// 			company: 'ООО ПК «САЗИ»',
// 			post: 'Технический эксперт ',
// 			phone: 9160616734,
// 			email: 'd.neklyudov@sazi-group.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Никитина Ольга Сергеевна',
// 			company: 'ОАО «Волжский абразивный завод» (ОАО «ВАЗ»)',
// 			post: 'Начальник отдел систем менеджмента ',
// 			phone: '(905) 336-85-57',
// 			email: 'Nikitina_OS(Evabz.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Новожилова Дарья Михайловна',
// 			company: 'АО «Уральский завод гражданской авиации» (УЗГА)',
// 			post: 'Начальник отдела менеджмента качества',
// 			phone: 9220275027,
// 			email: 'novozhilovadm@uwca.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Опарина Марина Анатольевна ',
// 			company: 'ООО «Релематика»',
// 			post: 'Директор по качеству ',
// 			phone: '(905)3431504',
// 			email: 'oparina_ma@relematika.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Пермяков Константин Александрович',
// 			company: 'Компания Новатех',
// 			post: 'Технический директор',
// 			phone: '968-028-81-18',
// 			email: 'permyakov_ka@novateh.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Плутицкая Анастасия Олеговна',
// 			company: 'ООО Саратовский МПК «РЕСУРС» ',
// 			post: 'Руководитель отдела стандартизации Структуры Директора по продажам',
// 			phone: 89272794900,
// 			email: 'ao.plutitskaya@gap-rs.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Полякова Ксения Вячеславовна ',
// 			company: 'ООО ПТП Фомальгаут',
// 			post: 'Заместитель генерального директора по качеству и пищевой безопасности ',
// 			phone: 9250699358,
// 			email: 'kv.polyakova@ya.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Пономарев Александр Александрович',
// 			company: 'Частное учреждение "Наука и инновации"',
// 			post: 'Главный специалистГруппы подготовки научно-технических проектов',
// 			phone: '(926) 336-68-80',
// 			email: 'AleksAleksPonomarev@rosatom.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Порошин Станислав Владимирович',
// 			company: 'ООО "МГК Информпроект"',
// 			post: 'Руководитель',
// 			phone: 89161954194,
// 			email: 'poroshin@mgk-ip.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Редина Алена Александровна ',
// 			company: 'АО «НПО Энергомаш им. академика В.П. Глушко» ',
// 			post: 'Инженер 3 категории по стандартизации ',
// 			phone: '(495) 286-91-34 ',
// 			email: 'Alena.Redina@npoem.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Романенко Елена Алексеевна',
// 			company: 'ОАО «Волжский абразивный завод» (ОАО «ВАЗ»)',
// 			post: 'Заместитель генерального директора по системам менеджмента ',
// 			phone: '903 370-27-78',
// 			email: 'Romanenko_EA@vabz.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Романов Никита Вячеславович',
// 			company: 'ООО "АЛЕЕ СОФТВЕР"',
// 			post: 'Старший менеджер проекта ',
// 			phone: 9657810260,
// 			email: 'nromanov@alee.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Русаков Илья Львович',
// 			company: 'ФГБОУ ВО НИУ "МЭИ"',
// 			post: 'Зам.директора программы развития, начальник отдела интегрированной системы менеджмента (ОИСМ)',
// 			phone: '(495) 362-79-29',
// 			email: 'Rusakovil@yandex.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Русаков Илья Львович',
// 			company: 'ФГБОУ ВО НИУ "МЭИ"',
// 			post: 'Зам.директора программы развития, начальник отдела интегрированной системы менеджмента (ОИСМ)',
// 			phone: '(906) 705-78-25',
// 			email: 'RusakovIL@mpei.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Самойлова Ирина Сергеевна',
// 			company: 'АО "БТК групп"',
// 			post: 'Начальник отдела по формированию НТД, Эксперт по стандартизации ',
// 			phone: '812 244 5510 доб. 2228',
// 			email: ' I.Samoylova@btk.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Семичастнов Вячеслав Николаевич',
// 			company: 'ПАО "Амурский судостроительный завод"',
// 			post: 'Начальник управления качества и стандартизации',
// 			phone: '914-209-97-44',
// 			email: 'Semichastnov.VN@amurshipyard.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Сотникова Татьяна Васильевна',
// 			company: 'ООО "ИНТЕРСКОЛ"',
// 			post: 'Специалист по качеству',
// 			phone: 9178977231,
// 			email: 't.sotnikova@a-interskol.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Сошников Андрей Викторович',
// 			company: 'АО «Российские космические системы»',
// 			post: 'Начальник отдела стандартизации',
// 			phone: '(903) 244-67-94',
// 			email: 'soshnikov.av@spacecorp.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Стрелков Дмитрий Евгеньевич',
// 			company: 'ФБУ "Нижегородский ЦСМ"',
// 			post: 'Руководитель метрологической службы',
// 			phone: '920 077-38-14',
// 			email: 'Strelkov@nncsm.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Тимошинина Елена Викторовна',
// 			company: 'ПАО «Амурский судостроительный завод »',
// 			post: 'Заместитель начальника управления качества и стандартизации ',
// 			phone: '(914)1767276',
// 			email: 'smk@amurshipyard.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Уткин Никита Александрович',
// 			company: 'АНО «Платформа НТИ»',
// 			post: 'Заместитель директора',
// 			phone: 9151813470,
// 			email: 'n.utkin@nti.work',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Ушакова Иванна Михайловна',
// 			company: 'ООО "ЛИД',
// 			post: 'Генеральный директор',
// 			phone: 9180782666,
// 			email: 'ivanna_egorova@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Чистякова Людмила Анатольевна',
// 			company: 'ООО «Эй Джи Си Флэт Гласс Клин»',
// 			post: 'Специалист по стандартизации и сертификации Службы качества',
// 			phone: '(910) 8924609',
// 			email: 'Ludmila.Chistjakova@agcrussia.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Шевелев Дмитрий Валерьевич',
// 			company: 'АО «ОКБ «Аэрокосмические системы»',
// 			post: 'Генеральный конструктор',
// 			phone: 9263441428,
// 			email: 'ljukova@aerospace-systems.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Юдин Вячеслав Александрович',
// 			company: 'АО "Челябинский трубопрокатный завод» (АО «ЧТПЗ»)',
// 			post: 'Ведущий инженер по техническому регулированию',
// 			phone: '908 062-67-13',
// 			email: 'vyacheslav.yudin@tmk-group.com',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Иванов Александр Владимирович',
// 			company: 'АО "Трансмашхолдинг"',
// 			post: 'Руководитель направления по стандартизации и зарубежной сертификации, Дирекция по техническому развитию',
// 			phone: '905 793 05 98',
// 			email: 'avl.ivanov@tmholding.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Михеева Наталия Анатольевна',
// 			company: 'АО "Верхнетуринский машиностроительный завод" (АО "ВТМЗ")',
// 			post: 'Начальник Отдела качества ',
// 			phone: '(904)-546-90-94 ',
// 			email: 'mna@vturamp.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Муратова Альфия Ахатовна',
// 			company: 'ПАО "Уфаоргсинтез"',
// 			post: 'Инженер по стандартизации отдела технического контроля, сертификации продукции, обеспечения СМК и стандартизации Управления по качеству  ',
// 			phone: '(347) 249-68-02',
// 			email: 'MuratovaAA1@bn.rosneft.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Ситников Владислав Вадимович',
// 			company: 'ООО «Газпром ВНИИГАЗ»',
// 			post: 'Помощник генерального директора',
// 			phone: 'вместе с Незвецким М.Ю.',
// 			email: null,
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Шабалина Ольга Константиновна',
// 			company: 'ВНИИР – филиал ФГУП «ВНИИМ им.Д.И.Менделеева»',
// 			post: 'Начальник отдела системы менеджмента качества и стандартизации',
// 			phone: '(917) 858 45 04',
// 			email: 'geogmord@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Шафигина Альбина Эриковна',
// 			company: 'ВНИИР – филиал ФГУП «ВНИИМ им.Д.И.Менделеева»',
// 			post: 'Инженер по системе менеджмента качества',
// 			phone: '8 937 595 58 61, 8 (495) 627-10-99, доб. 6710',
// 			email: 'shafigina.98@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Грабилин Сергей Юрьевич',
// 			company: 'АО "ОПК"',
// 			post: 'Начальник управления АО «Концерн «Автоматика»',
// 			phone: '8 (342) 254-10-02',
// 			email: 'grabilin@ao-avtomatika.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Гусев Андрей Викторович',
// 			company: 'АО «СПЕЦХИМИЯ»',
// 			post: 'Заместитель генерального директора по ГОЗ',
// 			phone: 89107752492,
// 			email: 's.d.kokaeva@tecmash.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Егоров Дмитрий Михайлович',
// 			company: 'АО «СПЕЦХИМИЯ»',
// 			post: 'Генеральный директор',
// 			phone: null,
// 			email: 'niipm@perm.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Климашов Борис Иванович ',
// 			company: 'АО "НПО" Высокоточные комплексы" ',
// 			post: 'Заместитель исполнительного директора по качеству - главный контролер ',
// 			phone: null,
// 			email: 'dept84@kemz.org',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Коркоцкая Анастасия Юрьевна ',
// 			company: 'Правительтсво Москвы',
// 			post: 'Заместитель генерального директора ГБУ "Аналитический центр"',
// 			phone: '8-499-374-92-13',
// 			email: 'KarkotskayaAY@develop.mos.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Курицын Максим Игоревич',
// 			company: 'АО "Спецхимия"',
// 			post: 'Главный метролог',
// 			phone: '7 (912) 780-92-25',
// 			email: 'metrolog@niiph.com',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Лобачев Антон Васильевич ',
// 			company: 'АО "Швабе"',
// 			post: 'Главный метролог ',
// 			phone: null,
// 			email: null,
// 			fsdf: ' ',
// 		},
// 		{
// 			name: 'Магидин Александр Михайлович',
// 			company: 'АО "ОДК"',
// 			post: 'Главный метролог-начальник отдела измерений и метрологии ',
// 			phone: '8 (812) 318-51-81, доб. 2291; 8 (911) 124-42-83',
// 			email: 'magidin@avid.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Маликова Н.В.',
// 			company: 'АО "Нацимбио"',
// 			post: 'Начальник управления совершенствования качества',
// 			phone: null,
// 			email: 'mmetrolog@meteor.su',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Моисеев Максим Эдуардович',
// 			company: 'АО «НПК «Техмаш»',
// 			post: 'Начальник отдела стандартизации и сертификации системы качества',
// 			phone: 89878389942,
// 			email: 'moiseev_me@npo-poisk.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Наталия Викторовна Жайворонко',
// 			company: 'АО "ОПК"',
// 			post: 'Главный метролог',
// 			phone: '+79964828956',
// 			email: null,
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Немов Николай Викторович ',
// 			company: 'АО "НПО" Высокоточные комплексы" ',
// 			post: 'И.о. заместителя генерального директора по качеству ',
// 			phone: null,
// 			email: 'oaosaz@mail.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Подъяпольский Борис Сергеевич',
// 			company: 'АО "ОПК"',
// 			post: 'Заместитель директора по качеству АО «НПП «Исток» им. Шокина» ',
// 			phone: 89101871830,
// 			email: 'nsabashkina@istokmw.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Простаков Николай Игоревич',
// 			company: 'АО "Швабе"',
// 			post: 'Начальник отдела развития СМК службы качества АО "ЦНИИ "Циклон"',
// 			phone: 'a.ryazanova@kret.com',
// 			email: 'nsabashkina@istokmw.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Пруссаков Алексей Михайлович ',
// 			company: 'АО "НПО" Высокоточные комплексы" ',
// 			post: 'Заместитель генерального директора по качеству ',
// 			phone: '8-495-631-62-80',
// 			email: 'prussakov@vniisignal.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Рязанова Александра Андреевна ',
// 			company: 'АО "КРЭТ"',
// 			post: 'Руководитель проекта направления по качеству продукции Департамента по управлению производстовм и качеству продукции ',
// 			phone: null,
// 			email: 'a.s.sadovnikov@nmz-iskra.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Савченко Сергей Владимирович ',
// 			company: 'АО "НПО" Высокоточные комплексы" ',
// 			post: 'Заместитель генерального директора по качеству ',
// 			phone: 89132107658,
// 			email: 'smk@cniiag.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Садовников Александр Сергеевич ',
// 			company: 'АО "Спецхимия"',
// 			post: 'Заместитель главного инженера',
// 			phone: '+79137101660',
// 			email: 'UsovVB@develop.mos.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Соломатов Дмитрий Владимирович ',
// 			company: 'АО "НПО" Высокоточные комплексы" ',
// 			post: 'Начальник управления качества ',
// 			phone: null,
// 			email: 'solomatovdv@bamaultransmash.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Усов Владимир Борисович ',
// 			company: 'Правительтсво Москвы',
// 			post: 'начальник Управления совершенствования систем и процессов управления ГБУ "Аналитический центр"',
// 			phone: '8-495-620-20-20 доб. 15-379',
// 			email: null,
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Шорин Владлен Маусырович',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Генеральный директор',
// 			phone: null,
// 			email: 'v.shorin@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Никулин Василий Семенович',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Заместитель генерального директора по качествуи развитию',
// 			phone: null,
// 			email: 'v.nikulin@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Аликина Наталья Алексеевна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Заместитель генерального директора по коммуникациям',
// 			phone: null,
// 			email: 'n.alikina@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Рулева Светлана Владимировна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Заместитель руководителя направления коммуникаций - руководитель проектов по добровольной сертификации',
// 			phone: null,
// 			email: 's.ruleva@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Керимов Денис Евгеньевич',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель проектов по управлению брендом направления коммуникаций',
// 			phone: null,
// 			email: 'd.kerimov@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Косарев Александр Сергеевич',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель департамента развития корпоративной системы',
// 			phone: null,
// 			email: 'a.kosarev@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Афанасьева Маргарита Александровна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель направления стандартизации Департамента развития корпоративной системы',
// 			phone: null,
// 			email: 'm.afanasyeva@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Саванаева Мария Вячеславовна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Главный специалист-эксперт Центра мониторинга и анализа качества Департамента развития корпоративной системы',
// 			phone: null,
// 			email: 'm.savanaeva@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Румянцева Анастасия Игоревна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Специалист направления стандартизации Департамента развития корпоративной системы',
// 			phone: null,
// 			email: 'a.rumyantseva@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Доркин Виталий Эдуардович',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель центра мониторинга и анализа качества Департамента развития корпоративной системы',
// 			phone: null,
// 			email: 'v.dorkin@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Махоткин Алексей Андреевич',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Главный специалист-аналитик структурного подразделения Метрологической службы',
// 			phone: null,
// 			email: 'a.makhotkin@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Трантина Алена Александровна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'И.о. главного метролога – руководитель проектов по метрологии Метрологической службы',
// 			phone: null,
// 			email: 'a.trantina@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Захарова Алёна Станиславовна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель департамента оценки и технического контроля',
// 			phone: null,
// 			email: 'a.zaharova@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Бадикова Татьяна Сергеевна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Советник генерального директора по развитию',
// 			phone: null,
// 			email: 't.badikova@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Денисенко Светлана Ивановна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Главный специалист-эксперт Центра сертификации "Ростех-сертификат"',
// 			phone: null,
// 			email: 's.denisenko@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Леонов Александр Владимирович',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'И.о. заместителя генерального директора по управлению проектами и цифровизации',
// 			phone: null,
// 			email: 'a.leonov@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Волкова Наталья Васильевна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель департамента организационного и корпоративного развития',
// 			phone: null,
// 			email: 'n.volkova@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Троицкая Лидия Михайловна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Помощник генерального директора по контролю поручений',
// 			phone: null,
// 			email: 'l.troitskaya@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Фалчаари Кристина Геннадьевна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Помощник генерального директора',
// 			phone: null,
// 			email: 'k.falchaari@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Бердников Вячеслав Васильевич',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Начальник технической приемки № 12',
// 			phone: null,
// 			email: 'tp12@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Винокуров Антон Валерьевич',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Начальник технической приемки № 13',
// 			phone: null,
// 			email: 'a.vinokurov@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Беззубцева Елена Михайловна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Начальник технической приемки № 14',
// 			phone: null,
// 			email: 'tp14@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Волосников Сергей Васильевич',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Начальник технической приемки № 15',
// 			phone: null,
// 			email: 'tp15@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Семенюк Сергей Михайлович',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Начальник технической приемки № 47',
// 			phone: null,
// 			email: 'tp47@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Озеров Александр Федорович',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель Уральского регионального технического представительства',
// 			phone: null,
// 			email: 'urtp@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Шмонова Яна Викторовна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель Сибирского регионального технического представительства',
// 			phone: null,
// 			email: 'ya.shmonova@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 		{
// 			name: 'Шмонова Яна Викторовна',
// 			company: 'АО "РТ-Техприемка"',
// 			post: 'Руководитель Сибирского регионального технического представительства',
// 			phone: null,
// 			email: 'ya.shmonova@rt-techpriemka.ru',
// 			fsdf: null,
// 		},
// 	])

// 	res.send('Все письма отправлены')
// })

module.exports = router
