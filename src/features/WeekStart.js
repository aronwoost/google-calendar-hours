import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

import {
  selectRangeType,
  selectWeekStart,
  changeWeekStart,
} from '../stores/viewState';
import { RANGE_TYPE, WEEK_START } from '../constants';

import styles from './WeekStart.module.css';

const WeekStart = () => {
  const dispatch = useDispatch();

  const currentRangeType = useSelector(selectRangeType);
  const weekStart = useSelector(selectWeekStart);

  if (currentRangeType !== RANGE_TYPE.WEEK) {
    return null;
  }

  return (
    <div>
      <span className={styles.weekStartLabel}>Week starts on:</span>
      <div
        className={cx(bootstrap['btn-group'], bootstrap['btn-group-sm'])}
        role="group"
      >
        <input
          className={bootstrap['btn-check']}
          type="radio"
          value="sunday"
          id="sunday"
          checked={weekStart === WEEK_START.SUNDAY}
          onChange={({ target }) => dispatch(changeWeekStart(target.value))}
        />
        <label
          className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
          htmlFor="sunday"
        >
          Sunday
        </label>
        <input
          className={bootstrap['btn-check']}
          type="radio"
          value="monday"
          id="monday"
          checked={weekStart === WEEK_START.MONDAY}
          onChange={({ target }) => dispatch(changeWeekStart(target.value))}
        />
        <label
          className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
          htmlFor="monday"
        >
          Monday
        </label>
      </div>
    </div>
  );
};

export default WeekStart;
