import React, { memo } from 'react'
import { Link, useParams } from 'react-router-dom'
import './style.scss'

const Thanks = () => {
	const { email, pdfName } = useParams()

	const url = `${import.meta.env.VITE_SERVER_PROTOCOL}://${
		import.meta.env.VITE_SERVER_URL
	}:${import.meta.env.VITE_SERVER_PORT}/api/fetchPDF/${pdfName}.pdf`

	const downloadPDF = async () => {
		try {
			const response = await fetch(url, {
				headers: {
					Authorization: `${import.meta.env.VITE_TOKEN}`,
				},
			})

			if (response.status === 200) {
				const blob = await response.blob()

				// Создаем URL для Blob
				const blobUrl = URL.createObjectURL(blob)

				// Создаем ссылку для скачивания
				const link = document.createElement('a')
				link.href = blobUrl
				link.download = `${pdfName}.pdf`

				// Производим клик по ссылке для скачивания
				link.click()

				// Освобождаем ресурсы
				URL.revokeObjectURL(blobUrl)
			}
		} catch (error) {
			console.error('Ошибка скачивания:', error)
		}
	}

	return (
		<div className='thanks'>
			<div className='thanks__window'>
				<p className='thanks__window_title'>Вы успешно зарегистрированы!</p>
				<p className='thanks__window_text'>
					Письмо с подтверждением регистрации отправлено на почту: {email}
				</p>
				<div className='thanks__window_link'>
					<Link
						href={`#`}
						className='thanks__window_link_item'
						onClick={downloadPDF}
					>
						Скачать заявку
					</Link>
					<Link to={'/form'} className='thanks__window_link_item'>
						Подать еще одну заявку
					</Link>
				</div>
			</div>
		</div>
	)
}

export default memo(Thanks)
