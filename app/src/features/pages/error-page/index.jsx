import React, { memo } from 'react'
import { Link, useParams } from 'react-router-dom'
import './style.scss'

const ErrorPage = props => {
	const { text } = useParams()

	return (
		<div className='error'>
			<p className='error__text'>{text}</p>
			<Link to={'/'} className='error__link'>
				Вернуться на главную
			</Link>
		</div>
	)
}

export default memo(ErrorPage)
