import React, { memo } from 'react'

const ThanksRate = () => {
	return (
		<div className='thanks'>
			<div className='thanks__window'>
				<p className='thanks__window_title' style={{ margin: '10px auto' }}>
					Спасибо за отзыв!
				</p>
			</div>
		</div>
	)
}

export default memo(ThanksRate)
