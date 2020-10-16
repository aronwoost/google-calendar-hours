import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectSelectedCalendar,
  changeRange,
  resetRange,
  selectRangeType,
} from '../stores/viewState';
import styles from './RangeChanger.module.css';
import { RANGE_TYPE } from '../constants';

const RangeChanger = () => {
  const dispatch = useDispatch();

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const currentRangeType = useSelector(selectRangeType);

  if (!selectedCalendar || currentRangeType === RANGE_TYPE.TOTAL) {
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

export default RangeChanger;
