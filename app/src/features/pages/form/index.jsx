// import { saveAs } from 'file-saver'
import React, { memo, useState } from 'react'
import InputMask from 'react-input-mask'
import { Link, useNavigate } from 'react-router-dom'
import { ReactSVG } from 'react-svg'
import spinner from '../../../icons/oval.svg'
import Button from '../../components/button'
import Checkbox from '../../components/checkbox'
import Input from '../../components/input'
import Select from '../../components/select'
import ContainerLayout from '../../layouts/container-layout'
import Sheet from '../../layouts/sheet'
import './style.scss'

const Form = () => {
	const checkboxes = [
		{
			value: 1,
			text: 'Развитие системы менеджмента качества как части общей системы руководства и управления организацией, обеспечивающей пригодность и стабильность процессов, связанных с созданием продукции и оказанием услуг',
		},
		{
			value: 2,
			text: 'Обеспечение надежности военной техники и информационного взаимодействия между организациями оборонно-промышленного комплекса и Минобороны России',
		},
		{
			value: 3,
			text: 'Обеспечение современного научно-технического уровня документов по стандартизации, деятельность по обновлению документов по стандартизации оборонной продукции',
		},
	]

	const navigate = useNavigate()

	const [loading, setLoading] = useState(false)

	const [name, setName] = useState('')
	const [fio, setFio] = useState('')
	const [post, setPost] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [format, setFormat] = useState('Очное')
	const [role, setRole] = useState('Как слушатель')
	const [theme, setTheme] = useState('')
	const [options, setOptions] = useState([])
	const [agree, setAgree] = useState(false)

	// const sendForm = async name => {
	// 	await fetch('http://localhost:3000/api/database', {
	// 		method: 'POST',
	// 		headers: {
	// 			Accept: 'application/json',
	// 			'Content-Type': 'application/json',
	// 		},
	// 		body: JSON.stringify({
	// 			name,
	// 			fio,
	// 			post,
	// 			phone,
	// 			email,
	// 			format,
	// 			role,
	// 			theme,
	// 			options,
	// 		}),
	// 	})
	// 		.then(async res => {
	// 			if (res.status == '500') {
	// 				navigate('/error')
	// 				return res.text()
	// 			} else {
	// 				try {
	// 					await fetch('http://localhost:3000/api/sendemail', {
	// 						method: 'POST',
	// 						headers: {
	// 							Accept: 'application/json',
	// 							'Content-Type': 'application/json',
	// 						},
	// 						body: JSON.stringify({
	// 							name,
	// 							fio,
	// 							post,
	// 							phone,
	// 							email,
	// 							format,
	// 							role,
	// 							theme,
	// 							options,
	// 						}),
	// 					})
	// 						.then(res => {
	// 							console.log('Все окей')
	// 							navigate('/thanks')
	// 							return res.text()
	// 						})
	// 						.catch(err => {
	// 							navigate('/thanks')
	// 							console.log('Все окей, но без сообщения на почту')
	// 							console.log(err)
	// 						})
	// 				} catch (e) {}

	// 				return res.json()
	// 			}
	// 		})
	// 		.catch(err => {
	// 			navigate('/error')
	// 			console.log(err)
	// 		})
	// }

	const sendForm = async name => {
		console.log('Отправка данных')

		setLoading(true)

		const today = new Date()

		const data = {
			name,
			fio,
			post,
			phone,
			email,
			format,
			role,
			theme,
			options,
			pdfName: `${fio}_${`${today.getDate()}.${
				(today.getMonth() + 1).length == 1
					? today.getMonth() + 1
					: '0' + (today.getMonth() + 1)
			}.${today.getFullYear()}`}`,
		}

		// Записываем данные в БД
		await fetch('https://localhost/api/database', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then(res => {
				return res.json()
			})
			.then(() => console.log('Данные успешно занесены в БД'))
			.catch(() => {
				setLoading(false)
				navigate('/error')
				throw new Error('Ошибка при занесении данных в БД')
			})

		// Формируем PDF
		await fetch('https://localhost/api/createPDF', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then(res => {
				return res.text()
			})
			.then(() => {
				console.log('PDF сформирован')
				navigate(`/thanks/${email}/${data.pdfName}`)
				setLoading(false)
			})
			.catch(() => {
				setLoading(false)
				navigate('/error')
				throw new Error('Ошибка при формировании PDF')
			})

		// await fetch('https://localhost/api/sendemail', {
		// 	method: 'POST',
		// 	headers: {
		// 		Accept: 'application/json',
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify(data),
		// })
		// 	.then(res => {
		// 		console.log('Сообщение на почту отправлено')
		// 		setLoading(false)
		// 		navigate(`/thanks/${email}/${data.pdfName}`)
		// 		return res.text()
		// 	})
		// 	.catch(err => {
		// 		console.log(err)
		// 		setLoading(false)
		// 		navigate('/error')
		// 		throw new Error('Ошибка при отправке письма на почту')
		// 	})
	}

	const createAndDownloadPdf = async () => {
		await fetch('https://localhost/api/createPDF', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
				fio,
				post,
				phone,
				email,
				format,
				role,
				theme,
				options,
			}),
		})
			.then(res => {
				return res.text()
			})
			.then(
				async () =>
					await fetch('https://localhost/api/fetchPDF', {
						Accept: 'application/pdf',
						'Content-Type': 'application/pdf',
					})
						.then(res => res.blob())
						.then(blob => {
							const fileURL = window.URL.createObjectURL(blob)
							// Setting various property values
							let alink = document.createElement('a')
							alink.href = fileURL
							alink.download = 'Регистрация на участие в конференции.pdf'
							alink.click()
						})
			)
			.catch(err => {
				console.log(err)
			})
	}

	function getOptionsArray(checked, item) {
		if (checked) {
			if (!options.includes(item.value)) {
				setOptions([...options, item.value].sort())
			}
		} else {
			if (options.includes(item.value)) {
				setOptions(options.filter(it => it !== item.value).sort())
			}
		}
	}

	return (
		<ContainerLayout>
			{loading && (
				<div className='loader'>
					<ReactSVG src={spinner} />
				</div>
			)}
			<div className='links'>
				<Link to={'/'}>На главную</Link>
			</div>
			<Sheet>
				<form className='form'>
					<h1>Заявка</h1>
					<h2>
						на участие в Конференции по теме: «Содействие развитию систем
						управления качеством, метрологии и стандартизации организаций
						промышленности»
					</h2>
					<h3>10-13 октября 2023 года, г. Сочи</h3>
					<Input
						placeholder='Наименование организации (полностью)'
						onChange={e => setName(e.target.value)}
					/>
					<Input
						placeholder='Фамилия Имя Отчество (полностью)'
						onChange={e => setFio(e.target.value)}
					/>
					<Input
						placeholder='Должность участника'
						onChange={e => setPost(e.target.value)}
					/>
					<InputMask
						mask='+7 (999) 999-99-99'
						placeholder='Телефон'
						style={{
							border: 'none',
							borderBottom: '1px solid black',
							outline: 'none',
							height: '50px',
							fontSize: '16px',
						}}
						onChange={e => {
							console.log(e)
							setPhone(e.target.value)
						}}
					/>
					<Input
						placeholder='Email участника'
						type={'email'}
						onChange={e => setEmail(e.target.value)}
					/>
					<Select
						options={[
							{ value: 'Очное', text: 'Очное' },
							{ value: 'Заочное', text: 'Заочное (ВКС)' },
						]}
						value={format}
						onChange={e => setFormat(e.target.value)}
					/>
					<Select
						options={[
							{ value: 'Как слушатель', text: 'Как слушатель' },
							{ value: 'С докладом', text: 'С докладом' },
						]}
						value={role}
						onChange={e => setRole(e.target.value)}
					/>
					{role == 'С докладом' && (
						<Input
							placeholder='Тема доклада'
							onChange={e => setTheme(e.target.value)}
						/>
					)}

					<h2>Важные для меня темы к обсуждению в рамках Конференции:</h2>

					{checkboxes.map((item, key) => {
						return (
							<Checkbox
								key={key}
								value={item.value}
								text={item.text}
								onChange={e => getOptionsArray(e.target.checked, item)}
							/>
						)
					})}

					<Checkbox
						text={'Согласие на обработку персональных данных'}
						onChange={e => setAgree(e.target.checked)}
						style={{ marginTop: '30px' }}
					/>

					<Button
						text={'Отправить'}
						onClick={e => {
							e.preventDefault()
							agree ? sendForm(name) : alert('Нет согласия')
							// createAndDownloadPdf()
						}}
					/>
				</form>
			</Sheet>
		</ContainerLayout>
	)
}

export default memo(Form)
