import React, { memo } from 'react'
import './style.scss'

const ContainerLayout = ({ children }) => {
	return <div className='containerLayout'>{children}</div>
}

export default memo(ContainerLayout)
