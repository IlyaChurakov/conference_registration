import React, { memo } from 'react'
import './style.scss'

const ContainerLayout = ({ children, style }) => {
	return (
		<div className='containerLayout' style={style}>
			{children}
		</div>
	)
}

export default memo(ContainerLayout)
