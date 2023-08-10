import React, { memo } from 'react'
import './style.scss'

const Button = ({ text, onClick }) => {
	return (
		<button className='button' onClick={onClick}>
			{text}
		</button>
	)
}

export default memo(Button)
