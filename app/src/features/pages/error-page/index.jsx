import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import './style.scss'

const ErrorPage = props => {
	return (
		<div className='error'>
			<p className='error__text'>{props.error}</p>
			<Link to={'/'} className='error__link'>
				Вернуться на главную
			</Link>
		</div>
	)
}

export default memo(ErrorPage)
