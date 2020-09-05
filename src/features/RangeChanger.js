import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectSelectedCalendar,
  changeRange,
  resetRange,
} from '../stores/viewState';
import styles from './RangeChanger.module.css';

const Range = () => {
  const dispatch = useDispatch();

  const selectedCalendar = useSelector(selectSelectedCalendar);

  if (!selectedCalendar) {
    return null;
  }

  return (
    <div data-testid="RangeChanger" className={styles.buttons}>
      <button type="button" onClick={() => dispatch(changeRange('prev'))}>
        Prev
      </button>
      <button type="button" onClick={() => dispatch(resetRange())}>
        Reset
      </button>
      <button type="button" onClick={() => dispatch(changeRange('next'))}>
        Next
      </button>
    </div>
  );
};

export default Range;
