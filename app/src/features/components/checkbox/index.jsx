import React, { memo } from 'react'
import './style.scss'

const Checkbox = ({ name, text, value, onChange, style }) => {
	return (
		<div className='checkbox' style={style}>
			<input type='checkbox' name={name} value={value} onChange={onChange} />
			<div className='checkbox__text'>{text}</div>
		</div>
	)
}

export default memo(Checkbox)
