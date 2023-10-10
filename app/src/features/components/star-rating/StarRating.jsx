import React from 'react'
import Star from './Star'
import styles from './StarRating.module.scss'

const StarRating = ({ field, form }) => {
	const { name, value } = field

	const handleStarClick = rating => {
		form.setFieldValue(name, rating)
	}

	return (
		<div className={styles.rating}>
			<label
				htmlFor='rating'
				className='form__label'
				style={{ marginRight: '10px' }}
			>
				Поставьте оценку
			</label>
			{[1, 2, 3, 4, 5].map(rating => (
				<label key={rating}>
					<input
						type='radio'
						name={name}
						value={rating}
						checked={value === rating}
						onChange={() => handleStarClick(rating)}
						style={{ display: 'none' }}
					/>
					<Star
						filled={rating <= value ? 'yellow' : ''}
						onClick={() => handleStarClick(rating)}
					/>
				</label>
			))}
		</div>
	)
}

export default StarRating
