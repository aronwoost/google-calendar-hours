import React from 'react';
import { useSelector } from 'react-redux';

import { selectHours } from '../stores/viewState';

import styles from './Hours.module.css';

const Hours = () => {
  const hours = useSelector(selectHours);

  if (hours === undefined) {
    return <div>Loading hours</div>;
  }

  return <div className={styles.hours}>{`${hours}h`}</div>;
};

export default Hours;
