const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function (req, res, next) {
	if (req.method === 'OPTIONS') {
		next()
	}
	try {
		const token = req.headers.authorization.split(' ')[1] // Bearer dasdfosidof

		if (!token) {
			return res.status(401).json({ message: 'Не авторизован' })
		}
		if (token !== process.env.TOKEN) {
			return res.status(403).json({ message: 'Auth failed' })
		}
		// const decoded = jwt.verify(token, process.env.SECRET_KEY)
		// console.log(decoded)
		// req.user = decoded
		next()
	} catch (e) {
		console.log(e)
		res.status(401).json({ message: 'Не авторизован' })
	}
}
