import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';

import { selectRangeType } from '../stores/viewState';

import { RANGE_TYPE } from '../constants';
import styles from './CustomRange.module.css';

import 'react-datepicker/dist/react-datepicker.css';

const CustomRange = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const currentRangeType = useSelector(selectRangeType);

  if (currentRangeType !== RANGE_TYPE.CUSTOM) {
    return null;
  }

  return (
    <div className={styles.component} data-testid="CustomRange">
      Start:
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
      />
      End:
      <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
    </div>
  );
};

export default CustomRange;
