import CryptoJS from 'crypto-js'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactSVG } from 'react-svg'
import * as Yup from 'yup'
import spinner from '../../../icons/oval.svg'
import ContainerLayout from '../../layouts/container-layout'
import Sheet from '../../layouts/sheet'
import './style.scss'

const FormikForm = () => {
	function getTime() {
		const currentDate = new Date()

		// Получение текущей даты (год, месяц, день)
		const year = currentDate.getFullYear()
		const month = currentDate.getMonth() + 1
		const day = currentDate.getDate()

		// Получение текущего времени (часы, минуты, секунды)
		const hours = currentDate.getHours()
		const minutes = currentDate.getMinutes()
		const seconds = currentDate.getSeconds()
		const milliseconds = currentDate.getMilliseconds()

		return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}-${milliseconds}`
	}

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
		{
			value: 4,
			text: 'Развитие системы обеспечения единства измерений',
		},
		{
			value: 5,
			text: 'Подготовка квалифицированных кадров',
		},
		{
			value: 6,
			text: 'Реализация единых интегральных проектов в области качества Корпорации',
		},
		{
			value: 7,
			text: 'Проблемные вопросы внедрения инструментов управления поставщиками в области качества на стадиях заключения и исполнения контрактов в рамках требований 44-ФЗ и 223-ФЗ',
		},
		{
			value: 8,
			text: 'Эффективность аудитов поставщиков, результаты',
		},
		{
			value: 9,
			text: 'Применение требований по качеству к поставщикам продукции, потребности, перспективы, тенденции',
		},
		{
			value: 10,
			text: 'Опыт реализации действенных мер по предотвращению применения неаутентичных и контрафактных материалов и полуфабрикатов, а также комплектующих изделий',
		},
		{
			value: 11,
			text: 'Импортозамещение в промышленном комплексе: потребности, тенденции, накопленный опыт',
		},
		{
			value: 12,
			text: 'Проблемы, тенденции и перспективы развития контроля качества технологических операций изготовления',
		},
		{
			value: 13,
			text: 'Совершенствование системы входного контроля закупаемой продукции',
		},
		{
			value: 14,
			text: 'Проблемные вопросы разработки, отработки и внедрения технологических процессов изготовления, определения контрольных операций',
		},
		{
			value: 15,
			text: 'Эффективность применения инструментов бережливого производства, результаты',
		},
		{
			value: 16,
			text: 'Потребности в высококвалифицированном конструкторском и производственном персонале, потребности, проблемы, тенденции',
		},
		{
			value: 17,
			text: 'Достаточность выполняемого объема научно-исследовательских работ для создания перспективных образцов техники',
		},
		{
			value: 18,
			text: 'Применение контрактов жизненного цикла образцов техники, потребности, проблемы, тенденции',
		},
		{
			value: 19,
			text: 'Оценка зрелости системы менеджмента качества как достоверный индикатор уровня развития',
		},
		{
			value: 20,
			text: 'Развитие базы современных и высокоточных технических средств для мониторинга и измерений',
		},
		{
			value: 21,
			text: 'Применение предиктивной аналитики, опыт, тенденции, перспективы',
		},
		{
			value: 22,
			text: 'Достаточность лабораторно-экспериментальной и испытательной базы, проблемы, тенденции перспективы',
		},
		{
			value: 23,
			text: 'Применение электронного дела изделия, опыт, потребности, перспективы',
		},
		{
			value: 24,
			text: 'Развитие системы гарантии качества проектирования',
		},
		{
			value: 25,
			text: 'Применение анализа видов и последствий потенциальных несоответствий конструкции, опыт, потребности, перспективы',
		},
		{
			value: 26,
			text: 'Применение анализа последствий ошибок технологического процесса изготовления и их предупреждения, опыт, потребности, перспективы',
		},
		{
			value: 27,
			text: 'Сокращение сроков восстановления гарантийной продукции, опыт, потребности, перспективы',
		},
		{
			value: 28,
			text: 'Эффективность применения процессного подхода в организациях Корпорации, опыт, проблемы, тенденции',
		},
	]

	const navigate = useNavigate()

	const [loading, setLoading] = useState(false)

	const sendForm = async values => {
		console.log('Отправка данных')
		setLoading(true)

		const today = new Date()

		const time = getTime()
		const hash = CryptoJS.SHA256(time).toString(CryptoJS.enc.Hex)

		const data = {
			...values,
			format: values.format,
			role: values.role,
			theme: values.theme,
			options: values.selectedItems,
			text: hash,
			pdfName: `${values.fio}_${`${today.getDate()}.${
				(today.getMonth() + 1).length == 1
					? today.getMonth() + 1
					: '0' + (today.getMonth() + 1)
			}.${today.getFullYear()}`}`,
		}

		// Формируем QRcode
		await fetch(
			`${import.meta.env.VITE_SERVER_PROTOCOL}://${
				import.meta.env.VITE_SERVER_URL
			}:${import.meta.env.VITE_SERVER_PORT}/api/qr`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `${import.meta.env.VITE_TOKEN}`,
				},
				body: JSON.stringify(data),
			}
		)
			.then(res => {
				if (res.status >= 200 && res.status <= 226) {
					console.log('QRcode сформирован')
					return res.text()
				} else {
					throw new Error(`${res.status}: ${res.statusText}`)
				}
			})
			.catch(err => {
				setLoading(false)
				navigate(`/error/${err ? err : 'Неизвестная ошибка'}`)
				throw new Error(err)
			})

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
					Authorization: `${import.meta.env.VITE_TOKEN}`,
				},
				body: JSON.stringify(data),
			}
		)
			.then(res => {
				if (res.status >= 200 && res.status <= 226) {
					console.log('Данные занесены в базу')
					console.log(data)
					return res.text()
				} else {
					throw new Error(`${res.status}: ${res.statusText}`)
				}
			})
			.catch(err => {
				setLoading(false)
				navigate(`/error/${err ? err : 'Неизвестная ошибка'}`)
				throw new Error(err)
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
					Authorization: `${import.meta.env.VITE_TOKEN}`,
				},
				body: JSON.stringify({ ...data, qrcodeTime: hash }),
			}
		)
			.then(res => {
				if (res.status >= 200 && res.status <= 226) {
					console.log('PDF сформирован')
					return res.text()
				} else {
					throw new Error(`${res.status}: ${res.statusText}`)
				}
			})
			.catch(err => {
				setLoading(false)
				navigate(`/error/${err ? err : 'Неизвестная ошибка'}`)
				throw new Error(err)
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
					Authorization: `${import.meta.env.VITE_TOKEN}`,
				},
				body: JSON.stringify(data),
			}
		)
			.then(res => {
				// Обрабатываем только успешные ответы
				if (res.status >= 200 && res.status <= 226) {
					console.log('Письмо на почту отправлено')
					// Убираем лоадер
					setLoading(false)
					// Перенаправляем на страницу благодарности
					navigate(`/thanks/${data.email}/${data.pdfName}`)
					// Возвращаем текстовый ответ, поскольку приходит тоже текст
					return res.text()
				} else {
					// Выкидываем ошибку с текстом, чтобы отработал блок catch
					throw new Error(`${res.status}: ${res.statusText}`)
				}
			})
			.catch(err => {
				console.log(err)
				// Также убираем лоадер
				setLoading(false)
				// Перенаправляем на страницу ошибки
				navigate(`/error/${err ? err : 'Неизвестная ошибка'}`)
				// Выкидываем ошибку
				throw new Error(err)
			})
	}

	const validationSchema = Yup.object({
		policy: Yup.string().required('Невозможно продолжить без согласия'),
		name: Yup.string().required('Введите название организации'),
		fio: Yup.string()
			.matches(/^[A-Za-zА-Яа-я\s'-]+$/, 'Недопустимые символы')
			.test(
				'doubleSpaces',
				'Введите полное ФИО',
				value => value.split(' ').length >= 2
			)
			.required('Введите ФИО'),
		email: Yup.string()
			.email('Email должен иметь формат example@mail.ru')
			.required('Введите email'),
		post: Yup.string().required('Введите должность участника'),
		phone: Yup.string()
			.matches(
				/^[0-9() -+]+$/,
				'Допустимые символы номера телефона: 0-9 ( ) - +'
			)
			.required('Введите номер телефона'),
		format: Yup.string().required('Выберите формат участия'),
		role: Yup.string().required('Выберите роль участника'),
		metrology: Yup.string().required('Укажите участие'),
	})

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
							theme: '',
							selectedItems: [],
							policy: false,
							metrology: '',
						}}
						validationSchema={validationSchema}
						onSubmit={async values => {
							await sendForm(values)
						}}
					>
						{({ isSubmitting, values, setFieldValue }) => (
							<Form className='form'>
								<h1>Заявка</h1>
								<h2>
									на участие в Конференции по теме: «Содействие развитию систем
									управления качеством, метрологии и стандартизации организаций
									промышленности»
								</h2>
								<h3>
									10-13 октября 2023 года, г. Сочи, Санаторий «Зеленая Роща»
								</h3>
								<div className='form__input_wrapper'>
									<div>
										<label htmlFor='name' className='form__label'>
											Наименование организации (полностью)
										</label>
										<ErrorMessage
											name='name'
											component='div'
											className='error-message'
										/>
										<Field
											id='name'
											name='name'
											placeholder='АО РТ-Техприемка'
											className='form__input'
										/>
									</div>

									<div>
										<label htmlFor='fio' className='form__label'>
											Фамилия Имя Отчество (полностью)
										</label>
										<ErrorMessage
											name='fio'
											component='div'
											className='error-message'
										/>
										<Field
											id='fio'
											name='fio'
											placeholder='Иванов Иван Иванович'
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
											placeholder='Директор по качеству'
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
											placeholder='8XXXXXXXXXX'
											type='phone'
											className='form__input'
										/>
									</div>

									<div>
										<label htmlFor='email' className='form__label'>
											Email
										</label>
										<ErrorMessage
											name='email'
											component='div'
											className='error-message'
										/>
										<Field
											id='email'
											name='email'
											placeholder='example@mail.ru'
											type='text'
											className='form__input'
										/>
									</div>

									<div>
										<label htmlFor='format' className='form__label'>
											Формат участия
										</label>
										<ErrorMessage
											name='format'
											component='div'
											className='error-message'
										/>
										<Field as='select' name='format' className='form__input'>
											<option value=''>Выбрать</option>
											<option value='Очно'>Очно</option>
											<option value='Заочно'>Заочно (ВКС)</option>
										</Field>
									</div>

									<div>
										<label htmlFor='role' className='form__label'>
											В качестве
										</label>
										<ErrorMessage
											name='role'
											component='div'
											className='error-message'
										/>
										<Field as='select' name='role' className='form__input'>
											<option value=''>Выбрать</option>
											<option value='Как слушатель'>Как слушатель</option>
											<option value='С докладом'>С докладом</option>
										</Field>
									</div>

									{values.role === 'С докладом' && (
										<div style={{ gridColumn: '1 / 3' }}>
											<label htmlFor='theme' className='form__label'>
												Тема доклада
											</label>
											<Field
												id='theme'
												name='theme'
												placeholder='...'
												type='text'
												className='form__input'
											/>
										</div>
									)}

									<div style={{ gridColumn: '1 / 3' }}>
										<label htmlFor='metrology' className='form__label'>
											Участие в Совете главных метрологов организаций ГК
											«Ростех»
										</label>
										<ErrorMessage
											name='metrology'
											component='div'
											className='error-message'
										/>
										<Field as='select' name='metrology' className='form__input'>
											<option value=''>Выбрать</option>
											<option value='Да'>Да</option>
											<option value='Нет'>Нет</option>
										</Field>
									</div>
								</div>

								<h2>Важные для меня темы к обсуждению в рамках Конференции:</h2>

								{checkboxes.map((item, key) => {
									return (
										<div key={key} className='form__checkbox'>
											<Field
												className='form__checkbox_field'
												type='checkbox'
												name='selectedItems'
												value={item.text}
												checked={values.selectedItems.includes(item.text)}
												onChange={() => {
													if (values.selectedItems.includes(item.text)) {
														// Убрать элемент из массива, если выбран
														setFieldValue(
															'selectedItems',
															values.selectedItems.filter(
																it => it !== item.text
															)
														)
													} else {
														// Добавить элемент в массив, если не выбран
														setFieldValue('selectedItems', [
															...values.selectedItems,
															item.text,
														])
													}
													console.log(values.selectedItems)
												}}
											/>
											<div
												className='form__checkbox_text'
												onClick={() => {
													if (values.selectedItems.includes(item.text)) {
														// Убрать элемент из массива, если выбран
														setFieldValue(
															'selectedItems',
															values.selectedItems.filter(
																it => it !== item.text
															)
														)
													} else {
														// Добавить элемент в массив, если не выбран
														setFieldValue('selectedItems', [
															...values.selectedItems,
															item.text,
														])
													}
													console.log(values.selectedItems)
												}}
											>
												{item.text}
											</div>
										</div>
									)
								})}

								<div
									className='form__checkbox'
									style={{ fontSize: '14px', marginTop: '30px' }}
								>
									<ErrorMessage
										name='policy'
										component='div'
										className='error-message'
									/>
									<input
										className='form__checkbox_field'
										type='checkbox'
										name='policy'
										required
									/>
									<div className='form__checkbox_text'>
										Я ознакомился и согласен с{' '}
										<a
											href={`${import.meta.env.VITE_SERVER_PROTOCOL}://${
												import.meta.env.VITE_SERVER_URL
											}:${import.meta.env.VITE_SERVER_PORT}/api/fetchPrivacy`}
											target='_blank'
										>
											Политикой Конфиденциальности
										</a>{' '}
										и{' '}
										<a
											href={`${import.meta.env.VITE_SERVER_PROTOCOL}://${
												import.meta.env.VITE_SERVER_URL
											}:${import.meta.env.VITE_SERVER_PORT}/api/fetchAgreement`}
											target='_blank'
										>
											Пользовательским соглашением
										</a>
									</div>
								</div>

								<button type='submit' name='button' className='form__submit'>
									Зарегистрироваться
								</button>

								<div
									style={{
										marginTop: '10px',
										fontSize: '12px',
										textAlign: 'center',
									}}
								>
									Контактное лицо по вопросам работы сайта:
									m.afanasyeva@rt-techpriemka.ru и
									d.kondratenko@rt-techpriemka.ru
								</div>
							</Form>
						)}
					</Formik>
				</Sheet>
			</ContainerLayout>
		</div>
	)
}

export default FormikForm
