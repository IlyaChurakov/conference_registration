const body = document.querySelector('body')
const button = document.querySelector('.button')
const modal_layout = document.querySelector('.layout')
const modal_title = document.querySelector('.modal__title')
const form = document.querySelector('#form'),
	name = form.querySelector('[name="name"]'),
	fio = form.querySelector('[name="fio"]'),
	post = form.querySelector('[name="post"]'),
	contacts = form.querySelector('[name="contacts"]'),
	format = form.querySelector('[name="format"]'),
	role = form.querySelector('[name="role"]'),
	theme = form.querySelector('[name="theme"]')

form.addEventListener('submit', e => {
	e.preventDefault()

	function getCheckedValues() {
		const checkboxes = document.querySelectorAll('input[type="checkbox"]')
		const checkedValues = []

		checkboxes.forEach(checkbox => {
			if (checkbox.checked) {
				checkedValues.push(checkbox.value)
			}
		})

		return checkedValues
	}

	fetch('http://172.16.0.168/api/database', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			name: name.value,
			fio: fio.value,
			post: post.value,
			contacts: contacts.value,
			format: format.value,
			role: role.value,
			theme: theme.value,
			options: `${getCheckedValues()}`,
		}),
	})
		.then(res => {
			if (res.status == '500') {
				body.style.overflow = 'hidden'
				modal_layout.style.display = 'block'
				modal_title.textContent = 'Ошибка'
				return res.text()
			} else {
				fetch('http://172.16.0.168/api/sendemail', {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: name.value,
						fio: fio.value,
						post: post.value,
						contacts: contacts.value,
						format: format.value,
						role: role.value,
						theme: theme.value,
						options: getCheckedValues(),
					}),
				})
					.then(res => {
						console.log('Сообщение на почту отправлено')
						return res.text()
					})
					.catch(err => {
						console.log(err)
					})

				body.style.overflow = 'hidden'
				modal_layout.style.display = 'block'
				modal_title.textContent = 'Ваша заявка принята'
				return res.json()
			}
		})
		.catch(err => {
			console.log(err)
			body.style.overflow = 'hidden'
			modal_layout.style.display = 'block'
			modal_title.textContent = 'Ошибка'
		})
})
