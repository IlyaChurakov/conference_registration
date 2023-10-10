import React from 'react'

const Star = ({ filled }) => {
	const starStyle = {
		color: filled ? 'gold' : 'gray', // Здесь можно настроить цвет заполненной и пустой звезды
		fontSize: '24px', // Здесь можно настроить размер звезды
		letterSpacing: 6,
	}

	return (
		<span style={{ display: 'block', width: '20px', ...starStyle }}>
			&#9733;
		</span>
	)
}

export default Star
