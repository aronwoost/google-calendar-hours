import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import cx from 'classnames';

import {
  selectRangeType,
  selectCurrentDatePointers,
  changeStart,
  changeEnd,
} from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

import bootstrap from '../bootstrap.module.css';
import styles from './CustomRange.module.css';

const CustomRange = () => {
  const dispatch = useDispatch();

  const currentRangeType = useSelector(selectRangeType);
  const { start, end } = useSelector(selectCurrentDatePointers);

  if (currentRangeType !== RANGE_TYPE.CUSTOM) {
    return null;
  }

  return (
    <div
      className={cx(
        styles.component,
        bootstrap['input-group'],
        bootstrap['input-group-sm']
      )}
      data-testid="CustomRange"
    >
      <span className={cx(bootstrap['input-group-text'])}>Start:</span>
      <input
        className={cx(bootstrap['form-control'])}
        type="date"
        value={dayjs(start).format('YYYY-MM-DD')}
        onChange={({ target }) =>
          dispatch(changeStart(new Date(target.value).toJSON()))
        }
      />
      <span className={cx(bootstrap['input-group-text'])}>End:</span>
      <input
        className={cx(bootstrap['form-control'])}
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
