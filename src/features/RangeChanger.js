import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';

import {
  selectSelectedCalendar,
  changeRange,
  resetRange,
  selectRangeType,
} from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

import bootstrap from '../bootstrap.module.css';

const RangeChanger = () => {
  const dispatch = useDispatch();

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const currentRangeType = useSelector(selectRangeType);

  if (
    !selectedCalendar ||
    currentRangeType === RANGE_TYPE.TOTAL ||
    currentRangeType === RANGE_TYPE.CUSTOM
  ) {
    return null;
  }

  return (
    <div
      data-testid="RangeChanger"
      className={bootstrap['btn-group']}
      role="group"
    >
      <button
        type="button"
        className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
        onClick={() => dispatch(changeRange('prev'))}
      >
        Prev
      </button>
      <button
        type="button"
        className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
        onClick={() => dispatch(resetRange())}
      >
        Reset
      </button>
      <button
        type="button"
        className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
        onClick={() => dispatch(changeRange('next'))}
      >
        Next
      </button>
    </div>
  );
};

export default RangeChanger;
