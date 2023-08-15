import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactSVG } from 'react-svg'
import spinner from '../../../icons/oval.svg'
import ContainerLayout from '../../layouts/container-layout'
import Sheet from '../../layouts/sheet'
import './style.scss'

// Валидация
// Включить значения селектов в данные для отправки
// Редизайн (в том числе и отступы)

const FormikForm = () => {
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

	const sendForm = async values => {
		console.log('Отправка данных')

		setLoading(true)

		const today = new Date()

		const data = {
			...values,
			format: values.format,
			role: values.role,
			theme: values.theme,
			options: values.selectedItems,
			pdfName: `${values.fio}_${`${today.getDate()}.${
				(today.getMonth() + 1).length == 1
					? today.getMonth() + 1
					: '0' + (today.getMonth() + 1)
			}.${today.getFullYear()}`}`,
		}

		// Записываем данные в БД
		await fetch(
			`${import.meta.env.VITE_SERVER_PROTOCOL}://${
				import.meta.env.VITE_SERVER_URL
			}:${import.meta.env.VITE_SERVER_PORT}/api/database`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		)
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
		await fetch(
			`${import.meta.env.VITE_SERVER_PROTOCOL}://${
				import.meta.env.VITE_SERVER_URL
			}:${import.meta.env.VITE_SERVER_PORT}/api/createPDF`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		)
			.then(res => {
				return res.text()
			})
			.then(() => {
				console.log('PDF сформирован')
			})
			.catch(err => {
				console.log(err)
				setLoading(false)
				navigate('/error')
				throw new Error('Ошибка при формировании PDF')
			})

		await fetch(
			`${import.meta.env.VITE_SERVER_PROTOCOL}://${
				import.meta.env.VITE_SERVER_URL
			}:${import.meta.env.VITE_SERVER_PORT}/api/sendemail`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		)
			.then(res => {
				console.log('Сообщение на почту отправлено')
				setLoading(false)
				navigate(`/thanks/${values.email}/${data.pdfName}`)
				return res.text()
			})
			.catch(err => {
				console.log(err)
				setLoading(false)
				navigate('/error')
				throw new Error('Ошибка при отправке письма на почту')
			})
	}

	const validate = values => {
		const errors = {}

		// Проверяем, что поля заполнены
		if (!values.name) {
			errors.name = 'Поле обязательно для заполнения'
		}
		if (!values.fio) {
			errors.fio = 'Поле обязательно для заполнения'
		}
		if (!values.post) {
			errors.post = 'Поле обязательно для заполнения'
		}
		if (!values.phone) {
			errors.phone = 'Поле обязательно для заполнения'
		}
		if (!values.email) {
			errors.email = 'Поле обязательно для заполнения'
		}

		return errors
	}

	return (
		<div>
			{loading && (
				<div className='loader'>
					<ReactSVG src={spinner} />
				</div>
			)}
			<ContainerLayout>
				<div className='links'>
					<Link to={'/'}>На главную</Link>
				</div>
				<Sheet>
					<Formik
						initialValues={{
							name: '',
							fio: '',
							post: '',
							phone: '',
							email: '',
							format: '',
							role: '',
							selectedItems: [],
						}}
						onSubmit={async values => {
							await sendForm(values)
						}}
						validate={validate}
					>
						{({ isSubmitting, values, setFieldValue }) => (
							<Form className='form'>
								<h1>Заявка</h1>
								<h2>
									на участие в Конференции по теме: «Содействие развитию систем
									управления качеством, метрологии и стандартизации организаций
									промышленности»
								</h2>
								<h3>10-13 октября 2023 года, г. Сочи</h3>
								<div>
									<label htmlFor='name' className='form__label'>
										Наименование организации
									</label>
									<ErrorMessage
										name='name'
										component='div'
										className='error-message'
									/>
									<Field
										id='name'
										name='name'
										placeholder='АО РТ-Техприемка (полностью)'
										className='form__input'
									/>
								</div>

								<div>
									<label htmlFor='fio' className='form__label'>
										ФИО
									</label>
									<ErrorMessage
										name='fio'
										component='div'
										className='error-message'
									/>
									<Field
										id='fio'
										name='fio'
										placeholder='Иванов Иван Иванович (полностью)'
										className='form__input'
									/>
								</div>

								<div>
									<label htmlFor='post' className='form__label'>
										Должность
									</label>
									<ErrorMessage
										name='post'
										component='div'
										className='error-message'
									/>
									<Field
										id='post'
										name='post'
										placeholder='Специалист по сопровождению информационных систем'
										type='text'
										className='form__input'
									/>
								</div>

								<div>
									<label htmlFor='phone' className='form__label'>
										Телефон
									</label>
									<ErrorMessage
										name='phone'
										component='div'
										className='error-message'
									/>
									<Field
										id='phone'
										name='phone'
										placeholder='8 (999) 123 45 67'
										type='phone'
										className='form__input'
									/>
								</div>

								<div>
									<label htmlFor='email' className='form__label'>
										Email
									</label>
									<ErrorMessage
										name='phone'
										component='div'
										className='error-message'
									/>
									<Field
										id='email'
										name='email'
										placeholder='example@mail.ru'
										type='email'
										className='form__input'
									/>
								</div>

								<div>
									<label htmlFor='format' className='form__label'>
										Формат участия
									</label>
									<Field as='select' name='format' className='form__input'>
										<option value=''>Выбрать</option>
										<option value='Очно'>Очно</option>
										<option value='Заочно'>Заочно</option>
									</Field>
								</div>

								<div>
									<label htmlFor='role' className='form__label'>
										В качестве
									</label>
									<Field as='select' name='role' className='form__input'>
										<option value=''>Выбрать</option>
										<option value='Как слушатель'>Как слушатель</option>
										<option value='С докладом'>С докладом</option>
									</Field>
								</div>

								{checkboxes.map((item, key) => {
									return (
										<div key={key} className='form__checkbox'>
											<Field
												className='form__checkbox_field'
												type='checkbox'
												name='selectedItems'
												value={item.value}
												checked={values.selectedItems.includes(item.value)}
												onChange={() => {
													if (values.selectedItems.includes(item.value)) {
														// Убрать элемент из массива, если выбран
														setFieldValue(
															'selectedItems',
															values.selectedItems.filter(
																it => it !== item.value
															)
														)
													} else {
														// Добавить элемент в массив, если не выбран
														setFieldValue('selectedItems', [
															...values.selectedItems,
															item.value,
														])
													}
													console.log(values.selectedItems)
												}}
											/>
											<div className='form__checkbox_text'>{item.text}</div>
										</div>
									)
								})}

								<button type='submit' className='form__submit'>
									Подать заявку
								</button>
							</Form>
						)}
					</Formik>
				</Sheet>
			</ContainerLayout>
		</div>
	)
}

export default FormikForm
