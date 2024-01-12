import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';

import { selectWeekStart, changeWeekStart } from '../stores/viewState';
import { WEEK_START } from '../constants';

import styles from './WeekStart.module.css';

const WeekStart = () => {
  const dispatch = useDispatch();

  const weekStart = useSelector(selectWeekStart);

  return (
    <div>
      <span className={styles.weekStartLabel}>Week starts on:</span>
      <div className={cx('btn-group', 'btn-group-sm')} role="group">
        <input
          className="btn-check"
          type="radio"
          value="sunday"
          id="sunday"
          checked={weekStart === WEEK_START.SUNDAY}
          onChange={({ target }) => dispatch(changeWeekStart(target.value))}
        />
        <label className={cx('btn', 'btn-outline-secondary')} htmlFor="sunday">
          Sunday
        </label>
        <input
          className={'btn-check'}
          type="radio"
          value="monday"
          id="monday"
          checked={weekStart === WEEK_START.MONDAY}
          onChange={({ target }) => dispatch(changeWeekStart(target.value))}
        />
        <label className={cx('btn', 'btn-outline-secondary')} htmlFor="monday">
          Monday
        </label>
      </div>
    </div>
  );
};

export default WeekStart;
