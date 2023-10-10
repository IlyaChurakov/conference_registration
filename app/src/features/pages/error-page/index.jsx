import React, { memo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './style.scss'

const ErrorPage = props => {
	const { text } = useParams()
	const navigate = useNavigate()

	return (
		<div className='error'>
			<p className='error__text'>{text}</p>
			<Link to={'#'} onClick={() => navigate(-1)} className='error__link'>
				Вернуться назад
			</Link>
		</div>
	)
}

export default memo(ErrorPage)
