import { Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReactSVG } from 'react-svg'
import * as Yup from 'yup'
import spinner from '../../../icons/oval.svg'
import StarRating from '../../components/star-rating/StarRating'
import Sheet from '../../layouts/sheet'
import styles from './Vote.module.scss'

const Vote = () => {
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const sendForm = async values => {
		console.log('Отправка данных')
		setLoading(true)

		const data = {
			...values,
		}

		// Записываем данные в БД
		await fetch(
			`${import.meta.env.VITE_SERVER_PROTOCOL}://${
				import.meta.env.VITE_SERVER_URL
			}:${import.meta.env.VITE_SERVER_PORT}/api/rate`,
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
					setLoading(false)
					navigate(`/thanks-rate`)
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
	}

	const validationSchema = Yup.object({
		message: Yup.string().required('Невозможно продолжить без согласия'),
		rating: Yup.string().required('Введите название организации'),
	})

	return (
		<div className={styles.vote}>
			{loading && (
				<div className='loader'>
					<ReactSVG src={spinner} />
				</div>
			)}
			<div className={styles.container}>
				<div className={styles.links}>
					<h2>Конференция ГК Ростех</h2>

					<a
						href='https://askvote.ru/c/JTu3Qu9LASrfeHZf2/polling '
						className={styles.links_item}
						target='_blank'
					>
						Голосование: Доклад дня
					</a>
					<a href='#' className={styles.links_item} target='_blank'>
						Голосование: Лучший вопрос
					</a>
					<a
						href='https://askvote.ru/desk/event/fexDTzWzDTTr6e3oF/polling'
						className={styles.links_item}
						target='_blank'
					>
						Интерактив
					</a>
					<a
						href={`/ПРОГРАММА Конференции.pdf`}
						target='_blank'
						className={styles.programm}
					>
						Программа конференции
					</a>
				</div>
				<Sheet
					style={{
						// position: 'absolute',
						// top: '70%',
						// left: '50%',
						// transform: 'translate(-50%, -50%)',
						height: '100%',
						width: '100%',
						maxWidth: '90%',
					}}
				>
					<Formik
						initialValues={{
							message: '',
							rating: 5,
						}}
						validationSchema={validationSchema}
						onSubmit={values => sendForm(values)}
					>
						{({ isSubmitting, values, setFieldValue }) => (
							<Form className={styles.form}>
								<h1>Отзыв об участии в конференции</h1>
								<div className={styles.form_input_wrapper}>
									<Field
										as='textarea'
										id='message'
										name='message'
										placeholder='Введите текст...'
										className={styles.form_input}
									/>

									<Field component={StarRating} name='rating'></Field>
								</div>

								<button
									type='submit'
									name='button'
									className='form__submit'
									style={{ width: '100%' }}
								>
									Отправить отзыв
								</button>
							</Form>
						)}
					</Formik>
				</Sheet>
			</div>
		</div>
	)
}

export default Vote
