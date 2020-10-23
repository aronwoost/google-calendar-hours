import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';

import {
  selectRangeType,
  selectCurrentDatePointers,
  changeStart,
  changeEnd,
} from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

import styles from './CustomRange.module.css';

const CustomRange = () => {
  const dispatch = useDispatch();

  const currentRangeType = useSelector(selectRangeType);
  const { start, end } = useSelector(selectCurrentDatePointers);

  if (currentRangeType !== RANGE_TYPE.CUSTOM) {
    return null;
  }

  return (
    <div className={styles.component} data-testid="CustomRange">
      Start:
      <input
        type="date"
        value={dayjs(start).format('YYYY-MM-DD')}
        onChange={({ target }) =>
          dispatch(changeStart(new Date(target.value).toJSON()))
        }
      />
      End:
      <input
        type="date"
        value={dayjs(end).format('YYYY-MM-DD')}
        onChange={({ target }) =>
          dispatch(changeEnd(new Date(target.value).toJSON()))
        }
      />
    </div>
  );
};

export default CustomRange;
