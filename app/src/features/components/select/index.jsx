import React, { memo } from 'react'
import './style.scss'

const Select = ({ onChange, options, style, value }) => {
	return (
		<select className='select' style={style} value={value} onChange={onChange}>
			{options.map((item, key) => {
				return (
					<option key={key} value={item.value}>
						{item.text}
					</option>
				)
			})}
		</select>
	)
}

export default memo(Select)
