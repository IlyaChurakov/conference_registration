class RatingController {
	async rate(req, res, next) {
		const { email, password } = req.body

		const user = await User.findOne({ where: { email } })

		if (!user) {
			return next(ApiError.internal('Пользователь не найден'))
		}

		let comparePassword = bcrypt.compareSync(password, user.password)

		if (!comparePassword) {
			return next(ApiError.internal('Указан неверный пароль'))
		}

		const token = generateJwt(user.id, user.email, user.role)

		return res.json({ token })
	}
}
