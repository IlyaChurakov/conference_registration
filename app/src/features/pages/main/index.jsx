import { memo } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';
import rostecLogo from './img/rostec.svg';
import rttecLogo from './img/rttec.svg';
import { ReactSVG } from 'react-svg';

const Main = () => {
  return (
    <div className={styles.main}>
      <div className={styles.logo}>
        <ReactSVG src={rostecLogo} />
        <ReactSVG src={rttecLogo} />
      </div>

      <div className={styles.descr}>
        ФОРУМ «АО «РТ-ТЕХПРИЕМКА» -{' '}
        <div className={styles.descr_title}>85 ЛЕТ НА СЛУЖБЕ ОТЕЧЕСТВУ»</div>
        <br />
        <br />
        <div className={styles.descr_subtitle}>
          г. Москва, Бизнес-парк «Ростех-сити»
        </div>
      </div>

      <div className={styles.title}>
        КАЧЕСТВО
        <div className={styles.title_subtitle}>РАСШИРЯЯ ГРАНИЦЫ</div>
      </div>

      <Link className={styles.link} to={'/form'}>
        Заполнить форму участника
      </Link>

      <div className={styles.dates}>23 – 26 сентября 2025</div>
    </div>
  );
};

export default memo(Main);
