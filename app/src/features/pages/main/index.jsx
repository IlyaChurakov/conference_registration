import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { ReactSVG } from 'react-svg'
import rostech_logo from '../../../icons/лого ростех.svg'
import rttech_logo from '../../../icons/лого рт тех.svg'
import './style.scss'

const Main = () => {
	return (
		<div className='main'>
			<ReactSVG src={rostech_logo} className='main__logo_rostech' />
			<ReactSVG src={rttech_logo} className='main__logo_rttech' />
			<Link className='main__link' to={'/formik'}>
				Заполнить форму
			</Link>
			<div className='main__text'>
				Конференция Государственной корпорации «Ростех» <br /> «Содействие
				развитию систем управления качеством, метрологии и стандартизации
				организаций промышленности»
			</div>
		</div>
	)
}

export default memo(Main)
