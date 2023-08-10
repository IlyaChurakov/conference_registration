import React, { memo } from 'react'
import './style.scss'

const Sheet = ({ children }) => {
	return <div className='sheet'>{children}</div>
}

export default memo(Sheet)
