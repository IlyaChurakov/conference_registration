import React, { memo } from 'react'
import { Link, useParams } from 'react-router-dom'
import './style.scss'

const Thanks = () => {
	const { email, pdfName } = useParams()

	return (
		<div className='thanks'>
			<div className='thanks__window'>
				<p className='thanks__window_title'>Вы зарегистрированы</p>
				<p className='thanks__window_text'>
					Письмо с подтверждением регистрации отправлено на почту: {email}
				</p>
				<div className='thanks__window_link'>
					<a
						href={`${import.meta.env.VITE_SERVER_PROTOCOL}://${
							import.meta.env.VITE_SERVER_URL
						}:${import.meta.env.VITE_SERVER_PORT}/api/fetchPDF/${pdfName}`}
						className='thanks__window_link_item'
					>
						Скачать заявку
					</a>
					<Link to={'/formik'} className='thanks__window_link_item'>
						Подать еще одну заявку
					</Link>
				</div>
			</div>
		</div>
	)
}

export default memo(Thanks)
