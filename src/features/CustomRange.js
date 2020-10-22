import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';

import {
  selectRangeType,
  selectCurrentDatePointers,
  setStart,
  setEnd,
} from '../stores/viewState';

import { RANGE_TYPE } from '../constants';
import styles from './CustomRange.module.css';

import 'react-datepicker/dist/react-datepicker.css';

const CustomRange = () => {
  const dispatch = useDispatch();

  const currentRangeType = useSelector(selectRangeType);
  const { start, end } = useSelector(selectCurrentDatePointers);
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (currentRangeType !== RANGE_TYPE.CUSTOM) {
    return null;
  }

  return (
    <div className={styles.component} data-testid="CustomRange">
      Start:
      <DatePicker
        selected={startDate}
        onChange={(date) => dispatch(setStart(date.toJSON()))}
      />
      End:
      <DatePicker
        selected={endDate}
        onChange={(date) => dispatch(setEnd(date.toJSON()))}
      />
    </div>
  );
};

export default CustomRange;
