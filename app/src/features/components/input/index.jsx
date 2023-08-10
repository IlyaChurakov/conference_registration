import React, { memo } from 'react'
import './style.scss'

const Input = ({ type, placeholder, style, onChange }) => {
	return (
		<input
			className='input'
			type={type}
			placeholder={placeholder}
			style={style}
			onChange={onChange}
		/>
	)
}

export default memo(Input)
