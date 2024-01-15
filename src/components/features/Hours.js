import { useSelector } from 'react-redux';

import { selectHours } from '../stores/viewState';

import styles from './Hours.module.css';

const Hours = () => (
  <div className={styles.hours}>{`${useSelector(selectHours)}h`}</div>
);

export default Hours;
