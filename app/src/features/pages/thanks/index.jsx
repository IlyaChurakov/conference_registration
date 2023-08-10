import React, { memo } from 'react'
import { Link, useParams } from 'react-router-dom'
import './style.scss'

const Thanks = () => {
	const { email, pdfName } = useParams()

	return (
		<div className='thanks'>
			<p className='thanks__text'>Вы зарегистрированы</p>
			<p className='thanks__text'>
				Письмо с подтверждением регистрации отправлено на почту: {email}
			</p>
			<a
				href={`https://localhost/api/fetchPDF/${pdfName}`}
				className='thanks__link'
			>
				Скачать заявку
			</a>
			<Link to={'/form'} className='thanks__link'>
				Подать еще одну заявку
			</Link>
		</div>
	)
}

export default memo(Thanks)
