import React, { memo } from 'react'
import './style.scss'

const Sheet = ({ children, style }) => {
	return (
		<div className='sheet' style={style}>
			{children}
		</div>
	)
}

export default memo(Sheet)
